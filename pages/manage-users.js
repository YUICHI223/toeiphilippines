import React from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import ManageUsers from '../components/ManageUsers'

export default function ManageUsersPage() {
  return (
    <div className="min-h-screen bg-bg-dark text-gray-200">
      <Sidebar />
      <div className="pl-64">
        <Topbar />
        <main className="p-0">
          <ManageUsers />
        </main>
      </div>
    </div>
  )
}
