import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Phone, Lock, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please fill in both identifier and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await login(identifier, password);
      if (!res.requires2FA) {
        if (res.user?.role?.roleCode === 'ADMIN' || res.user?.role?.roleCode === 'SUPER_ADMIN') {
          navigate('/admin');
        } else if (res.user?.role?.roleCode === 'SURVEYOR') {
          navigate('/surveyor');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillQuickLogin = (mobile: string, pass: string) => {
    setIdentifier(mobile);
    setPassword(pass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="card-container w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Portal Login</h2>
          <p className="text-sm text-slate-500 mt-1">Access your Household Survey & Ration Portal</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Mobile Number / Email / Survey Number</label>
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter Mobile, Email, or SRV..."
                className="form-input pl-10"
                required
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input pl-10"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full py-3 mt-2 text-base font-semibold">
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Quick Credentials Preset Tester */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">
            Quick Test Accounts
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => fillQuickLogin('9999999999', 'password123')}
              className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 text-left"
            >
              <span className="font-semibold block text-slate-900">Admin Account</span>
              <span>9999999999</span>
            </button>
            <button
              onClick={() => fillQuickLogin('9876543210', 'Password@123')}
              className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 text-left"
            >
              <span className="font-semibold block text-slate-900">Citizen Beneficiary</span>
              <span>9876543210</span>
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:underline">
            Register Direct
          </Link>
        </p>
      </div>
    </div>
  );
};
