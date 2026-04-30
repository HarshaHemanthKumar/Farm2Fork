import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import FarmerApp from './components/farmer/FarmerApp';
import ConsumerApp from './components/consumer/ConsumerApp';
import DriverApp from './components/driver/DriverApp';
import { useState, useEffect } from 'react';
import { api } from './lib/api';
import { Leaf } from 'lucide-react';

import { GeminiChatbot } from './components/GeminiChatbot';

export default function App() {
  const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL?.startsWith('https://') && import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!isSupabaseConfigured) {
    return (
      <div className="flex justify-center bg-[#f3f4f6] min-h-screen">
        <div className="w-full max-w-md bg-[#fbfbf9] h-screen overflow-hidden flex flex-col justify-center p-8 shadow-2xl relative text-center">
          <h1 className="text-[32px] font-bold tracking-tight text-[#1b5e20] mb-6">Setup Required</h1>
          <p className="text-gray-500 font-medium mb-4">
            Please set the following environment variables in your platform settings:
          </p>
          <div className="text-left bg-white p-6 border border-gray-100 rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#81c784] font-bold block mb-1">VITE_SUPABASE_URL</span>
              <span className="text-sm font-medium text-gray-800">Your project URL</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-[#81c784] font-bold block mb-1">VITE_SUPABASE_ANON_KEY</span>
              <span className="text-sm font-medium text-gray-800">Your project API key</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-8 uppercase tracking-widest font-bold">
            Restart the server after adding them.
          </p>
        </div>
      </div>
    );
  }

  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    import('./lib/supabase').then(({ getSupabase }) => {
      const supabase = getSupabase();
      
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          localStorage.removeItem('user');
          setUser(null);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          localStorage.removeItem('user');
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    });
  }, [isSupabaseConfigured]);

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      const { getSupabase } = await import('./lib/supabase');
      await getSupabase().auth.signOut();
    }
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  if (!user) {
    return (
      <div className="flex justify-center bg-[#f3f4f6] min-h-screen">
        <div className="w-full max-w-md bg-[#fbfbf9] h-screen overflow-hidden flex flex-col shadow-2xl relative">
          <AuthPage onLogin={(u: any) => {
            localStorage.setItem('user', JSON.stringify(u));
            setUser(u);
            if (u.role === 'farmer') navigate('/farmer');
            else if (u.role === 'driver') navigate('/driver');
            else navigate('/');
          }} />
          <GeminiChatbot user={null} onLogin={(u: any) => {
            localStorage.setItem('user', JSON.stringify(u));
            setUser(u);
            if (u.role === 'farmer') navigate('/farmer');
            else if (u.role === 'driver') navigate('/driver');
            else navigate('/');
          }} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center bg-[#f3f4f6] min-h-screen">
      <div className="w-full max-w-md bg-[#fdfbf9] h-screen overflow-hidden flex flex-col shadow-2xl relative">
        <Routes>
          <Route path="/farmer/*" element={user.role === 'farmer' ? <FarmerApp onLogout={handleLogout} /> : <Navigate to="/" />} />
          <Route path="/driver/*" element={user.role === 'driver' ? <DriverApp onLogout={handleLogout} /> : <Navigate to="/" />} />
          <Route path="/*" element={user.role === 'consumer' ? <ConsumerApp onLogout={handleLogout} /> : <Navigate to={user.role === 'farmer' ? '/farmer' : '/driver'} />} />
        </Routes>
        <GeminiChatbot user={user} onLogin={() => {}} />
      </div>
    </div>
  );
}

function AuthPage({ onLogin }: { onLogin: (user: any) => void }) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'signup'>('phone');
  const [error, setError] = useState('');
  const [role, setRole] = useState('consumer');
  const [name, setName] = useState('');
  const [upiId, setUpiId] = useState('');

  const submitPhone = async () => {
    try {
      setError('');
      // In development, might want to bypass real SMS or just call API
      await api.requestOtp(phone);
      setStep('otp');
    } catch (e: any) {
      let msg = e.message;
      try { msg = JSON.parse(e.message).error; } catch {}
      setError(msg || 'An error occurred sending OTP');
    }
  };

  const submitOtp = async () => {
    try {
      setError('');
      const res = await api.verifyOtp(phone, otp);
      if (res.needsSignup) {
        setStep('signup');
      } else {
        onLogin(res.user);
      }
    } catch (e: any) {
      let msg = e.message;
      try { msg = JSON.parse(e.message).error; } catch {}
      setError(msg || 'Invalid OTP');
    }
  };

  const submitSignup = async () => {
    try {
      setError('');
      if (role === 'farmer' && !upiId.includes('@')) {
        setError('Please enter a valid UPI ID');
        return;
      }
      const res = await api.signup({ phone: phone.replace(/\D/g, ''), role, name, upiId: role === 'farmer' ? upiId : null });
      onLogin(res.user);
    } catch (e: any) {
      let msg = e.message;
      try { msg = JSON.parse(e.message).error; } catch {}
      setError(msg || 'An error occurred during signup');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#fbfbf9] px-6 py-16 justify-center text-center relative w-full items-center">
      <div className="flex flex-col items-center mb-12">
        <Leaf className="w-16 h-16 text-[#81c784] mb-4 fill-[#81c784]" />
        <h1 className="text-[32px] font-bold text-[#1b5e20] tracking-tight mb-2">Farm2Fork</h1>
        <p className="text-gray-500 font-medium">Fresh produce, direct from farmers</p>
      </div>

      <div className="w-full text-left">
        {step === 'phone' && (
          <>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Enter your phone number</label>
            <div className="flex gap-2 mb-6">
              <div className="bg-[#e8f5e9] text-[#2e7d32] text-lg font-bold flex items-center justify-center px-4 rounded-xl border border-[#c8e6c9]">
                +91
              </div>
              <input 
                type="text" 
                placeholder="9876543210"
                className="flex-1 border border-gray-300 bg-white rounded-xl px-4 py-3.5 text-lg font-medium focus:outline-none focus:border-[#4caf50] focus:ring-1 focus:ring-[#4caf50] text-gray-700"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-4 font-medium">{error}</p>}
            <button onClick={submitPhone} className="w-full bg-[#388e3c] text-white text-lg font-bold py-3.5 rounded-xl hover:bg-[#2e7d32] transition-colors">
              Get OTP
            </button>
          </>
        )}
        
        {step === 'otp' && (
          <>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Enter OTP sent to +91 {phone}</label>
            <input 
              type="text" 
              placeholder="123456"
              className="w-full border border-gray-300 bg-white rounded-xl px-4 py-3.5 mb-6 text-lg tracking-widest font-bold text-center focus:outline-none focus:border-[#4caf50] focus:ring-1 focus:ring-[#4caf50] text-gray-700"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm mb-4 font-medium">{error}</p>}
            <button onClick={submitOtp} className="w-full bg-[#388e3c] text-white text-lg font-bold py-3.5 rounded-xl hover:bg-[#2e7d32] transition-colors">
              Verify OTP
            </button>
            <button onClick={() => setStep('phone')} className="w-full mt-4 text-gray-400 font-bold hover:text-gray-600 transition-colors py-2">
              Change Phone Number
            </button>
          </>
        )}

        {step === 'signup' && (
          <>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Complete your profile</label>
            <input 
              type="text" 
              placeholder="Full Name"
              className="w-full border border-gray-300 bg-white rounded-xl px-4 py-3.5 mb-4 text-lg font-medium focus:outline-none focus:border-[#4caf50]"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">I am a...</label>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setRole('consumer')} className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${role === 'consumer' ? 'bg-[#e8f5e9] border-[#4caf50] text-[#2e7d32] font-bold' : 'border-gray-200 bg-white text-gray-500 font-semibold'}`}>🛒<br/>Consumer</button>
                <button onClick={() => setRole('farmer')} className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${role === 'farmer' ? 'bg-[#e8f5e9] border-[#4caf50] text-[#2e7d32] font-bold' : 'border-gray-200 bg-white text-gray-500 font-semibold'}`}>🚜<br/>Farmer</button>
                <button onClick={() => setRole('driver')} className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${role === 'driver' ? 'bg-[#e8f5e9] border-[#4caf50] text-[#2e7d32] font-bold' : 'border-gray-200 bg-white text-gray-500 font-semibold'}`}>🚚<br/>Courier</button>
              </div>
            </div>
            {role === 'farmer' && (
              <div className="mb-6 animate-[slideDown_0.2s_ease-out]">
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">UPI ID for Payments</label>
                <input 
                  type="text" 
                  placeholder="name@upi"
                  className="w-full border border-gray-300 bg-white rounded-xl px-4 py-3.5 mb-1 text-lg font-medium focus:outline-none focus:border-[#4caf50]"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
                <p className="ml-1 text-xs text-gray-500 font-medium">You will receive payments for your produce here.</p>
              </div>
            )}
            {error && <p className="text-red-500 text-sm mb-4 font-medium">{error}</p>}
            <button onClick={submitSignup} className="w-full bg-[#388e3c] text-white text-lg font-bold py-3.5 rounded-xl hover:bg-[#2e7d32] transition-colors">
              Create Account
            </button>
            <button onClick={() => setStep('phone')} className="w-full mt-4 text-gray-400 font-bold hover:text-gray-600 transition-colors py-2">
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}


