import React, { useState, useEffect } from 'react'

export default function JobForm({ show, onClose, onSubmit, loading, initial }) {
  const [title, setTitle] = useState(initial?.title || '')
  const [description, setDescription] = useState(initial?.description || '')

  useEffect(() => {
    if (initial) {
      setTitle(initial.title || '')
      setDescription(initial.description || '')
    } else {
      setTitle('')
      setDescription('')
    }
  }, [initial, show])

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-panel-dark p-6 rounded shadow max-w-lg w-full relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-200"
        >
          ✕
        </button>

        <h3 className="text-lg font-semibold mb-4">{initial ? 'Edit Job Title' : 'Add New Job Title'}</h3>

        <div className="mb-3">
          <label className="block text-sm text-gray-300 mb-1">Job Title *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded bg-panel-muted text-gray-200 border border-white/20"
            placeholder="Enter job title"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-300 mb-1">Description *</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 rounded bg-panel-muted text-gray-200 border border-white/20"
            placeholder="Enter job description"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white">Cancel</button>
          <button
            onClick={() => onSubmit({ title: title.trim(), description: description.trim() })}
            disabled={loading || !title.trim()}
            className="px-4 py-2 bg-accent-blue hover:bg-blue-600 rounded text-white disabled:opacity-50"
          >
            {loading ? (initial ? 'Updating...' : 'Creating...') : (initial ? 'Update Job Title' : 'Create Job Title')}
          </button>
        </div>
      </div>
    </div>
  )
}
