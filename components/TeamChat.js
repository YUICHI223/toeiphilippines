import React, { useState, useEffect } from 'react'
import { auth, db, storage } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, getDocs, addDoc, serverTimestamp, onSnapshot, orderBy } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export default function TeamChat(){
  const [user, setUser] = useState(null)
  const [departments, setDepartments] = useState([])
  const [selectedDept, setSelectedDept] = useState('')
  const [deptUsers, setDeptUsers] = useState([])
  const [selectedRecipients, setSelectedRecipients] = useState(new Set())
  const [file, setFile] = useState(null)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u)
    })
    // load departments and sections (some projects use 'sections' instead)
    async function loadDepts(){
      try{
        const [deptSnap, secSnap] = await Promise.all([
          getDocs(collection(db, 'departments')),
          getDocs(collection(db, 'sections'))
        ])

        const depts = deptSnap.docs.map(d=>({ id: d.id, source: 'department', ...d.data() }))
        const secs = secSnap.docs.map(d=>({ id: d.id, source: 'section', ...d.data() }))

        // merge - prefer departments over sections when ids collide
        const map = new Map()
        depts.forEach(d => map.set(d.id, d))
        secs.forEach(s => {
          if(!map.has(s.id)) map.set(s.id, s)
          else {
            // keep department, but if department missing name, fill from section
            const existing = map.get(s.id)
            if(!existing.name && (s.name || s.title)) {
              existing.name = s.name || s.title
            }
            map.set(s.id, existing)
          }
        })

        const merged = Array.from(map.values()).map(item => ({ id: item.id, name: item.name || item.title || item.label || item.displayName || item.id, source: item.source }))
        // sort alphabetically
        merged.sort((a,b)=> a.name.localeCompare(b.name))
        setDepartments(merged)
      }catch(e){
        console.error('Error loading departments/sections', e)
        setDepartments([])
      }
    }
    loadDepts()
    return () => unsub()
  }, [])

  async function loadUsersForDept(deptId){
    try{
      // try departmentId field
      const q = query(collection(db, 'users'), where('departmentId', '==', deptId))
      let snap = await getDocs(q)
      if (snap.empty) {
        // try sectionId
        const q2 = query(collection(db, 'users'), where('sectionId', '==', deptId))
        snap = await getDocs(q2)
      }
      const list = snap.docs.map(d=>({ id: d.id, ...d.data() }))
      setDeptUsers(list)
    }catch(e){
      console.error('Error fetching users for dept', e)
      setDeptUsers([])
    }
  }

  // messages state with real-time listeners
  const [messages, setMessages] = useState([])

  useEffect(()=>{
    if(!user) return

    // listen for messages where recipients include current user
    const q1 = query(collection(db, 'chatMessages'), where('recipients', 'array-contains', user.uid), orderBy('createdAt', 'desc'))
    const unsub1 = onSnapshot(q1, snap => {
      const list = snap.docs.map(d=>({ id: d.id, ...d.data() }))
      setMessages(prev => {
        // merge keeping unique ids and sort by createdAt desc
        const map = new Map(prev.map(m=>[m.id,m]))
        list.forEach(m=>map.set(m.id,m))
        return Array.from(map.values()).sort((a,b)=> (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0))
      })
    }, e => console.error('msg listener err', e))

    // listen for messages sent by the current user
    const q2 = query(collection(db, 'chatMessages'), where('senderId', '==', user.uid), orderBy('createdAt', 'desc'))
    const unsub2 = onSnapshot(q2, snap => {
      const list = snap.docs.map(d=>({ id: d.id, ...d.data() }))
      setMessages(prev => {
        const map = new Map(prev.map(m=>[m.id,m]))
        list.forEach(m=>map.set(m.id,m))
        return Array.from(map.values()).sort((a,b)=> (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0))
      })
    }, e => console.error('msg listener err', e))

    return ()=>{ unsub1(); unsub2() }
  }, [user])

  function toggleRecipient(uid){
    setSelectedRecipients(prev=>{
      const s = new Set(prev)
      if(s.has(uid)) s.delete(uid); else s.add(uid)
      return s
    })
  }

  async function handleSend(e){
    e.preventDefault()
    if(!user) return alert('Not authenticated')
    if(selectedRecipients.size === 0) return alert('Select at least one recipient')
    setSending(true)
    try{
      let fileData = null
      if(file){
        const storageRef = ref(storage, `chat_files/${Date.now()}_${file.name}`)
        await uploadBytes(storageRef, file)
        const url = await getDownloadURL(storageRef)
        fileData = { name: file.name, url }
      }

      const recipients = Array.from(selectedRecipients)
      await addDoc(collection(db, 'chatMessages'), {
        senderId: user.uid,
        senderEmail: user.email,
        recipients,
        department: selectedDept || null,
        file: fileData,
        text: '',
        createdAt: serverTimestamp()
      })
      alert('File sent')
      setFile(null)
      setSelectedRecipients(new Set())
    }catch(e){
      console.error('Send failed', e)
      alert('Send failed')
    }finally{
      setSending(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-panel-dark p-4 rounded">
        <label className="block text-sm mb-2">Select Department / Section</label>
        <select className="w-full bg-panel-muted p-2 rounded" value={selectedDept} onChange={e=>{setSelectedDept(e.target.value); loadUsersForDept(e.target.value)}}>
          <option value="">-- Choose department --</option>
          {departments.map(d=> (
            <option key={d.id} value={d.id}>{d.name || d.title || d.label || d.displayName || d.id}</option>
          ))}
        </select>
      </div>

      <div className="bg-panel-dark p-4 rounded">
        <label className="block text-sm mb-2">Select Recipients</label>
        {deptUsers.length === 0 ? (
          <div className="text-xs text-gray-400">No users in selected department</div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-auto">
            {deptUsers.map(u=> (
              <div key={u.id} className="flex items-center gap-3">
                <input type="checkbox" checked={selectedRecipients.has(u.id)} onChange={()=>toggleRecipient(u.id)} />
                <div className="text-sm">{u.firstName} {u.lastName} <span className="text-xs text-gray-400">({u.email})</span></div>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="bg-panel-dark p-4 rounded space-y-3">
        <label className="block text-sm">Attach file</label>
        <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} />
        <div className="flex items-center gap-2">
          <button disabled={sending} className="px-4 py-2 bg-blue-600 rounded text-white">Send File</button>
          <div className="text-xs text-gray-400">Selected: {selectedRecipients.size} recipient(s)</div>
        </div>
      </form>

      <div className="bg-panel-dark p-4 rounded">
        <h4 className="font-semibold mb-2">Recent Messages</h4>
        {messages.length === 0 ? (
          <div className="text-xs text-gray-400">No messages</div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-auto">
            {messages.map(m=> (
              <div key={m.id} className="p-3 bg-panel-muted rounded">
                <div className="text-sm font-semibold">{m.senderEmail || m.senderId}</div>
                <div className="text-xs text-gray-400">{m.createdAt?.toDate ? new Date(m.createdAt.toDate()).toLocaleString() : '-'}</div>
                {m.text && <div className="mt-2">{m.text}</div>}
                {m.file && (
                  <div className="mt-2">
                    <a className="text-sm text-blue-400 underline" href={m.file.url} target="_blank" rel="noreferrer">{m.file.name || 'attachment'}</a>
                  </div>
                )}
                {m.recipients && m.recipients.length > 0 && (
                  <div className="mt-2 text-xs text-gray-400">To: {m.recipients.join(', ')}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
