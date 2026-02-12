import React, { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import JobForm from './forms/JobForm'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

export default function JobManager() {
  const [jobs, setJobs] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showJobModal, setShowJobModal] = useState(false)
  const [jobLoading, setJobLoading] = useState(false)
  const [editJob, setEditJob] = useState(null)

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const jobsSnap = await getDocs(collection(db, 'jobs'))
      const jobsList = jobsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      setJobs(jobsList)

      const usersSnap = await getDocs(collection(db, 'users'))
      const usersList = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      setUsers(usersList)
    } catch (e) {
      console.error('Failed to fetch jobs/users', e)
    } finally {
      setLoading(false)
    }
  }

  function countUsersForJob(job) {
    try {
      return users.filter(u => {
        if (!u) return false
        if (u.jobId && String(u.jobId) === String(job.id)) return true
        if (u.jobId && String(u.jobId) === String(job._id)) return true
        // match by job title/name
        if (u.jobTitle && job.title && String(u.jobTitle).toLowerCase().trim() === String(job.title).toLowerCase().trim()) return true
        if (u.job && job.title && String(u.job).toLowerCase().trim() === String(job.title).toLowerCase().trim()) return true
        return false
      }).length
    } catch (e) {
      return 0
    }
  }

  function handleAddJob() {
    setShowJobModal(true)
  }

  async function createJob(data) {
    try {
      setJobLoading(true)
      if (editJob) {
        // update existing
        await updateDoc(doc(db, 'jobs', editJob.id), { title: data.title, description: data.description || '', updatedAt: serverTimestamp() })
        setEditJob(null)
        alert('Job updated')
      } else {
        await addDoc(collection(db, 'jobs'), { title: data.title, description: data.description || '', employees: 0, status: 'active', createdAt: serverTimestamp() })
        alert('Job added')
      }
      await fetchAll()
      setShowJobModal(false)
    } catch (e) {
      console.error('Failed to add/update job', e)
      alert('Failed to add/update job')
    } finally {
      setJobLoading(false)
    }
  }

  async function handleDeleteJob(jobId) {
    const ok = window.confirm('Delete this job?')
    if (!ok) return
    try {
      setLoading(true)
      await deleteDoc(doc(db, 'jobs', jobId))
      await fetchAll()
      alert('Deleted')
    } catch (e) {
      console.error(e)
      alert('Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-200">
      <div className="w-64"><Sidebar /></div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold">Jobs Management</h1>
                <p className="text-sm text-gray-400">Create and manage company job titles and positions</p>
              </div>
              <div>
                <button onClick={handleAddJob} className="bg-accent-blue text-white px-4 py-2 rounded">+ Add Job Title</button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-panel-muted rounded border border-white/10">
                <div className="text-xs text-gray-400">Total Job Titles</div>
                <div className="text-2xl font-bold">{jobs.length}</div>
              </div>
              <div className="p-4 bg-panel-muted rounded border border-white/10">
                <div className="text-xs text-gray-400">Active Positions</div>
                <div className="text-2xl font-bold">{jobs.length}</div>
              </div>
              <div className="p-4 bg-panel-muted rounded border border-white/10">
                <div className="text-xs text-gray-400">Total Employees</div>
                <div className="text-2xl font-bold">{users.length}</div>
              </div>
            </div>

            <div className="bg-panel-dark border border-white/10 rounded p-4">
              <div className="mb-4">
                <input placeholder="Search job titles..." className="w-full px-4 py-2 rounded bg-panel-muted text-gray-200" />
              </div>

              <div className="mb-3 text-sm text-gray-400 font-semibold">All Job Titles</div>

              <div className="overflow-x-auto">
                <table className="min-w-full bg-panel-dark border border-white/10 rounded">
                  <thead>
                    <tr className="text-left text-xs text-gray-400">
                      <th className="px-6 py-3 border-b border-white/10">JOB TITLE</th>
                      <th className="px-6 py-3 border-b border-white/10">DESCRIPTION</th>
                      <th className="px-6 py-3 border-b border-white/10">EMPLOYEES</th>
                      <th className="px-6 py-3 border-b border-white/10">STATUS</th>
                      <th className="px-6 py-3 border-b border-white/10">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={5} className="px-6 py-4 text-gray-400">Loading...</td></tr>
                    ) : jobs.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-4 text-gray-400">No jobs found</td></tr>
                    ) : (
                      jobs.map(job => (
                        <tr key={job.id} className="border-b border-white/6 hover:bg-panel-muted/30">
                          <td className="px-6 py-4 align-top">
                            <div className="font-semibold text-gray-200">{job.title || job.name}</div>
                          </td>
                          <td className="px-6 py-4 align-top text-sm text-gray-400">
                            {job.description || ''}
                          </td>
                          <td className="px-6 py-4 align-top text-sm text-gray-200">
                            {(job.employees || countUsersForJob(job))} employees
                          </td>
                          <td className="px-6 py-4 align-top">
                            <span className={`px-2 py-1 text-xs rounded-full ${job.status === 'active' ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-200'}`}>
                              {job.status || 'active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 align-top">
                            <div className="flex items-center gap-2">
                                <button onClick={() => { setEditJob(job); setShowJobModal(true) }} className="text-sm px-2 py-1 bg-white/5 rounded">✎</button>
                              <button onClick={() => handleDeleteJob(job.id)} className="text-sm px-2 py-1 bg-red-600 rounded">🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>
      <JobForm show={showJobModal} onClose={() => setShowJobModal(false)} onSubmit={createJob} loading={jobLoading} />
    </div>
  )
}
