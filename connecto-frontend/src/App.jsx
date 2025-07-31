import React, { useState, createContext, useContext, useEffect, useRef } from 'react';

// Enhanced Mock API service with advanced features
const api = {
  signup: async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      userId: 'user_' + Date.now(),
      email: userData.email,
      message: 'OTP sent to your email'
    };
  },
  
  verifyOTP: async (userId, otp) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (otp.length === 6) {
      return {
        success: true,
        message: 'Account verified successfully'
      };
    } else {
      return {
        success: false,
        message: 'Invalid OTP. Please try again.'
      };
    }
  },
  
  login: async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock different user roles
    const isAdmin = email.includes('admin');
    const isPremium = email.includes('premium');
    
    return {
      success: true,
      token: 'mock_jwt_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
      user: {
        id: 'user_123',
        name: email.split('@')[0],
        email: email,
        isVerified: true,
        role: isAdmin ? 'admin' : isPremium ? 'premium' : 'user',
        avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(email.split('@')[0]) + '&background=7c3aed&color=fff'
      },
      expiresIn: '15m' // Mock token expiry
    };
  },

  // New API endpoints for Phase 4
  refreshToken: async (refreshToken) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      token: 'new_mock_jwt_token_' + Date.now(),
      expiresIn: '15m'
    };
  },

  verifyToken: async (token) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      user: {
        id: 'user_123',
        name: 'Wareesha Ashraf',
        email: 'wareesha@example.com',
        role: 'user',
        isVerified: true
      }
    };
  },

  getUserProfile: async (token) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      success: true,
      user: {
        id: 'user_123',
        name: 'Wareesha Ashraf',
        email: 'wareesha@example.com',
        role: 'user',
        isVerified: true,
        joinedDate: '2024-01-15',
        lastLogin: new Date().toISOString(),
        settings: {
          notifications: true,
          twoFactor: false,
          darkMode: true
        }
      }
    };
  },

  updateProfile: async (token, profileData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      message: 'Profile updated successfully',
      user: {
        ...profileData,
        id: 'user_123',
        lastUpdated: new Date().toISOString()
      }
    };
  },

  // Mock posts API for social features
  getPosts: async (token) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      success: true,
      posts: [
        {
          id: 1,
          author: 'Wareesha Ashraf',
          content: 'Just implemented Phase 4 of the auth system! 🚀',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          likes: 12,
          comments: 3
        },
        {
          id: 2,
          author: 'wareeshayy',
          content: 'Protected routes are working perfectly!',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          likes: 8,
          comments: 1
        }
      ]
    };
  }
};

// Enhanced Auth Context with advanced features
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [tokenExpiry, setTokenExpiry] = useState(null);

  // Auto-refresh token timer
  const refreshTimerRef = useRef(null);

  useEffect(() => {
    // Initialize auth state from memory (in real app, this would be localStorage)
    const initializeAuth = async () => {
      try {
        // Simulate checking stored auth data
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Set up automatic token refresh
  useEffect(() => {
    if (token && tokenExpiry) {
      const timeUntilExpiry = new Date(tokenExpiry).getTime() - Date.now();
      const refreshTime = Math.max(timeUntilExpiry - 60000, 5000); // Refresh 1 minute before expiry

      refreshTimerRef.current = setTimeout(() => {
        handleTokenRefresh();
      }, refreshTime);
    }

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [token, tokenExpiry]);

  const handleTokenRefresh = async () => {
    try {
      if (refreshToken) {
        const result = await api.refreshToken(refreshToken);
        if (result.success) {
          setToken(result.token);
          const newExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
          setTokenExpiry(newExpiry);
        }
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  const signup = async (userData) => {
    try {
      const result = await api.signup(userData);
      return result;
    } catch (error) {
      throw new Error('Network error. Please try again.');
    }
  };

  const verifyOTP = async (userId, otp) => {
    try {
      const result = await api.verifyOTP(userId, otp);
      return result;
    } catch (error) {
      throw new Error('Network error. Please try again.');
    }
  };

  const login = async (email, password) => {
    try {
      const result = await api.login(email, password);
      
      if (result.success) {
        setUser(result.user);
        setToken(result.token);
        setRefreshToken(result.refreshToken);
        setIsAuthenticated(true);
        
        // Set token expiry
        const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        setTokenExpiry(expiry);
      }
      
      return result;
    } catch (error) {
      throw new Error('Network error. Please try again.');
    }
  };

  const loginWithGoogle = (credentialResponse) => {
    try {
      const userData = {
        id: 'google_user_123',
        name: 'Google User',
        email: 'user@gmail.com',
        picture: 'https://ui-avatars.com/api/?name=Google+User&background=7c3aed&color=fff',
        role: 'user',
        isVerified: true
      };

      setUser(userData);
      setToken('mock_google_token_' + Date.now());
      setRefreshToken('mock_google_refresh_' + Date.now());
      setIsAuthenticated(true);
      
      const expiry = new Date(Date.now() + 15 * 60 * 1000);
      setTokenExpiry(expiry);
    } catch (error) {
      console.error('Error handling Google login:', error);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    setTokenExpiry(null);
    setIsAuthenticated(false);
    
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
  };

  // Enhanced auth methods for Phase 4
  const updateProfile = async (profileData) => {
    try {
      const result = await api.updateProfile(token, profileData);
      if (result.success) {
        setUser(prev => ({ ...prev, ...result.user }));
      }
      return result;
    } catch (error) {
      throw new Error('Failed to update profile');
    }
  };

  const hasPermission = (requiredRole) => {
    if (!user) return false;
    
    const roleHierarchy = { admin: 3, premium: 2, user: 1 };
    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    
    return userLevel >= requiredLevel;
  };

  const isTokenExpiring = () => {
    if (!tokenExpiry) return false;
    const timeUntilExpiry = new Date(tokenExpiry).getTime() - Date.now();
    return timeUntilExpiry < 300000; // Less than 5 minutes
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      signup,
      verifyOTP,
      login, 
      logout, 
      loading,
      loginWithGoogle,
      token,
      refreshToken,
      tokenExpiry,
      updateProfile,
      hasPermission,
      isTokenExpiring,
      handleTokenRefresh
    }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null, fallback = null }) => {
  const { isAuthenticated, loading, hasPermission } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || <LoginRequired />;
  }

  if (requiredRole && !hasPermission(requiredRole)) {
    return <AccessDenied requiredRole={requiredRole} />;
  }

  return children;
};

// Login Required Component
const LoginRequired = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Authentication Required</h2>
        <p className="text-gray-400 mb-6">You need to log in to access this page.</p>
        <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200">
          Go to Login
        </button>
      </div>
    </div>
  );
};

// Access Denied Component
const AccessDenied = ({ requiredRole }) => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Access Denied</h2>
        <p className="text-gray-400 mb-2">You don't have permission to access this page.</p>
        <p className="text-gray-500 mb-6">Required role: <span className="text-yellow-400 font-semibold">{requiredRole}</span> | Your role: <span className="text-blue-400 font-semibold">{user?.role}</span></p>
        <button 
          onClick={() => window.history.back()}
          className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

// Enhanced Dashboard Component
const Dashboard = () => {
  const { user, logout, updateProfile, isTokenExpiring, handleTokenRefresh } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load dashboard data
    const loadDashboardData = async () => {
      try {
        const postsResult = await api.getPosts(user?.token);
        if (postsResult.success) {
          setPosts(postsResult.posts);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const handleProfileUpdate = async (newData) => {
    try {
      await updateProfile(newData);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Token Expiry Warning */}
      {isTokenExpiring() && (
        <div className="bg-yellow-600 p-3 text-center">
          <span className="text-black font-medium">Your session is about to expire. </span>
          <button 
            onClick={handleTokenRefresh}
            className="text-black underline hover:no-underline"
          >
            Refresh now
          </button>
        </div>
      )}

      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm font-bold">C.</span>
              </div>
              <span className="text-white font-semibold">Connecto</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img 
                  src={user?.avatar || user?.picture} 
                  alt={user?.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-white">{user?.name}</span>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user?.role === 'admin' ? 'bg-red-600 text-white' :
                  user?.role === 'premium' ? 'bg-yellow-600 text-black' :
                  'bg-gray-600 text-white'
                }`}>
                  {user?.role}
                </div>
              </div>
              <button
                onClick={logout}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-900 p-1 rounded-lg mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'profile', label: 'Profile', icon: '👤' },
            { id: 'posts', label: 'Posts', icon: '📝' },
            { id: 'settings', label: 'Settings', icon: '⚙️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-gray-900 rounded-lg p-6">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Welcome back, {user?.name}!</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Account Status</h3>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${user?.isVerified ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-gray-300">{user?.isVerified ? 'Verified' : 'Unverified'}</span>
                  </div>
                </div>
                
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Role</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user?.role === 'admin' ? 'bg-red-600 text-white' :
                    user?.role === 'premium' ? 'bg-yellow-600 text-black' :
                    'bg-gray-600 text-white'
                  }`}>
                    {user?.role?.toUpperCase()}
                  </span>
                </div>
                
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Member Since</h3>
                  <span className="text-gray-300">January 2024</span>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-300">Successfully logged in</span>
                    <span className="text-gray-500 text-sm ml-auto">Just now</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-300">Profile viewed</span>
                    <span className="text-gray-500 text-sm ml-auto">2 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <ProfileSettings user={user} onUpdate={handleProfileUpdate} />
          )}

          {activeTab === 'posts' && (
            <PostsSection posts={posts} userRole={user?.role} />
          )}

          {activeTab === 'settings' && (
            <SettingsSection user={user} />
          )}
        </div>
      </div>
    </div>
  );
};

// Profile Settings Component
const ProfileSettings = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdate(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Profile Settings</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
            rows={4}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Tell us about yourself..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

// Posts Section Component
const PostsSection = ({ posts, userRole }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Posts</h2>
        {userRole === 'admin' && (
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">
            Create Post
          </button>
        )}
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">{post.author[0]}</span>
              </div>
              <div>
                <h3 className="text-white font-semibold">{post.author}</h3>
                <p className="text-gray-400 text-sm">{new Date(post.timestamp).toLocaleDateString()}</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-4">{post.content}</p>
            
            <div className="flex items-center space-x-6 text-gray-400">
              <button className="flex items-center space-x-2 hover:text-purple-400 transition-colors duration-200">
                <span>❤️</span>
                <span>{post.likes}</span>
              </button>
              <button className="flex items-center space-x-2 hover:text-purple-400 transition-colors duration-200">
                <span>💬</span>
                <span>{post.comments}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Settings Section Component
const SettingsSection = ({ user }) => {
  const [settings, setSettings] = useState({
    notifications: true,
    twoFactor: false,
    darkMode: true
  });

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
      
      <div className="space-y-6 max-w-2xl">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Security</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Two-Factor Authentication</label>
                <p className="text-gray-400 text-sm">Add an extra layer of security to your account</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.twoFactor}
                  onChange={(e) => setSettings({...settings, twoFactor: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Preferences</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Email Notifications</label>
                <p className="text-gray-400 text-sm">Receive email updates about your account</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:
                  w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Dark Mode</label>
                <p className="text-gray-400 text-sm">Use dark theme across the application</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={(e) => setSettings({...settings, darkMode: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Danger Zone</h3>
          
          <div className="space-y-4">
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin Panel Component
const AdminPanel = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'premium', status: 'active' },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'user', status: 'inactive' }
  ]);

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Panel</h1>
        
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-6">User Management</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="pb-3 text-gray-300">Name</th>
                  <th className="pb-3 text-gray-300">Email</th>
                  <th className="pb-3 text-gray-300">Role</th>
                  <th className="pb-3 text-gray-300">Status</th>
                  <th className="pb-3 text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-800">
                    <td className="py-4 text-white">{user.name}</td>
                    <td className="py-4 text-gray-300">{user.email}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-red-600 text-white' :
                        user.role === 'premium' ? 'bg-yellow-600 text-black' :
                        'bg-gray-600 text-white'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === 'active' ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <button className="text-purple-400 hover:text-purple-300 mr-3">Edit</button>
                      <button className="text-red-400 hover:text-red-300">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Login Component
const Login = ({ onSwitchToSignup, onSwitchToOTP }) => {
  const { login, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      if (!result.success) {
        setError(result.message || 'Login failed');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    loginWithGoogle({ credential: 'mock_google_credential' });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl font-bold">C.</span>
            </div>
            <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
            <p className="text-gray-400 mt-2">Sign in to your account</p>
          </div>

          {error && (
            <div className="bg-red-600 text-white p-3 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="wareesha@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="mt-6 w-full bg-white hover:bg-gray-100 border border-gray-300 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <button 
                onClick={onSwitchToSignup}
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Signup Component
const Signup = ({ onSwitchToLogin, onSwitchToOTP }) => {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    signup(formData).then(result => {
      if (result.success) {
        onSwitchToOTP(result.userId, formData.email);
      } else {
        setError(result.message || 'Signup failed');
      }
      setLoading(false);
    }).catch(error => {
      setError(error.message);
      setLoading(false);
    });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl font-bold">C.</span>
            </div>
            <h2 className="text-3xl font-bold text-white">Create Account</h2>
            <p className="text-gray-400 mt-2">Join us today</p>
          </div>

          {error && (
            <div className="bg-red-600 text-white p-3 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Wareesha Ashraf"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="wareesha@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <button 
                onClick={onSwitchToLogin}
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// OTP Verification Component
const OTPVerification = ({ userId, email, onSwitchToLogin }) => {
  const { verifyOTP } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await verifyOTP(userId, otpString);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onSwitchToLogin();
        }, 2000);
      } else {
        setError(result.message || 'Invalid OTP');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Account Verified!</h2>
          <p className="text-gray-400 mb-6">Your account has been successfully verified. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white">Verify Your Email</h2>
            <p className="text-gray-400 mt-2">
              We've sent a 6-digit code to<br/>
              <span className="text-white font-medium">{email}</span>
            </p>
          </div>

          {error && (
            <div className="bg-red-600 text-white p-3 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex space-x-3 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Didn't receive the code?{' '}
              <button className="text-purple-400 hover:text-purple-300 font-medium">
                Resend
              </button>
            </p>
          </div>

          <div className="mt-4 text-center">
            <button 
              onClick={onSwitchToLogin}
              className="text-gray-400 hover:text-white"
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentView, setCurrentView] = useState('login');
  const [otpData, setOtpData] = useState({ userId: null, email: '' });

  const handleSwitchToOTP = (userId, email) => {
    setOtpData({ userId, email });
    setCurrentView('otp');
  };

  return (
    <AuthProvider>
      <AuthenticatedApp 
        currentView={currentView}
        setCurrentView={setCurrentView}
        otpData={otpData}
        onSwitchToOTP={handleSwitchToOTP}
      />
    </AuthProvider>
  );
};

// Authenticated App Component
const AuthenticatedApp = ({ currentView, setCurrentView, otpData, onSwitchToOTP }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Route based on user role
    if (user?.role === 'admin') {
      return (
        <div>
          <Dashboard />
          <div className="mt-8">
            <ProtectedRoute requiredRole="admin">
              <AdminPanel />
            </ProtectedRoute>
          </div>
        </div>
      );
    }
    return <Dashboard />;
  }

  // Authentication views
  switch (currentView) {
    case 'signup':
      return (
        <Signup 
          onSwitchToLogin={() => setCurrentView('login')}
          onSwitchToOTP={onSwitchToOTP}
        />
      );
    case 'otp':
      return (
        <OTPVerification 
          userId={otpData.userId}
          email={otpData.email}
          onSwitchToLogin={() => setCurrentView('login')}
        />
      );
    default:
      return (
        <Login 
          onSwitchToSignup={() => setCurrentView('signup')}
          onSwitchToOTP={onSwitchToOTP}
        />
      );
  }
};

export default App;