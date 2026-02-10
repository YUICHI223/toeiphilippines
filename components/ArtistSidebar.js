import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'

const items = [
  { label: 'Dashboard', href: '/dashboards/artist', icon: 'dashboard' },
  { label: 'My Tasks', href: '/dashboards/artist/my-tasks', icon: 'tasks' },
  { label: 'My Projects', href: '/dashboards/artist/my-projects', icon: 'project' },
  { label: 'Calendar', href: '/dashboards/artist/calendar', icon: 'calendar' },
  { label: 'Submissions', href: '/dashboards/artist/submissions', icon: 'doc' },
  { label: 'Performance', href: '/dashboards/artist/performance', icon: 'chart' },
  { label: 'Attendance', href: '/dashboards/artist/attendance', icon: 'log' },
  { label: 'Leave Requests', href: '/dashboards/artist/leave-requests', icon: 'request' },
  { label: 'My Profile', href: '/dashboards/artist/profile', icon: 'profile' },
  { label: 'Team Chat', href: '/dashboards/artist/chat', icon: 'chat' },
]

const iconMap = {
  dashboard: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 4h4" /></svg>,
  tasks: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  project: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  calendar: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  doc: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  chart: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  log: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  request: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3" /></svg>,
  profile: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  chat: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
}

export default function ArtistSidebar(){
  const router = useRouter()
  const currentPath = router.pathname

  const isActive = (href) => {
    if (href === '#') return false
    return currentPath === href
  }

  return (
    <aside className="w-64 h-screen bg-slate-900 text-gray-200 border-r border-blue-800/40 fixed flex flex-col">
      <div className="px-4 py-5 flex items-center gap-3 border-b border-blue-900/30 flex-shrink-0">
        <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center font-bold text-white">T</div>
        <div className="text-sm font-semibold">Toei Animation Philippines</div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-thin scrollbar-thumb-blue-700 scrollbar-track-slate-800">
        <ul className="space-y-1">
          {items.map((it, i) => (
            <li key={i}>
              <Link href={it.href} legacyBehavior>
                <a className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-all ${
                  isActive(it.href)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-blue-900/30 hover:text-white'
                }`}>
                  <span className="flex-shrink-0 text-blue-400">{iconMap[it.icon]}</span>
                  <span className="truncate">{it.label}</span>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-blue-900/30 p-4 flex-shrink-0">
        <div className="flex items-center gap-3 px-2 py-2 rounded hover:bg-blue-900/20 cursor-pointer transition-colors">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">Artist</div>
            <div className="text-xs text-gray-400">System Online</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
