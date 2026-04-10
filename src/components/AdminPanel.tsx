import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  X,
  FilePlus,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Sun,
  Moon,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Notice1Generator from './Notice1Generator';
import Notice2Generator from './Notice2Generator';
import DivorceCertificateGenerator from './DivorceCertificateGenerator';
import SettingsComponent from './Settings';

interface AdminPanelProps {
  user: { name: string; email: string };
  onLogout: () => void;
}

export default function AdminPanel({ user, onLogout }: AdminPanelProps) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract tab from URL, e.g. /admin/appointments -> appointments
  const pathParts = location.pathname.split('/');
  const activeTab = pathParts[2] || 'dashboard';

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(
    'Notification' in window ? Notification.permission : 'denied'
  );
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointments', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        
        // Check for new unread appointments to trigger browser notification
        if (notificationPermission === 'granted') {
          const newUnread = data.appointments.filter((app: any) => !app.isRead);
          const oldUnread = appointments.filter((app: any) => !app.isRead);
          
          if (newUnread.length > oldUnread.length) {
            const latest = newUnread[0];
            new Notification('New Appointment Request', {
              body: `${latest.name} requested a ${latest.service} appointment.`,
              icon: '/favicon.ico' // Assuming there's a favicon
            });
          }
        }
        
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // Poll every 15 seconds
    const interval = setInterval(fetchAppointments, 15000);
    return () => clearInterval(interval);
  }, [notificationPermission, appointments]); // Re-run if permission changes

  const unreadCount = appointments.filter(a => !a.isRead).length;

  const handleNotificationClick = async () => {
    setShowNotifications(!showNotifications);
    
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/appointments/${id}/read`, {
        method: 'PATCH',
        credentials: 'include'
      });
      fetchAppointments();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/appointments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      fetchAppointments();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const confirmDeleteAppointment = async () => {
    if (!appointmentToDelete) return;
    try {
      await fetch(`/api/appointments/${appointmentToDelete}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      fetchAppointments();
    } catch (error) {
      console.error('Failed to delete appointment:', error);
    } finally {
      setAppointmentToDelete(null);
    }
  };

  const stats = [
    { label: 'Total Registrations', value: '1,284', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Appointments', value: appointments.filter(a => a.status === 'Pending').length.toString(), icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex transition-colors duration-200">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transform transition-transform duration-300 lg:translate-x-0 lg:static ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white leading-tight">Admin Portal</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Kazi Office Durgapur</p>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-gray-500 dark:text-gray-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 mb-4 rounded-lg transition-colors text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-primary font-medium border border-gray-100 dark:border-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Website
          </button>

          <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-4">Menu</div>
          
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'registrations', label: 'Registrations', icon: FileText },
            { id: 'appointments', label: 'Appointments', icon: Calendar, badge: unreadCount > 0 ? unreadCount : null },
            { id: 'documents', label: 'Documents', icon: FilePlus },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                navigate(`/admin/${item.id}`);
                setIsMobileMenuOpen(false);
                if (item.id !== 'documents') setSelectedDocument(null);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                {item.label}
              </div>
              {item.badge && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-slate-800">
          <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 mb-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Logged in as</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user.email}</p>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 relative z-30 transition-colors duration-200">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-gray-500 dark:text-gray-400">
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search records..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white transition-colors"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 relative">
            <button onClick={toggleTheme} className="p-2 text-gray-400 hover:text-primary dark:hover:text-accent relative">
              {isDark ? <Sun className="w-5 h-5 text-accent" /> : <Moon className="w-5 h-5 text-primary" />}
            </button>
            
            <button onClick={handleNotificationClick} className="p-2 text-gray-400 hover:text-primary dark:hover:text-accent relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              )}
            </button>
            
            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50">
                    <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                      {unreadCount} New
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {appointments.filter(a => !a.isRead).length === 0 ? (
                      <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                        No new notifications
                      </div>
                    ) : (
                      appointments.filter(a => !a.isRead).map(app => (
                        <div key={app._id} className="p-4 border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer" onClick={() => {
                          markAsRead(app._id);
                          navigate('/admin/appointments');
                          setShowNotifications(false);
                        }}>
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{app.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(app.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">Requested a {app.service} appointment.</p>
                          <div className="flex items-center gap-2 text-xs text-primary font-medium">
                            <Calendar className="w-3 h-3" /> {app.date} at {app.time}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 border-t border-gray-100 dark:border-slate-700 text-center">
                    <button 
                      onClick={() => {
                        navigate('/admin/appointments');
                        setShowNotifications(false);
                      }}
                      className="text-sm text-primary font-medium hover:underline"
                    >
                      View All Appointments
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="h-8 w-px bg-gray-200 dark:bg-slate-700 mx-1 sm:mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Administrator</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center justify-center font-bold text-sm sm:text-base">
                {user.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && (
              <>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400">Welcome back! Here's what's happening today.</p>
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
                      className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm transition-colors"
                    >
                      <div className={`w-12 h-12 ${stat.bg} dark:bg-opacity-10 rounded-xl flex items-center justify-center mb-4`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</h3>
                    </motion.div>
                  ))}
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Recent Activities */}
                  <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                    <div className="p-6 border-b border-gray-50 dark:border-slate-800 flex items-center justify-between">
                      <h3 className="font-bold text-gray-900 dark:text-white">Recent Activities</h3>
                      <button className="text-primary text-sm font-medium hover:underline">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                            <th className="px-6 py-4 font-semibold">Type</th>
                            <th className="px-6 py-4 font-semibold">Name</th>
                            <th className="px-6 py-4 font-semibold">Date</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                          {recentActivities.map((activity) => (
                            <tr key={activity.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                                  activity.type === 'Marriage' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 
                                  activity.type === 'Divorce' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                                }`}>
                                  {activity.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{activity.name}</td>
                              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{activity.date}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${
                                    activity.status === 'Completed' ? 'bg-emerald-500' : 
                                    activity.status === 'Pending' ? 'bg-amber-500' : 'bg-blue-500'
                                  }`}></div>
                                  <span className="text-sm text-gray-700 dark:text-gray-300">{activity.status}</span>
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

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 transition-colors">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-4">Quick Links</h3>
                      <div className="space-y-3">
                        {[
                          'Print Certificates',
                          'Monthly Reports',
                          'Database Backup',
                          'User Permissions'
                        ].map((link, idx) => (
                          <button 
                            key={idx}
                            className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 font-medium transition-colors flex items-center justify-between"
                          >
                            {link}
                            <Plus className="w-4 h-4 text-gray-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'appointments' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                <div className="p-6 border-b border-gray-50 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 dark:text-white text-xl">Appointments</h3>
                  <div className="flex gap-2">
                    <span className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-sm font-medium">
                      {appointments.filter(a => a.status === 'Pending').length} Pending
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                        <th className="px-6 py-4 font-semibold">Client</th>
                        <th className="px-6 py-4 font-semibold">Service</th>
                        <th className="px-6 py-4 font-semibold">Date & Time</th>
                        <th className="px-6 py-4 font-semibold">Contact</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                      {appointments.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                            No appointments found.
                          </td>
                        </tr>
                      ) : (
                        appointments.map((app) => (
                          <tr key={app._id} className={`transition-colors ${!app.isRead ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-gray-50 dark:hover:bg-slate-800/50'}`}>
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                {!app.isRead && <span className="w-2 h-2 bg-primary rounded-full"></span>}
                                {app.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Submitted: {new Date(app.createdAt).toLocaleDateString()}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
                                {app.service}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 dark:text-white flex items-center gap-1"><Calendar className="w-3 h-3"/> {app.date}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1"><Clock className="w-3 h-3"/> {app.time}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 dark:text-white">{app.phone}</div>
                              {app.email && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{app.email}</div>}
                            </td>
                            <td className="px-6 py-4">
                              <select 
                                value={app.status}
                                onChange={(e) => updateStatus(app._id, e.target.value)}
                                className={`text-sm rounded-md px-2 py-1 border-0 font-medium cursor-pointer focus:ring-0 ${
                                  app.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' :
                                  app.status === 'Cancelled' ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                                  'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {!app.isRead && (
                                  <button 
                                    onClick={() => markAsRead(app._id)}
                                    className="text-xs text-primary hover:underline font-medium"
                                  >
                                    Mark Read
                                  </button>
                                )}
                                <button 
                                  onClick={() => setAppointmentToDelete(app._id)}
                                  className="text-gray-400 hover:text-red-500 transition-colors"
                                  title="Delete Appointment"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6">
                {!selectedDocument ? (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Available Documents</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {/* Notice 1 Tile */}
                      <div 
                        onClick={() => setSelectedDocument('notice1')}
                        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-6 cursor-pointer hover:shadow-md hover:border-primary dark:hover:border-primary transition-all group"
                      >
                        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <FileText className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Notice 1</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Generate Talaqu-e-Hassan / Aahsan notice document.</p>
                      </div>
                      
                      {/* Notice 2 Tile */}
                      <div 
                        onClick={() => setSelectedDocument('notice2')}
                        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-6 cursor-pointer hover:shadow-md hover:border-primary dark:hover:border-primary transition-all group"
                      >
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <FileText className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Notice 2</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Generate 2nd Talaque notice document.</p>
                      </div>

                      {/* Divorce Certificate Tile */}
                      <div 
                        onClick={() => setSelectedDocument('divorce_certificate')}
                        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-6 cursor-pointer hover:shadow-md hover:border-primary dark:hover:border-primary transition-all group"
                      >
                        <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <FileText className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Divorce Certificate</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Generate Divorce Registration Certificate.</p>
                      </div>
                      {/* Add more tiles here in the future */}
                    </div>
                  </div>
                ) : (
                  <div>
                    <button 
                      onClick={() => setSelectedDocument(null)}
                      className="mb-4 flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" /> Back to Documents
                    </button>
                    {selectedDocument === 'notice1' && <Notice1Generator />}
                    {selectedDocument === 'notice2' && <Notice2Generator />}
                    {selectedDocument === 'divorce_certificate' && <DivorceCertificateGenerator />}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <SettingsComponent />
            )}
            
            {/* Other tabs can go here */}
            {['registrations', 'users'].includes(activeTab) && (
              <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 flex items-center justify-center h-64 transition-colors">
                <p className="text-gray-500 dark:text-gray-400 text-lg">This section is under construction.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Appointment Confirmation Modal */}
      {appointmentToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
              <Trash2 className="w-6 h-6" />
              <h3 className="text-lg font-bold">Confirm Deletion</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this appointment? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setAppointmentToDelete(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteAppointment}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
