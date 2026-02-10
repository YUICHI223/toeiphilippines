import React, { useEffect, useState } from 'react'
import { normalizeDateForInput } from '../utils/normalizeDateInput'

/**
 * UserForm Component
 * Reusable form for adding and editing user data
 * @param {Object} user - Current user data (null for add mode)
 * @param {string} mode - 'add' or 'edit'
 * @param {Function} onSubmit - Callback when form is submitted
 * @param {Function} onCancel - Callback when cancel is clicked
 * @param {Array} jobs - List of available jobs
 * @param {Array} departments - List of available departments
 * @param {Array} roles - List of available roles
 */
export default function UserForm({ 
  user, 
  mode, 
  onSubmit, 
  onCancel, 
  jobs = [], 
  departments = [], 
  roles = [] 
}) {
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    middleName: user?.middleName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    jobId: user?.jobId || '',
    departmentId: user?.departmentId || '',
    roleId: user?.roleId || '',
    password: '',
    employeeId: user?.employeeId || '',
    pagibig: user?.pagibig || '',
    sss: user?.sss || '',
    philhealth: user?.philhealth || '',
    address: user?.address || '',
    tinId: user?.tinId || '',
    basicPay: user?.basicPay || '',
    allowance: user?.allowance || '',
    bankAccount: user?.bankAccount || '',
    dateHired: normalizeDateForInput(user?.dateHired) || '',
    resignDate: normalizeDateForInput(user?.resignDate) || '',
    status: user?.status || 'Active',
    payClass: user?.payClass || '',
    birthdate: normalizeDateForInput(user?.birthdate) || '',
    maritalStatus: user?.maritalStatus || '',
    nameOfDependents: user?.nameOfDependents || '',
  })

  const [showPassword, setShowPassword] = useState(false)

  // Reset/sync form when editing a different user or switching to add mode
  useEffect(() => {
    setForm({
      firstName: user?.firstName || '',
      middleName: user?.middleName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      jobId: user?.jobId || '',
      departmentId: user?.departmentId || '',
      roleId: user?.roleId || '',
      password: '',
      employeeId: user?.employeeId || '',
      pagibig: user?.pagibig || '',
      sss: user?.sss || '',
      philhealth: user?.philhealth || '',
      address: user?.address || '',
      tinId: user?.tinId || '',
      basicPay: user?.basicPay || '',
      allowance: user?.allowance || '',
      bankAccount: user?.bankAccount || '',
      dateHired: normalizeDateForInput(user?.dateHired) || '',
      resignDate: normalizeDateForInput(user?.resignDate) || '',
      status: user?.status || 'Active',
      payClass: user?.payClass || '',
      birthdate: normalizeDateForInput(user?.birthdate) || '',
      maritalStatus: user?.maritalStatus || '',
      nameOfDependents: user?.nameOfDependents || '',
    })
  }, [user, mode])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (mode === 'edit') {
      onSubmit({ ...form, id: user.id })
    } else {
      onSubmit(form)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 max-h-[70vh] overflow-y-auto">
      {/* Personal Information */}
      <label className="block text-sm text-gray-300 font-semibold">First Name *</label>
      <input 
        name="firstName" 
        value={form.firstName} 
        onChange={handleChange} 
        placeholder="Enter first name" 
        className="w-full px-3 py-2 rounded bg-panel-muted text-gray-200 border border-white/20 placeholder:text-gray-400" 
        required 
      />

      <label className="block text-sm text-gray-300">Middle Name (Optional)</label>
      <input 
        name="middleName" 
        value={form.middleName} 
        onChange={handleChange} 
        placeholder="Enter middle name (optional)" 
        className="w-full px-3 py-2 rounded bg-panel-muted text-gray-200 border border-white/20 placeholder:text-gray-400" 
      />

      <label className="block text-sm text-gray-300 font-semibold">Last Name *</label>
      <input 
        name="lastName" 
        value={form.lastName} 
        onChange={handleChange} 
        placeholder="Enter last name" 
        className="w-full px-3 py-2 rounded bg-panel-muted text-gray-200 border border-white/20 placeholder:text-gray-400" 
        required 
      />

      <label className="block text-sm text-gray-300 font-semibold">Email Address *</label>
      <input 
        name="email" 
        value={form.email} 
        onChange={handleChange} 
        placeholder="admin@toei.com" 
        className="w-full px-3 py-2 rounded bg-panel-muted text-gray-200 border border-white/20 placeholder:text-gray-400" 
        required 
      />

      <label className="block text-sm text-gray-300 font-semibold">Phone Number *</label>
      <input 
        name="phone" 
        value={form.phone} 
        onChange={handleChange} 
        placeholder="Enter phone number" 
        className="w-full px-3 py-2 rounded bg-panel-muted text-gray-200 border border-white/20 placeholder:text-gray-400" 
        required 
      />

      {/* Employment Information */}
      <label className="block text-sm text-gray-300 font-semibold mt-4">Job Title *</label>
      <select 
        name="jobId" 
        value={form.jobId} 
        onChange={handleChange} 
        className="w-full px-3 py-2 rounded bg-panel-muted text-gray-200 border border-white/20"
      >
        <option value="">Select Job Title</option>
        {jobs.map(j => (
          <option key={j.id} value={j.id}>
            {j.name || j.title || j.label || j.jobTitle || j.id}
          </option>
        ))}
      </select>

      <label className="block text-sm text-gray-300 font-semibold">Department *</label>
      <select 
        name="departmentId" 
        value={form.departmentId} 
        onChange={handleChange} 
        className="w-full px-3 py-2 rounded bg-panel-muted text-gray-200 border border-white/20" 
        required
      >
        <option value="">Select Department</option>
        {departments.map(d => (
          <option key={d.id} value={d.id}>
            {d.name || d.label || d.id}
          </option>
        ))}
      </select>

      <label className="block text-sm text-gray-300 font-semibold">Role * <span className="font-normal text-xs text-gray-400">(Determines permissions & dashboard access)</span></label>
      <select 
        name="roleId" 
        value={form.roleId} 
        onChange={handleChange} 
        className="w-full px-3 py-2 rounded bg-panel-muted text-gray-200 border border-white/20" 
        required
      >
        <option value="">Select Role</option>
        {roles.map(r => (
          <option key={r.id} value={r.id}>
            {r.name || r.title || r.id}
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-400">The selected role will determine what features and permissions the user can access.</p>

      {/* Authentication */}
      <label className="block text-sm text-gray-300 font-semibold mt-4">Password *</label>
      <div className="relative">
        <input 
          name="password" 
          type={showPassword ? 'text' : 'password'} 
          value={form.password} 
          onChange={handleChange} 
          placeholder="••••••" 
          className="w-full px-3 py-2 rounded bg-panel-muted text-gray-200 border border-white/20 placeholder:text-gray-400" 
          required={mode === 'add'} 
          minLength={6} 
        />
        <button 
          type="button" 
          onClick={() => setShowPassword(s => !s)} 
          className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-400"
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </div>
      <p className="text-xs text-yellow-300">⚠ Password must be at least 6 characters long</p>

      {/* Government IDs */}
      <label className="block text-sm text-gray-300 font-semibold mt-4">Employee ID *</label>
      <input 
        name="employeeId" 
        value={form.employeeId} 
        onChange={handleChange} 
        placeholder="Enter employee ID" 
        className="w-full px-3 py-2 rounded bg-panel-muted text-gray-200 border border-white/20 placeholder:text-gray-400" 
        required 
      />

      <label className="block text-sm text-gray-300 font-semibold">PAGIBIG</label>
      <input 
        name="pagibig" 
        value={form.pagibig} 
        onChange={handleChange} 
        placeholder="Enter PAGIBIG number" 
        className="w-full px-3 py-2 rounded bg-panel-muted text-gray-200 border border-white/20 placeholder:text-gray-400" 
      />

      <label className="block text-sm text-gray-300 font-semibold">SSS</label>
      <input 
        name="sss" 
        value={form.sss} 
        onChange={handleChange} 
        placeholder="Enter SSS number" 
        className="w-full px-3 py-2 rounded bg-panel-muted text-gray-200 border border-white/20 placeholder:text-gray-400" 
      />

      <label className="block text-sm text-gray-300 font-semibold">PHILHEALTH</label>
      <input 
        name="philhealth" 
        value={form.philhealth} 
        onChange={handleChange} 
        placeholder="Enter PHILHEALTH number" 
        className="w-full px-3 py-2 rounded bg-panel-muted text-gray-200 border border-white/20 placeholder:text-gray-400" 
      />

      <label className="block text-sm text-gray-300 font-semibold">TIN ID *</label>
      <input 
        name="tinId" 
        value={form.tinId} 
        onChange={handleChange} 
        placeholder="Enter TIN ID" 
        className="w-full px-3 py-2 rounded bg-panel-muted text-gray-200 border border-white/20 placeholder:text-gray-400" 
        required 
      />

      {/* Address & Contact */}
      <label className="block text-sm text-gray-300 font-semibold mt-4">Address *</label>
      <textarea 
        name="address" 
        value={form.address} 
        onChange={handleChange} 
        placeholder="Enter address" 
        className="w-full px-3 py-2 rounded bg-panel-muted text-gray-200 border border-white/20 placeholder:text-gray-400" 
      />

      {/* Compensation */}
      <label className="block text-sm text-gray-300 font-semibold mt-4">Basic Pay *</label>
      <input 
        name="basicPay" 
        value={form.basicPay} 
        onChange={handleChange} 
        placeholder="Enter basic pay" 
        className="w-full px-3 py-2 rounded bg-panel-muted text-gray-200 border border-white/20 placeholder:text-gray-400" 
        required 
      />

      <label className="block text-sm text-gray-300">Allowance (Optional)</label>
      <input 
        name="allowance" 
        value={form.allowance} 
        onChange={handleChange} 
        placeholder="Enter allowance (optional)" 
        className="w-full px-3 py-2 rounded bg-panel-muted text-gray-200 border border-white/20 placeholder:text-gray-400" 
      />

      <label className="block text-sm text-gray-300 font-semibold">Bank Account *</label>
      <input 
        name="bankAccount" 
        value={form.bankAccount} 
        onChange={handleChange} 
        placeholder="Enter bank account number" 
        className="w-full px-3 py-2 rounded bg-panel-muted text-gray-200 border border-white/20 placeholder:text-gray-400" 
      />

      <label className="block text-sm text-gray-300 font-semibold">Pay Class *</label>
      <select 
        name="payClass" 
        value={form.payClass} 
        onChange={handleChange} 
        className="w-full px-3 py-2 rounded bg-panel-muted text-gray-200 border border-white/20" 
        required
      >
        <option value="">Select Pay Class</option>
        <option value="Staff 1">Staff 1</option>
        <option value="Staff 2">Staff 2</option>
      </select>

      {/* Employment Dates */}
      <label className="block text-sm text-gray-300 font-semibold mt-4">Date Hired *</label>
      <input 
        name="dateHired" 
        type="date" 
        value={form.dateHired} 
        onChange={handleChange} 
        className="w-full px-3 py-2 rounded bg-panel-muted text-gray-200 border border-white/20" 
        required 
      />

      <label className="block text-sm text-gray-300 font-semibold">Resign Date (Optional)</label>
      <input 
        name="resignDate" 
        type="date" 
        value={form.resignDate} 
        onChange={handleChange} 
        className="w-full px-3 py-2 rounded bg-panel-muted text-gray-200 border border-white/20" 
      />

      <label className="block text-sm text-gray-300 font-semibold">Status *</label>
      <select 
        name="status" 
        value={form.status} 
        onChange={handleChange} 
        className="w-full px-3 py-2 rounded bg-panel-muted text-gray-200 border border-white/20" 
        required
      >
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
      </select>

      {/* Personal Details */}
      <label className="block text-sm text-gray-300 font-semibold mt-4">Birthdate *</label>
      <input 
        name="birthdate" 
        type="date" 
        value={form.birthdate} 
        onChange={handleChange} 
        className="w-full px-3 py-2 rounded bg-panel-muted text-gray-200 border border-white/20" 
        required 
      />

      <label className="block text-sm text-gray-300 font-semibold">Marital Status</label>
      <select 
        name="maritalStatus" 
        value={form.maritalStatus} 
        onChange={handleChange} 
        className="w-full px-3 py-2 rounded bg-panel-muted text-gray-200 border border-white/20"
      >
        <option value="">Select Marital Status</option>
        <option value="Single">Single</option>
        <option value="Married">Married</option>
        <option value="Widowed">Widowed</option>
        <option value="Separated">Separated</option>
      </select>

      <label className="block text-sm text-gray-300">Names of Dependents (Optional)</label>
      <input 
        name="nameOfDependents" 
        value={form.nameOfDependents} 
        onChange={handleChange} 
        placeholder="Enter names of dependents (optional)" 
        className="w-full px-3 py-2 rounded bg-panel-muted text-gray-200 border border-white/20 placeholder:text-gray-400" 
      />

      {/* Form Actions */}
      <div className="flex justify-between items-center pt-4">
        <button 
          type="button" 
          className="px-4 py-2 rounded border border-gray-600 text-gray-200 hover:bg-gray-700" 
          onClick={onCancel}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="px-4 py-2 rounded bg-accent-blue text-white font-semibold hover:bg-blue-600"
        >
          {mode === 'add' ? '+ Add User' : 'Save'}
        </button>
      </div>
    </form>
  )
}
