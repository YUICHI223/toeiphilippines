import React, { useState, useEffect, useMemo } from 'react'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import TeamForm from './forms/TeamForm'

export default function TeamManager() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('All Types')
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [currentTeam, setCurrentTeam] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '', type: '', checker: '', backupChecker: '', members: [] })
  const [users, setUsers] = useState([])
  const [departments, setDepartments] = useState([])

  useEffect(() => {
    fetchTeams()
    fetchUsers()
    fetchDepartments()
  }, [])

  async function fetchTeams() {
    setLoading(true)
    try {
      const snapshot = await getDocs(collection(db, 'teams'))
      setTeams(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (e) {
      console.error('Error fetching teams:', e)
      alert('Failed to load teams. See console for details.')
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

  async function fetchDepartments() {
    try {
      const snapshot = await getDocs(collection(db, 'sections'))
      setDepartments(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (e) {
      console.error('Error fetching departments:', e)
    }
  }

  async function handleAddTeam(e, teamData) {
    e.preventDefault()
    const data = teamData || formData
    if (!data.name.trim()) {
      alert('Team name is required')
      return
    }
    try {
      setLoading(true)
      await addDoc(collection(db, 'teams'), {
        name: data.name,
        description: data.description,
        type: data.type || null,
        checker: data.checker || null,
        backupChecker: data.backupChecker || null,
        members: data.members || [],
        createdAt: serverTimestamp()
      })
      setShowModal(false)
      setFormData({ name: '', description: '', type: '', checker: '', members: [] })
      fetchTeams()
    } catch (e) {
      console.error('Error adding team:', e)
      alert('Failed to add team. See console for details.')
    } finally {
      setLoading(false)
    }
  }

  async function handleEditTeam(e, teamData) {
    e.preventDefault()
    const data = teamData || formData
    if (!data.name.trim()) {
      alert('Team name is required')
      return
    }
    try {
      setLoading(true)
      await updateDoc(doc(db, 'teams', currentTeam.id), {
        name: data.name,
        description: data.description,
        type: data.type || null,
        checker: data.checker || null,
        backupChecker: data.backupChecker || null,
        members: data.members || [],
        updatedAt: serverTimestamp()
      })
      setShowModal(false)
      setFormData({ name: '', description: '', type: '', checker: '', members: [] })
      fetchTeams()
    } catch (e) {
      console.error('Error updating team:', e)
      alert('Failed to update team. See console for details.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteTeam(id) {
    if (!confirm('Are you sure?')) return
    try {
      await deleteDoc(doc(db, 'teams', id))
      fetchTeams()
    } catch (e) {
      console.error('Error deleting team:', e)
      alert('Failed to delete team. See console for details.')
    }
  }

  function openAddModal() {
    setModalMode('add')
    setCurrentTeam(null)
    setFormData({ name: '', description: '', type: '', checker: '', backupChecker: '', members: [] })
    setShowModal(true)
  }

  function openEditModal(team) {
    setModalMode('edit')
    setCurrentTeam(team)
    setFormData({
      name: team.name || '',
      description: team.description || '',
      type: team.type || '',
      checker: team.checker || '',
      backupChecker: team.backupChecker || '',
      members: team.members || []
    })
    setShowModal(true)
  }

  const teamTypes = useMemo(() => {
    const types = new Set(['All Types'])
    teams.forEach(t => {
      if (t.type) types.add(t.type)
    })
    return Array.from(types)
  }, [teams])

  const filteredTeams = useMemo(() => {
    let list = teams
    
    if (typeFilter !== 'All Types') {
      list = list.filter(t => t.type === typeFilter)
    }
    
    if (!searchTerm.trim()) return list
    const q = searchTerm.toLowerCase()
    return list.filter(t =>
      (t.name || '').toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q)
    )
  }, [teams, typeFilter, searchTerm])

  const totalTeams = teams.length
  const activeTeams = teams.filter(t => t.checker).length
  const uniqueTypes = new Set(teams.map(t => t.type).filter(Boolean)).size

  function getCheckerName(checkerId) {
    if (!checkerId) return 'Not assigned'
    const checker = users.find(u => u.id === checkerId)
    return checker ? `${checker.firstName || ''} ${checker.lastName || ''}`.trim() || checker.email : 'Not assigned'
  }

  function getMemberNames(memberIds) {
    if (!memberIds || memberIds.length === 0) return []
    return memberIds.map(id => {
      const user = users.find(u => u.id === id)
      return user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Unknown'
    })
  }

  return (
    <div className="p-4 md:p-6 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">👥 Team Management</h1>
            <p className="text-xs md:text-sm text-gray-400">Manage teams and track team assignments</p>
          </div>
          <div className="bg-accent-blue/10 border border-accent-blue/30 rounded px-3 md:px-4 py-2 md:py-3 text-sm w-full md:w-auto">
            <div className="text-xs text-gray-400 mb-1">👤 Admin Mode</div>
            <div className="text-xs md:text-sm font-semibold text-accent-blue">Full team management access</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 md:p-4 rounded">
            <div className="flex items-center gap-3">
              <div className="text-2xl md:text-3xl">👥</div>
              <div className="min-w-0">
                <div className="text-2xl md:text-3xl font-bold">{totalTeams}</div>
                <div className="text-xs text-blue-200">Total Teams</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-600 to-green-700 p-3 md:p-4 rounded">
            <div className="flex items-center gap-3">
              <div className="text-2xl md:text-3xl">✓</div>
              <div className="min-w-0">
                <div className="text-2xl md:text-3xl font-bold">{activeTeams}</div>
                <div className="text-xs text-green-200">Active Teams</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-600 to-orange-700 p-3 md:p-4 rounded">
            <div className="flex items-center gap-3">
              <div className="text-2xl md:text-3xl">📦</div>
              <div className="min-w-0">
                <div className="text-2xl md:text-3xl font-bold">{uniqueTypes}</div>
                <div className="text-xs text-orange-200">Team Types</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-col sm:flex-row gap-2 md:gap-3 items-start sm:items-center">
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 bg-panel-muted px-3 md:px-4 py-2 rounded text-gray-200 border border-white/20 placeholder:text-gray-400 text-sm w-full"
            placeholder="Search teams..."
          />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="bg-panel-muted px-3 md:px-4 py-2 rounded text-gray-200 border border-white/20 text-sm w-full sm:w-auto"
          >
            {teamTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <button
            onClick={openAddModal}
            className="bg-accent-blue hover:bg-blue-600 px-4 py-2 rounded text-white font-semibold flex items-center gap-2 text-sm w-full sm:w-auto justify-center"
          >
            + Create Team
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {loading ? (
            <div className="col-span-full text-center p-8 text-gray-400 text-sm">Loading...</div>
          ) : filteredTeams.length === 0 ? (
            <div className="col-span-full text-center p-8 text-gray-400 text-sm">No teams found</div>
          ) : (
            filteredTeams.map(team => (
              <div key={team.id} className="bg-panel-dark border border-white/10 rounded p-3 md:p-4 hover:border-white/20 transition">
                <div className="flex justify-between items-start gap-2 mb-3">
                  <h3 className="font-semibold text-sm md:text-lg text-gray-200">{team.name}</h3>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => openEditModal(team)}
                      className="text-blue-400 hover:text-blue-300 text-lg"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(team.id)}
                      className="text-red-400 hover:text-red-300 text-lg"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {team.description && (
                  <p className="text-xs text-gray-400 mb-3">{team.description}</p>
                )}

                <div className="space-y-2 md:space-y-3">
                  <div className="bg-panel-muted p-2 md:p-3 rounded">
                    <div className="text-xs text-gray-400 mb-1">Team Checker</div>
                    <div className="text-xs md:text-sm text-blue-400 flex items-center gap-1">
                      👤 {getCheckerName(team.checker)}
                    </div>
                  </div>

                  <div className="bg-panel-muted p-2 md:p-3 rounded">
                    <div className="text-xs text-gray-400 mb-2">Team Members</div>
                    <div className="flex items-start gap-2">
                      <div className="text-sm">👥</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs md:text-sm font-semibold text-gray-200">{team.members?.length || 0} members</div>
                        {team.members && team.members.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {getMemberNames(team.members).map((name, idx) => (
                              <span key={idx} className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded break-words">
                                {name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <TeamForm
            modalMode={modalMode}
            formData={formData}
            setFormData={setFormData}
            handleAddTeam={handleAddTeam}
            handleEditTeam={handleEditTeam}
            loading={loading}
            setShowModal={setShowModal}
            users={users}
            departments={departments}
          />
        )}
      </div>
    </div>
  )
}
