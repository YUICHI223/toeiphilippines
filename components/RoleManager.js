import React, { useEffect, useState, useMemo } from 'react'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import RoleForm from './forms/RoleForm'

export default function RoleManager() {
  const [roles, setRoles] = useState([])
  const [userCounts, setUserCounts] = useState({})
  const [foundUserRoles, setFoundUserRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [currentRole, setCurrentRole] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '', permissions: '' })
  const [expandedRoles, setExpandedRoles] = useState({})
  const [selectedPermissions, setSelectedPermissions] = useState([])

  const allPermissions = [
    { category: 'User Management', items: ['Manage Users', 'Teams'] },
    { category: 'Role Management', items: ['Role Manager'] },
    { category: 'Department Management', items: ['Departments'] },
    { category: 'Project Management', items: ['Projects'] },
    { category: 'Attendance View', items: ['Attendance Log', 'Attendance'] },
    { category: 'Attendance Edit', items: ['Attendance Log (Edit)'] },
    { category: 'Reports View', items: ['Reports', 'Payroll Reports'] },
    { category: 'Analytics View', items: ['Analytics'] },
    { category: 'Settings Access', items: ['System Settings', 'Dashboard Overview'] },
    { category: 'Profile Edit', items: ['Profile', 'My Profile'] },
    { category: 'Task Management', items: ['Task Management'] },
    { category: 'Calendar Access', items: ['Calendar Access', 'Calendar'] },
    { category: 'Animation Management', items: ['Animation Management', 'Animation Projects'] },
    { category: 'Production Oversight', items: ['Production Oversight'] },
    { category: 'Quality Control', items: ['Quality Control'] },
    { category: 'Client Management', items: ['Client Management'] },
    { category: 'Production Management', items: ['Production Control', 'Status of Production'] },
    { category: 'Downtime Management', items: ['Downtime Management', 'Downtime Grant (Per department)'] },
    { category: 'Downtime Request', items: ['Downtime Request', 'Request Downtime'] },
    { category: 'Leave Management', items: ['All Leaves', 'Leave Requests'] },
    { category: 'Leave Request', items: ['Leave Request', 'Request Leave'] },
    { category: 'Backup Management', items: ['Backup Checker Management'] },
    { category: 'Overtime Management', items: ['Overtime Requests', 'Overtime (Requests)'] },
    { category: 'Payslip View', items: ['Payslips', 'Payroll Calculator'] },
    { category: 'Payslip Management', items: ['Receive PDF from Supervisor'] },
    { category: 'Loan Management', items: ['Loans'] },
    { category: 'Premium Management', items: ['Premiums'] },
    { category: 'COC Management', items: ['COE Requests', 'COE Request +1 more'] },
    { category: 'Team Management', items: ['Team', 'Teams'] },
    { category: 'Team Chat', items: ['Team Chat', 'Chatbox'] },
    { category: 'Cancelled Productions', items: ['Cancelled Productions'] },
    { category: 'Onhold Productions', items: ['On Hold Productions'] },
    { category: 'Pdf Management', items: ['Send PDF to Payroll'] },
  ]

  // Helper: normalize a permission label or key to a canonical key (snake_case)
  function permissionKey(s) {
    if (!s && s !== 0) return ''
    return String(s)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
  }

  const predefinedRoles = [
    'ADMINISTRATOR',
    'PCA - KA', 'PCA - IB', 'PCA - BG', 'PCA - TP',
    'CHECKER - KA', 'CHECKER - IB', 'CHECKER - BG', 'CHECKER - TP',
    'FINAL CHECKER - KA', 'FINAL CHECKER - IB', 'FINAL CHECKER - BG', 'FINAL CHECKER - TP',
    'ARTIST - KA', 'ARTIST - IB', 'ARTIST - BG', 'ARTIST - TP',
    'SUPERVISOR - KA', 'SUPERVISOR - IB', 'SUPERVISOR - BG', 'SUPERVISOR - TP',
    'LEAD ANIMATOR', 'SENIOR CHECKER', 'PRODUCTION COORDINATOR',
    'TECHNICAL DIRECTOR',
    'PAYROLL - KA', 'PAYROLL - IB', 'PAYROLL - BG', 'PAYROLL - TP'
  ]

  const roleTemplates = {
    'ADMINISTRATOR': {
      description: 'Full system access with all permissions for Toei Animation Philippines',
      permissions: allPermissions.flatMap(cat => cat.items)
    },
    'PCA - KA': {
      description: 'Production Control Assistant - Key Animator',
      permissions: ['Reports View', 'Attendance View', 'Task Management', 'Status of Production', 'Production Control', 'Calendar Access']
    },
    'PCA - IB': {
      description: 'Production Control Assistant - Inbetweener',
      permissions: ['Reports View', 'Attendance View', 'Task Management', 'Status of Production', 'Production Control', 'Calendar Access']
    },
    'PCA - BG': {
      description: 'Production Control Assistant - Background',
      permissions: ['Reports View', 'Attendance View', 'Task Management', 'Status of Production', 'Production Control', 'Calendar Access']
    },
    'PCA - TP': {
      description: 'Production Control Assistant - Trace and Paint',
      permissions: ['Reports View', 'Attendance View', 'Task Management', 'Status of Production', 'Production Control', 'Calendar Access']
    },
    'CHECKER - KA': {
      description: 'Checker for Key Animator',
      permissions: ['Reports View', 'Attendance View', 'Task Management', 'Quality Control', 'Calendar Access', 'Animation Management']
    },
    'CHECKER - IB': {
      description: 'Checker for Inbetweener',
      permissions: ['Reports View', 'Attendance View', 'Task Management', 'Quality Control', 'Calendar Access', 'Animation Management']
    },
    'CHECKER - BG': {
      description: 'Checker for Background',
      permissions: ['Reports View', 'Attendance View', 'Task Management', 'Quality Control', 'Calendar Access', 'Animation Management']
    },
    'CHECKER - TP': {
      description: 'Checker for Trace and Paint',
      permissions: ['Reports View', 'Attendance View', 'Task Management', 'Quality Control', 'Calendar Access', 'Animation Management']
    },
    'FINAL CHECKER - KA': {
      description: 'Final Checker for Key Animator',
      permissions: ['Reports View', 'Attendance View', 'Quality Control', 'Production Oversight', 'Calendar Access', 'Animation Management']
    },
    'FINAL CHECKER - IB': {
      description: 'Final Checker for Inbetweener',
      permissions: ['Reports View', 'Attendance View', 'Quality Control', 'Production Oversight', 'Calendar Access', 'Animation Management']
    },
    'FINAL CHECKER - BG': {
      description: 'Final Checker for Background',
      permissions: ['Reports View', 'Attendance View', 'Quality Control', 'Production Oversight', 'Calendar Access', 'Animation Management']
    },
    'FINAL CHECKER - TP': {
      description: 'Final Checker for Trace and Paint',
      permissions: ['Reports View', 'Attendance View', 'Quality Control', 'Production Oversight', 'Calendar Access', 'Animation Management']
    },
    'ARTIST - KA': {
      description: 'Artist - Key Animator',
      permissions: ['Profile Edit', 'My Profile', 'Payslips', 'Attendance Log', 'Attendance', 'Leave Request', 'Request Leave']
    },
    'ARTIST - IB': {
      description: 'Artist - Inbetweener',
      permissions: ['Profile Edit', 'My Profile', 'Payslips', 'Attendance Log', 'Attendance', 'Leave Request', 'Request Leave']
    },
    'ARTIST - BG': {
      description: 'Artist - Background',
      permissions: ['Profile Edit', 'My Profile', 'Payslips', 'Attendance Log', 'Attendance', 'Leave Request', 'Request Leave']
    },
    'ARTIST - TP': {
      description: 'Artist - Trace and Paint',
      permissions: ['Profile Edit', 'My Profile', 'Payslips', 'Attendance Log', 'Attendance', 'Leave Request', 'Request Leave']
    },
    'SUPERVISOR - KA': {
      description: 'Supervisor - Key Animator',
      permissions: ['Reports View', 'Payroll Reports', 'Attendance Log', 'Attendance Log (Edit)', 'Task Management', 'Status of Production', 'Production Control', 'Calendar Access']
    },
    'SUPERVISOR - IB': {
      description: 'Supervisor - Inbetweener',
      permissions: ['Reports View', 'Payroll Reports', 'Attendance Log', 'Attendance Log (Edit)', 'Task Management', 'Status of Production', 'Production Control', 'Calendar Access']
    },
    'SUPERVISOR - BG': {
      description: 'Supervisor - Background',
      permissions: ['Reports View', 'Payroll Reports', 'Attendance Log', 'Attendance Log (Edit)', 'Task Management', 'Status of Production', 'Production Control', 'Calendar Access']
    },
    'SUPERVISOR - TP': {
      description: 'Supervisor - Trace and Paint',
      permissions: ['Reports View', 'Payroll Reports', 'Attendance Log', 'Attendance Log (Edit)', 'Task Management', 'Status of Production', 'Production Control', 'Calendar Access']
    },
    'LEAD ANIMATOR': {
      description: 'Lead Animator - Senior animation role with team leadership',
      permissions: ['Reports View', 'Task Management', 'Team', 'Teams', 'Team Chat', 'Chatbox', 'Animation Management', 'Calendar Access']
    },
    'SENIOR CHECKER': {
      description: 'Senior Checker - Advanced quality control role',
      permissions: ['Reports View', 'Quality Control', 'Production Oversight', 'Animation Management', 'Task Management', 'Calendar Access']
    },
    'PRODUCTION COORDINATOR': {
      description: 'Production Coordinator - Project coordination and management',
      permissions: ['Reports View', 'Payroll Reports', 'Task Management', 'Status of Production', 'Production Control', 'Client Management', 'Calendar Access']
    },
    'TECHNICAL DIRECTOR': {
      description: 'Technical Director - Technical oversight and guidance',
      permissions: ['Reports View', 'Analytics', 'Task Management', 'Production Oversight', 'Animation Management', 'System Settings', 'Calendar Access']
    },
    'PAYROLL - KA': {
      description: 'Payroll - Key Animator Department',
      permissions: ['Reports View', 'Payroll Reports', 'Payslips', 'Payroll Calculator', 'Loans', 'Premiums', 'Attendance Log']
    },
    'PAYROLL - IB': {
      description: 'Payroll - Inbetweener Department',
      permissions: ['Reports View', 'Payroll Reports', 'Payslips', 'Payroll Calculator', 'Loans', 'Premiums', 'Attendance Log']
    },
    'PAYROLL - BG': {
      description: 'Payroll - Background Department',
      permissions: ['Reports View', 'Payroll Reports', 'Payslips', 'Payroll Calculator', 'Loans', 'Premiums', 'Attendance Log']
    },
    'PAYROLL - TP': {
      description: 'Payroll - Tool Philippines Department',
      permissions: ['Reports View', 'Payroll Reports', 'Payslips', 'Payroll Calculator', 'Loans', 'Premiums', 'Attendance Log']
    }
  }

  useEffect(() => {
    loadRolesOnce()
  }, [])

  async function loadRolesOnce() {
    try {
      setLoading(true)
      const snapshot = await getDocs(collection(db, 'roles'))
      const allRoles = snapshot.docs.map(d => ({ 
        docId: d.id,  // Keep Firestore document ID separate
        ...d.data() 
      }))
      setRoles(allRoles)
      
      // Only initialize missing predefined roles if we have fewer than 15 roles
      if (allRoles.length < 15) {
        const existingNames = new Set(allRoles.map(r => r.name))
        const missingRoles = predefinedRoles.filter(name => !existingNames.has(name))
        
        if (missingRoles.length > 0) {
          for (const roleName of missingRoles) {
            await addDoc(collection(db, 'roles'), {
              name: roleName,
              description: '',
              permissions: [],
              createdAt: serverTimestamp()
            })
          }
          // Fetch again after adding
          fetchRoles()
        }
      }
      // Ensure we compute user counts by fetching roles again (this runs the user-scan/count logic)
      await fetchRoles()
    } catch (e) {
      console.error('Error loading roles:', e)
      alert('Failed to load roles. See console for details.')
    } finally {
      setLoading(false)
    }
  }

  async function createRoleFromTemplate(roleName) {
    try {
      const template = roleTemplates[roleName]
      if (!template) {
        alert('Template not found')
        return
      }

      // Check if role already exists
      if (roles.some(r => r.name === roleName)) {
        alert(`Role "${roleName}" already exists`)
        return
      }

      setLoading(true)
      
      await addDoc(collection(db, 'roles'), {
        name: roleName,
        description: template.description,
        permissions: template.permissions,
        createdAt: serverTimestamp()
      })

      await fetchRoles()
      alert(`✓ Created "${roleName}" from template`)
    } catch (e) {
      console.error('Error creating role from template:', e)
      alert(`Failed: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function removeDuplicateRoles() {
    const ok = window.confirm('⚠️ This will remove 600+ duplicates. This WILL take 5-10 minutes.\n\nDo NOT close or refresh the browser. Continue?')
    if (!ok) return
    
    try {
      setLoading(true)
      
      // Get all roles
      const snapshot = await getDocs(collection(db, 'roles'))
      const allRoles = snapshot.docs.map(d => ({ docId: d.id, ...d.data() }))
      
      console.log(`Total roles before cleanup: ${allRoles.length}`)
      alert(`Starting cleanup: ${allRoles.length} roles to process...`)
      
      // Group by role name (case-insensitive)
      const rolesByNameLower = {}
      
      allRoles.forEach(role => {
        const nameLower = (role.name || '').toLowerCase().trim()
        if (!rolesByNameLower[nameLower]) {
          rolesByNameLower[nameLower] = []
        }
        rolesByNameLower[nameLower].push(role)
      })
      
      // Collect all duplicate IDs
      const toDelete = []
      Object.entries(rolesByNameLower).forEach(([nameLower, roles]) => {
        if (roles.length > 1) {
          // Keep first, delete rest (use docId, not id field)
          for (let i = 1; i < roles.length; i++) {
            toDelete.push(roles[i].docId)  // Use docId here!
          }
        }
      })
      
      console.log(`Total duplicates to delete: ${toDelete.length}`)
      alert(`Found ${toDelete.length} duplicates. Starting deletion...\n\nDO NOT REFRESH`)
      
      // Delete ALL at once using multiple parallel batches
      const batchSize = 50
      let deleted = 0
      
      for (let i = 0; i < toDelete.length; i += batchSize) {
        const batch = writeBatch(db)
        const batchIds = toDelete.slice(i, i + batchSize)
        
        for (const docId of batchIds) {
          batch.delete(doc(db, 'roles', docId))
        }
        
        console.log(`Committing batch ${Math.floor(i / batchSize) + 1}...`)
        await batch.commit()
        deleted += batchIds.length
        console.log(`Progress: ${deleted}/${toDelete.length}`)
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      console.log(`All deletions completed: ${deleted}`)
      alert(`✓ Deleted ${deleted} duplicates!\n\nRefreshing in 2 seconds...`)
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      await fetchRoles()
    } catch (e) {
      console.error('Error:', e)
      alert(`ERROR: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function fetchRoles() {
    setLoading(true)
    try {
      const snapshot = await getDocs(collection(db, 'roles'))
      const rolesData = snapshot.docs.map(d => ({ 
        docId: d.id,  // Keep Firestore document ID separate
        ...d.data() 
      }))
      console.log(`Fetched ${rolesData.length} roles from Firebase`)
      setRoles(rolesData)

      // Fetch users once to compute counts per role
      try {
        const usersSnap = await getDocs(collection(db, 'users'))
        const counts = {}
        // initialize counts for known role docIds
        rolesData.forEach(r => { counts[r.docId] = 0 })

        const found = new Set()
        usersSnap.docs.forEach(uDoc => {
          const u = uDoc.data()
          const roleIdFromUser = u?.roleId
          const roleNameFromUser = u?.role

          let matchedRole = null

          if (roleIdFromUser) {
            matchedRole = rolesData.find(r => r.docId === roleIdFromUser || r.id === roleIdFromUser || String(r.docId) === String(roleIdFromUser))
          }

          if (!matchedRole && roleNameFromUser) {
            matchedRole = rolesData.find(r => (r.name || '').toLowerCase().trim() === String(roleNameFromUser || '').toLowerCase().trim())
          }

          if (matchedRole) {
            counts[matchedRole.docId] = (counts[matchedRole.docId] || 0) + 1
          }

          // record raw role references we found on user documents
          if (u?.role) found.add(String(u.role))
          if (u?.roleId) found.add(String(u.roleId))
        })

        setFoundUserRoles(Array.from(found))

        setUserCounts(counts)
      } catch (e) {
        console.warn('Failed to fetch users for counts', e)
      }
    } catch (e) {
      console.error('Error fetching roles:', e)
      alert('Failed to load roles. See console for details.')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddRole(e) {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('Role name is required')
      return
    }
    try {
      setLoading(true)
      // Convert selected display labels to canonical keys before saving
      const toSave = (selectedPermissions || []).map(p => permissionKey(p))
      await addDoc(collection(db, 'roles'), {
        name: formData.name,
        description: formData.description,
        permissions: toSave,
        createdAt: serverTimestamp()
      })
      setShowModal(false)
      setFormData({ name: '', description: '', permissions: '' })
      setSelectedPermissions([])
      fetchRoles()
    } catch (e) {
      console.error('Error adding role:', e)
      alert('Failed to add role. See console for details.')
    } finally {
      setLoading(false)
    }
  }

  async function handleEditRole(e) {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('Role name is required')
      return
    }
    try {
      setLoading(true)
      // Convert selected display labels to canonical keys before saving
      const toSave = (selectedPermissions || []).map(p => permissionKey(p))
      await updateDoc(doc(db, 'roles', currentRole.docId), {
        name: formData.name,
        description: formData.description,
        permissions: toSave,
        updatedAt: serverTimestamp()
      })
      setShowModal(false)
      setFormData({ name: '', description: '', permissions: '' })
      setSelectedPermissions([])
      setCurrentRole(null)
      fetchRoles()
    } catch (e) {
      console.error('Error updating role:', e)
      alert('Failed to update role. See console for details.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteRole(docId) {
    // docId is passed from the trash button onClick
    const role = roles.find(r => r.docId === docId)
    if (!role) {
      alert('Error: Could not find role')
      return
    }
    
    const ok = window.confirm('Are you sure you want to delete this role? This action cannot be undone.')
    if (!ok) return
    try {
      setLoading(true)
      console.log(`Attempting to delete role: ${role.name} with docId: "${docId}"`)
      
      const batch = writeBatch(db)
      const docRef = doc(db, 'roles', docId)
      
      console.log(`Adding delete operation to batch for: ${docRef.path}`)
      batch.delete(docRef)
      
      console.log(`Committing batch...`)
      await batch.commit()
      console.log(`Batch commit successful`)
      
      // Wait for Firebase to propagate
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log(`Fetching updated roles...`)
      await fetchRoles()
      alert('Role deleted successfully!')
    } catch (e) {
      console.error('Error deleting role:', e)
      alert(`Failed: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  function openAddModal() {
    setModalMode('add')
    setCurrentRole(null)
    setFormData({ name: '', description: '', permissions: '' })
    setSelectedPermissions([])
    setShowModal(true)
  }

  function openEditModal(role) {
    setModalMode('edit')
    setCurrentRole(role)
    setFormData({
      name: role.name || '',
      description: role.description || '',
      permissions: (role.permissions || []).join(', ')
    })
    // Use stored permission keys (snake_case) directly for checkbox state
    try {
      const keys = (role.permissions || []).map(p => permissionKey(p))
      setSelectedPermissions(keys)
    } catch (e) {
      setSelectedPermissions(role.permissions || [])
    }
    setShowModal(true)
  }

  // Display all roles from Firebase
  const filteredRoles = roles.filter(role => 
    (role.name && role.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => {
    // Sort predefined roles first, then custom roles
    const aIsPredefined = predefinedRoles.includes(a.name)
    const bIsPredefined = predefinedRoles.includes(b.name)
    if (aIsPredefined !== bIsPredefined) return bIsPredefined - aIsPredefined
    return (a.name || '').localeCompare(b.name || '')
  })

  const availablePermissions = useMemo(() => {
    try {
      const all = roles.flatMap(r => r.permissions || [])
      return Array.from(new Set(all))
    } catch (e) {
      return []
    }
  }, [roles])

  return (
    <div className="w-full">
      <div className="bg-panel-dark w-full px-8 py-6">
        
        {/* TEMPLATES SECTION */}
        <div className="mb-12 flex justify-center">
          <div className="w-full bg-panel-dark rounded shadow border border-blue-900/30 p-8">
            <h2 className="text-lg font-semibold mb-2 text-white">Role Templates</h2>
            <p className="text-sm text-gray-400 mb-6">Quickly create roles from predefined templates</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(roleTemplates).map(([roleName, template]) => {
                const roleExists = roles.some(r => r.name === roleName)
                return (
                  <div 
                    key={roleName}
                    className={`p-4 rounded border transition-all ${
                      roleExists 
                        ? 'border-blue-900/40 bg-blue-900/10' 
                        : 'border-blue-900/30 bg-panel-muted hover:border-blue-900/60'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-semibold text-white flex-1">{roleName}</h3>
                      {roleExists && <span className="text-blue-400 text-lg">✓</span>}
                    </div>
                    
                    <p className="text-xs text-gray-400 mb-3">{template.description}</p>
                    
                    <div className="text-xs text-gray-500 mb-3">
                      {template.permissions.length} permissions
                    </div>
                    
                    {!roleExists && (
                      <button
                        onClick={() => createRoleFromTemplate(roleName)}
                        disabled={loading}
                        className="text-xs text-blue-400 hover:text-blue-300 disabled:text-gray-500"
                      >
                        Click to create →
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        
        {/* MANAGEMENT SECTION */}
        <div className="mb-12 flex justify-center">
          <div className="w-full bg-panel-dark rounded shadow border border-blue-900/30 p-8">
            <h2 className="text-lg font-semibold mb-2 text-white">Roles</h2>
            <p className="text-sm text-gray-400 mb-6">Manage user roles and permissions</p>
            
            <div className="mb-6 p-4 bg-panel-muted border border-blue-900/30 rounded">
              <div className="text-sm text-gray-300">
                <span className="font-semibold text-white">{roles.length}</span> Total Roles
                {searchTerm && (
                  <span className="ml-4">
                    • <span className="font-semibold text-blue-400">{filteredRoles.length}</span> Matching
                  </span>
                )}
              </div>
              {foundUserRoles && foundUserRoles.length > 0 && (
                <div className="mt-2 text-xs text-gray-400">
                  Detected in users: {foundUserRoles.slice(0,10).join(', ')}{foundUserRoles.length > 10 ? ` (+${foundUserRoles.length-10} more)` : ''}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mb-6">
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-panel-muted px-4 py-2 rounded text-gray-200 w-1/3 border border-white/20 placeholder:text-gray-400"
                placeholder="Search roles..."
              />
              <div className="flex gap-3 items-center">
                <button
                  className="px-4 py-2 rounded text-gray-200 border border-white/20 hover:bg-blue-900/20"
                  onClick={() => fetchRoles()}
                  aria-label="Refresh roles"
                >
                  🔄 Refresh
                </button>

                <button
                  onClick={openAddModal}
                  className="inline-flex items-center gap-2 bg-accent-blue px-3 py-2 rounded text-white font-semibold hover:bg-blue-600"
                  aria-label="Create role"
                >
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-white/10 text-white">+</span>
                  <span className="text-sm">Create Role</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center text-gray-400 py-8">Loading roles...</div>
            ) : filteredRoles.length === 0 ? (
              <div className="text-center text-gray-400 py-8">No roles found</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRoles.map((role) => (
                  <div 
                    key={role.docId} 
                    className="bg-panel-muted border border-blue-900/30 rounded p-4 hover:border-blue-900/60 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-white">{role.name}</h3>
                        <p className="text-xs text-gray-400 mt-1">{role.description || '-'}</p>
                      </div>
                      <div className="flex gap-2 ml-2">
                        <button
                          onClick={() => openEditModal(role)}
                          title="Edit"
                          aria-label={`Edit ${role.name}`}
                          className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-500 text-white transition"
                        >
                          <span className="text-sm">✎</span>
                        </button>

                        <button
                          onClick={() => handleDeleteRole(role.docId)}
                          title="Delete"
                          aria-label={`Delete ${role.name}`}
                          className="w-8 h-8 flex items-center justify-center rounded-md bg-red-600 hover:bg-red-500 text-white transition"
                        >
                          <span className="text-sm">🗑️</span>
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-gray-400 mb-3 pb-3 border-b border-blue-900/20">
                      <div>ID: {role.docId}</div>
                      <div className="text-xs text-gray-500 mt-1">Updated: {new Date().toLocaleTimeString()}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                          <div className="text-xs text-gray-400 mb-1">Users</div>
                          <div className="text-lg font-bold text-white">{userCounts[role.docId] || 0}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Permissions</div>
                        <div className="text-lg font-bold text-white">{role.permissions?.length || 0}</div>
                      </div>
                    </div>

                    {role.permissions && role.permissions.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-gray-300 mb-2">
                          Permissions ({role.permissions.length}):
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {role.permissions.slice(0, 3).map((perm, i) => (
                            <span key={i} className="bg-blue-900/40 px-2 py-1 rounded text-xs text-blue-300">
                              {perm}
                            </span>
                          ))}
                        </div>
                        {role.permissions.length > 3 && (
                          <button
                            className="text-xs text-blue-400 hover:text-blue-300"
                            onClick={() => setExpandedRoles({ ...expandedRoles, [role.id]: !expandedRoles[role.id] })}
                          >
                            {expandedRoles[role.id] ? '▼' : '▶'} Show all {role.permissions.length} permissions
                          </button>
                        )}
                        {expandedRoles[role.id] && role.permissions.length > 3 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {role.permissions.slice(3).map((perm, i) => (
                              <span key={i} className="bg-blue-900/40 px-2 py-1 rounded text-xs text-blue-300">
                                {perm}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal for Add/Edit Role */}
        {showModal && (
          <RoleForm
            modalMode={modalMode}
            formData={formData}
            setFormData={setFormData}
            selectedPermissions={selectedPermissions}
            setSelectedPermissions={setSelectedPermissions}
            availablePermissions={availablePermissions}
            handleAddRole={handleAddRole}
            handleEditRole={handleEditRole}
            loading={loading}
            setShowModal={setShowModal}
          />
        )}
      </div>
    </div>
  )
}
