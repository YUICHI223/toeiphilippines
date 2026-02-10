import React from 'react'
import ArtistSidebar from '../../../components/ArtistSidebar'
import Topbar from '../../../components/Topbar'
import DashboardCard from '../../../components/DashboardCard'

export default function ArtistDashboard(){
  return (
    <div className="min-h-screen bg-bg-dark text-gray-200">
      <ArtistSidebar />
      <div className="pl-64">
        <Topbar />

        <main className="p-6 max-w-6xl mx-auto space-y-6">
          {/* Welcome Section */}
          <section>
            <h1 className="text-3xl font-bold mb-2">Welcome Back, Artist</h1>
            <p className="text-gray-400">Here's your animation production progress</p>
          </section>

          {/* Quick Stats */}
          <section className="grid grid-cols-3 gap-4">
            <DashboardCard title="Assigned Tasks" className="col-span-1">
              <div className="text-3xl font-bold">0</div>
              <div className="text-sm text-gray-400">0 pending, 0 in progress, 0 completed</div>
            </DashboardCard>

            <DashboardCard title="Current Projects" className="col-span-1">
              <div className="text-3xl font-bold">0</div>
              <div className="text-sm text-gray-400">0 active</div>
            </DashboardCard>

            <DashboardCard title="Submissions" className="col-span-1">
              <div className="text-3xl font-bold">0</div>
              <div className="text-sm text-gray-400">0 pending review</div>
            </DashboardCard>
          </section>

          {/* Tasks and Projects */}
          <section className="grid grid-cols-2 gap-4">
            <DashboardCard title="My Active Tasks">
              <div className="space-y-3">
                <div className="p-4 bg-panel-muted rounded">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold">Scene Animation - Episode 1</div>
                      <div className="text-xs text-gray-400">Project: Main Series 2026</div>
                    </div>
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">In Progress</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '65%'}}></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">65% Complete</div>
                </div>
              </div>
              <div className="text-center py-8 text-gray-400">No active tasks</div>
              <div className="flex justify-center"><button className="px-4 py-2 bg-accent-blue text-white rounded">View All Tasks</button></div>
            </DashboardCard>

            <DashboardCard title="My Projects">
              <div className="space-y-3">
                <div className="p-4 bg-panel-muted rounded">
                  <div className="font-semibold mb-1">Main Series 2026</div>
                  <div className="text-sm text-gray-400">12 Episodes • Key Animation</div>
                  <div className="mt-2 flex gap-2">
                    <span className="text-xs bg-green-600/30 text-green-400 px-2 py-1 rounded">Active</span>
                  </div>
                </div>
              </div>
              <div className="text-center py-8 text-gray-400">No projects assigned yet</div>
              <div className="flex justify-center"><button className="px-4 py-2 bg-accent-orange text-white rounded">View All Projects</button></div>
            </DashboardCard>
          </section>

          {/* Performance Section */}
          <section className="grid grid-cols-2 gap-4">
            <DashboardCard title="Your Performance">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Tasks Completed</span>
                    <span className="font-bold">0/20</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '0%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Quality Score</span>
                    <span className="font-bold">0%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{width: '0%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">On-Time Delivery</span>
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
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-panel-muted rounded text-center">
                    <div className="font-bold text-xl">0</div>
                    <div className="text-xs text-gray-400">Present Days</div>
                  </div>
                  <div className="p-3 bg-panel-muted rounded text-center">
                    <div className="font-bold text-xl">0</div>
                    <div className="text-xs text-gray-400">Absent Days</div>
                  </div>
                  <div className="p-3 bg-panel-muted rounded text-center">
                    <div className="font-bold text-xl">0</div>
                    <div className="text-xs text-gray-400">Leave Days</div>
                  </div>
                  <div className="p-3 bg-panel-muted rounded text-center">
                    <div className="font-bold text-xl">0%</div>
                    <div className="text-xs text-gray-400">Attendance Rate</div>
                  </div>
                </div>
              </div>
            </DashboardCard>
          </section>

          {/* Quick Actions */}
          <section>
            <DashboardCard title="Quick Actions">
              <div className="grid grid-cols-3 gap-4">
                <button className="p-4 bg-panel-muted hover:bg-blue-900/40 rounded transition-colors text-left">
                  <div className="font-semibold mb-1">Submit Work</div>
                  <div className="text-xs text-gray-400">Upload your completed animations</div>
                </button>
                <button className="p-4 bg-panel-muted hover:bg-blue-900/40 rounded transition-colors text-left">
                  <div className="font-semibold mb-1">Request Leave</div>
                  <div className="text-xs text-gray-400">Apply for time off</div>
                </button>
                <button className="p-4 bg-panel-muted hover:bg-blue-900/40 rounded transition-colors text-left">
                  <div className="font-semibold mb-1">View Feedback</div>
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
