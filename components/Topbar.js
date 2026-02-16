import React from 'react'
import { auth } from '../lib/firebase'
import { signOut } from 'firebase/auth'
import { useRouter } from 'next/router'
import Link from 'next/link'

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
    <header className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 md:p-4 bg-transparent border-b border-blue-900/20 gap-3 md:gap-0">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 w-full md:w-auto">
        <h2 className="text-lg md:text-xl text-white font-semibold">Dashboard Overview</h2>
        <div className="text-xs md:text-sm text-gray-300">0 projects • 0 users</div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 w-full md:w-auto">
        <input placeholder="Search..." className="bg-panel-muted text-xs md:text-sm px-3 py-2 rounded-md text-gray-300 outline-none focus:ring-1 focus:ring-accent-blue flex-1 sm:flex-none" />
        <div className="flex items-center gap-2">
          <button onClick={handleLogout} className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs md:text-sm transition-colors flex-1 sm:flex-none">Logout</button>
          <Link href="/profile">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-900 rounded-full flex items-center justify-center text-sm flex-shrink-0 text-white font-bold cursor-pointer hover:from-blue-500 hover:to-blue-800 transition-colors">P</div>
          </Link>
        </div>
      </div>
    </header>
  )
}
