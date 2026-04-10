import React, { useState, useEffect } from 'react';
import { FileText, Download, Loader2, AlertCircle } from 'lucide-react';
import FormField from './FormField';

interface Template {
  _id: string;
  name: string;
  createdAt: string;
}

export default function Notice2Generator() {
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    police_station: '',
    district: '',
    firstparty_name: '',
    firstparty_father_name: '',
    firstparty_address: '',
    secondparty_name: '',
    secondparty_father_name: '',
    secondparty_address: '',
    date: '',
    name: '',
    date1: '',
    date2: '',
    photo: '',
    signature: ''
  });

  const [underlines, setUnderlines] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const toggleUnderline = (name: string) => {
    setUnderlines(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const applyUnderline = (text: string) => {
    if (!text) return text;
    return `__UNDERLINE_START__${text}__UNDERLINE_END__`;
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const noticeTemplate = data.templates.find((t: Template) => 
          t.name === 'kazi_m_d_notice_2' || t.name === 'kazi_m_d_notice_2.docx'
        );
        if (noticeTemplate) {
          setTemplateId(noticeTemplate._id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Compress large images to prevent Vercel 4.5MB payload limit errors
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round(height * (MAX_WIDTH / width));
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round(width * (MAX_HEIGHT / height));
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Fill white background in case of transparent PNGs being converted to JPEG
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
        }
        
        // Compress to JPEG with 0.7 quality to drastically reduce base64 string size
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setFormData({ ...formData, [fieldName]: compressedBase64 });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateId) {
      setMessage({ text: 'Template not found.', type: 'error' });
      return;
    }

    setGenerating(true);
    setMessage(null);
    try {
      const payloadData: Record<string, any> = {
        ...formData,
        date: formatDate(formData.date),
        date1: formatDate(formData.date1),
        date2: formatDate(formData.date2)
      };

      for (const key in payloadData) {
        if (underlines[key] && typeof payloadData[key] === 'string' && !payloadData[key].startsWith('data:image')) {
          payloadData[key] = applyUnderline(payloadData[key]);
        }
      }

      const res = await fetch(`/api/templates/${templateId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ data: payloadData })
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Notice_2_Generated.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setMessage({ text: 'Document generated successfully!', type: 'success' });
      } else {
        setMessage({ text: 'Failed to generate document.', type: 'error' });
      }
    } catch (error) {
      console.error('Generation error:', error);
      setMessage({ text: 'Error generating document.', type: 'error' });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center"><Loader2 className="animate-spin mx-auto h-8 w-8 text-emerald-600" /></div>;
  }

  if (!templateId) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 flex items-start">
        <AlertCircle className="text-red-500 w-6 h-6 mr-3 mt-0.5" />
        <div>
          <h3 className="text-red-800 dark:text-red-400 font-bold text-lg">Template Not Found</h3>
          <p className="text-red-600 dark:text-red-300 mt-1">
            The required template "kazi_m_d_notice_2.docx" is not uploaded to the server. Please go to Settings and upload this template to enable Notice 2 generation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 transition-colors">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
        <FileText className="mr-2 text-emerald-600 dark:text-emerald-400" />
        Generate Notice 2
      </h2>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleGenerate} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Police Station" name="police_station" value={formData.police_station} onChange={handleInputChange} isUnderlined={underlines.police_station} onToggleUnderline={toggleUnderline} />
          <FormField label="District" name="district" value={formData.district} onChange={handleInputChange} isUnderlined={underlines.district} onToggleUnderline={toggleUnderline} />
          
          <div className="md:col-span-2 mt-4"><h4 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-1">First Party Details</h4></div>
          <FormField label="Name" name="firstparty_name" value={formData.firstparty_name} onChange={handleInputChange} isUnderlined={underlines.firstparty_name} onToggleUnderline={toggleUnderline} />
          <FormField label="Father's Name" name="firstparty_father_name" value={formData.firstparty_father_name} onChange={handleInputChange} isUnderlined={underlines.firstparty_father_name} onToggleUnderline={toggleUnderline} />
          <FormField label="Address" name="firstparty_address" value={formData.firstparty_address} onChange={handleInputChange} isUnderlined={underlines.firstparty_address} onToggleUnderline={toggleUnderline} isTextArea />

          <div className="md:col-span-2 mt-4"><h4 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-1">Second Party Details</h4></div>
          <FormField label="Name" name="secondparty_name" value={formData.secondparty_name} onChange={handleInputChange} isUnderlined={underlines.secondparty_name} onToggleUnderline={toggleUnderline} />
          <FormField label="Father's Name" name="secondparty_father_name" value={formData.secondparty_father_name} onChange={handleInputChange} isUnderlined={underlines.secondparty_father_name} onToggleUnderline={toggleUnderline} />
          <FormField label="Address" name="secondparty_address" value={formData.secondparty_address} onChange={handleInputChange} isUnderlined={underlines.secondparty_address} onToggleUnderline={toggleUnderline} isTextArea />

          <div className="md:col-span-2 mt-4"><h4 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-1">Other Details</h4></div>
          <FormField label="Date of Notice" name="date" type="date" value={formData.date} onChange={handleInputChange} isUnderlined={underlines.date} onToggleUnderline={toggleUnderline} />
          <FormField label="Husband's Name" name="name" value={formData.name} onChange={handleInputChange} isUnderlined={underlines.name} onToggleUnderline={toggleUnderline} />
          <FormField label="Date of Application (date1)" name="date1" type="date" value={formData.date1} onChange={handleInputChange} isUnderlined={underlines.date1} onToggleUnderline={toggleUnderline} />
          <FormField label="Date of 1st Talaque Notice (date2)" name="date2" type="date" value={formData.date2} onChange={handleInputChange} isUnderlined={underlines.date2} onToggleUnderline={toggleUnderline} />

          <div className="md:col-span-2 mt-4"><h4 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-1">Images</h4></div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Photo (Max 300x300)</label>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'photo')} className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-white" required />
            {formData.photo && <span className="text-xs text-emerald-600 mt-1 block">Photo uploaded</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Signature (Max 350x120)</label>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'signature')} className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-white" required />
            {formData.signature && <span className="text-xs text-emerald-600 mt-1 block">Signature uploaded</span>}
          </div>
        </div>

        <div className="mt-6">
          <button 
            type="submit" 
            disabled={generating}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition flex justify-center items-center font-semibold"
          >
            {generating ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Download className="mr-2 h-5 w-5" />}
            {generating ? 'Generating Notice 2...' : 'Generate & Download DOCX'}
          </button>
        </div>
      </form>
    </div>
  );
}
