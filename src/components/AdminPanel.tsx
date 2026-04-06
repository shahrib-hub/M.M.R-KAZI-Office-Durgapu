import React, { useState } from 'react';
import { 
  Users, 
  FileText, 
  Calendar, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  BarChart3, 
  Bell,
  Search,
  Plus,
  Menu,
  X
} from 'lucide-react';
import { motion } from 'motion/react';

interface AdminPanelProps {
  user: { name: string; email: string };
  onLogout: () => void;
}

export default function AdminPanel({ user, onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const stats = [
    { label: 'Total Registrations', value: '1,284', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Appointments', value: '12', icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Active Users', value: '456', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'System Health', value: 'Optimal', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const recentActivities = [
    { id: 1, type: 'Marriage', name: 'Ahmed & Fatima', date: '2024-03-20', status: 'Completed' },
    { id: 2, type: 'Divorce', name: 'Zaid & Sarah', date: '2024-03-18', status: 'Pending' },
    { id: 3, type: 'Consultation', name: 'Omar Khan', date: '2024-03-15', status: 'In Progress' },
    { id: 4, type: 'Marriage', name: 'Yusuf & Maryam', date: '2024-03-12', status: 'Completed' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 lg:static ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 leading-tight">Admin Portal</h2>
              <p className="text-xs text-gray-500">Kazi Office Durgapur</p>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-gray-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'registrations', label: 'Registrations', icon: FileText },
            { id: 'appointments', label: 'Appointments', icon: Calendar },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="text-xs text-gray-500 mb-1">Logged in as</p>
            <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-100 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-gray-500">
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search records..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="p-2 text-gray-400 hover:text-primary relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-gray-200 mx-1 sm:mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-emerald-600 font-medium">Administrator</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-sm sm:text-base">
                {user.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-500">Welcome back! Here's what's happening today.</p>
              </div>
              <button className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-900 transition-colors shadow-sm">
                <Plus className="w-4 h-4" />
                New Registration
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
                >
                  <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center mb-4`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                </motion.div>
              ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Activities */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Recent Activities</h3>
                  <button className="text-primary text-sm font-medium hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                        <th className="px-6 py-4 font-semibold">Type</th>
                        <th className="px-6 py-4 font-semibold">Name</th>
                        <th className="px-6 py-4 font-semibold">Date</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {recentActivities.map((activity) => (
                        <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                              activity.type === 'Marriage' ? 'bg-blue-50 text-blue-600' : 
                              activity.type === 'Divorce' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                              {activity.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{activity.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{activity.date}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                activity.status === 'Completed' ? 'bg-emerald-500' : 
                                activity.status === 'Pending' ? 'bg-amber-500' : 'bg-blue-500'
                              }`}></div>
                              <span className="text-sm text-gray-700">{activity.status}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Actions / Info */}
              <div className="space-y-8">
                <div className="bg-primary rounded-2xl p-6 text-white shadow-lg shadow-primary/20">
                  <h3 className="font-bold text-lg mb-2">System Notice</h3>
                  <p className="text-emerald-100 text-sm mb-4">
                    Registration is currently restricted to administrators only. Public registration is disabled.
                  </p>
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-xs text-emerald-200 mb-1">Current Server Time</p>
                    <p className="font-mono text-xl">{new Date().toLocaleTimeString()}</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
                  <div className="space-y-3">
                    {[
                      'Print Certificates',
                      'Monthly Reports',
                      'Database Backup',
                      'User Permissions'
                    ].map((link, idx) => (
                      <button 
                        key={idx}
                        className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm text-gray-700 font-medium transition-colors flex items-center justify-between"
                      >
                        {link}
                        <Plus className="w-4 h-4 text-gray-400" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
