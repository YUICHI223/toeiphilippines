import React, { useState, useEffect } from 'react'
import { auth, db, storage } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export default function ProductionControl(){
  const [user, setUser] = useState(null)
  const [teams, setTeams] = useState([])
  const [departments, setDepartments] = useState([])
  const [selectedTeam, setSelectedTeam] = useState('')
  const [selectedDept, setSelectedDept] = useState('')
  const [usersList, setUsersList] = useState([])
  const [deptUsers, setDeptUsers] = useState([])
  const [selectedRecipients, setSelectedRecipients] = useState(new Set())
  const [file, setFile] = useState(null)
  const [sending, setSending] = useState(false)

  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, u=>setUser(u))
    async function load(){
      try{
        const [tSnap, deptSnap, secSnap, usersSnap] = await Promise.all([
          getDocs(collection(db,'teams')),
          getDocs(collection(db,'departments')),
          getDocs(collection(db,'sections')),
          getDocs(collection(db,'users'))
        ])
        setTeams(tSnap.docs.map(d=>({ id: d.id, ...d.data() })))

        const depts = deptSnap.docs.map(d=>({ id: d.id, source: 'department', ...d.data() }))
        const secs = secSnap.docs.map(d=>({ id: d.id, source: 'section', ...d.data() }))
        const map = new Map()
        depts.forEach(d => map.set(d.id, d))
        secs.forEach(s => {
          if(!map.has(s.id)) map.set(s.id, s)
          else {
            const existing = map.get(s.id)
            if(!existing.name && (s.name || s.title)) existing.name = s.name || s.title
            map.set(s.id, existing)
          }
        })
        const merged = Array.from(map.values()).map(item => ({ id: item.id, name: item.name || item.title || item.label || item.displayName || item.id, source: item.source }))
        merged.sort((a,b)=> a.name.localeCompare(b.name))
        setDepartments(merged)

        const users = usersSnap.docs.map(d=>({ id: d.id, ...d.data() }))
        setUsersList(users)
      }catch(e){ console.error('load err', e); setTeams([]); setDepartments([]); setUsersList([]) }
    }
    load()
    return ()=>unsub()
  },[])

  async function loadUsersForDept(deptId){
    try{
      const q = query(collection(db, 'users'), where('departmentId', '==', deptId))
      let snap = await getDocs(q)
      if(snap.empty){
        const q2 = query(collection(db, 'users'), where('sectionId', '==', deptId))
        snap = await getDocs(q2)
      }
      const list = snap.docs.map(d=>({ id: d.id, ...d.data() }))
      setDeptUsers(list)
    }catch(e){ console.error('Error loading users for dept', e); setDeptUsers([]) }
  }

  async function handleSend(e){
    e.preventDefault()
    if(!user) return alert('Not authenticated')
    if(!file) return alert('Choose a file to send')
    setSending(true)
    try{
      const storageRef = ref(storage, `chat_files/${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      const recipients = Array.from(selectedRecipients)
      if(recipients.length === 0 && !selectedTeam && !selectedDept){
        alert('Select at least one recipient or choose a team/department target')
        setSending(false)
        return
      }

      const payload = {
        senderId: user.uid,
        senderEmail: user.email,
        recipients: recipients,
        department: selectedDept || null,
        team: selectedTeam || null,
        isGroup: recipients.length === 0, // group if no individual recipients
        file: { name: file.name, url },
        text: '',
        createdAt: serverTimestamp()
      }
      if(payload.team) payload.department = null
      await addDoc(collection(db, 'chatMessages'), payload)
      alert('File sent to production control')
      setFile(null)
      setSelectedDept('')
      setSelectedTeam('')
      setSelectedRecipients(new Set())
    }catch(e){ console.error('send err', e); alert('Send failed') }
    finally{ setSending(false) }
  }

  function toggleRecipient(uid){
    setSelectedRecipients(prev=>{
      const s = new Set(prev)
      if(s.has(uid)) s.delete(uid); else s.add(uid)
      return s
    })
  }

  return (
    <div className="bg-panel-dark p-4 rounded">
      <h3 className="font-semibold mb-2">Production Control - Send File</h3>
      <div className="mb-3">
        <label className="block text-sm mb-1">Target Department (optional)</label>
        <select className="w-full bg-panel-muted p-2 rounded" value={selectedDept} onChange={async e=>{ const val = e.target.value; setSelectedDept(val); setSelectedTeam(''); if(val){ await loadUsersForDept(val) } else { setDeptUsers([]) } }}>
          <option value="">-- None --</option>
          {departments.map(d=> <option key={d.id} value={d.id}>{d.name || d.id}</option>)}
        </select>
      </div>
      <div className="mb-3">
        <label className="block text-sm mb-1">Target Team (optional)</label>
        <select className="w-full bg-panel-muted p-2 rounded" value={selectedTeam} onChange={async e=>{ const val = e.target.value; setSelectedTeam(val); setSelectedDept(''); if(val){ const t = teams.find(x=>x.id===val); if(t && Array.isArray(t.members) && t.members.length>0){ // try to resolve from local cache
                const members = t.members
                if(usersList && usersList.length > 0){
                  setDeptUsers(members.map(id=>usersList.find(u=>u.id===id)).filter(Boolean))
                } else {
                  // fetch by ids in chunks
                  const chunks = []
                  for(let i=0;i<members.length;i+=10) chunks.push(members.slice(i,i+10))
                  const results = []
                  for(const chunk of chunks){
                    try{
                      const q = query(collection(db, 'users'), where('__name__', 'in', chunk))
                      const snap = await getDocs(q)
                      results.push(...snap.docs.map(d=>({ id: d.id, ...d.data() })))
                    }catch(e){ console.error('Error fetching team members', e) }
                  }
                  setDeptUsers(results)
                }
              } else {
                setDeptUsers([])
              } } else { setDeptUsers([]) } }}>
          <option value="">-- None --</option>
          {teams.map(t=> <option key={t.id} value={t.id}>{t.name || t.id}</option>)}
        </select>
      </div>
      <div className="bg-panel-dark p-4 rounded">
        <label className="block text-sm mb-2">Select Recipients (optional)</label>
        {deptUsers.length === 0 ? (
          <div className="text-xs text-gray-400">{selectedTeam ? 'No users in selected team' : selectedDept ? 'No users in selected department' : 'Select team or department to show users'}</div>
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

        <form onSubmit={handleSend} className="mt-4 space-y-3">
          <label className="block text-sm">Choose file</label>
          <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} />
          <div className="flex items-center gap-2">
            <button disabled={sending} className="px-4 py-2 bg-green-600 rounded text-white">Send to Production</button>
            <div className="text-xs text-gray-400">Selected: {selectedRecipients.size} recipient(s)</div>
          </div>
        </form>
      </div>
    </div>
  )
}
