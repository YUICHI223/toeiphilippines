import React, { useState } from 'react'

export default function RoleForm({
  modalMode,
  formData,
  setFormData,
  selectedPermissions,
  setSelectedPermissions,
  availablePermissions,
  handleAddRole,
  handleEditRole,
  loading,
  setShowModal
}) {
  const [internalSelected, setInternalSelected] = useState(selectedPermissions || [])

  // Keep internalSelected in sync when parent changes selectedPermissions
  React.useEffect(() => setInternalSelected(selectedPermissions || []), [selectedPermissions])

  function permissionKey(s) {
    if (!s && s !== 0) return ''
    return String(s)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-panel-dark p-4 md:p-6 rounded shadow max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
        <button 
          type="button" 
          onClick={() => setShowModal(false)} 
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-200 text-xl"
        >
          ✕
        </button>
        <h2 className="text-lg md:text-xl font-bold mb-4">{modalMode === 'add' ? 'Add New Role' : 'Edit Role'}</h2>
        
        <form onSubmit={modalMode === 'add' ? handleAddRole : handleEditRole}>
          <div className="mb-4">
            <label className="block text-xs md:text-sm font-medium text-gray-300 mb-1">Role Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-panel-muted px-3 py-2 rounded text-gray-200 border border-white/20 text-sm"
              placeholder="e.g. Administrator, Supervisor"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs md:text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-panel-muted px-3 py-2 rounded text-gray-200 border border-white/20 text-sm"
              placeholder="Describe this role"
              rows={3}
            />
          </div>

          <div className="max-h-96 overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 mb-3">
            {(availablePermissions || []).map((perm, idx) => {
              const key = permissionKey(perm)
              const checked = internalSelected.includes(key)
              const toggle = (e) => {
                e.stopPropagation()
                if (checked) {
                  const next = internalSelected.filter(p => p !== key)
                  setInternalSelected(next)
                  setSelectedPermissions(next)
                } else {
                  const next = [...internalSelected, key]
                  setInternalSelected(next)
                  setSelectedPermissions(next)
                }
              }

              // human-friendly label: prefer original perm string
              const label = String(perm)

              return (
                <label key={idx} className="p-2 md:p-3 rounded border border-white/10 bg-panel-muted flex items-start gap-2 md:gap-3 cursor-pointer hover:border-white/20 transition">
                  <input type="checkbox" className="w-4 h-4 mt-1 flex-shrink-0" checked={checked} onChange={toggle} />
                  <div className="flex flex-col text-xs md:text-sm min-w-0">
                    <span className="text-gray-200 break-words">{label}</span>
                    <span className="text-[9px] md:text-[10px] text-gray-500 break-words">{key}</span>
                  </div>
                </label>
              )
            })}
          </div>
            
            <div className="mt-4 text-xs text-gray-400">
              Current selection: {selectedPermissions.length} permission(s)
            </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 md:gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-3 md:px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 md:px-4 py-2 bg-accent-blue hover:bg-blue-600 rounded text-white disabled:opacity-50 text-sm"
            >
              {loading ? 'Saving...' : modalMode === 'add' ? 'Create Role' : 'Update Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
