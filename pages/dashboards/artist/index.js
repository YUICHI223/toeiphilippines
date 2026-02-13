import React from 'react'
import ArtistSidebar from '../../../components/ArtistSidebar'
import Topbar from '../../../components/Topbar'
import DashboardCard from '../../../components/DashboardCard'

export default function ArtistDashboard(){
  return (
    <div className="min-h-screen bg-bg-dark text-gray-200">
      <ArtistSidebar />
      <div className="md:pl-64 pl-0 pt-16 md:pt-0">
        <Topbar />

        <main className="p-3 md:p-6 max-w-6xl mx-auto space-y-4 md:space-y-6">
          {/* Welcome Section */}
          <section>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome Back, Artist</h1>
            <p className="text-xs md:text-sm text-gray-400">Here's your animation production progress</p>
          </section>

          {/* Quick Stats */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <DashboardCard title="Assigned Tasks" className="col-span-1">
              <div className="text-2xl md:text-3xl font-bold">0</div>
              <div className="text-xs md:text-sm text-gray-400">0 pending, 0 in progress, 0 completed</div>
            </DashboardCard>

            <DashboardCard title="Current Projects" className="col-span-1">
              <div className="text-2xl md:text-3xl font-bold">0</div>
              <div className="text-xs md:text-sm text-gray-400">0 active</div>
            </DashboardCard>

            <DashboardCard title="Submissions" className="col-span-1">
              <div className="text-2xl md:text-3xl font-bold">0</div>
              <div className="text-xs md:text-sm text-gray-400">0 pending review</div>
            </DashboardCard>
          </section>

          {/* Tasks and Projects */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
            <DashboardCard title="My Active Tasks">
              <div className="space-y-2 md:space-y-3">
                <div className="p-2 md:p-4 bg-panel-muted rounded">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="min-w-0">
                      <div className="font-semibold text-sm">Scene Animation - Episode 1</div>
                      <div className="text-xs text-gray-400">Project: Main Series 2026</div>
                    </div>
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded flex-shrink-0">In Progress</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '65%'}}></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">65% Complete</div>
                </div>
              </div>
              <div className="text-center py-6 md:py-8 text-gray-400 text-sm">No active tasks</div>
              <div className="flex justify-center"><button className="px-4 py-2 bg-accent-blue text-white rounded text-sm">View All Tasks</button></div>
            </DashboardCard>

            <DashboardCard title="My Projects">
              <div className="space-y-2 md:space-y-3">
                <div className="p-2 md:p-4 bg-panel-muted rounded">
                  <div className="font-semibold text-sm mb-1">Main Series 2026</div>
                  <div className="text-xs md:text-sm text-gray-400">12 Episodes • Key Animation</div>
                  <div className="mt-2 flex gap-2">
                    <span className="text-xs bg-green-600/30 text-green-400 px-2 py-1 rounded">Active</span>
                  </div>
                </div>
              </div>
              <div className="text-center py-6 md:py-8 text-gray-400 text-sm">No projects assigned yet</div>
              <div className="flex justify-center"><button className="px-4 py-2 bg-accent-orange text-white rounded text-sm">View All Projects</button></div>
            </DashboardCard>
          </section>

          {/* Performance Section */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
            <DashboardCard title="Your Performance">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2 text-xs md:text-sm">
                    <span>Tasks Completed</span>
                    <span className="font-bold">0/20</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '0%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2 text-xs md:text-sm">
                    <span>Quality Score</span>
                    <span className="font-bold">0%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{width: '0%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2 text-xs md:text-sm">
                    <span>On-Time Delivery</span>
                    <span className="font-bold">0%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '0%'}}></div>
                  </div>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard title="Attendance Summary">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  <div className="p-2 md:p-3 bg-panel-muted rounded text-center">
                    <div className="font-bold text-lg md:text-xl">0</div>
                    <div className="text-xs text-gray-400">Present Days</div>
                  </div>
                  <div className="p-2 md:p-3 bg-panel-muted rounded text-center">
                    <div className="font-bold text-lg md:text-xl">0</div>
                    <div className="text-xs text-gray-400">Absent Days</div>
                  </div>
                  <div className="p-2 md:p-3 bg-panel-muted rounded text-center">
                    <div className="font-bold text-lg md:text-xl">0</div>
                    <div className="text-xs text-gray-400">Leave Days</div>
                  </div>
                  <div className="p-2 md:p-3 bg-panel-muted rounded text-center">
                    <div className="font-bold text-lg md:text-xl">0%</div>
                    <div className="text-xs text-gray-400">Attendance Rate</div>
                  </div>
                </div>
              </div>
            </DashboardCard>
          </section>

          {/* Quick Actions */}
          <section>
            <DashboardCard title="Quick Actions">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
                <button className="p-3 md:p-4 bg-panel-muted hover:bg-blue-900/40 rounded transition-colors text-left">
                  <div className="font-semibold text-sm mb-1">Submit Work</div>
                  <div className="text-xs text-gray-400">Upload your completed animations</div>
                </button>
                <button className="p-3 md:p-4 bg-panel-muted hover:bg-blue-900/40 rounded transition-colors text-left">
                  <div className="font-semibold text-sm mb-1">Request Leave</div>
                  <div className="text-xs text-gray-400">Apply for time off</div>
                </button>
                <button className="p-3 md:p-4 bg-panel-muted hover:bg-blue-900/40 rounded transition-colors text-left">
                  <div className="font-semibold text-sm mb-1">View Feedback</div>
                  <div className="text-xs text-gray-400">Check supervisor comments</div>
                </button>
              </div>
            </DashboardCard>
          </section>
        </main>
      </div>
    </div>
  )
}
