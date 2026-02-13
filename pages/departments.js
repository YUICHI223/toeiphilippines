import React from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import DepartmentManager from '../components/DepartmentManager'

export default function DepartmentsPage() {
  return (
    <div className="min-h-screen bg-bg-dark text-gray-200">
      <Sidebar />
      <div className="md:pl-64 pl-0 pt-16 md:pt-0">
        <Topbar />
        <main className="p-0">
          <DepartmentManager />
        </main>
      </div>
    </div>
  )
}
