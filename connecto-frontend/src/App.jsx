import React, { useState, createContext, useContext, useEffect, useRef } from 'react';

// Auth Context
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for existing session
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const loginWithGoogle = (credentialResponse) => {
    try {
      // Mock Google login response
      const userData = {
        id: 'google_user_123',
        name: 'Google User',
        email: 'user@gmail.com',
        picture: 'https://via.placeholder.com/40',
        isVerified: true
      };

      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error handling Google login:', error);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      logout, 
      loading,
      loginWithGoogle 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// Custom hook for form handling
const useForm = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!values.firstName) newErrors.firstName = 'First name is required';
    if (!values.lastName) newErrors.lastName = 'Last name is required';
    if (!values.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!values.password) {
      newErrors.password = 'Password is required';
    } else if (values.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return {
    values,
    errors,
    handleChange,
    validate,
    setValues,
    setErrors
  };
};

// Input Component
const Input = ({ 
  label, 
  name, 
  type = "text", 
  value, 
  onChange, 
  error, 
  placeholder, 
  className = '',
  ...props 
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-3 bg-gray-800 border ${error ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200`}
        {...props}
      />
      {error && (
        <p className="text-red-400 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

// Button Component
const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  loading = false,
  className = '',
  type = 'button'
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {loading ? (
        <div className="flex justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        children
      )}
    </button>
  );
};

// Social Login Button
const SocialButton = ({ 
  children, 
  onClick, 
  disabled = false, 
  loading = false,
  className = '',
  type = 'button',
  provider = 'default'
}) => {
  const { loginWithGoogle } = useAuth();

  const handleGoogleLogin = () => {
    // Mock Google login
    loginWithGoogle({ credential: 'mock-credential' });
  };

  if (provider === 'google') {
    return (
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={disabled || loading}
        className={`w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 px-6 rounded-lg border border-gray-300 flex items-center justify-center gap-3 transition-colors duration-200 ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google
      </button>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg border border-gray-700 flex items-center justify-center gap-2 transition-colors duration-200 ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {loading ? (
        <div className="flex justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        children
      )}
    </button>
  );
};

// Sign Up Form Component
const SignUpForm = ({ onSwitchToLogin }) => {
  const form = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    
    if (!form.validate()) {
      return;
    }

    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Account created successfully! Please login.');
      onSwitchToLogin();
    } catch (err) {
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignup = () => {
    alert('GitHub signup would redirect to GitHub OAuth');
  };

  return (
    <div className="flex min-h-screen bg-black">
      {/* Left Side - Onboarding */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-xl font-bold">OP</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Get Started with Us</h1>
            <p className="text-gray-400 mb-8">Complete these easy steps to register your account</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-gray-900 rounded-lg border border-gray-800">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                1
              </div>
              <span className="text-white">Sign up your account</span>
            </div>
            
            <div className="flex items-center p-4 bg-gray-900 rounded-lg border border-gray-800 opacity-50">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                2
              </div>
              <span className="text-gray-400">Set up your workspace</span>
            </div>
            
            <div className="flex items-center p-4 bg-gray-900 rounded-lg border border-gray-800 opacity-50">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                3
              </div>
              <span className="text-gray-400">Set up your profile</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-gray-900 rounded-xl p-8 border border-gray-800">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Sign Up Account</h2>
            <p className="text-gray-400">Enter your personal data to create your account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-300">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <SocialButton provider="google" />
            
            <SocialButton onClick={handleGithubSignup}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub
            </SocialButton>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">Or</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="firstName"
                value={form.values.firstName || ''}
                onChange={form.handleChange}
                error={form.errors.firstName}
                placeholder="eg. John"
              />
              <Input
                label="Last Name"
                name="lastName"
                value={form.values.lastName || ''}
                onChange={form.handleChange}
                error={form.errors.lastName}
                placeholder="eg. Francisco"
              />
            </div>

            <Input
              label="Email"
              type="email"
              name="email"
              value={form.values.email || ''}
              onChange={form.handleChange}
              error={form.errors.email}
              placeholder="eg.johntrans@gmail.com"
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={form.values.password || ''}
              onChange={form.handleChange}
              error={form.errors.password}
              placeholder="Enter your password"
            />

            <div className="text-sm text-gray-400 mb-6">
              Must be at least 8 characters.
            </div>

            <Button onClick={handleSubmit} loading={loading}>
              Sign Up
            </Button>
          </div>

          <div className="mt-6 text-center">
            <span className="text-gray-400">Already have an account? </span>
            <button
              onClick={onSwitchToLogin}
              className="text-purple-400 hover:text-purple-300 transition-colors duration-200"
            >
              Log in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Login Form Component
const LoginForm = ({ onSwitchToSignup }) => {
  const form = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async () => {
    setError('');
    
    if (!form.values.email || !form.values.password) {
      setError('Email and password are required');
      return;
    }
    
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const userData = {
        id: '1',
        name: 'John Doe',
        email: form.values.email,
        isVerified: true
      };
      const token = 'mock-jwt-token';
      
      login(userData, token);
    } catch (err) {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 rounded-xl p-8 border border-gray-800">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400">Enter your credentials to access your account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <SocialButton provider="google" />
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900 text-gray-400">Or continue with email</span>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            value={form.values.email || ''}
            onChange={form.handleChange}
            error={form.errors.email}
            placeholder="Enter your email"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={form.values.password || ''}
            onChange={form.handleChange}
            error={form.errors.password}
            placeholder="Enter your password"
          />

          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-purple-500 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-400">Remember me</span>
            </label>
            <button
              type="button"
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors duration-200"
              onClick={() => alert('Forgot password functionality would be implemented')}
            >
              Forgot password?
            </button>
          </div>

          <Button onClick={handleSubmit} loading={loading}>
            Sign In
          </Button>
        </div>

        <div className="mt-6 text-center">
          <span className="text-gray-400">Don't have an account? </span>
          <button
            onClick={onSwitchToSignup}
            className="text-purple-400 hover:text-purple-300 transition-colors duration-200"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-3xl font-bold mb-4">Welcome to your dashboard, {user?.name}!</h1>
          <p className="mb-6">You are successfully logged in.</p>
          <button
            onClick={logout}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {showLogin ? (
        <LoginForm onSwitchToSignup={() => setShowLogin(false)} />
      ) : (
        <SignUpForm onSwitchToLogin={() => setShowLogin(true)} />
      )}
    </>
  );
};

// App Wrapper with AuthProvider
export default function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}