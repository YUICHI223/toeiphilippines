# Real-time Messenger System Setup

## Firestore Schema

### Collections Structure

```
conversations/
  {conversationId} [document]
    ├── participantEmails: string[] (sorted alphabetically)
    ├── participantIds: string[] (sorted alphabetically)
    ├── participantNames: object { email: name, ... }
    ├── lastMessage: { senderEmail, text, createdAt }
    ├── lastMessageTime: timestamp
    ├── createdAt: timestamp
    ├── createdBy: string
    └── messages/ [subcollection]
        └── {messageId} [document]
            ├── senderEmail: string
            ├── senderId: string
            ├── senderName: string
            ├── text: string
            ├── createdAt: timestamp
            ├── edited: boolean
            └── deleted: boolean
```

## Firestore Indexes

**Composite Index Required:**
- Collection: `conversations`
- Fields: 
  - `participantEmails` (Arrays)
  - `lastMessageTime` (Descending)

**To create index:**
1. Go to Firebase Console → Firestore Database → Indexes
2. Click "Create Index"
3. Select collection: `conversations`
4. Add field: `participantEmails` (Arrays)
5. Add field: `lastMessageTime` (Descending)
6. Create index

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Conversations - only participants can read/write
    match /conversations/{conversationId} {
      allow read: if request.auth.token.email in resource.data.participantEmails;
      allow create: if request.auth.token.email in request.resource.data.participantEmails
                     && request.resource.data.participantEmails.size() == 2
                     && request.resource.data.createdBy == request.auth.token.email;
      allow update: if request.auth.token.email in resource.data.participantEmails
                     && (resource.data.lastMessage != request.resource.data.lastMessage || 
                         resource.data.lastMessageTime != request.resource.data.lastMessageTime);
      
      // Messages - only participants can read/write
      match /messages/{messageId} {
        allow read: if request.auth.token.email in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participantEmails;
        allow create: if request.auth.token.email in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participantEmails
                       && request.resource.data.senderEmail == request.auth.token.email
                       && request.resource.data.senderId == request.auth.uid
                       && request.resource.data.text.size() > 0
                       && request.resource.data.edited == false
                       && request.resource.data.deleted == false;
        allow update: if request.auth.token.email in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participantEmails
                       && request.resource.data.senderEmail == resource.data.senderEmail
                       && request.resource.data.senderId == resource.data.senderId;
      }
    }
    
    // Users collection (allow read for searching)
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

## Key Features

### 1. **Auto-create Conversations**
- When you click a user, the system searches for an existing conversation
- If found, opens it
- If not found, creates a new one with both users

### 2. **Duplicate Prevention**
- Participant emails are **sorted alphabetically** before querying
- This ensures only one conversation exists between two users
- Query: `where('participantEmails', '==', [email1, email2].sort())`

### 3. **Real-time Updates**
- Firestore `onSnapshot` listeners on:
  - User's conversations (sorted by `lastMessageTime` descending)
  - Messages in active conversation (sorted by `createdAt` ascending)
- Auto-scroll to latest message via `useRef` and `useEffect`

### 4. **Message Sending**
- Validates: user authenticated, conversation selected, message not empty
- Stores message in `conversations/{conversationId}/messages` subcollection
- Updates conversation's `lastMessage` and `lastMessageTime`
- Prevents accidental duplicates with validation

### 5. **Security**
- Only participants can see conversations and messages
- Enforced via Firestore security rules
- Users identified by email (from `auth.token.email`)
- Cannot create group chats or chat with yourself

### 6. **Participant Identification**
- Users identified by email (not UID alone)
- Email is more user-friendly for discovering contacts
- Conversation list shows user's name + email

## Testing

### With Two Accounts
1. **Account A:** Open in normal browser window
   - Log in as user1@email.com
   - Search for user2@email.com
   - Click to start conversation
   
2. **Account B:** Open in Incognito window
   - Log in as user2@email.com
   - Should see conversation from Account A in sidebar
   - Click it to open chat
   
3. **Send messages** back and forth - should appear in real-time on both sides

## Troubleshooting

### Conversations not showing
- **Check:** Firebase console → Firestore → data → do conversations exist?
- **Check:** Are participant emails sorted correctly?
- **Check:** Is current user's email in `participantEmails` array?

### Messages not sending
- **Check:** Console (F12) for error messages
- **Check:** Is `conversationId` set correctly?
- **Check:** Is message text not empty?

### Firestore index error
- **Action:** Go to Firebase Console, click index creation link
- **Create:** Composite index on `conversations` with:
  - `participantEmails` (Arrays)
  - `lastMessageTime` (Descending)

## Future Enhancements

- [ ] Delete messages (set `deleted: true` instead of removing)
- [ ] Edit messages (update `text`, set `edited: true`)
- [ ] Typing indicators (real-time presence)
- [ ] Read receipts (track when messages were read)
- [ ] Group chats (support 3+ participants)
- [ ] File uploads (send images, documents)
- [ ] Voice messages
- [ ] Message search and filtering
