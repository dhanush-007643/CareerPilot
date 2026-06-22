import api from './api';

export const adminService = {
  // Analytics
  getAnalytics: async () => {
    const res = await api.get('/analytics');
    return res.data;
  },

  // Freshers
  getFreshers: async () => {
    const res = await api.get('/admin/freshers');
    return res.data;
  },
  blockFresher: async (id) => {
    const res = await api.put(`/admin/freshers/${id}/block`);
    return res.data;
  },
  deleteFresher: async (id) => {
    const res = await api.delete(`/admin/freshers/${id}`);
    return res.data;
  },

  // Companies
  getCompanies: async () => {
    const res = await api.get('/admin/companies');
    return res.data;
  },
  approveCompany: async (id) => {
    const res = await api.put(`/admin/companies/${id}/approve`);
    return res.data;
  },
  rejectCompany: async (id) => {
    const res = await api.put(`/admin/companies/${id}/reject`);
    return res.data;
  },
  blockCompany: async (id) => {
    const res = await api.put(`/admin/companies/${id}/block`);
    return res.data;
  },
  deleteCompany: async (id) => {
    const res = await api.delete(`/admin/companies/${id}`);
    return res.data;
  },

  // Jobs
  getJobs: async () => {
    const res = await api.get('/admin/jobs');
    return res.data;
  },

  // Applications
  getApplications: async () => {
    const res = await api.get('/admin/applications');
    return res.data;
  },
  updateApplicationStatus: async (applicationId, status) => {
    const res = await api.put('/admin/applications/status', { applicationId, status });
    return res.data;
  },

  // Assessments
  getAssessments: async () => {
    const res = await api.get('/admin/assessments');
    return res.data;
  },
  createAssessment: async (data) => {
    const res = await api.post('/admin/assessments', data);
    return res.data;
  },
  deleteAssessment: async (id) => {
    const res = await api.delete(`/admin/assessments/${id}`);
    return res.data;
  },

  // Certificates
  getCertificates: async () => {
    const res = await api.get('/admin/certificates');
    return res.data;
  },

  // Interviews
  getInterviews: async () => {
    const res = await api.get('/admin/interviews');
    return res.data;
  },

  // Reports
  getReports: async () => {
    const res = await api.get('/reports');
    return res.data;
  },
  resolveReport: async (id, status, adminNotes) => {
    const res = await api.put(`/reports/${id}`, { status, adminNotes });
    return res.data;
  },

  // Settings
  getSettings: async () => {
    const res = await api.get('/settings');
    return res.data;
  },
  updateSettings: async (data) => {
    const res = await api.put('/settings', data);
    return res.data;
  }
};
