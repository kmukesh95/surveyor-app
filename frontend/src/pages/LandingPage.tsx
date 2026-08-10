import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileCheck, MapPin, ArrowRight, Lock } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 text-center py-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
          <Shield className="w-4 h-4 text-blue-600" />
          <span>Official Digital Household & Ration Card Management System</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight mb-6">
          Streamlined Household Surveys & <span className="text-blue-600">Digital Ration Verification</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
          Integrated portal for citizen self-registration, field surveyor household data entry, document media verification, and administrative approval workflows.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/register" className="btn btn-primary py-3.5 px-8 text-base font-bold shadow-lg">
            Direct Citizen Survey <ArrowRight className="w-5 h-5 ml-1" />
          </Link>
          <Link to="/login" className="btn btn-secondary py-3.5 px-8 text-base font-semibold">
            Sign In to Portal
          </Link>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Portal Core Capabilities</h2>
          <p className="text-slate-500 mt-2 text-base">Engineered for accuracy, security, and zonal administration</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card-container hover:border-blue-300 transition-all">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">System-Generated Survey Number</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Upon document verification & Administrator approval, an official 8-digit unique alphanumeric Survey Number (e.g. SRV9DPQJ) is generated.
            </p>
          </div>

          <div className="card-container hover:border-blue-300 transition-all">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Zonal Jurisdiction Mapping</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Assign State, District, and Block level jurisdictions to Field Surveyors and Admins for targeted household data collection.
            </p>
          </div>

          <div className="card-container hover:border-blue-300 transition-all">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">2FA Security & Form Edit Locks</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              AES-256 encrypted authentication with 2FA code guards. Submitted applications are locked to prevent unauthorized alterations.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
