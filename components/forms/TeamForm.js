import React, { useState, useMemo } from 'react'

export default function TeamForm({
  modalMode,
  formData,
  setFormData,
  handleAddTeam,
  handleEditTeam,
  loading,
  setShowModal,
  users,
  departments = []
}) {
  const [selectedMembers, setSelectedMembers] = useState(formData.members || [])

  // Filter users by selected section/department
  const selectedDept = departments.find(d => d.id === formData.type)
  const selectedDeptName = selectedDept?.name || ''
  const selectedDeptId = formData.type
  
  const usersInSection = useMemo(() => {
    if (!selectedDeptId && !selectedDeptName) return []
    
    const selectedNameUpper = selectedDeptName.trim().toUpperCase()
    
    return users.filter(u => {
      // Match by departmentId (primary - most reliable)
      if (u.departmentId === selectedDeptId) return true
      
      // Match by section name (string comparison, case-insensitive)
      const userSection = (u.section || '').trim().toUpperCase()
      if (userSection === selectedNameUpper && userSection) return true
      
      // Match by department name (string comparison, case-insensitive)
      const userDepartment = (u.department || '').trim().toUpperCase()
      if (userDepartment === selectedNameUpper && userDepartment) return true
      
      return false
    })
  }, [users, selectedDeptName, selectedDeptId])

  const handleMemberToggle = (userId) => {
    setSelectedMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-panel-dark p-6 rounded shadow max-w-md w-full relative">
        <button
          type="button"
          onClick={() => setShowModal(false)}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-200 text-xl"
        >
          ✕
        </button>

        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <div className="w-6 h-6 bg-accent-blue rounded-full flex items-center justify-center text-white text-sm">👥</div>
          Create New Team (v2.0)
        </h2>

        <form onSubmit={(e) => {
          e.preventDefault()
          const teamData = {
            ...formData,
            members: selectedMembers,
            backupChecker: formData.backupChecker
          }
          if (modalMode === 'add') {
            handleAddTeam(e, teamData)
          } else {
            handleEditTeam(e, teamData)
          }
        }} className="space-y-4">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Group Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-panel-muted px-4 py-2 rounded text-gray-200 border border-white/20 placeholder:text-gray-500"
              placeholder="Enter group name"
              required
            />
          </div>

          {/* Team Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Team Type *</label>
            <select
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value })}
              className="w-full bg-panel-muted px-4 py-2 rounded text-gray-200 border border-white/20"
              required
            >
              <option value="">Select team type</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Team Checker */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Team Checker (Must be CHECKER) *</label>
            <select
              value={formData.checker}
              onChange={e => setFormData({ ...formData, checker: e.target.value })}
              className="w-full bg-panel-muted px-4 py-2 rounded text-gray-200 border border-white/20"
              required
            >
              <option value="">Select team checker</option>
              {usersInSection.length === 0 ? (
                <option disabled>No users in this section</option>
              ) : (
                usersInSection.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Backup Checker */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Backup Checker (Must be CHECKER) *</label>
            <select
              value={formData.backupChecker || ''}
              onChange={e => setFormData({ ...formData, backupChecker: e.target.value })}
              className="w-full bg-panel-muted px-4 py-2 rounded text-gray-200 border border-white/20"
              required
            >
              <option value="">Select backup checker</option>
              {usersInSection.length === 0 ? (
                <option disabled>No users in this section</option>
              ) : (
                usersInSection.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-panel-muted px-4 py-2 rounded text-gray-200 border border-white/20 placeholder:text-gray-500"
              placeholder="Enter team description"
              rows={3}
            />
          </div>

          {/* Team Members */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Team Members ({selectedMembers.length} selected)
            </label>
            <div className="bg-panel-muted border border-white/20 rounded p-3 max-h-48 overflow-y-auto space-y-2">
              {usersInSection.length === 0 ? (
                <div className="text-xs text-gray-400 p-2">No users in this section</div>
              ) : (
                usersInSection
                  .filter(u => u.id !== formData.checker && u.id !== formData.backupChecker)
                  .map(user => (
                    <label key={user.id} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(user.id)}
                        onChange={() => handleMemberToggle(user.id)}
                        className="w-4 h-4 accent-accent-blue"
                      />
                      <span className="text-sm text-gray-300">
                        {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}
                      </span>
                    </label>
                  ))
              )}
            </div>

            {/* Selected members display */}
            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedMembers.map(memberId => {
                  const user = usersInSection.find(u => u.id === memberId)
                  return (
                    <div key={memberId} className="bg-accent-blue/20 border border-accent-blue/40 text-accent-blue text-xs px-2 py-1 rounded flex items-center gap-1">
                      {user?.firstName} {user?.lastName}
                      <button
                        type="button"
                        onClick={() => handleMemberToggle(memberId)}
                        className="hover:text-red-400"
                      >
                        ✕
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-accent-blue hover:bg-blue-600 rounded text-white font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              <span>+</span> Create Team
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

