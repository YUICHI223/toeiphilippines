import React from 'react'
export default function Nav(){
  return (
    <header className="bg-white shadow">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="text-lg font-bold">SystemToEi</div>
        <nav className="space-x-4">
          <a className="text-sm text-gray-600 hover:text-gray-900" href="#">Home</a>
        </nav>
      </div>
    </header>
  )
}
