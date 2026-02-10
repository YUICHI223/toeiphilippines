import React from 'react'
import Sidebar from '../../../components/Sidebar'
import Topbar from '../../../components/Topbar'
import DashboardCard from '../../../components/DashboardCard'

export default function AdminDashboard(){
  return (
    <div className="min-h-screen bg-bg-dark text-gray-200">
      <Sidebar />
      <div className="pl-64">
        <Topbar />

        <main className="p-6 max-w-6xl mx-auto space-y-6">
          <section className="grid grid-cols-3 gap-4">
            <DashboardCard title="Total Projects" className="col-span-1">
              <div className="text-3xl font-bold">0</div>
              <div className="text-sm text-gray-400">0 active, 0 completed, 0 pending</div>
            </DashboardCard>

            <DashboardCard title="All Users" className="col-span-1">
              <div className="text-3xl font-bold">0</div>
              <div className="text-sm text-gray-400">4 departments, 0 job titles</div>
            </DashboardCard>

            <DashboardCard title="Role Management" className="col-span-1">
              <div className="text-3xl font-bold">0</div>
              <div className="text-sm text-gray-400">0 roles configured</div>
            </DashboardCard>
          </section>

          <section className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <DashboardCard title="Production Overview">
                <div className="grid grid-cols-4 gap-3 mb-6">
                  <div className="p-4 bg-panel-muted rounded text-center">
                    <div className="font-bold text-2xl">0</div>
                    <div className="text-xs text-gray-400">All Departments</div>
                  </div>
                  <div className="p-4 bg-panel-muted rounded text-center">
                    <div className="font-bold text-2xl">0</div>
                    <div className="text-xs text-gray-400">KA</div>
                  </div>
                  <div className="p-4 bg-panel-muted rounded text-center">
                    <div className="font-bold text-2xl">0</div>
                    <div className="text-xs text-gray-400">Inbetweener</div>
                  </div>
                  <div className="p-4 bg-panel-muted rounded text-center">
                    <div className="font-bold text-2xl">0</div>
                    <div className="text-xs text-gray-400">Background</div>
                  </div>
                </div>
                <div className="text-center py-12 text-gray-400">No Projects Yet</div>
                <div className="flex justify-center"><button className="px-4 py-2 bg-accent-blue text-white rounded">Create Project</button></div>
              </DashboardCard>
            </div>

            <div className="col-span-1">
              <DashboardCard title="User Management">
                <div className="text-sm text-gray-400 mb-4">All Departments (0)</div>
                <div className="h-3 bg-gradient-to-r from-blue-500 to-blue-900 rounded-full mb-6"></div>
                <div className="text-center py-8 text-gray-400">No Users Yet</div>
                <div className="flex justify-center"><button className="px-4 py-2 bg-accent-orange text-white rounded">Add User</button></div>
              </DashboardCard>
            </div>
          </section>

          <section>
            <DashboardCard title="Admin Actions">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-panel-muted rounded">User Management<br/><span className="text-xs text-gray-400">Manage users, roles, and permissions.</span></div>
                <div className="p-3 bg-panel-muted rounded">Project Management<br/><span className="text-xs text-gray-400">Create and manage projects and tasks.</span></div>
                <div className="p-3 bg-panel-muted rounded">Attendance Management<br/><span className="text-xs text-gray-400">Track and manage attendance records.</span></div>
              </div>
            </DashboardCard>
          </section>
        </main>
      </div>
    </div>
  )
}
