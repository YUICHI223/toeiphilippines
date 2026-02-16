import React from 'react'
import ArtistSidebar from '../../../components/ArtistSidebar'
import Topbar from '../../../components/Topbar'
import TeamChat from '../../../components/TeamChat'

export default function ArtistChatPage(){
  return (
    <div className="min-h-screen bg-bg-dark text-gray-200">
      <ArtistSidebar />
      <div className="md:pl-64 pl-0 pt-16 md:pt-0">
        <Topbar />
        <main className="p-4 md:p-6 max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Team Chat</h1>
          <TeamChat />
        </main>
      </div>
    </div>
  )
}
