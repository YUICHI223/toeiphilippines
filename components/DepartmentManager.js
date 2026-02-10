import React, { useState, useEffect, useMemo } from 'react'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import DepartmentForm from './forms/DepartmentForm'

export default function DepartmentManager() {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [currentDepartment, setCurrentDepartment] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '', manager: '' })
  const [users, setUsers] = useState([])

  useEffect(() => {
    fetchDepartments()
    fetchUsers()
  }, [])

  async function fetchDepartments() {
    setLoading(true)
    try {
      const snapshot = await getDocs(collection(db, 'sections'))
      setDepartments(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (e) {
      console.error('Error fetching departments:', e)
      alert('Failed to load departments. See console for details.')
    } finally {
      setLoading(false)
    }
  }

  async function fetchUsers() {
    try {
      const snapshot = await getDocs(collection(db, 'users'))
      setUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (e) {
      console.error('Error fetching users:', e)
    }
  }

  async function handleAddDepartment(e) {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('Department name is required')
      return
    }
    try {
      setLoading(true)
      await addDoc(collection(db, 'sections'), {
        name: formData.name,
        description: formData.description,
        manager: formData.manager || null,
        createdAt: serverTimestamp()
      })
      setShowModal(false)
      setFormData({ name: '', description: '', manager: '' })
      fetchDepartments()
    } catch (e) {
      console.error('Error adding department:', e)
      alert('Failed to add department. See console for details.')
    } finally {
      setLoading(false)
    }
  }

  async function handleEditDepartment(e) {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('Department name is required')
      return
    }
    try {
      setLoading(true)
      await updateDoc(doc(db, 'sections', currentDepartment.id), {
        name: formData.name,
        description: formData.description,
        manager: formData.manager || null,
        updatedAt: serverTimestamp()
      })
      setShowModal(false)
      setFormData({ name: '', description: '', manager: '' })
      fetchDepartments()
    } catch (e) {
      console.error('Error updating department:', e)
      alert('Failed to update department. See console for details.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteDepartment(id) {
    if (!confirm('Are you sure?')) return
    try {
      await deleteDoc(doc(db, 'sections', id))
      fetchDepartments()
    } catch (e) {
      console.error('Error deleting department:', e)
      alert('Failed to delete department. See console for details.')
    }
  }

  function openAddModal() {
    setModalMode('add')
    setCurrentDepartment(null)
    setFormData({ name: '', description: '', manager: '' })
    setShowModal(true)
  }

  function openEditModal(dept) {
    setModalMode('edit')
    setCurrentDepartment(dept)
    setFormData({
      name: dept.name || '',
      description: dept.description || '',
      manager: dept.manager || ''
    })
    setShowModal(true)
  }

  const filteredDepartments = useMemo(() => {
    // Build departments from sections collection AND any user sections/departments that exist
    const sectionMap = new Map()
    
    // Add all sections from the collection
    departments.forEach(d => {
      const key = (d.name || '').trim().toUpperCase()
      sectionMap.set(key, d)
    })
    
    // Add any user sections/departments that don't exist in the collection yet
    users.forEach(u => {
      // Check section field (string)
      let userSection = (u.section || u.department || '').trim()
      
      // If departmentId exists, resolve it to the section name
      if (!userSection && u.departmentId) {
        const dept = departments.find(d => d.id === u.departmentId)
        userSection = (dept?.name || u.departmentId).trim()
      }
      
      if (userSection) {
        const key = userSection.toUpperCase()
        if (!sectionMap.has(key)) {
          sectionMap.set(key, {
            id: userSection,
            name: userSection,
            description: '',
            manager: null
          })
        }
      }
    })
    
    let list = Array.from(sectionMap.values())
    
    if (!searchTerm.trim()) return list
    const q = searchTerm.toLowerCase()
    return list.filter(d => 
      (d.name || '').toLowerCase().includes(q) ||
      (d.description || '').toLowerCase().includes(q) ||
      (d.manager || '').toLowerCase().includes(q)
    )
  }, [departments, users, searchTerm])

  const totalDepartments = useMemo(() => {
    const sectionMap = new Map()
    departments.forEach(d => {
      const key = (d.name || '').trim().toUpperCase()
      sectionMap.set(key, d)
    })
    users.forEach(u => {
      const userSection = (u.section || u.department || '').trim()
      if (userSection) {
        const key = userSection.toUpperCase()
        if (!sectionMap.has(key)) {
          sectionMap.set(key, { id: userSection, name: userSection, description: '', manager: null })
        }
      }
    })
    return sectionMap.size
  }, [departments, users])

  const activeDepartments = useMemo(() => {
    const sectionMap = new Map()
    departments.forEach(d => {
      const key = (d.name || '').trim().toUpperCase()
      sectionMap.set(key, d)
    })
    users.forEach(u => {
      const userSection = (u.section || u.department || '').trim()
      if (userSection) {
        const key = userSection.toUpperCase()
        if (!sectionMap.has(key)) {
          sectionMap.set(key, { id: userSection, name: userSection, description: '', manager: null })
        }
      }
    })
    return Array.from(sectionMap.values()).filter(d => d.manager).length
  }, [departments, users])
  const totalEmployees = users.filter(u => (u.section || u.department || u.departmentId)).length

  function getEmployeeCount(deptName) {
    return users.filter(u => {
      // Check section/department string fields
      const userDept = (u.section || u.department || '').trim().toUpperCase()
      if (userDept === (deptName || '').trim().toUpperCase()) return true
      
      // Check departmentId field - resolve it to section name
      if (u.departmentId) {
        const dept = departments.find(d => d.id === u.departmentId)
        const deptName2 = (dept?.name || '').trim().toUpperCase()
        if (deptName2 === (deptName || '').trim().toUpperCase()) return true
      }
      
      return false
    }).length
  }

  function getManagerName(managerId) {
    if (!managerId) return 'Not assigned'
    const manager = users.find(u => u.id === managerId)
    return manager ? `${manager.firstName || ''} ${manager.lastName || ''}`.trim() || manager.email : 'Not assigned'
  }

  return (
    <div className="p-6 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Department Management</h1>
            <p className="text-gray-400">Manage company departments and organizational structure.</p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-accent-blue hover:bg-blue-600 px-4 py-2 rounded text-white font-semibold"
          >
            + New Department
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-panel-dark p-4 rounded border border-white/10">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🏢</div>
              <div>
                <div className="text-2xl font-bold">{totalDepartments}</div>
                <div className="text-xs text-gray-400">Total Departments</div>
              </div>
            </div>
          </div>
          <div className="bg-panel-dark p-4 rounded border border-white/10">
            <div className="flex items-center gap-3">
              <div className="text-2xl">✓</div>
              <div>
                <div className="text-2xl font-bold">{activeDepartments}</div>
                <div className="text-xs text-gray-400">Active Departments</div>
              </div>
            </div>
          </div>
          <div className="bg-panel-dark p-4 rounded border border-white/10">
            <div className="flex items-center gap-3">
              <div className="text-2xl">👥</div>
              <div>
                <div className="text-2xl font-bold">{totalEmployees}</div>
                <div className="text-xs text-gray-400">Total Employees</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-panel-muted px-4 py-2 rounded text-gray-200 w-full border border-white/20 placeholder:text-gray-400"
            placeholder="Search departments..."
          />
        </div>

        <div className="bg-panel-dark rounded shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blue-900/30">
                <th className="px-6 py-4 text-left font-semibold">DEPARTMENT</th>
                <th className="px-6 py-4 text-left font-semibold">DESCRIPTION</th>
                <th className="px-6 py-4 text-left font-semibold">MANAGER</th>
                <th className="px-6 py-4 text-left font-semibold">EMPLOYEES</th>
                <th className="px-6 py-4 text-left font-semibold">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-4 text-center text-gray-400">Loading...</td></tr>
              ) : filteredDepartments.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-gray-400">No departments found</td></tr>
              ) : filteredDepartments.map((dept) => (
                <tr key={dept.id} className="border-b border-blue-900/20 hover:bg-panel-muted/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="text-xl">🏢</div>
                      <span className="font-semibold">{dept.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300 text-xs">{dept.description || '-'}</td>
                  <td className="px-6 py-4 text-blue-400">{getManagerName(dept.manager)}</td>
                  <td className="px-6 py-4">
                    <span className="text-blue-400">{getEmployeeCount(dept.name)} employees</span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      className="text-blue-400 mr-3 text-xs hover:text-blue-300"
                      onClick={() => openEditModal(dept)}
                    >
                      ✎ Edit
                    </button>
                    <button 
                      className="text-red-400 text-xs hover:text-red-300"
                      onClick={() => handleDeleteDepartment(dept.id)}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal for Add/Edit Department */}
        {showModal && (
          <DepartmentForm
            modalMode={modalMode}
            formData={formData}
            setFormData={setFormData}
            handleAddDepartment={handleAddDepartment}
            handleEditDepartment={handleEditDepartment}
            loading={loading}
            setShowModal={setShowModal}
            users={users}
          />
        )}
      </div>
    </div>
  )
}
