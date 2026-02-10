import React from 'react'

export default function DashboardCard({children, title, className}){
  return (
    <div className={"rounded border border-blue-900/30 bg-panel-dark p-4 " + (className || '')}>
      {title && <div className="text-sm text-gray-400 mb-3 font-medium">{title}</div>}
      <div>{children}</div>
    </div>
  )
}
