import React from 'react'
import Sidebar from '../../../components/Sidebar'
import Topbar from '../../../components/Topbar'
import DashboardCard from '../../../components/DashboardCard'

export default function AdminDashboard(){
  return (
    <div className="min-h-screen bg-bg-dark text-gray-200">
      <Sidebar />
      <div className="md:pl-64 pl-0 pt-16 md:pt-0">
        <Topbar />

        <main className="p-3 md:p-6 max-w-6xl mx-auto space-y-4 md:space-y-6">
          <section className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <DashboardCard title="Total Projects" className="col-span-1">
              <div className="text-2xl md:text-3xl font-bold">0</div>
              <div className="text-xs md:text-sm text-gray-400">0 active, 0 completed, 0 pending</div>
            </DashboardCard>

            <DashboardCard title="All Users" className="col-span-1">
              <div className="text-2xl md:text-3xl font-bold">0</div>
              <div className="text-xs md:text-sm text-gray-400">4 departments, 0 job titles</div>
            </DashboardCard>

            <DashboardCard title="Role Management" className="col-span-1">
              <div className="text-2xl md:text-3xl font-bold">0</div>
              <div className="text-xs md:text-sm text-gray-400">0 roles configured</div>
            </DashboardCard>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
            <div className="lg:col-span-2">
              <DashboardCard title="Production Overview">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3 mb-6">
                  <div className="p-2 md:p-4 bg-panel-muted rounded text-center">
                    <div className="font-bold text-lg md:text-2xl">0</div>
                    <div className="text-xs text-gray-400">All Departments</div>
                  </div>
                  <div className="p-2 md:p-4 bg-panel-muted rounded text-center">
                    <div className="font-bold text-lg md:text-2xl">0</div>
                    <div className="text-xs text-gray-400">KA</div>
                  </div>
                  <div className="p-2 md:p-4 bg-panel-muted rounded text-center">
                    <div className="font-bold text-lg md:text-2xl">0</div>
                    <div className="text-xs text-gray-400">Inbetweener</div>
                  </div>
                  <div className="p-2 md:p-4 bg-panel-muted rounded text-center">
                    <div className="font-bold text-lg md:text-2xl">0</div>
                    <div className="text-xs text-gray-400">Background</div>
                  </div>
                </div>
                <div className="text-center py-8 md:py-12 text-gray-400 text-sm">No Projects Yet</div>
                <div className="flex justify-center"><button className="px-4 py-2 bg-accent-blue text-white rounded text-sm">Create Project</button></div>
              </DashboardCard>
            </div>

            <div className="lg:col-span-1">
              <DashboardCard title="User Management">
                <div className="text-xs md:text-sm text-gray-400 mb-4">All Departments (0)</div>
                <div className="h-3 bg-gradient-to-r from-blue-500 to-blue-900 rounded-full mb-6"></div>
                <div className="text-center py-6 md:py-8 text-gray-400 text-sm">No Users Yet</div>
                <div className="flex justify-center"><button className="px-4 py-2 bg-accent-orange text-white rounded text-sm">Add User</button></div>
              </DashboardCard>
            </div>
          </section>

          <section>
            <DashboardCard title="Admin Actions">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
                <div className="p-3 bg-panel-muted rounded">
                  <div className="font-semibold text-sm">User Management</div>
                  <div className="text-xs text-gray-400 mt-1">Manage users, roles, and permissions.</div>
                </div>
                <div className="p-3 bg-panel-muted rounded">
                  <div className="font-semibold text-sm">Project Management</div>
                  <div className="text-xs text-gray-400 mt-1">Create and manage projects and tasks.</div>
                </div>
                <div className="p-3 bg-panel-muted rounded">
                  <div className="font-semibold text-sm">Attendance Management</div>
                  <div className="text-xs text-gray-400 mt-1">Track and manage attendance records.</div>
                </div>
              </div>
            </DashboardCard>
          </section>
        </main>
      </div>
    </div>
  )
}
