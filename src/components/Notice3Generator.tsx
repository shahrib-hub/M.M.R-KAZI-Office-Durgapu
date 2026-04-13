import React, { useState, useEffect } from 'react';
import { FileText, Download, Loader2, AlertCircle } from 'lucide-react';
import FormField from './FormField';

interface Template {
  _id: string;
  name: string;
  createdAt: string;
}

export default function Notice3Generator() {
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    policestation: '',
    district: '',
    firstparty_name: '',
    firstparty_fname: '',
    firstparty_address: '',
    secondparty_name: '',
    secondparty_fname: '',
    secondparty_address: '',
    date: '',
    name: '',
    talak1_date: '',
    talak2_date: '',
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
          t.name === 'kazi_m_d_notice_3' || t.name === 'kazi_m_d_notice_3.docx'
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
        talak1_date: formatDate(formData.talak1_date),
        talak2_date: formatDate(formData.talak2_date)
      };

      for (const key in payloadData) {
        if (typeof payloadData[key] === 'string' && !payloadData[key].startsWith('data:image')) {
          let val = payloadData[key].trim();
          // Remove accidental newlines from single-line fields
          if (!key.includes('address') && !key.includes('condition')) {
            val = val.replace(/[\r\n]+/g, ' ');
          }
          if (underlines[key]) {
            val = applyUnderline(val);
          }
          payloadData[key] = val;
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
        a.download = `Notice_3_Generated.docx`;
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
            The required template "kazi_m_d_notice_3.docx" is not uploaded to the server. Please go to Settings and upload this template to enable Notice 3 generation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <FileText className="mr-2 text-emerald-600" />
          Notice 3 Generator
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Fill in the details below to generate Notice 3.
        </p>
      </div>

      <div className="p-6">
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Police Station"
              name="policestation"
              value={formData.policestation}
              onChange={handleInputChange}
              underlined={underlines['policestation']}
              onToggleUnderline={() => toggleUnderline('policestation')}
              required
            />
            <FormField
              label="District"
              name="district"
              value={formData.district}
              onChange={handleInputChange}
              underlined={underlines['district']}
              onToggleUnderline={() => toggleUnderline('district')}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* First Party */}
            <div className="space-y-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white border-b pb-2">First Party</h3>
              <FormField
                label="Name"
                name="firstparty_name"
                value={formData.firstparty_name}
                onChange={handleInputChange}
                underlined={underlines['firstparty_name']}
                onToggleUnderline={() => toggleUnderline('firstparty_name')}
                required
              />
              <FormField
                label="Father's Name"
                name="firstparty_fname"
                value={formData.firstparty_fname}
                onChange={handleInputChange}
                underlined={underlines['firstparty_fname']}
                onToggleUnderline={() => toggleUnderline('firstparty_fname')}
                required
              />
              <FormField
                label="Address"
                name="firstparty_address"
                value={formData.firstparty_address}
                onChange={handleInputChange}
                underlined={underlines['firstparty_address']}
                onToggleUnderline={() => toggleUnderline('firstparty_address')}
                type="textarea"
                required
              />
            </div>

            {/* Second Party */}
            <div className="space-y-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white border-b pb-2">Second Party</h3>
              <FormField
                label="Name"
                name="secondparty_name"
                value={formData.secondparty_name}
                onChange={handleInputChange}
                underlined={underlines['secondparty_name']}
                onToggleUnderline={() => toggleUnderline('secondparty_name')}
                required
              />
              <FormField
                label="Father's Name"
                name="secondparty_fname"
                value={formData.secondparty_fname}
                onChange={handleInputChange}
                underlined={underlines['secondparty_fname']}
                onToggleUnderline={() => toggleUnderline('secondparty_fname')}
                required
              />
              <FormField
                label="Address"
                name="secondparty_address"
                value={formData.secondparty_address}
                onChange={handleInputChange}
                underlined={underlines['secondparty_address']}
                onToggleUnderline={() => toggleUnderline('secondparty_address')}
                type="textarea"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <FormField
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
              underlined={underlines['date']}
              onToggleUnderline={() => toggleUnderline('date')}
              required
            />
            <FormField
              label="Name (for body text)"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              underlined={underlines['name']}
              onToggleUnderline={() => toggleUnderline('name')}
              required
            />
            <FormField
              label="Talak 1 Date"
              name="talak1_date"
              type="date"
              value={formData.talak1_date}
              onChange={handleInputChange}
              underlined={underlines['talak1_date']}
              onToggleUnderline={() => toggleUnderline('talak1_date')}
              required
            />
            <FormField
              label="Talak 2 Date"
              name="talak2_date"
              type="date"
              value={formData.talak2_date}
              onChange={handleInputChange}
              underlined={underlines['talak2_date']}
              onToggleUnderline={() => toggleUnderline('talak2_date')}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Photo (Max 300x300)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'photo')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {formData.photo && (
                <div className="mt-2">
                  <img src={formData.photo} alt="Preview" className="h-24 object-contain rounded border border-gray-200 dark:border-gray-600" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Signature (Max 350x120)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'signature')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {formData.signature && (
                <div className="mt-2">
                  <img src={formData.signature} alt="Signature Preview" className="h-16 object-contain rounded border border-gray-200 dark:border-gray-600" />
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={generating}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg flex items-center transition-colors disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Generate Notice 3
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
