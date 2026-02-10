import React from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import RoleManager from '../components/RoleManager'

export default function RoleManagerPage() {
  return (
    <div className="min-h-screen bg-bg-dark text-gray-200">
      <Sidebar />
      <div className="pl-64">
        <Topbar />
        <main className="p-0">
          <RoleManager />
        </main>
      </div>
    </div>
  )
}
