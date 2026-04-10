'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { QOOT_LOGO_BASE64 } from '@/lib/brand';

const navItems = [
  { href: '/admin', label: 'لوحة التحكم', icon: '📊', exact: true },
  { href: '/admin/tracking', label: 'تتبع المناديب', icon: '🗺️' },
  { href: '/admin/requests', label: 'الطلبات', icon: '📋' },
  { href: '/admin/couriers', label: 'المناديب', icon: '🚗' },
  { href: '/admin/families', label: 'الأسر المستفيدة', icon: '👨‍👩‍👧‍👦' },
  { href: '/admin/reports', label: 'التقارير', icon: '📈' },
];

function Sidebar({ open, onClose, role, name }: { open: boolean; onClose: () => void; role: string | null; name: string | null }) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />}
      <aside className={`sidebar z-40 transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-white flex items-center justify-center p-1">
              <img src={QOOT_LOGO_BASE64} alt="جمعية قوت" className="max-w-full max-h-full object-contain" />
            </div>
            <div>
              <div className="font-black text-gray-900 text-sm leading-none">جمعية قوت</div>
              <div className="text-xs text-[#6dbe45] font-black">{role === 'supervisor' ? 'لوحة المشرف' : 'لوحة الإدارة'}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className={`sidebar-link ${isActive(item.href, item.exact) ? 'active bg-[#2f5d2f] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
              onClick={onClose}>
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 bg-[#2f5d2f]/5 rounded-xl border border-[#2f5d2f]/10">
            <div className="w-9 h-9 bg-[#2f5d2f] rounded-full flex items-center justify-center text-white font-bold text-sm">{name ? name[0] : 'ح'}</div>
            <div>
              <div className="font-bold text-gray-800 text-sm">{name || 'جاري التحميل...'}</div>
              <div className="text-xs text-[#6dbe45] font-bold uppercase tracking-wider">{role === 'admin' ? 'مدير النظام' : role === 'supervisor' ? 'مشرف - مشاهدة فقط' : '...'}</div>
            </div>
          </div>
          <Link href="/login" onClick={() => localStorage.removeItem('nema_user_role')} className="btn-ghost w-full justify-center mt-3 text-xs">تسجيل الخروج</Link>
        </div>
      </aside>
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('nema_user_role') || 'admin';
    const name = localStorage.getItem('nema_user_name') || 'أ. حسان';
    
    setUserRole(role);
    setUserName(name);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50" style={{ direction: 'rtl' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} role={userRole} name={userName} />

      {/* Main content */}
      <div className="lg:pr-[260px] min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg border border-gray-200">
              ☰
            </button>
            <div>
              <div className="font-black text-gray-900">لوحة تحكم الإدارة</div>
              <div className="text-xs text-gray-400">جمعية قوت</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-100 transition">
                🔔
              </button>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">3</span>
            </div>
            {userRole && userRole !== 'supervisor' && (
              <Link href="/admin/requests"
                className="btn-primary py-2 px-4 text-sm">
                + طلب جديد
              </Link>
            )}
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
