import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Set default authorization header whenever token changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // Load user profile on mount if token is present
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      if (token === 'mock_token_12345') {
        try {
          const savedUser = localStorage.getItem('mock_user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          } else {
            setUser({
              _id: 'mock_user_id',
              name: 'John Doe',
              email: 'john@example.com',
              role: 'fresher',
              skills: ['React', 'Node.js']
            });
          }
        } catch (e) {
          setUser({
            _id: 'mock_user_id',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'fresher',
            skills: ['React', 'Node.js']
          });
        }
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
        } else {
          // Token expired or invalid
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Error fetching current user:', err);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        setToken(res.data.token);
        setUser({
          _id: res.data._id,
          name: res.data.name,
          email: res.data.email,
          role: res.data.role,
          skills: res.data.skills,
          location: res.data.location,
          phone: res.data.phone,
          headline: res.data.headline,
          visibility: res.data.visibility || 'public'
        });
        return { success: true, user: res.data };
      }
    } catch (err) {
      // If server is not reachable, do a mock fallback login
      if (!err.response || err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        const isStartup = email.toLowerCase().includes('startup') || email.toLowerCase().includes('recruiter');
        const mockUser = {
          _id: 'mock_user_id',
          name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
          email: email,
          role: isStartup ? 'startup' : 'fresher',
          skills: ['React', 'Node.js', 'Tailwind CSS'],
          visibility: 'public'
        };
        localStorage.setItem('mock_user', JSON.stringify(mockUser));
        setToken('mock_token_12345');
        setUser(mockUser);
        return { success: true, isMock: true, user: mockUser };
      }
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check credentials.'
      };
    }
  };

  // Register handler
  const register = async (name, email, password, role, skills, phone, location, headline, bio, educationDetails, experienceDetails, projects, certificates) => {
    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
        skills,
        personalInfo: { phone, location, headline, bio },
        educationDetails,
        experienceDetails,
        projects,
        certificates
      });
      if (res.data.success) {
        setToken(res.data.token);
        setUser({
          _id: res.data._id,
          name: res.data.name,
          email: res.data.email,
          role: res.data.role,
          skills: res.data.skills,
          location: res.data.location,
          phone: res.data.phone,
          headline: res.data.headline
        });
        return { success: true, user: res.data };
      }
    } catch (err) {
      // If server is not reachable, do a mock fallback register
      if (!err.response || err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        const mockUser = {
          _id: 'mock_user_id',
          name: name,
          email: email,
          role: role || 'fresher',
          skills: skills || [],
          location: location || '',
          phone: phone || '',
          headline: headline || '',
          visibility: 'public'
        };
        localStorage.setItem('mock_user', JSON.stringify(mockUser));
        setToken('mock_token_12345');
        setUser(mockUser);
        return { success: true, isMock: true, user: mockUser };
      }
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed. Try again.'
      };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('mock_user');
    setToken(null);
    setUser(null);
  };

  // Update user context handler
  const updateUser = (updatedFields) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const updated = { ...prevUser, ...updatedFields };
      localStorage.setItem('mock_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
