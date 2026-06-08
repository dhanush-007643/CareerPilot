import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import StartupDashboard from './pages/StartupDashboard';
import FresherDashboard from './pages/FresherDashboard';
import TrainingArena from './pages/TrainingArena';

// Route Guard Component
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div class="min-h-screen flex items-center justify-center bg-darkBg text-textSecondary font-medium">
        Loading context...
      </div>
    );
  }

  // Redirect to login if unauthenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to their default dashboard if role is unauthorized for this route
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'startup' ? '/startup-dashboard' : '/fresher-dashboard'} replace />;
  }

  return children;
};

// Root route redirect logic
const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div class="min-h-screen flex items-center justify-center bg-darkBg text-textSecondary font-medium">
        Loading context...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === 'startup' ? '/startup-dashboard' : '/fresher-dashboard'} replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div class="min-h-screen bg-darkBg flex flex-col font-sans">
          
          {/* Header Navigation */}
          <Navbar />
          
          {/* Page Contents */}
          <main class="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Private Startup Routes */}
              <Route
                path="/startup-dashboard"
                element={
                  <PrivateRoute allowedRoles={['startup']}>
                    <StartupDashboard />
                  </PrivateRoute>
                }
              />

              {/* Private Fresher Routes */}
              <Route
                path="/fresher-dashboard"
                element={
                  <PrivateRoute allowedRoles={['fresher']}>
                    <FresherDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/training-arena"
                element={
                  <PrivateRoute allowedRoles={['fresher']}>
                    <TrainingArena />
                  </PrivateRoute>
                }
              />

              {/* Default Fallback Redirect */}
              <Route path="/" element={<HomeRedirect />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          {/* Premium Ambient Light Effect */}
          <footer class="py-6 border-t border-white/5 text-center text-xs text-textSecondary bg-darkCard/40">
            <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between px-6 gap-2">
              <p>© 2026 CareerPilot. Connecting Fresher Talents with Disruptive Startups.</p>
              <div class="flex space-x-4">
                <a href="#" class="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" class="hover:text-white transition-colors">Terms of Service</a>
              </div>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
