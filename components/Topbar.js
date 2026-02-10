import React from 'react'
import { auth } from '../lib/firebase'
import { signOut } from 'firebase/auth'
import { useRouter } from 'next/router'

export default function Topbar(){
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className="flex items-center justify-between p-4 bg-transparent border-b border-blue-900/20">
      <div className="flex items-center gap-4">
        <h2 className="text-xl text-white font-semibold">Dashboard Overview</h2>
        <div className="text-sm text-gray-300">0 projects • 0 users</div>
      </div>

      <div className="flex items-center gap-3">
        <input placeholder="Search..." className="bg-panel-muted text-sm px-3 py-2 rounded-md text-gray-300 outline-none focus:ring-1 focus:ring-accent-blue" />
        <button onClick={handleLogout} className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition-colors">Logout</button>
        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm">A</div>
      </div>
    </header>
  )
}
