import React, { useState, useEffect } from 'react';
import { Upload, FileText, Download, Loader2 } from 'lucide-react';

interface Template {
  _id: string;
  name: string;
  createdAt: string;
}

export default function DocumentGenerator() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    app_no: '',
    husband_name: '',
    husband_father: '',
    husband_address: '',
    wife_name: '',
    wife_father: '',
    wife_address: '',
    divorce_date: '',
    mehar: '',
    condition: '',
    witness1: '',
    witness2: '',
    photo: '[Photo Placeholder]',
    signature: '[Signature Placeholder]',
    registrar_signature: '[Registrar Signature Placeholder]'
  });

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
          alert('Template uploaded successfully!');
          fetchTemplates();
        } else {
          const errorData = await res.json();
          console.error('Upload failed with status:', res.status, errorData);
          alert(`Failed to upload template: ${errorData.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('Error uploading template. Check console for details.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) {
      alert('Please select a template first.');
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch(`/api/templates/${selectedTemplate}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ data: formData })
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const templateName = templates.find(t => t._id === selectedTemplate)?.name || 'document';
        a.download = `${templateName}_filled.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to generate document.');
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Error generating document.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <FileText className="mr-2 text-emerald-600" />
        Document Generator
      </h2>

      {/* Upload Section */}
      <div className="mb-8 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">1. Upload Template (.docx)</h3>
        <p className="text-sm text-gray-600 mb-4">Upload a Word document with placeholders like {'{{husband_name}}'}.</p>
        <div className="flex items-center">
          <label className="cursor-pointer bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition flex items-center">
            {uploading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Upload className="mr-2 h-5 w-5" />}
            {uploading ? 'Uploading...' : 'Select DOCX File'}
            <input type="file" accept=".docx" className="hidden" onChange={handleFileUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      {/* Generate Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">2. Generate Document</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Template</label>
          <select 
            className="w-full p-2 border rounded focus:ring-emerald-500 focus:border-emerald-500"
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
          >
            <option value="">-- Select a template --</option>
            {templates.map(t => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>
        </div>

        {selectedTemplate && (
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Application No</label>
                <input type="text" name="app_no" value={formData.app_no} onChange={handleInputChange} className="w-full p-2 border rounded" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Divorce Date</label>
                <input type="date" name="divorce_date" value={formData.divorce_date} onChange={handleInputChange} className="w-full p-2 border rounded" required />
              </div>
              
              <div className="md:col-span-2 mt-4"><h4 className="font-semibold text-gray-700 border-b pb-1">Husband Details</h4></div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Husband Name</label>
                <input type="text" name="husband_name" value={formData.husband_name} onChange={handleInputChange} className="w-full p-2 border rounded" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Husband Father Name</label>
                <input type="text" name="husband_father" value={formData.husband_father} onChange={handleInputChange} className="w-full p-2 border rounded" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Husband Address</label>
                <textarea name="husband_address" value={formData.husband_address} onChange={handleInputChange} className="w-full p-2 border rounded" rows={2} required />
              </div>

              <div className="md:col-span-2 mt-4"><h4 className="font-semibold text-gray-700 border-b pb-1">Wife Details</h4></div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wife Name</label>
                <input type="text" name="wife_name" value={formData.wife_name} onChange={handleInputChange} className="w-full p-2 border rounded" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wife Father Name</label>
                <input type="text" name="wife_father" value={formData.wife_father} onChange={handleInputChange} className="w-full p-2 border rounded" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Wife Address</label>
                <textarea name="wife_address" value={formData.wife_address} onChange={handleInputChange} className="w-full p-2 border rounded" rows={2} required />
              </div>

              <div className="md:col-span-2 mt-4"><h4 className="font-semibold text-gray-700 border-b pb-1">Other Details</h4></div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mehar Amount</label>
                <input type="text" name="mehar" value={formData.mehar} onChange={handleInputChange} className="w-full p-2 border rounded" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition of Divorce</label>
                <input type="text" name="condition" value={formData.condition} onChange={handleInputChange} className="w-full p-2 border rounded" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Witness Name</label>
                <input type="text" name="witness1" value={formData.witness1} onChange={handleInputChange} className="w-full p-2 border rounded" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Second Witness Name</label>
                <input type="text" name="witness2" value={formData.witness2} onChange={handleInputChange} className="w-full p-2 border rounded" required />
              </div>
            </div>

            <div className="mt-6">
              <button 
                type="submit" 
                disabled={generating}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition flex justify-center items-center font-semibold"
              >
                {generating ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Download className="mr-2 h-5 w-5" />}
                {generating ? 'Generating Document...' : 'Generate & Download DOCX'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
