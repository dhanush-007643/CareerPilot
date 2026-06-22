import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';

const Settings = () => {
  const [settings, setSettings] = useState({
    platformName: '',
    emailSettings: { smtpHost: '', smtpPort: '', smtpUser: '', smtpPass: '' },
    notificationSettings: { enableEmailAlerts: true, enableInAppAlerts: true },
    securitySettings: { requireEmailVerification: false, maxLoginAttempts: 5 },
    assessmentSettings: { defaultPassingScore: 70 }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await adminService.getSettings();
      if (res.success && res.data) {
        setSettings(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e, section) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    if (section) {
      setSettings(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: val
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: val
      }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminService.updateSettings(settings);
      alert('Settings saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-white">System <span className="text-rose-500">Settings</span></h1>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
        
        <div className="space-y-6">
          {/* General */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">General Settings</h3>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Platform Name</label>
              <input 
                type="text" name="platformName" value={settings.platformName} onChange={(e) => handleChange(e)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-300 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Email */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Email Configuration (SMTP)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">SMTP Host</label>
                <input type="text" name="smtpHost" value={settings.emailSettings.smtpHost} onChange={(e) => handleChange(e, 'emailSettings')} className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-300" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">SMTP Port</label>
                <input type="text" name="smtpPort" value={settings.emailSettings.smtpPort} onChange={(e) => handleChange(e, 'emailSettings')} className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-300" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">SMTP User</label>
                <input type="text" name="smtpUser" value={settings.emailSettings.smtpUser} onChange={(e) => handleChange(e, 'emailSettings')} className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-300" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">SMTP Password</label>
                <input type="password" name="smtpPass" value={settings.emailSettings.smtpPass} onChange={(e) => handleChange(e, 'emailSettings')} className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-300" />
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Security Settings</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" name="requireEmailVerification" checked={settings.securitySettings.requireEmailVerification} onChange={(e) => handleChange(e, 'securitySettings')} className="rounded bg-slate-950 border-slate-800" />
                Require Email Verification for new signups
              </label>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Max Login Attempts</label>
                <input type="number" name="maxLoginAttempts" value={settings.securitySettings.maxLoginAttempts} onChange={(e) => handleChange(e, 'securitySettings')} className="w-full md:w-1/3 p-2 bg-slate-950 border border-slate-800 rounded text-slate-300" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
