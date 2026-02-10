import React, { useEffect, useState } from 'react'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import RoleForm from './forms/RoleForm'

export default function RoleManager() {
  const [roles, setRoles] = useState([])
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

  useEffect(() => {
    fetchRoles()
  }, [])

  async function fetchRoles() {
    setLoading(true)
    try {
      const snapshot = await getDocs(collection(db, 'roles'))
      setRoles(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
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
      await addDoc(collection(db, 'roles'), {
        name: formData.name,
        description: formData.description,
        permissions: selectedPermissions,
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
      await updateDoc(doc(db, 'roles', currentRole.id), {
        name: formData.name,
        description: formData.description,
        permissions: selectedPermissions,
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

  async function handleDeleteRole(id) {
    const ok = window.confirm('Are you sure you want to delete this role? This action cannot be undone.')
    if (!ok) return
    try {
      setLoading(true)
      await deleteDoc(doc(db, 'roles', id))
      fetchRoles()
    } catch (e) {
      console.error('Error deleting role:', e)
      alert('Failed to delete role. See console for details.')
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
    setSelectedPermissions(role.permissions || [])
    setShowModal(true)
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

  // Build display roles from predefined list, using Firebase data where available
  const filteredRoles = predefinedRoles.map(roleName => {
    const firebaseRole = roles.find(r => r.name === roleName)
    return firebaseRole || { id: roleName, name: roleName, description: '', permissions: [] }
  })

  return (
    <div className="w-full">
      <div className="bg-panel-dark w-full px-8 py-6">
        
        {/* TEMPLATES SECTION - TOP */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-white">Role Templates</h2>
          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading roles...</div>
          ) : filteredRoles.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No roles found</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-8 border-b border-blue-900/30">
              {filteredRoles.map((role) => (
                <div 
                  key={role.id} 
                  className="bg-panel-muted border border-blue-900/30 rounded p-4 hover:border-blue-900/60 transition-colors"
                >
                  <h3 className="text-sm font-semibold text-white mb-2">{role.name}</h3>
                  <p className="text-xs text-gray-400 mb-3">{role.description || '-'}</p>
                  <div className="text-xs text-gray-500">
                    {role.permissions?.length || 0} permissions
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MANAGEMENT SECTION - BOTTOM */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-panel-muted px-4 py-2 rounded text-gray-200 w-1/3 border border-white/20 placeholder:text-gray-400"
              placeholder="Search roles..."
            />
            <div className="flex gap-3">
              <button
                className="px-4 py-2 rounded text-gray-200 border border-white/20 hover:bg-blue-900/20"
                onClick={() => fetchRoles()}
              >
                🔄 Refresh
              </button>
              <button
                className="bg-accent-blue px-4 py-2 rounded text-white font-semibold"
                onClick={openAddModal}
              >
                + Create Role
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
                  key={role.id} 
                  className="bg-panel-muted border border-blue-900/30 rounded p-4 hover:border-blue-900/60 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-white">{role.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">{role.description || '-'}</p>
                    </div>
                    <div className="flex gap-2 ml-2">
                      <button 
                        className="text-blue-400 hover:text-blue-300 text-lg"
                        onClick={() => openEditModal(role)}
                        title="Edit"
                      >
                        ✎
                      </button>
                      <button 
                        className="text-red-400 hover:text-red-300 text-lg"
                        onClick={() => handleDeleteRole(role.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 mb-3 pb-3 border-b border-blue-900/20">
                    <div>ID: {role.id}</div>
                    <div className="text-xs text-gray-500 mt-1">Updated: {new Date().toLocaleTimeString()}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Users</div>
                      <div className="text-lg font-bold text-white">0</div>
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

        {/* Modal for Add/Edit Role */}
        {showModal && (
          <RoleForm
            modalMode={modalMode}
            formData={formData}
            setFormData={setFormData}
            selectedPermissions={selectedPermissions}
            setSelectedPermissions={setSelectedPermissions}
            allPermissions={allPermissions}
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
