import React, { useState, useEffect, useRef } from 'react'
import { auth, db } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp, 
  onSnapshot, 
  orderBy,
  writeBatch,
  doc,
  updateDoc,
  collectionGroup
} from 'firebase/firestore'

export default function TeamChat(){
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [usersList, setUsersList] = useState([])
  const [searchText, setSearchText] = useState('')
  const [messageText, setMessageText] = useState('')
  const [activeConversation, setActiveConversation] = useState(null)
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  
  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auth and profiles
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u)
      if(u){
        (async ()=>{
          try{
            const docRef = await getDocs(query(collection(db, 'users'), where('__name__', '==', u.uid)))
            if(!docRef.empty){
              const d = docRef.docs[0]
              setProfile({ id: d.id, ...d.data() })
            } else {
              setProfile(null)
            }
          }catch(err){
            console.error('Failed loading user profile', err)
            setProfile(null)
          }
        })()
      }else{
        setProfile(null)
      }
    })
    
    // load all users for search
    async function loadAllUsers(){
      try{
        const snap = await getDocs(collection(db, 'users'))
        const list = snap.docs.map(d=>({ id: d.id, ...d.data() }))
        setUsersList(list)
      }catch(e){
        console.error('Error loading users', e)
        setUsersList([])
      }
    }
    loadAllUsers()
    return () => unsub()
  }, [])

  // Listen to user's conversations
  useEffect(() => {
    if(!user?.email) return

    const q = query(
      collection(db, 'conversations'),
      where('participantEmails', 'array-contains', user.email),
      orderBy('lastMessageTime', 'desc')
    )

    const unsub = onSnapshot(q, snap => {
      const convos = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
      setConversations(convos)
      console.log(`Loaded ${convos.length} conversations for ${user.email}`, convos)
    }, err => console.error('Conversation listener error:', err))

    return () => unsub()
  }, [user?.email])

  // Listen to messages in active conversation
  useEffect(() => {
    if(!activeConversation) {
      setMessages([])
      return
    }

    const q = query(
      collection(db, `conversations/${activeConversation}/messages`),
      orderBy('createdAt', 'asc')
    )

    const unsub = onSnapshot(q, snap => {
      const msgs = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
      setMessages(msgs)
      console.log(`Loaded ${msgs.length} messages for conversation ${activeConversation}`, msgs)
    }, err => console.error('Messages listener error:', err))

    return () => unsub()
  }, [activeConversation])

  // Find or create conversation with a user
  async function startConversation(otherUser) {
    if (!user?.email || !otherUser?.email) {
      alert('User email not available')
      return
    }

    // Prevent self-chat
    if (user.email === otherUser.email) {
      alert('Cannot chat with yourself')
      return
    }

    try {
      setLoading(true)

      // Check if conversation already exists
      const participants = [user.email, otherUser.email].sort()
      const existingQuery = query(
        collection(db, 'conversations'),
        where('participantEmails', '==', participants)
      )

      const existingSnap = await getDocs(existingQuery)

      if (!existingSnap.empty) {
        // Conversation exists
        const conversationId = existingSnap.docs[0].id
        setActiveConversation(conversationId)
        console.log('Found existing conversation:', conversationId)
        return
      }

      // Create new conversation
      const newConversation = {
        participantEmails: participants,
        participantIds: [user.uid, otherUser.id].sort(),
        participantNames: {
          [user.email]: `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim(),
          [otherUser.email]: `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim()
        },
        lastMessage: null,
        lastMessageTime: serverTimestamp(),
        createdAt: serverTimestamp(),
        createdBy: user.email
      }

      const convoRef = await addDoc(collection(db, 'conversations'), newConversation)
      setActiveConversation(convoRef.id)
      console.log('Created new conversation:', convoRef.id)
    } catch (err) {
      console.error('Error starting conversation:', err)
      alert('Failed to start conversation: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Send message
  async function handleSend(e) {
    e.preventDefault()

    if (!user?.email) return alert('Not authenticated')
    if (!activeConversation) return alert('No conversation selected')

    const text = (messageText || '').trim()
    if (!text) return alert('Message cannot be empty')

    try {
      setLoading(true)

      // Add message to subcollection
      const messageData = {
        senderEmail: user.email,
        senderId: user.uid,
        senderName: `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim(),
        text,
        createdAt: serverTimestamp(),
        edited: false,
        deleted: false
      }

      const msgRef = await addDoc(
        collection(db, `conversations/${activeConversation}/messages`),
        messageData
      )

      // Update conversation lastMessage
      const convoRef = doc(db, 'conversations', activeConversation)
      await updateDoc(convoRef, {
        lastMessage: {
          senderEmail: user.email,
          text,
          createdAt: serverTimestamp()
        },
        lastMessageTime: serverTimestamp()
      })

      setMessageText('')
      console.log('Message sent:', msgRef.id)
    } catch (err) {
      console.error('Error sending message:', err)
      alert('Failed to send message: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-120px)]">
      {/* Left: Conversations List */}
      <aside className="col-span-3 bg-white rounded shadow flex flex-col border-r">
        <div className="flex items-center justify-between mb-3 p-3 border-b">
          <h3 className="font-semibold text-gray-900">Messages</h3>
          <div className="text-xs text-gray-500">{usersList.filter(u => u.id !== user?.uid).length} users</div>
        </div>
        
        <input 
          type="text" 
          placeholder="Search users..." 
          value={searchText} 
          onChange={e => setSearchText(e.target.value)}
          className="mx-3 mb-3 w-auto bg-gray-100 p-2 rounded text-sm text-gray-900 placeholder-gray-500"
        />

        {/* Conversations */}
        <div className="flex-1 overflow-auto px-2">
          {conversations.length === 0 ? (
            <div className="text-xs text-gray-400 text-center py-4">No conversations yet</div>
          ) : (
            <ul className="space-y-1">
              {conversations.map(convo => {
                const otherEmail = convo.participantEmails.find(e => e !== user?.email)
                const otherUser = usersList.find(u => u.email === otherEmail)
                return (
                  <li
                    key={convo.id}
                    className={`flex items-center gap-3 p-2 rounded cursor-pointer transition ${activeConversation === convo.id ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-gray-100'}`}
                    onClick={() => setActiveConversation(convo.id)}
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {(otherUser?.firstName || '').charAt(0)}{(otherUser?.lastName || '').charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : otherEmail}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {convo.lastMessage?.text || '(no messages)'}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* User Search */}
        <div className="border-t p-3 max-h-48 overflow-auto">
          <div className="text-xs font-semibold text-gray-600 mb-2">Start Chat</div>
          {(() => {
            const filterText = searchText.toLowerCase()
            let filtered = usersList.filter(u => u.id !== user?.uid)
            
            if(filterText.trim()) {
              filtered = filtered.filter(u => {
                const email = (u.email || '').toLowerCase()
                const name = `${(u.firstName || '')} ${(u.lastName || '')}`.toLowerCase()
                return email.includes(filterText) || name.includes(filterText)
              })
            }
            
            if(filtered.length === 0) {
              return <div className="text-xs text-gray-400">{searchText ? 'No users found' : 'Type to search'}</div>
            }
            
            return (
              <ul className="space-y-1">
                {filtered.slice(0, 5).map(u => (
                  <li
                    key={u.id}
                    className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 transition text-xs"
                    onClick={() => {
                      startConversation(u)
                      setSearchText('')
                    }}
                  >
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                      {(u.firstName || '').charAt(0)}{(u.lastName || '').charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-900 truncate">{u.firstName} {u.lastName}</div>
                      <div className="text-gray-500 truncate">{u.email}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )
          })()}
        </div>
      </aside>

      {/* Center: Messages */}
      <main className="col-span-6 bg-white rounded shadow flex flex-col">
        {!activeConversation ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-xl mb-2">💬</div>
              <div>Select a conversation to start messaging</div>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
              {(() => {
                const convo = conversations.find(c => c.id === activeConversation)
                const otherEmail = convo?.participantEmails.find(e => e !== user?.email)
                const otherUser = usersList.find(u => u.email === otherEmail)
                return (
                  <div>
                    <div className="font-semibold text-gray-900">
                      {otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : otherEmail}
                    </div>
                    <div className="text-xs text-gray-500">{otherEmail}</div>
                  </div>
                )
              })()}
              <button
                onClick={() => setActiveConversation(null)}
                className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
              >
                Close
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 pt-4">No messages yet. Start the conversation!</div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.senderId === user?.uid
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-2 rounded-lg ${isMe ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
                        <div className="text-xs font-semibold opacity-75">{msg.senderEmail}</div>
                        <div className="mt-1">{msg.text}</div>
                        <div className="text-xs opacity-50 mt-1">
                          {msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleTimeString() : ''}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t bg-gray-50">
              <form onSubmit={handleSend} className="flex items-center gap-3">
                <input
                  type="text"
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  placeholder="Write a message..."
                  className="flex-1 px-3 py-2 rounded border text-gray-900 placeholder-gray-500"
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? '...' : '➤'}
                </button>
              </form>
            </div>
          </>
        )}
      </main>

      {/* Right: User Profile */}
      <aside className="col-span-3 bg-white rounded shadow p-4 flex flex-col border-l">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-lg">
            {(profile?.firstName || '').charAt(0)}{(profile?.lastName || '').charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{profile ? `${profile.firstName} ${profile.lastName}` : 'Profile'}</div>
            <div className="text-xs text-gray-500">{user?.email || ''}</div>
          </div>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded">
          <div className="text-xs font-semibold text-gray-700 mb-2">Info</div>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Conversations: {conversations.length}</div>
            <div>Messages: {messages.length}</div>
            <div>Active: {activeConversation ? activeConversation.slice(-8) : 'none'}</div>
          </div>
        </div>

        <div className="mt-auto text-xs text-gray-500 text-center">
          <div className="mb-2">🔒 Messages are encrypted</div>
          <div>Only participants can access this chat</div>
        </div>
      </aside>
    </div>
  )
}
