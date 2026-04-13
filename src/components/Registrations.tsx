import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Eye, ArrowLeft, Loader2, Save, X } from 'lucide-react';

interface Log {
  _id: string;
  type: string;
  documentType?: string;
  data: Record<string, any>;
  date?: string;
  time?: string;
  createdAt: string;
}

export default function Registrations() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'manual' | 'details'>('manual');
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);

  // Manual Entry State
  const [manualType, setManualType] = useState('Marriage');
  const [manualDate, setManualDate] = useState('');
  const [manualTime, setManualTime] = useState('');
  const [manualFields, setManualFields] = useState<{ key: string; value: string }[]>([
    { key: 'Name', value: '' },
    { key: 'Partner Name', value: '' }
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (view === 'list') {
      fetchLogs();
    }
  }, [view]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/logs', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this log? This action cannot be undone.')) return;
    
    try {
      const res = await fetch(`/api/logs/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        fetchLogs();
        if (view === 'details' && selectedLog?._id === id) {
          setView('list');
        }
      }
    } catch (error) {
      console.error('Failed to delete log:', error);
    }
  };

  const handleAddManualField = () => {
    setManualFields([...manualFields, { key: '', value: '' }]);
  };

  const handleRemoveManualField = (index: number) => {
    const newFields = [...manualFields];
    newFields.splice(index, 1);
    setManualFields(newFields);
  };

  const handleManualFieldChange = (index: number, field: 'key' | 'value', val: string) => {
    const newFields = [...manualFields];
    newFields[index][field] = val;
    setManualFields(newFields);
  };

  const handleSaveManualLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const dataObj: Record<string, string> = {};
    manualFields.forEach(f => {
      if (f.key.trim()) {
        dataObj[f.key.trim()] = f.value.trim();
      }
    });

    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: manualType,
          date: manualDate,
          time: manualTime,
          data: dataObj
        })
      });

      if (res.ok) {
        // Reset form
        setManualType('Marriage');
        setManualDate('');
        setManualTime('');
        setManualFields([{ key: 'Name', value: '' }, { key: 'Partner Name', value: '' }]);
        setView('list');
      }
    } catch (error) {
      console.error('Failed to save manual log:', error);
    } finally {
      setSaving(false);
    }
  };

  if (view === 'manual') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manual Log Entry</h2>
          </div>
          <button 
            onClick={() => setView('list')}
            className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium flex items-center transition-colors"
          >
            <FileText className="w-5 h-5 mr-2" /> View All Logs
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
          <form onSubmit={handleSaveManualLog} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Registration Type</label>
                <select 
                  value={manualType}
                  onChange={(e) => setManualType(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 dark:text-white"
                  required
                >
                  <option value="Marriage">Marriage</option>
                  <option value="Divorce">Divorce</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input 
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
                <input 
                  type="time"
                  value={manualTime}
                  onChange={(e) => setManualTime(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-slate-800 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Custom Information Fields</h3>
                <button 
                  type="button"
                  onClick={handleAddManualField}
                  className="text-sm flex items-center gap-1 text-primary hover:text-emerald-700 font-medium"
                >
                  <Plus className="w-4 h-4" /> Add Field
                </button>
              </div>

              <div className="space-y-3">
                {manualFields.map((field, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-1">
                      <input 
                        type="text"
                        placeholder="Field Name (e.g., Father's Name)"
                        value={field.key}
                        onChange={(e) => handleManualFieldChange(index, 'key', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 dark:text-white text-sm"
                        required
                      />
                    </div>
                    <div className="flex-[2]">
                      <input 
                        type="text"
                        placeholder="Value"
                        value={field.value}
                        onChange={(e) => handleManualFieldChange(index, 'value', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 dark:text-white text-sm"
                        required
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={() => handleRemoveManualField(index)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-0.5"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-primary hover:bg-emerald-700 text-white font-medium rounded-lg flex items-center transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                Save Log Entry
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'details' && selectedLog) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setView('list')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Log Details</h2>
          </div>
          <button 
            onClick={() => handleDelete(selectedLog._id)}
            className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg font-medium flex items-center transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Delete Log
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">Type</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {selectedLog.type} {selectedLog.documentType ? `(${selectedLog.documentType})` : ''}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">Date</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {selectedLog.date || new Date(selectedLog.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">Time</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {selectedLog.time || new Date(selectedLog.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">System Logged</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {new Date(selectedLog.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Inputted Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {Object.entries(selectedLog.data).map(([key, value]) => (
                <div key={key} className="border-b border-gray-100 dark:border-slate-800 pb-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 capitalize">{key.replace(/_/g, ' ')}</p>
                  <p className="text-gray-900 dark:text-white font-medium break-words">
                    {typeof value === 'string' && value.includes('__UNDERLINE_START__') 
                      ? value.replace(/__UNDERLINE_START__|__UNDERLINE_END__/g, '') 
                      : String(value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Registrations & Logs</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">View generated documents and manual registration logs.</p>
        </div>
        <button 
          onClick={() => setView('manual')}
          className="px-4 py-2 bg-primary hover:bg-emerald-700 text-white rounded-lg font-medium flex items-center transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" /> New Manual Log
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto" />
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">No logs found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Generated documents and manual entries will appear here.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">S.No</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Type</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Date & Time</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Key Info</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {logs.map((log, index) => {
                  // Try to extract a name to show as key info
                  const keyInfo = log.data?.name || log.data?.firstparty_name || log.data?.hb_name || Object.values(log.data)[0] || 'N/A';
                  const displayKeyInfo = typeof keyInfo === 'string' ? keyInfo.replace(/__UNDERLINE_START__|__UNDERLINE_END__/g, '') : String(keyInfo);

                  return (
                    <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 text-gray-500 dark:text-gray-400 font-medium">
                        #{logs.length - index}
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900 dark:text-white">{log.type}</div>
                        {log.documentType && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{log.documentType}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="text-gray-900 dark:text-white text-sm">
                          {log.date || new Date(log.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                          {log.time || new Date(log.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                        {displayKeyInfo}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => { setSelectedLog(log); setView('details'); }}
                            className="p-2 text-primary hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(log._id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete Log"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
