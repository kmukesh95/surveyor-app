import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export const TwoFactorModal: React.FC = () => {
  const { verify2FA } = useAuth();
  const [tfaCode, setTfaCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tfaCode.trim().length !== 6) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await verify2FA(tfaCode);
    } catch (err: any) {
      setError(err.message || '2FA verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content max-w-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Two-Factor Authentication</h2>
          <p className="text-sm text-slate-500 mt-1">
            Enter the 6-digit security code sent to your registered device.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-6">
            <label className="form-label text-center">6-Digit Security Code</label>
            <div className="relative">
              <input
                type="text"
                maxLength={6}
                value={tfaCode}
                onChange={(e) => setTfaCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="form-input text-center text-2xl font-mono tracking-widest"
                autoFocus
              />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full py-3 text-base">
            {isSubmitting ? 'Verifying...' : 'Verify Code & Proceed'}
          </button>
        </form>
      </div>
    </div>
  );
};
