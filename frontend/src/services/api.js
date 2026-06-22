/**
 * CareerPilot – Centralized API Service Layer
 * ============================================
 * All HTTP calls go through this configured Axios instance so that:
 *  1. The JWT token is automatically attached to every request.
 *  2. 401 responses are handled globally (redirect to /auth).
 *  3. Error messages are normalised across the app.
 *
 * The Vite dev-server proxies /api → http://localhost:5000, so baseURL
 * stays as '/api' and no CORS issues arise during local development.
 */

import axios from 'axios';

// ─── Create instance ────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15-second timeout
});

// ─── Request interceptor – attach JWT ────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Read token fresh from localStorage on every request (never stale)
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor – global error handling ────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('mock_user');
        // Only redirect if not already on the auth page
        if (!window.location.pathname.includes('/auth')) {
          const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/auth?returnUrl=${returnUrl}`;
        }
      }

      // Normalise error message so callers can always do err.message
      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        `Request failed with status ${status}`;
      error.message = message;
    } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      error.message = 'Network error – check your connection or server status.';
    }
    return Promise.reject(error);
  }
);

// ─── Convenience helpers ─────────────────────────────────────────────────────

/** Fetch all active jobs with optional filter query params */
export const fetchJobs = (params = {}) => api.get('/jobs', { params });

/** Fetch a single job by ID – uses the jobs list endpoint + client filter */
export const fetchJob = async (jobId) => {
  const res = await api.get('/jobs');
  const job = (res.data.data || []).find((j) => j._id === jobId);
  return job || null;
};

/** Fetch private jobs the current fresher has been invited to */
export const fetchMyInvitations = () => api.get('/jobs/my-invitations');

/** Invite a candidate to a private job (startup only) */
export const inviteCandidateToJob = (payload) => api.post('/jobs/invite', payload);

/** Submit a job application (fresher only) */
export const applyForJob = (payload) => api.post('/applications/apply', payload);

/** Get all applications for a specific job (startup only) */
export const fetchApplicantsForJob = (jobId) => api.get(`/applications/job/${jobId}`);

/** Get all candidates across all company jobs (company only) */
export const fetchCompanyCandidates = () => api.get('/company/candidates');

/** Update an application's Kanban status (startup only) */
export const updateApplicationStatus = (applicationId, status) =>
  api.put('/applications/status', { applicationId, status });

/** Get the current fresher's own applications */
export const fetchMyApplications = () => api.get('/applications/my');

/** Schedule an interview for an application (startup only) */
export const scheduleInterview = (applicationId, payload) =>
  api.post(`/applications/${applicationId}/schedule`, payload);

/** Auth: get current logged-in user */
export const fetchMe = () => api.get('/auth/me');

/** Auth: login */
export const login = (email, password) =>
  api.post('/auth/login', { email, password });

/** Auth: register */
export const register = (payload) => api.post('/auth/register', payload);

/** Demo Seeding */
export const seedDatabase = () => api.post('/seed');



// ─── Notification API helpers ────────────────────────────────────────────────

/** Fetch notifications for authenticated user */
export const fetchNotifications = () => api.get('/notifications');

/** Mark a single notification as read */
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);

/** Mark all notifications as read */
export const markAllNotificationsRead = () => api.put('/notifications/read-all');

// ─── Messaging API helpers ───────────────────────────────────────────────────

/** Fetch list of users the current user has conversations with */
export const fetchConversationsList = () => api.get('/messages/conversations/list');

/** Fetch conversation between current user and another user */
export const fetchConversation = (otherUserId) => api.get(`/messages/${otherUserId}`);

/** Send a message to another user */
export const sendMessage = (payload) => api.post('/messages', payload);

// ─── Interview API helpers ───────────────────────────────────────────────────
export const createInterview = (payload) => api.post('/interviews/create', payload);
export const fetchInterviews = () => api.get('/interviews');
export const updateInterviewStatus = (id, status) => api.put(`/interviews/${id}/update`, { status });

export default api;
