import React, { useEffect, useState, useMemo } from 'react'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { createUserWithEmailAndPassword, updateProfile, updateEmail } from 'firebase/auth'
import { db, auth } from '../lib/firebase'
import DashboardCard from './DashboardCard'
import UserForm from './forms/UserForm'

export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [jobs, setJobs] = useState([])
  const [departments, setDepartments] = useState([])
  const [rolesData, setRolesData] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [currentUser, setCurrentUser] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    fetchLookups()
    fetchUsers()
  }, [])

  async function fetchLookups() {
    try {
      const jobsSnap = await getDocs(collection(db, 'jobs'))
      const jobsList = jobsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      
      // Define default jobs to always include
      const defaultJobs = [
        { id: 'artist', name: 'Artist' },
        { id: 'director', name: 'Director' },
        { id: 'supervisor', name: 'Supervisor' },
        { id: 'animator', name: 'Animator' },
        { id: 'cleanup_artist', name: 'Cleanup Artist' },
        { id: 'in_betweener', name: 'In-Betweener' },
        { id: 'colorist', name: 'Colorist' },
        { id: 'checker', name: 'Checker' },
        { id: 'storyboard_artist', name: 'Storyboard Artist' },
        { id: 'background_artist', name: 'Background Artist' },
        { id: 'compositor', name: 'Compositor' },
        { id: 'admin', name: 'Administrator' },
        { id: 'hr', name: 'HR Staff' },
        { id: 'finance', name: 'Finance Staff' },
        { id: 'manager', name: 'Manager' },
      ]
      
      // Merge: keep fetched jobs and add any defaults that aren't already there
      const mergedJobs = [...jobsList]
      const existingIds = new Set(mergedJobs.map(j => j.id))
      for (const defaultJob of defaultJobs) {
        if (!existingIds.has(defaultJob.id)) {
          mergedJobs.push(defaultJob)
        }
      }
      
      setJobs(mergedJobs)
      
      const depsSnap = await getDocs(collection(db, 'sections'))
      setDepartments(depsSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      const rolesSnap = await getDocs(collection(db, 'roles'))
      setRolesData(rolesSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (e) {
      console.error(e)
    }
  }

  async function fetchUsers() {
    setLoading(true)
    try {
      const snapshot = await getDocs(collection(db, 'users'))
      setUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function isUserOnline(u) {
    try {
      const last = u?.lastActive
      if (!last) return false
      let d
      if (last.toDate && typeof last.toDate === 'function') d = last.toDate()
      else d = new Date(last)
      if (isNaN(d)) return false
      const diff = Date.now() - d.getTime()
      return diff <= 5 * 60 * 1000
    } catch (e) {
      return false
    }
  }

  const filteredUsers = useMemo(() => {
    const q = (searchTerm || '').trim().toLowerCase()
    let list = users.filter(u => {
      if (!q) return true
      const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase()
      const email = (u.email || '').toLowerCase()
      const emp = (u.employeeId || u.id || '').toString().toLowerCase()
      const deptName = (() => {
        if (u.department) return (u.department || '').toLowerCase()
        if (u.departmentId) {
          const d = departments.find(x => x.id === u.departmentId)
          return (d?.name || '').toLowerCase()
        }
        return ''
      })()
      const jobName = (() => {
        if (u.jobTitle) return (u.jobTitle || '').toLowerCase()
        if (u.jobId) {
          const j = jobs.find(x => x.id === u.jobId)
          return (j?.name || '').toLowerCase()
        }
        return ''
      })()
      const roleName = (() => {
        if (u.role) return (u.role || '').toLowerCase()
        if (u.roleId) {
          const r = rolesData.find(x => x.id === u.roleId)
          return (r?.name || '').toLowerCase()
        }
        return ''
      })()
      return name.includes(q) || email.includes(q) || emp.includes(q) || deptName.includes(q) || jobName.includes(q) || roleName.includes(q)
    })

    if (statusFilter === 'Online') {
      list = list.filter(u => isUserOnline(u))
    } else if (statusFilter === 'Offline') {
      list = list.filter(u => !isUserOnline(u))
    } else {
      list.sort((a, b) => (isUserOnline(b) ? 1 : 0) - (isUserOnline(a) ? 1 : 0))
    }

    return list
  }, [users, searchTerm, statusFilter, jobs, departments, rolesData])

  async function handleAddUser(user) {
    try {
      setLoading(true)
      
      // Validate email and password
      if (!user.email || !user.password) {
        alert('Email and password are required!')
        setLoading(false)
        return
      }
      
      const { password, firstName, lastName, email, roleId, ...userData } = user
      
      console.log('Creating user with email:', email)
      
      // Create Firebase Auth account
      const authUser = await createUserWithEmailAndPassword(auth, email, password)
      console.log('Auth user created:', authUser.user.uid)
      
      // Update auth profile
      await updateProfile(authUser.user, {
        displayName: `${firstName} ${lastName}`
      })
      
      // Get role name from roleId
      let roleName = ''
      if (roleId) {
        const foundRole = rolesData.find(r => r.id === roleId)
        roleName = foundRole?.name || ''
      }
      
      // Add user data to Firestore with auth UID
      const userDocData = {
        ...userData,
        firstName,
        lastName,
        email,
        roleId,
        role: roleName,  // Store role name directly for easier access in login
        uid: authUser.user.uid,
        createdAt: serverTimestamp()
      }
      
      console.log('Saving to Firestore:', userDocData)
      await addDoc(collection(db, 'users'), userDocData)
      
      setShowModal(false)
      fetchUsers()
      alert('User created successfully! They can now login with their email and password.')
    } catch (e) {
      console.error('add user error', e)
      let errorMsg = e.message
      if (e.code === 'auth/email-already-in-use') {
        errorMsg = 'Email is already in use. Please use a different email.'
      } else if (e.code === 'auth/weak-password') {
        errorMsg = 'Password is too weak. Please use a stronger password (min 6 characters).'
      } else if (e.code === 'auth/invalid-email') {
        errorMsg = 'Invalid email format. Please check the email address.'
      }
      alert('Failed to add user: ' + errorMsg)
    } finally {
      setLoading(false)
    }
  }

  async function handleEditUser(user) {
    try {
      setLoading(true)
      const { id, uid, password, firstName, lastName, email, roleId, ...data } = user
      const originalUser = users.find(u => u.id === id)
      
      // Get role name from roleId
      let roleName = ''
      if (roleId) {
        const foundRole = rolesData.find(r => r.id === roleId)
        roleName = foundRole?.name || ''
      }
      
      // Prepare Firestore update (exclude password from DB)
      const updateData = {
        ...data,
        firstName,
        lastName,
        email,
        roleId,
        role: roleName,  // Store role name directly for easier access in login
        updatedAt: serverTimestamp()
      }
      
      // Update Firestore first
      await updateDoc(doc(db, 'users', id), updateData)
      console.log('Firestore updated successfully')
      
      // Try to update Firebase Auth email if it changed
      if (email && email !== originalUser?.email && uid) {
        try {
          console.log('Attempting to update email in Firebase Auth for UID:', uid)
          
          // Try backend API first (requires Firebase Admin SDK setup)
          const authResponse = await fetch('/api/updateUserEmail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, newEmail: email })
          })
          
          const responseData = await authResponse.json()
          console.log('API Response:', responseData)
          
          if (authResponse.ok) {
            console.log('✅ Firebase Auth email updated via backend:', responseData.message)
            alert('User updated! Email has been changed in both Firestore and Firebase Authentication.')
          } else {
            console.warn('⚠️ Backend email update failed:', responseData.error)
            console.warn('Full response:', responseData)
            
            // Fallback: Try client-side update for current user
            const currentAuthUser = auth.currentUser
            if (currentAuthUser?.uid === uid) {
              await updateEmail(currentAuthUser, email)
              console.log('Firebase Auth email updated (current user)')
              alert('User updated! (Current user email updated)')
            } else {
              console.warn('Email updated in Firestore only. Reason:', responseData.error)
              alert('User profile updated in system. Firebase Authentication update: ' + responseData.error)
            }
          }
        } catch (authError) {
          console.error('Auth email update error:', authError)
          alert('User updated in system. Email sync error (will retry). Check console for details.')
        }
      }
      
      setShowModal(false)
      fetchUsers()
      alert('User updated successfully!')
    } catch (e) {
      console.error('edit user error', e)
      alert('Failed to update user: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteUser(id) {
    const ok = window.confirm('Are you sure you want to delete this user? This action cannot be undone.')
    if (!ok) return
    try {
      setLoading(true)
      await deleteDoc(doc(db, 'users', id))
      fetchUsers()
    } catch (e) {
      console.error('delete user error', e)
      alert('Failed to delete user. See console for details.')
    } finally {
      setLoading(false)
    }
  }

  const totalUsers = users.length
  const onlineUsers = users.filter(u => isUserOnline(u)).length
  const adminCount = users.filter(u => u.role === 'Administrator').length

  // Pagination calculations
  const totalUsersFiltered = filteredUsers.length
  const totalPages = Math.max(1, Math.ceil(totalUsersFiltered / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  function getPageItems() {
    const items = []
    const maxVisible = 5
    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) items.push(i)
    } else {
      items.push(1)
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      if (start > 2) items.push('...')
      for (let i = start; i <= end; i++) items.push(i)
      if (end < totalPages - 1) items.push('...')
      items.push(totalPages)
    }
    return items
  }

  function formatLastActive(v) {
    if (!v) return '-'
    try {
      if (v.toDate && typeof v.toDate === 'function') return v.toDate().toLocaleString()
      if (typeof v === 'string') {
        const d = new Date(v)
        if (!isNaN(d)) return d.toLocaleString()
        return v
      }
      if (v instanceof Date) return v.toLocaleString()
      return String(v)
    } catch (e) {
      return '-'
    }
  }

  return (
    <div className="w-full">
      <div className="bg-panel-dark w-full px-8 py-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">User Management</h1>
            <p className="text-gray-400 mb-6 text-base">Manage user accounts, roles, and permissions</p>
          </div>
          <div>
            <button
              className="bg-accent-blue px-4 py-2 rounded text-white font-semibold"
              onClick={() => { setModalMode('add'); setCurrentUser(null); setShowModal(true) }}
            >
              + Add New User
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6 mt-4">
          <DashboardCard title="Total Users" variant="purple" icon="👥">
            <div className="text-2xl font-bold">{totalUsers}</div>
          </DashboardCard>
          <DashboardCard title="Active Users" variant="green" icon="✓">
            <div className="text-2xl font-bold">{onlineUsers}</div>
          </DashboardCard>
          <DashboardCard title="Administrators" variant="orange" icon="⚙️">
            <div className="text-2xl font-bold">{adminCount}</div>
          </DashboardCard>
          <DashboardCard title="Online Now" variant="teal" icon="🌐">
            <div className="text-2xl font-bold">{onlineUsers}</div>
          </DashboardCard>
        </div>

        <div className="mb-4 flex justify-between items-center">
          <div className="w-2/3">
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-panel-muted px-4 py-2 rounded text-gray-200 w-full border border-white/20 placeholder:text-gray-400"
              placeholder="Search by name, id, department, role or email..."
            />
          </div>
          <div className="flex items-center gap-3">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-panel-muted px-3 py-2 rounded text-gray-200 border border-white/20">
              <option value="All">All Status</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>
          </div>
        </div>

        {/* USER TABLE */}
        <div className="mb-6">
          <div className="bg-panel-dark rounded shadow overflow-x-auto">
            <table className="min-w-full w-full text-sm table-auto">
              <colgroup>
                <col style={{ width: '22%' }} /> {/* User Name */}
                <col style={{ width: '12%' }} /> {/* Employee ID */}
                <col style={{ width: '14%' }} /> {/* Job Title */}
                <col style={{ width: '18%' }} /> {/* Department */}
                <col style={{ width: '8%' }} />  {/* Status */}
                <col style={{ width: '16%' }} /> {/* Last Active */}
                <col style={{ width: '10%' }} /> {/* Actions */}
              </colgroup>
              <thead>
                <tr className="border-b border-blue-900/30">
                  <th className="px-6 py-4 text-left text-sm font-semibold">USER NAME</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">EMPLOYEE ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">JOB TITLE</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">DEPARTMENT/SECTION</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">STATUS</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">LAST ACTIVE</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="p-4 text-center text-gray-400">Loading...</td></tr>
                ) : paginatedUsers.length === 0 ? (
                  <tr><td colSpan={7} className="p-4 text-center text-gray-400 text-xs">No users found</td></tr>
                ) : paginatedUsers.map((u, i) => (
                  <tr 
                    key={u.id} 
                    className={`border-b border-blue-900/20 ${i % 2 === 0 ? 'bg-blue-950/20' : 'bg-transparent'}`}
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-sm">{u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : (u.username || u.email || '-')}</div>
                      <div className="text-xs text-gray-400 mt-1">{u.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">{u.employeeId || u.id || '-'}</td>
                    <td className="px-6 py-4 text-sm">{(u.jobTitle) || (u.jobId && jobs.find(j => j.id === u.jobId)?.name) || '-'}</td>
                    <td className="px-6 py-4 text-sm">{(u.department) || (u.departmentId && departments.find(d => d.id === u.departmentId)?.name) || u.section || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center gap-1 ${isUserOnline(u) ? 'text-green-300' : 'text-gray-400'}`}>
                        <span className={`w-2 h-2 rounded-full ${isUserOnline(u) ? 'bg-green-400' : 'bg-gray-600'}`} />
                        {isUserOnline(u) ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{formatLastActive(u.lastActive)}</td>
                    <td className="px-6 py-4 text-sm">
                      <button className="text-blue-400 mr-1 text-xs" onClick={() => { setModalMode('edit'); setCurrentUser(u); setShowModal(true) }}>✎ Edit</button>
                      <button className="text-red-400 text-xs" onClick={() => handleDeleteUser(u.id)}>🗑️ Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-300">Items per page:</label>
            <select 
              value={pageSize} 
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="bg-panel-muted px-3 py-1 rounded text-gray-200 border border-white/20 text-sm"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="bg-panel-muted rounded-full px-4 py-2 flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-full bg-accent-blue text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600"
            >
              ← Prev
            </button>

            <div className="flex items-center gap-1">
              {getPageItems().map((item, idx) => (
                <span key={idx}>
                  {item === '...' ? (
                    <span className="px-2 text-gray-400">…</span>
                  ) : (
                    <button
                      onClick={() => typeof item === 'number' && setCurrentPage(item)}
                      className={`px-3 py-1 rounded-full text-sm transition ${
                        item === currentPage
                          ? 'bg-accent-blue text-white'
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      {item}
                    </button>
                  )}
                </span>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-full bg-accent-blue text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600"
            >
              Next →
            </button>
          </div>

          <div className="text-sm text-gray-400">
            Showing {startIndex + 1}-{Math.min(endIndex, totalUsersFiltered)} of {totalUsersFiltered}
          </div>
        </div>

        {/* Modal for Add/Edit User */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-panel-dark p-6 rounded shadow max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
              <button type="button" aria-label="Close" onClick={() => setShowModal(false)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-200">?</button>
              <h2 className="text-xl font-bold mb-4">{modalMode === 'add' ? 'Add New User' : 'Edit User'}</h2>
              <UserForm
                user={currentUser}
                mode={modalMode}
                jobs={jobs}
                departments={departments}
                roles={rolesData}
                onSubmit={modalMode === 'add' ? handleAddUser : handleEditUser}
                onCancel={() => setShowModal(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
