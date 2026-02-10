# SystemToEi — Next.js + Tailwind + Firebase starter

Quick start:

1. Copy `.env.local.example` to `.env.local` and fill Firebase vars (or set env vars):

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

2. Install and run:

```bash
npm install
npm run dev
```

Files created: `package.json`, `next.config.js`, `tailwind.config.js`, `postcss.config.js`, `pages/`, `components/`, `lib/firebase.js`, `styles/globals.css`.

You can extend this scaffold with auth UI and Firestore logic.

// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     // Allow creating a file_transfers record only when the authenticated user is the sender
//     match /file_transfers/{transferId} {
//       allow create: if request.auth != null && request.resource.data.fromId == request.auth.uid;
//       allow read: if request.auth != null;
//       allow update, delete: if false;
//     }

//     // Users can read/update their own profile document.
//     // Admin users (custom claim `admin`) may also read all user docs for management purposes.
//     match /users/{userId} {
//       allow read: if request.auth != null && (request.auth.uid == userId || request.auth.token.admin == true || request.auth.token.isAdmin == true);
//       allow update: if request.auth != null && request.auth.uid == userId;
//       allow create: if request.auth != null && request.auth.uid == userId;
//     }

//     // Deny other access by default
//     match /{document=**} {
//       allow read, write: if false;
//     }
//   }
// }
