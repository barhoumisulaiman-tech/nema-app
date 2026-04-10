'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { QOOT_LOGO_BASE64 } from '@/lib/brand';

const navItems = [
  { href: '/supervisor', label: 'لوحة التحكم', icon: '📊', exact: true },
  { href: '/supervisor/tracking', label: 'تتبع المناديب', icon: '🗺️' },
  { href: '/supervisor/requests', label: 'الطلبات', icon: '📋' },
  { href: '/supervisor/couriers', label: 'المناديب', icon: '🚗' },
  { href: '/supervisor/families', label: 'الأسر المستفيدة', icon: '👨‍👩‍👧‍👦' },
  { href: '/supervisor/reports', label: 'التقارير', icon: '📈' },
];

function Sidebar({ open, onClose, name }: { open: boolean; onClose: () => void; name: string | null }) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />}
      <aside className={`sidebar z-40 transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-white flex items-center justify-center p-1">
              <img src={QOOT_LOGO_BASE64} alt="جمعية قوت" className="max-w-full max-h-full object-contain" />
            </div>
            <div>
              <div className="font-black text-gray-900 text-sm leading-none">جمعية قوت</div>
              <div className="text-xs text-[#6dbe45] font-black">لوحة المشرف</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className={`sidebar-link ${isActive(item.href, item.exact) ? 'active bg-[#b68a3a] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
              onClick={onClose}>
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
            <div className="w-9 h-9 bg-[#b68a3a] rounded-full flex items-center justify-center text-white font-bold text-sm">{name ? name[0] : 'م'}</div>
            <div>
              <div className="font-bold text-gray-800 text-sm">{name || 'جاري التحميل...'}</div>
              <div className="text-[10px] text-yellow-700 font-bold uppercase tracking-wider">مشرف - مشاهدة فقط</div>
            </div>
          </div>
          <Link href="/login" onClick={() => { localStorage.removeItem('nema_user_role'); }} className="btn-ghost w-full justify-center mt-3 text-xs text-red-500">تسجيل الخروج</Link>
        </div>
      </aside>
    </>
  );
}

export default function SupervisorLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('nema_user_role');
    const name = localStorage.getItem('nema_user_name');
    
    // Safety redirect if not supervisor (optional but good)
    if (role !== 'supervisor' && role !== 'admin') {
      router.push('/login');
      return;
    }
    
    setUserName(name || 'المشرف');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50" style={{ direction: 'rtl' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} name={userName} />

      <div className="lg:pr-[260px] min-h-screen">
        <header className="sticky top-0 z-20 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg border border-gray-200">
              ☰
            </button>
            <div>
              <div className="font-black text-gray-900 italic">نظام الرقابة والمتابعة</div>
              <div className="text-xs text-gray-400">جمعية قوت - حساب المشرف</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-lg text-xs font-bold border border-yellow-100">
               وضع القراءة فقط 👁️
             </div>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
