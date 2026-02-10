import React from 'react'

const VARIANTS = {
  purple: 'bg-gradient-to-r from-purple-600 to-purple-500 text-white',
  green: 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-white',
  orange: 'bg-gradient-to-r from-orange-500 to-orange-400 text-white',
  teal: 'bg-gradient-to-r from-sky-600 to-sky-500 text-white',
  default: 'bg-panel-dark text-white'
}

export default function DashboardCard({ children, title, variant = 'default', icon, className }){
  const vclass = VARIANTS[variant] || VARIANTS.default
  return (
    <div className={`rounded p-4 ${vclass} ${className || ''}`}>
      <div className="flex items-center justify-between">
        <div>
          {title && <div className="text-sm opacity-90 mb-2 font-medium">{title}</div>}
          <div className="text-2xl font-bold">{children}</div>
        </div>
        {icon && (
          <div className="opacity-30 ml-4 flex-shrink-0" style={{fontSize: 40}}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
