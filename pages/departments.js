import React from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import DepartmentManager from '../components/DepartmentManager'

export default function DepartmentsPage() {
  return (
    <div className="flex h-screen bg-gray-900 text-gray-200">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="p-0 overflow-y-auto">
          <DepartmentManager />
        </main>
      </div>
    </div>
  )
}
