import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { serviceAPI, categoryAPI, uploadAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const IMAGEKIT_PUBLIC_KEY = 'public_lGKXPbY/UNKPiTMc0R568/6J354=';
const IMAGEKIT_URL_ENDPOINT = 'https://ik.imagekit.io/ufabhqty5';

const ServiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: '', price: '', deliveryTime: '',
    tags: '', requirements: '', images: [], isActive: true,
  });

  useEffect(() => {
    fetchCategories();
    if (isEdit) fetchService();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await categoryAPI.getCategories();
      setCategories(res.data.data.categories);
    } catch (err) { console.error(err); }
  };

  const fetchService = async () => {
    setLoading(true);
    try {
      const res = await serviceAPI.getServiceById(id);
      const s = res.data.data.service;
      setForm({
        title: s.title, description: s.description, category: s.category?._id || '',
        price: s.price, deliveryTime: s.deliveryTime, tags: s.tags?.join(', ') || '',
        requirements: s.requirements || '', images: s.images || [], isActive: s.isActive,
      });
    } catch (err) {
      toast.error('Service not found');
      navigate('/dashboard/services');
    }
    setLoading(false);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validation
    for (const file of files) {
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}. Use JPEG, PNG, WebP, or GIF.`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File too large: ${file.name}. Max 5MB.`);
        return;
      }
    }

    setUploading(true);
    try {
      // Get auth params from backend
      const authRes = await uploadAPI.getAuthParams();
      const { token, expire, signature } = authRes.data.data;

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('publicKey', IMAGEKIT_PUBLIC_KEY);
        formData.append('signature', signature);
        formData.append('expire', expire);
        formData.append('token', token);
        formData.append('fileName', file.name);
        formData.append('folder', '/skilldesk/services');

        const uploadRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await uploadRes.json();

        if (data.url) {
          setForm((prev) => ({
            ...prev,
            images: [...prev.images, { url: data.url, fileId: data.fileId }],
          }));
        }
      }
      toast.success('Image uploaded!');
    } catch (err) {
      toast.error('Upload failed');
    }
    setUploading(false);
  };

  const removeImage = (idx) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category || !form.price || !form.deliveryTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const data = {
        ...form,
        price: Number(form.price),
        deliveryTime: Number(form.deliveryTime),
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      if (isEdit) {
        await serviceAPI.updateService(id, data);
        toast.success('Service updated!');
      } else {
        await serviceAPI.createService(data);
        toast.success('Service created!');
      }
      navigate('/dashboard/services');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save service');
    }
    setSaving(false);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="animate-fade-in max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Edit Service' : 'Create New Service'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="e.g., Professional React Website Development" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field h-32 resize-none" placeholder="Describe your service in detail..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Price ($) *</label>
              <input type="number" min="5" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" placeholder="99" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery (days) *</label>
              <input type="number" min="1" value={form.deliveryTime} onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })} className="input-field" placeholder="7" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags (comma-separated)</label>
            <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input-field" placeholder="react, website, frontend" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Requirements</label>
            <textarea value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} className="input-field h-20 resize-none" placeholder="What do you need from the client?" />
          </div>
        </div>

        {/* Images */}
        <div className="card p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Service Images</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            {form.images.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-gray-700" />
                </button>
              </div>
            ))}
            <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-primary-400 flex flex-col items-center justify-center cursor-pointer transition-colors">
              {uploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
              ) : (
                <>
                  <Upload className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Upload</span>
                </>
              )}
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
          <p className="text-xs text-gray-400">JPEG, PNG, WebP, or GIF. Max 5MB each.</p>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-primary !py-3 px-8">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : isEdit ? 'Update Service' : 'Create Service'}
          </button>
          <button type="button" onClick={() => navigate('/dashboard/services')} className="btn-secondary !py-3">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default ServiceForm;
