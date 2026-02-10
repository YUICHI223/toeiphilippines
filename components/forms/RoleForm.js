import React from 'react'

export default function RoleForm({
  modalMode,
  formData,
  setFormData,
  selectedPermissions,
  setSelectedPermissions,
  allPermissions,
  handleAddRole,
  handleEditRole,
  loading,
  setShowModal
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
        <h2 className="text-xl font-bold mb-4">{modalMode === 'add' ? 'Add New Role' : 'Edit Role'}</h2>
        
        <form onSubmit={modalMode === 'add' ? handleAddRole : handleEditRole}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">Role Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-panel-muted px-3 py-2 rounded text-gray-200 border border-white/20"
              placeholder="e.g. Administrator, Supervisor"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-panel-muted px-3 py-2 rounded text-gray-200 border border-white/20"
              placeholder="Describe this role"
              rows={3}
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-300">Permissions * ({selectedPermissions.length} permission(s))</label>
            </div>
            
            <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
              {allPermissions.map((permCategory, idx) => {
                const isSelected = selectedPermissions.some(p => permCategory.items.includes(p))
                return (
                  <div 
                    key={idx}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedPermissions(selectedPermissions.filter(p => !permCategory.items.includes(p)))
                      } else {
                        setSelectedPermissions([...selectedPermissions, ...permCategory.items])
                      }
                    }}
                    className={`p-4 rounded border-2 cursor-pointer transition ${
                      isSelected 
                        ? 'border-accent-blue bg-accent-blue/10' 
                        : 'border-white/20 bg-panel-muted hover:bg-panel-muted/80'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 accent-accent-blue mt-1 cursor-pointer"
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-200 mb-1">{permCategory.category}</h4>
                        <p className="text-xs text-gray-400">
                          Grants access to: {permCategory.items.slice(0, 2).join(', ')}{permCategory.items.length > 2 ? ` +${permCategory.items.length - 2} more` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="mt-4 text-xs text-gray-400">
              Current selection: {selectedPermissions.length} permission(s)
            </div>
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
              {loading ? 'Saving...' : modalMode === 'add' ? 'Create Role' : 'Update Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
