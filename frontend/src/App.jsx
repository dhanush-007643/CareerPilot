import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';

// Page Imports
import LandingPage from './pages/LandingPage';
import AuthPortal from './pages/AuthPortal';
import FresherDashboard from './pages/FresherDashboard';
import FresherJobBoard from './pages/FresherJobBoard';
import TrainingArena from './pages/TrainingArena';
import ApplicationTracker from './pages/ApplicationTracker';
import StartupDashboard from './pages/StartupDashboard';
import CompanyRegistration from './pages/CompanyRegistration';
import CompanyProfile from './pages/CompanyProfile';
import TeamManagement from './pages/TeamManagement';
import JobCreator from './pages/JobCreator';
import CandidatePipeline from './pages/CandidatePipeline';
import ProfilePage from './pages/ProfilePage';
import ResumeManagement from './pages/ResumeManagement';
import JobDetails from './pages/JobDetails';
import ApplyJob from './pages/ApplyJob';
import InviteHandler from './pages/InviteHandler';
import StartupInterviews from './pages/StartupInterviews';
import FresherFeedback from './pages/Feedback';
import MyTickets from './pages/MyTickets';
import ChatSupport from './pages/ChatSupport';
import CompanyFeedback from './pages/CompanyFeedback';
import CompanyTickets from './pages/CompanyTickets';
import CompanyChat from './pages/CompanyChat';

// Networking Page Imports
import CompanyDirectory from './pages/CompanyDirectory';
import FollowedCompanies from './pages/FollowedCompanies';
import CompanyDetails from './pages/CompanyDetails';
import CandidateDirectory from './pages/CandidateDirectory';
import CandidateDetails from './pages/CandidateDetails';
import SavedCandidates from './pages/SavedCandidates';
import Messaging from './pages/Messaging';
import Notifications from './pages/Notifications';
import Invitations from './pages/Invitations';

// Home redirect component based on mock session token presence and user role
const HomeRedirect = () => {
  const hasToken = localStorage.getItem('token');
  if (hasToken) {
    const savedUser = localStorage.getItem('mock_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.role === 'startup') {
          return <Navigate to="/startup/dashboard" replace />;
        }
      } catch (e) {}
    }
    return <Navigate to="/fresher/dashboard" replace />;
  }
  return <LandingPage />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-blue-500/30 selection:text-blue-900">
          {/* Dynamic Navigation Header */}
          <Navbar />
          
          {/* Page Contents */}
          <main className="flex-grow relative">
            <Routes>
              {/* Zone 1: Public Gateway Routes */}
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/auth" element={<AuthPortal />} />
              <Route path="/invite/:inviteCode" element={<InviteHandler />} />

              {/* Zone 2: Fresher Portal Routes */}
              <Route path="/fresher/dashboard" element={<FresherDashboard />} />
              <Route path="/fresher/jobs" element={<FresherJobBoard />} />
              <Route path="/fresher/arena" element={<TrainingArena />} />
              <Route path="/fresher/tracker" element={<ApplicationTracker />} />
              <Route path="/fresher/profile" element={<ProfilePage />} />
              <Route path="/fresher/resume" element={<ResumeManagement />} />
              <Route path="/fresher/jobs/:id" element={<JobDetails />} />
              <Route path="/fresher/jobs/:id/apply" element={<ApplyJob />} />
              <Route path="/fresher/feedback" element={<FresherFeedback />} />
              <Route path="/fresher/tickets" element={<MyTickets />} />
              <Route path="/fresher/support-chat" element={<ChatSupport />} />
              
              {/* Networking Routes */}
              <Route path="/companies" element={<CompanyDirectory />} />
              <Route path="/followed-companies" element={<FollowedCompanies />} />
              <Route path="/companies/:id" element={<CompanyDetails />} />
              <Route path="/candidates" element={<CandidateDirectory />} />
              <Route path="/candidates/:id" element={<CandidateDetails />} />
              <Route path="/messages" element={<Messaging />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/invitations" element={<Invitations />} />

              {/* Zone 3: Startup Command Center Routes */}
              <Route path="/startup/dashboard" element={<StartupDashboard />} />
              <Route path="/startup/onboarding" element={<CompanyRegistration />} />
              <Route path="/startup/post-job" element={<JobCreator />} />
              <Route path="/startup/pipeline" element={<CandidatePipeline />} />
              <Route path="/startup/profile" element={<CompanyProfile />} />
              <Route path="/startup/team" element={<TeamManagement />} />
              <Route path="/startup/saved-candidates" element={<SavedCandidates />} />
              <Route path="/startup/feedback" element={<CompanyFeedback />} />
              <Route path="/startup/tickets" element={<CompanyTickets />} />
              <Route path="/startup/support-chat" element={<CompanyChat />} />
              <Route path="/startup/interviews" element={<StartupInterviews />} />

              {/* Fallback Redirects */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          {/* Footer */}
          <footer className="py-8 bg-[#0B1120] border-t border-slate-800 text-center text-xs text-slate-500 mt-auto relative z-50">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between px-6 gap-2">
              <p>© 2026 CareerPilot. Connecting Fresher Talents with Disruptive Startups.</p>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-cyan-400 font-bold transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-cyan-400 font-bold transition-colors">Terms of Service</a>
              </div>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
