import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Shield, MapPin, FileCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadge = (roleCode?: string) => {
    switch (roleCode) {
      case 'SUPER_ADMIN':
        return <span className="badge badge-rejected"><Shield className="w-3 h-3" /> Super Admin</span>;
      case 'ADMIN':
        return <span className="badge badge-submitted"><Shield className="w-3 h-3" /> Administrator</span>;
      case 'SURVEYOR':
        return <span className="badge badge-draft"><MapPin className="w-3 h-3" /> Field Surveyor</span>;
      case 'BENEFICIARY':
        return <span className="badge badge-approved"><FileCheck className="w-3 h-3" /> Citizen Beneficiary</span>;
      default:
        return null;
    }
  };

  return (
    <header className="glass-header sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 text-decoration-none">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">E-Survey & Ration Portal</h1>
            <p className="text-xs text-slate-500 font-medium">Digital Household Verification System</p>
          </div>
        </Link>

        {user ? (
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                {user.firstName.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-800">
                  {user.firstName} {user.lastName}
                </span>
                {getRoleBadge(user.role?.roleCode)}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-secondary text-sm py-2 px-3 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn btn-secondary text-sm py-2">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary text-sm py-2">
              Citizen Registration
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
