import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Loader2, Settings as SettingsIcon, AlertCircle } from 'lucide-react';

interface Template {
  _id: string;
  name: string;
  createdAt: string;
}

export default function Settings() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      
      try {
        const res = await fetch('/api/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: file.name.replace('.docx', ''),
            data: base64Data
          })
        });

        if (res.ok) {
          setMessage({ text: 'Template uploaded successfully!', type: 'success' });
          fetchTemplates();
        } else {
          const errorData = await res.json();
          console.error('Upload failed with status:', res.status, errorData);
          setMessage({ text: `Failed to upload template: ${errorData.message || 'Unknown error'}`, type: 'error' });
        }
      } catch (error) {
        console.error('Upload error:', error);
        setMessage({ text: 'Error uploading template. Check console for details.', type: 'error' });
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const confirmDelete = async () => {
    if (!templateToDelete) return;
    
    try {
      const res = await fetch(`/api/templates/${templateToDelete}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setMessage({ text: 'Template deleted successfully!', type: 'success' });
        fetchTemplates();
      } else {
        setMessage({ text: 'Failed to delete template.', type: 'error' });
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessage({ text: 'Error deleting template.', type: 'error' });
    } finally {
      setTemplateToDelete(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 transition-colors relative">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
        <SettingsIcon className="mr-2 text-emerald-600 dark:text-emerald-400" />
        Settings & Template Management
      </h2>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
          {message.text}
        </div>
      )}

      <div className="mb-8 p-4 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800/50">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Upload Template (.docx)</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Upload a Word document to be used as a template.</p>
        <div className="flex items-center">
          <label className="cursor-pointer bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition flex items-center">
            {uploading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Upload className="mr-2 h-5 w-5" />}
            {uploading ? 'Uploading...' : 'Select DOCX File'}
            <input type="file" accept=".docx" className="hidden" onChange={handleFileUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Manage Templates</h3>
        {templates.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No templates uploaded yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-slate-700">
            {templates.map(t => (
              <li key={t._id} className="py-3 flex justify-between items-center">
                <span className="text-gray-800 dark:text-gray-200 font-medium">{t.name}</span>
                <button 
                  onClick={() => setTemplateToDelete(t._id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  title="Delete Template"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {templateToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold">Confirm Deletion</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this template? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setTemplateToDelete(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
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
