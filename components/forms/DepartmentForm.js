import React from 'react'

export default function DepartmentForm({
  modalMode,
  formData,
  setFormData,
  handleAddDepartment,
  handleEditDepartment,
  loading,
  setShowModal,
  users
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-panel-dark p-6 rounded shadow max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
        <button 
          type="button" 
          onClick={() => setShowModal(false)} 
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-200"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4">{modalMode === 'add' ? 'Add New Department' : 'Edit Department'}</h2>
        
        <form onSubmit={modalMode === 'add' ? handleAddDepartment : handleEditDepartment}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">Department Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-panel-muted px-3 py-2 rounded text-gray-200 border border-white/20"
              placeholder="e.g. Key Animation, Background"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-panel-muted px-3 py-2 rounded text-gray-200 border border-white/20"
              placeholder="Describe this department"
              rows={3}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-1">Department Manager</label>
            <select
              value={formData.manager}
              onChange={e => setFormData({ ...formData, manager: e.target.value })}
              className="w-full bg-panel-muted px-3 py-2 rounded text-gray-200 border border-white/20"
            >
              <option value="">-- Select Manager --</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-accent-blue hover:bg-blue-600 rounded text-white disabled:opacity-50"
            >
              {loading ? 'Saving...' : modalMode === 'add' ? 'Create Department' : 'Update Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
