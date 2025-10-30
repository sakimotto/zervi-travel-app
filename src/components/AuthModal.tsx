import React, { useState } from 'react';
import { X, User, Mail, Lock, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup' | 'reset';
  onModeChange: (mode: 'login' | 'signup' | 'reset') => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode, onModeChange }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('staff');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { signIn, signUp, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        onClose();
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email);
        if (error) throw error;
        setSuccess('Password reset email sent! Check your inbox for instructions.');
        setTimeout(() => {
          handleModeChange('login');
          setSuccess(null);
        }, 3000);
      } else {
        const { error } = await signUp(email, password, name, role);
        if (error) throw error;
        setSuccess('Account created successfully! Please check your email to verify your account.');
        setTimeout(() => {
          onClose();
          setSuccess(null);
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setRole('staff');
    setError(null);
    setSuccess(null);
  };

  const handleModeChange = (newMode: 'login' | 'signup' | 'reset') => {
    resetForm();
    onModeChange(newMode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            {mode === 'login' ? <LogIn className="mr-2" size={20} /> : mode === 'reset' ? <Lock className="mr-2" size={20} /> : <UserPlus className="mr-2" size={20} />}
            {mode === 'login' ? 'Sign In to Travel Hub' : mode === 'reset' ? 'Reset Password' : 'Join Travel Hub Team'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {mode === 'signup' && mode !== 'reset' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="staff">Staff Member</option>
                  <option value="manager">Travel Manager</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your password"
                  minLength={6}
                  required
                />
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-md text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                {mode === 'login' ? <LogIn className="mr-2" size={18} /> : mode === 'reset' ? <Lock className="mr-2" size={18} /> : <UserPlus className="mr-2" size={18} />}
                {mode === 'login' ? 'Sign In' : mode === 'reset' ? 'Send Reset Email' : 'Create Account'}
              </>
            )}
          </button>

          <div className="mt-4 text-center space-y-2">
            {mode === 'login' && (
              <button
                type="button"
                onClick={() => handleModeChange('reset')}
                className="text-primary hover:text-primary/80 text-sm block w-full"
              >
                Forgot password?
              </button>
            )}
            <button
              type="button"
              onClick={() => handleModeChange(mode === 'login' ? 'signup' : 'login')}
              className="text-primary hover:text-primary/80 text-sm block w-full"
            >
              {mode === 'login'
                ? "Don't have an account? Sign up"
                : mode === 'reset'
                ? "Back to sign in"
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;