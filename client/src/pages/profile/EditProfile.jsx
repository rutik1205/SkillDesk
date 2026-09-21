import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI, uploadAPI } from '../../services/api';
import Avatar from '../../components/common/Avatar';
import { Loader2, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: user.name || '', bio: user.bio || '', location: user.location || '',
    website: user.website || '', professionalTitle: user.professionalTitle || '',
    experience: user.experience || '', skills: user.skills?.join(', ') || '',
    avatar: user.avatar || { url: '', fileId: '' },
  });

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return; }

    setUploading(true);
    try {
      const authRes = await uploadAPI.getAuthParams();
      const { token, expire, signature } = authRes.data.data;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('publicKey', 'public_lGKXPbY/UNKPiTMc0R568/6J354=');
      formData.append('signature', signature);
      formData.append('expire', expire);
      formData.append('token', token);
      formData.append('fileName', `avatar_${user._id}`);
      formData.append('folder', '/skilldesk/avatars');

      const res = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.url) {
        setForm((prev) => ({ ...prev, avatar: { url: data.url, fileId: data.fileId } }));
        toast.success('Avatar uploaded!');
      }
    } catch (err) { toast.error('Upload failed'); }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...form,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      };
      const res = await userAPI.updateProfile(data);
      updateUser(res.data.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
    setSaving(false);
  };

  return (
    <div className="animate-fade-in max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <div className="card p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Profile Picture</label>
          <div className="flex items-center gap-4">
            <Avatar src={form.avatar?.url} name={form.name} size="xl" />
            <div>
              <label className="btn-secondary text-sm cursor-pointer gap-2">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? 'Uploading...' : 'Change Photo'}
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploading} />
              </label>
              <p className="text-xs text-gray-400 mt-1">JPEG, PNG. Max 2MB.</p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Basic Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="input-field h-24 resize-none" placeholder="Tell us about yourself..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-field" placeholder="City, Country" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
              <input type="text" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="input-field" placeholder="https://..." />
            </div>
          </div>
        </div>

        {/* Freelancer-specific */}
        {user.role === 'freelancer' && (
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Professional Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Professional Title</label>
              <input type="text" value={form.professionalTitle} onChange={(e) => setForm({ ...form, professionalTitle: e.target.value })} className="input-field" placeholder="e.g., Senior Full Stack Developer" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Experience</label>
              <input type="text" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} className="input-field" placeholder="e.g., 5+ years" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Skills (comma-separated)</label>
              <input type="text" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} className="input-field" placeholder="React, Node.js, MongoDB" />
            </div>
          </div>
        )}

        <button type="submit" disabled={saving} className="btn-primary !py-3 px-8">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
