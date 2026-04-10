'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const ROLES = {
  admin: { label: 'الإدارة', icon: '⚙️', color: '#2f5d2f', redirectTo: '/admin', email: 'admin@nema.org.sa', pass: '123456' },
  courier: { label: 'المندوب', icon: '🚗', color: '#6dbe45', redirectTo: '/courier', email: 'courier@nema.org.sa', pass: '123456' },
  supervisor: { label: 'المشرف', icon: '👁️', color: '#b68a3a', redirectTo: '/admin', email: 'supervisor@nema.org.sa', pass: '123456' },
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = (searchParams.get('role') || 'admin') as keyof typeof ROLES;
  const [role, setRole] = useState<keyof typeof ROLES>(roleParam);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentRole = ROLES[role];

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 1200));
    if (email === currentRole.email && password === currentRole.pass) {
      router.push(currentRole.redirectTo);
    } else {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ direction: 'rtl' }}>
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient flex-col items-center justify-center p-16 relative overflow-hidden">
        <div className="absolute inset-0">
          {['🍽️','🌿','❤️','🏡','🤝'].map((e, i) => (
            <div key={i} className="absolute text-white/10 text-8xl animate-float"
              style={{ right: `${5 + i * 20}%`, top: `${10 + i * 18}%`, animationDelay: `${i * 0.6}s` }}>{e}</div>
          ))}
        </div>
        <div className="relative z-10 text-center text-white">
          <div className="text-8xl mb-6">🌿</div>
          <h2 className="text-4xl font-black mb-4">جمعية حفظ النعمة</h2>
          <p className="text-green-200 text-lg leading-relaxed max-w-sm">
            منصة متكاملة لإدارة عمليات استلام وتوزيع فائض الطعام بكفاءة واحترافية
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6">
            {[{n:'231', l:'طلب مكتمل'}, {n:'18K+', l:'وجبة منقذة'}, {n:'156', l:'أسرة مستفيدة'}].map((s, i) => (
              <div key={i} className="bg-white/10 rounded-2xl p-4">
                <div className="text-2xl font-black text-white">{s.n}</div>
                <div className="text-white/80 text-xs mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-4 shadow-xl"
              style={{ background: `linear-gradient(135deg, ${currentRole.color}, ${currentRole.color}cc)` }}>
              {currentRole.icon}
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">تسجيل الدخول</h1>
            <p className="text-gray-500">دخول {currentRole.label}</p>
          </div>

          {/* Role Switcher */}
          <div className="flex bg-white rounded-2xl p-1.5 border border-gray-200 gap-1 mb-8">
            {(Object.entries(ROLES) as [keyof typeof ROLES, typeof ROLES[keyof typeof ROLES]][]).map(([key, val]) => (
              <button key={key} onClick={() => setRole(key)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${role === key ? 'text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                style={role === key ? { background: `linear-gradient(135deg, ${val.color}, ${val.color}cc)` } : {}}>
                {val.icon} {val.label}
              </button>
            ))}
          </div>

          <div className="card p-8">
            <div className="form-group">
              <label className="form-label">البريد الإلكتروني</label>
              <input className="form-input" type="email" placeholder={currentRole.email}
                value={email} onChange={e => setEmail(e.target.value)} dir="ltr" />
            </div>
            <div className="form-group">
              <label className="form-label">كلمة المرور</label>
              <input className="form-input" type="password" placeholder="••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
            )}

            <div className="text-sm text-gray-400 bg-gray-50 rounded-xl p-3 mb-4">
              <strong>للتجربة:</strong> البريد: <code className="bg-white px-1 rounded">{currentRole.email}</code> | كلمة المرور: <code className="bg-white px-1 rounded">123456</code>
            </div>

            <button className="btn-primary w-full justify-center py-4 text-base" onClick={handleLogin} disabled={loading}
              style={{ background: `linear-gradient(135deg, ${currentRole.color}, ${currentRole.color}cc)` }}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
                  </svg>
                  جاري تسجيل الدخول...
                </span>
              ) : `دخول ${currentRole.label}`}
            </button>

            <div className="text-center mt-4">
              <button className="text-sm text-gray-400 hover:text-green-600 transition">
                نسيت كلمة المرور؟
              </button>
            </div>
          </div>

          <div className="text-center mt-6">
            <Link href="/" className="text-gray-500 hover:text-[#2f5d2f] text-sm transition">
              ← العودة للصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
