import React from 'react'
import ProductionControl from '../components/ProductionControl'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

export default function ProductionControlPage(){
  return (
    <div className="min-h-screen bg-slate-900 text-gray-200">
      <Sidebar />
      <div className="md:pl-64">
        <Topbar />
        <main className="p-6 max-w-7xl mx-auto">
          <ProductionControl />
        </main>
      </div>
    </div>
  )
}
