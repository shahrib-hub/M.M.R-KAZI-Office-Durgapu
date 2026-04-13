import React, { useState, useEffect } from 'react';
import { FileText, Download, Loader2, AlertCircle } from 'lucide-react';
import FormField from './FormField';

interface Template {
  _id: string;
  name: string;
  createdAt: string;
}

export default function DivorceCertificateGenerator() {
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    app_no: '',
    hb_name: '',
    hbfather_name: '',
    hb_dob: '',
    hb_address: '',
    wf_name: '',
    wffather_name: '',
    wf_dob: '',
    wf_address: '',
    dv_date: '',
    mehar_rupees_number: '',
    mehar_rupees_word: '',
    condition_of_divorce: '',
    hb_idf_name: '',
    hb_idf_fathername: '',
    hb_idf_address: '',
    witness1_name: '',
    witness1_fname: '',
    witness1_address: '',
    witness2_name: '',
    witness2_fname: '',
    witness2_address: '',
    dv_reg_date: '',
    sr_no: '',
    vol_no: '',
    pg_no: '',
    date: '',
    photo: ''
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
        const divTemplate = data.templates.find((t: Template) => 
          t.name === 'kazi_m_d_div_certificate' || t.name === 'kazi_m_d_div_certificate.docx'
        );
        if (divTemplate) {
          setTemplateId(divTemplate._id);
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
        hb_dob: formatDate(formData.hb_dob),
        wf_dob: formatDate(formData.wf_dob),
        dv_date: formatDate(formData.dv_date),
        dv_reg_date: formatDate(formData.dv_reg_date),
        date: formatDate(formData.date)
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
        a.download = `Divorce_Certificate_Generated.docx`;
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
            The required template "kazi_m_d_div_certificate.docx" is not uploaded to the server. Please go to Settings and upload this template to enable Divorce Certificate generation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 transition-colors">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
        <FileText className="mr-2 text-emerald-600 dark:text-emerald-400" />
        Generate Divorce Certificate
      </h2>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleGenerate} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="App. No." name="app_no" value={formData.app_no} onChange={handleInputChange} isUnderlined={underlines.app_no} onToggleUnderline={toggleUnderline} className="md:col-span-2" />
          
          <div className="md:col-span-2 mt-4"><h4 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-1">Husband Details</h4></div>
          <FormField label="Name" name="hb_name" value={formData.hb_name} onChange={handleInputChange} isUnderlined={underlines.hb_name} onToggleUnderline={toggleUnderline} />
          <FormField label="Father's Name" name="hbfather_name" value={formData.hbfather_name} onChange={handleInputChange} isUnderlined={underlines.hbfather_name} onToggleUnderline={toggleUnderline} />
          <FormField label="Date of Birth" name="hb_dob" type="date" value={formData.hb_dob} onChange={handleInputChange} isUnderlined={underlines.hb_dob} onToggleUnderline={toggleUnderline} />
          <FormField label="Resident of" name="hb_address" value={formData.hb_address} onChange={handleInputChange} isUnderlined={underlines.hb_address} onToggleUnderline={toggleUnderline} isTextArea />

          <div className="md:col-span-2 mt-4"><h4 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-1">Wife Details</h4></div>
          <FormField label="Name" name="wf_name" value={formData.wf_name} onChange={handleInputChange} isUnderlined={underlines.wf_name} onToggleUnderline={toggleUnderline} />
          <FormField label="Father's Name" name="wffather_name" value={formData.wffather_name} onChange={handleInputChange} isUnderlined={underlines.wffather_name} onToggleUnderline={toggleUnderline} />
          <FormField label="Date of Birth" name="wf_dob" type="date" value={formData.wf_dob} onChange={handleInputChange} isUnderlined={underlines.wf_dob} onToggleUnderline={toggleUnderline} />
          <FormField label="Resident of" name="wf_address" value={formData.wf_address} onChange={handleInputChange} isUnderlined={underlines.wf_address} onToggleUnderline={toggleUnderline} isTextArea />

          <div className="md:col-span-2 mt-4"><h4 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-1">Divorce Details</h4></div>
          <FormField label="Divorce Date" name="dv_date" type="date" value={formData.dv_date} onChange={handleInputChange} isUnderlined={underlines.dv_date} onToggleUnderline={toggleUnderline} />
          <FormField label="Amt. of Mehar (Number)" name="mehar_rupees_number" value={formData.mehar_rupees_number} onChange={handleInputChange} isUnderlined={underlines.mehar_rupees_number} onToggleUnderline={toggleUnderline} />
          <FormField label="Amt. of Mehar (Words)" name="mehar_rupees_word" value={formData.mehar_rupees_word} onChange={handleInputChange} isUnderlined={underlines.mehar_rupees_word} onToggleUnderline={toggleUnderline} className="md:col-span-2" />
          <FormField label="Condition of Divorce" name="condition_of_divorce" value={formData.condition_of_divorce} onChange={handleInputChange} isUnderlined={underlines.condition_of_divorce} onToggleUnderline={toggleUnderline} isTextArea rows={3} />

          <div className="md:col-span-2 mt-4"><h4 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-1">Husband Identifier</h4></div>
          <FormField label="Name" name="hb_idf_name" value={formData.hb_idf_name} onChange={handleInputChange} isUnderlined={underlines.hb_idf_name} onToggleUnderline={toggleUnderline} />
          <FormField label="Father's Name" name="hb_idf_fathername" value={formData.hb_idf_fathername} onChange={handleInputChange} isUnderlined={underlines.hb_idf_fathername} onToggleUnderline={toggleUnderline} />
          <FormField label="Resident of" name="hb_idf_address" value={formData.hb_idf_address} onChange={handleInputChange} isUnderlined={underlines.hb_idf_address} onToggleUnderline={toggleUnderline} isTextArea />

          <div className="md:col-span-2 mt-4"><h4 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-1">First Witness</h4></div>
          <FormField label="Name" name="witness1_name" value={formData.witness1_name} onChange={handleInputChange} isUnderlined={underlines.witness1_name} onToggleUnderline={toggleUnderline} />
          <FormField label="Father's Name" name="witness1_fname" value={formData.witness1_fname} onChange={handleInputChange} isUnderlined={underlines.witness1_fname} onToggleUnderline={toggleUnderline} />
          <FormField label="Resident of" name="witness1_address" value={formData.witness1_address} onChange={handleInputChange} isUnderlined={underlines.witness1_address} onToggleUnderline={toggleUnderline} isTextArea />

          <div className="md:col-span-2 mt-4"><h4 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-1">Second Witness</h4></div>
          <FormField label="Name" name="witness2_name" value={formData.witness2_name} onChange={handleInputChange} isUnderlined={underlines.witness2_name} onToggleUnderline={toggleUnderline} />
          <FormField label="Father's Name" name="witness2_fname" value={formData.witness2_fname} onChange={handleInputChange} isUnderlined={underlines.witness2_fname} onToggleUnderline={toggleUnderline} />
          <FormField label="Resident of" name="witness2_address" value={formData.witness2_address} onChange={handleInputChange} isUnderlined={underlines.witness2_address} onToggleUnderline={toggleUnderline} isTextArea />

          <div className="md:col-span-2 mt-4"><h4 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-1">Registration Details</h4></div>
          <FormField label="Divorce Registration Date" name="dv_reg_date" type="date" value={formData.dv_reg_date} onChange={handleInputChange} isUnderlined={underlines.dv_reg_date} onToggleUnderline={toggleUnderline} />
          <FormField label="Serial No." name="sr_no" value={formData.sr_no} onChange={handleInputChange} isUnderlined={underlines.sr_no} onToggleUnderline={toggleUnderline} />
          <FormField label="Volume No." name="vol_no" value={formData.vol_no} onChange={handleInputChange} isUnderlined={underlines.vol_no} onToggleUnderline={toggleUnderline} />
          <FormField label="Page No." name="pg_no" value={formData.pg_no} onChange={handleInputChange} isUnderlined={underlines.pg_no} onToggleUnderline={toggleUnderline} />
          <FormField label="Date (Bottom Right)" name="date" type="date" value={formData.date} onChange={handleInputChange} isUnderlined={underlines.date} onToggleUnderline={toggleUnderline} />

          <div className="md:col-span-2 mt-4"><h4 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-1">Images</h4></div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Photo (Max 300x300)</label>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'photo')} className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-white" required />
            {formData.photo && <span className="text-xs text-emerald-600 mt-1 block">Photo uploaded</span>}
          </div>
        </div>

        <div className="mt-6">
          <button 
            type="submit" 
            disabled={generating}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition flex justify-center items-center font-semibold"
          >
            {generating ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Download className="mr-2 h-5 w-5" />}
            {generating ? 'Generating Divorce Certificate...' : 'Generate & Download DOCX'}
          </button>
        </div>
      </form>
    </div>
  );
}
