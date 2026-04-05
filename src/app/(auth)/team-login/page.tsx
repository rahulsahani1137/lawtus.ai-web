'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTeamAuthStore } from '@/store/teamAuthStore';
import { teamAuthAPI } from '@/lib/team-api';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, setPendingEmail, pendingEmail, clearPendingEmail } = useTeamAuthStore();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await teamAuthAPI.sendOTP(email);
      setPendingEmail(email, response.expiresInSeconds);
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await teamAuthAPI.verifyOTP(pendingEmail || email, otp);
      setAuth(
        response.tokens.accessToken,
        response.tokens.refreshToken,
        response.user
      );
      clearPendingEmail();
      router.push('/team/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Lawtus Trainer
          </h1>
          <p className="text-slate-300">Internal Team Portal</p>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-500/10 border border-amber-500/50 rounded-lg p-4 mb-6">
          <p className="text-amber-200 font-semibold text-sm mb-1">
            ⚠️ Authorized Team Members Only
          </p>
          <p className="text-amber-100/70 text-xs">
            This portal is for internal use by Lawtus.ai team members.
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {step === 'email' ? (
            <form onSubmit={handleSendOTP}>
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@lawtus.ai"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <div className="mb-2">
                <p className="text-sm text-gray-600">
                  OTP sent to <span className="font-semibold">{pendingEmail}</span>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    clearPendingEmail();
                    setOtp('');
                  }}
                  className="text-sm text-slate-600 hover:text-slate-900 underline"
                >
                  Change email
                </button>
              </div>

              <div className="mb-6 mt-4">
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  required
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-center text-2xl tracking-widest"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Development mode: Use <code className="bg-gray-100 px-1 rounded">123456</code>
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-sm mt-6">
          Need access? Contact your administrator.
        </p>
      </div>
    </div>
  );
}
