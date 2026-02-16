import React, { useState, useEffect } from 'react'
import { auth, db } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { useRouter } from 'next/router'
import Sidebar from '../components/Sidebar'
import ArtistSidebar from '../components/ArtistSidebar'
import Topbar from '../components/Topbar'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState('')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (authUser) => {
      if (!authUser) {
        router.push('/login')
        return
      }

      setUser(authUser)

      // Fetch user data from Firestore
      try {
        let userDocRef = doc(db, 'users', authUser.uid)
        let snap = await getDoc(userDocRef)
        
        // Fallback: find user by email if UID lookup fails
        if (!snap.exists()) {
          const q = query(collection(db, 'users'), where('email', '==', authUser.email))
          const querySnap = await getDocs(q)
          if (!querySnap.empty) {
            snap = querySnap.docs[0]
          }
        }

        if (snap.exists()) {
          const data = snap.data()
          let enrichedData = { ...data }
          
          // Fetch job title by jobId
          if (data?.jobId) {
            try {
              const jobDoc = await getDoc(doc(db, 'jobs', data.jobId))
              if (jobDoc.exists()) {
                enrichedData.jobTitle = jobDoc.data().name || jobDoc.data().title || data.jobTitle
              }
            } catch (e) {
              console.error('Error fetching job:', e)
            }
          }
          
          // Fetch department by departmentId
          if (data?.departmentId) {
            console.log('Looking up departmentId:', data.departmentId)
            try {
              // First try: departments collection
              let deptDoc = await getDoc(doc(db, 'departments', data.departmentId))
              console.log('Department doc exists?', deptDoc.exists())
              
              // If not found, try sections collection
              if (!deptDoc.exists()) {
                console.log('Not in departments, trying sections collection...')
                deptDoc = await getDoc(doc(db, 'sections', data.departmentId))
                console.log('Section doc exists?', deptDoc.exists())
              }
              
              if (deptDoc.exists()) {
                const deptData = deptDoc.data()
                console.log('Department/Section data:', deptData)
                enrichedData.department = deptData?.name || deptData?.title || deptData?.label || deptData?.text || data?.department || '-'
                console.log('Resolved department:', enrichedData.department)
              } else {
                console.log('Not found in departments or sections, using departmentId as value:', data.departmentId)
                enrichedData.department = data?.department || data.departmentId || '-'
              }
            } catch (e) {
              console.error('Error fetching department:', e)
              enrichedData.department = data?.department || data.departmentId || '-'
            }
          } else if (data?.sectionId) {
            console.log('Looking up sectionId:', data.sectionId)
            try {
              const sectionDoc = await getDoc(doc(db, 'sections', data.sectionId))
              if (sectionDoc.exists()) {
                const sectionData = sectionDoc.data()
                enrichedData.department = sectionData?.name || sectionData?.title || sectionData?.label || data?.section || data?.department || '-'
                console.log('Resolved section as department:', enrichedData.department)
              } else {
                enrichedData.department = data?.section || data?.department || '-'
              }
            } catch (e) {
              console.error('Error fetching section:', e)
              enrichedData.department = data?.section || data?.department || '-'
            }
          } else if (data?.roles) {
            // Try to get department from roles field
            console.log('Checking roles field for department:', data.roles)
            enrichedData.department = data.roles || '-'
          } else if (data?.department) {
            console.log('Using department from user data:', data.department)
            enrichedData.department = data.department
          } else if (data?.section) {
            console.log('Using section from user data:', data.section)
            enrichedData.department = data.section
          } else {
            enrichedData.department = '-'
          }
          console.log('Final enrichedData.department:', enrichedData.department)
          
          setUserData(enrichedData)
          
          // Determine role for sidebar selection (same logic as login.js)
          let extractedRoles = []
          
          // Priority 1: Check 'roles' field (can be array or string)
          const rolesField = data?.roles
          if (Array.isArray(rolesField)) {
            extractedRoles = rolesField.map(r => String(r || '').toLowerCase().trim()).filter(Boolean)
          } else if (rolesField && typeof rolesField === 'string') {
            extractedRoles = String(rolesField).toLowerCase().split(/[,;|\\/]+/).map(r => r.trim()).filter(Boolean)
          }
          
          // Priority 2: Try roleId lookup in roles collection if still empty
          if (extractedRoles.length === 0 && data?.roleId) {
            try {
              const roleIdValue = data.roleId
              // First try: direct document ID lookup
              let roleDoc = await getDoc(doc(db, 'roles', roleIdValue))
              
              // If not found, try searching for a role with id field matching roleIdValue
              if (!roleDoc.exists()) {
                const rolesSnap = await getDocs(query(collection(db, 'roles'), where('id', '==', roleIdValue)))
                if (!rolesSnap.empty) {
                  roleDoc = rolesSnap.docs[0]
                }
              }
              
              if (roleDoc.exists()) {
                const roleName = roleDoc.data().name || ''
                if (roleName) {
                  extractedRoles.push(String(roleName).toLowerCase().trim())
                }
              }
            } catch (e) {
              console.error('Error looking up role:', e)
            }
          }
          
          // Priority 3: Check jobTitle
          if (extractedRoles.length === 0 && enrichedData?.jobTitle) {
            extractedRoles.push(String(enrichedData.jobTitle).toLowerCase().trim())
          }
          
          // Determine sidebar based on roles found
          const rolesStr = extractedRoles.join(' ').toLowerCase()
          if (rolesStr.includes('artist')) {
            setUserRole('artist')
          } else if (rolesStr.includes('admin')) {
            setUserRole('admin')
          }
        }
      } catch (e) {
        console.error('Error fetching user profile:', e)
      } finally {
        setLoading(false)
      }
    })

    return () => unsub()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-300">
        Loading profile...
      </div>
    )
  }

  if (!user || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-300">
        No profile data found
      </div>
    )
  }

  const SidebarComponent = userRole === 'artist' ? ArtistSidebar : Sidebar

  return (
    <div className="min-h-screen bg-bg-dark text-gray-200">
      <SidebarComponent />
      <div className="md:pl-64 pl-0 pt-16 md:pt-0">
        <Topbar />

        <main className="p-4 md:p-6 max-w-6xl mx-auto">
          {/* Header with avatar and name */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {/* Avatar & Name Card */}
            <div className="md:col-span-1 bg-panel-dark rounded-lg p-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-900 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white">
                {(userData?.firstName || 'U').charAt(0)}
              </div>
              <h2 className="text-xl font-bold mb-1">
                {userData?.firstName} {userData?.lastName}
              </h2>
              <p className="text-xs text-gray-400 mb-4">{userData?.email}</p>
              <div className="text-xs text-gray-500 space-y-1">
                <p>📱 {userData?.phone || 'N/A'}</p>
                <p>🏢 {userData?.department || userData?.section || 'N/A'}</p>
              </div>
            </div>

            {/* General Information */}
            <div className="md:col-span-3 bg-panel-dark rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="text-blue-400">ℹ️</span> General Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-panel-muted rounded p-4">
                  <p className="text-xs text-gray-400 mb-1">Email Address</p>
                  <p className="font-semibold">{userData?.email}</p>
                </div>
                <div className="bg-panel-muted rounded p-4">
                  <p className="text-xs text-gray-400 mb-1">Job Title</p>
                  <p className="font-semibold">{userData?.jobTitle || userData?.job || '-'}</p>
                </div>
                <div className="bg-panel-muted rounded p-4">
                  <p className="text-xs text-gray-400 mb-1">Department</p>
                  <p className="font-semibold">{userData?.department || userData?.section || '-'}</p>
                </div>
                <div className="bg-panel-muted rounded p-4">
                  <p className="text-xs text-gray-400 mb-1">Status</p>
                  <p className="font-semibold text-green-400">{userData?.status || 'Active'}</p>
                </div>
                <div className="bg-panel-muted rounded p-4">
                  <p className="text-xs text-gray-400 mb-1">Employee ID</p>
                  <p className="font-semibold">{userData?.employeeId || '-'}</p>
                </div>
                <div className="bg-panel-muted rounded p-4">
                  <p className="text-xs text-gray-400 mb-1">Team</p>
                  <p className="font-semibold">{userData?.team || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Role & Permissions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-panel-dark rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="text-blue-400">👤</span> Role Information
              </h3>
              <div className="space-y-3">
                <div className="bg-panel-muted rounded p-4">
                  <p className="text-xs text-gray-400 mb-1">Roles</p>
                  <p className="font-semibold">{userData?.roles || userData?.roleId || 'Not Assigned'}</p>
                </div>
                <div className="bg-panel-muted rounded p-4">
                  <p className="text-xs text-gray-400 mb-1">Role ID</p>
                  <p className="font-semibold text-sm">{userData?.roleId || '-'}</p>
                </div>
                <div className="bg-panel-muted rounded p-4">
                  <p className="text-xs text-gray-400 mb-1">Permission Level</p>
                  <p className="font-semibold">{(userData?.roles || userData?.roleId || '').toLowerCase().includes('admin') ? 'Administrator' : 'Standard User'}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-panel-dark rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="text-blue-400">📞</span> Contact Information
              </h3>
              <div className="space-y-3">
                <div className="bg-panel-muted rounded p-4">
                  <p className="text-xs text-gray-400 mb-1">Phone</p>
                  <p className="font-semibold">{userData?.phone || 'Not Provided'}</p>
                </div>
                <div className="bg-panel-muted rounded p-4">
                  <p className="text-xs text-gray-400 mb-1">Address</p>
                  <p className="font-semibold text-xs">{userData?.address || 'Not Provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-panel-dark rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="text-blue-400">🔐</span> Account Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-panel-muted rounded p-4">
                <p className="text-xs text-gray-400 mb-1">Account Status</p>
                <p className="font-semibold text-green-400">Active</p>
              </div>
              <div className="bg-panel-muted rounded p-4">
                <p className="text-xs text-gray-400 mb-1">Last Active</p>
                <p className="font-semibold text-xs">
                  {userData?.lastActive?.toDate?.().toLocaleDateString() || 'Today'}
                </p>
              </div>
              <div className="bg-panel-muted rounded p-4">
                <p className="text-xs text-gray-400 mb-1">User ID</p>
                <p className="font-semibold text-xs truncate">{user?.uid}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
