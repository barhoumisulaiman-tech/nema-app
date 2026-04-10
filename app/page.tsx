'use client';
import Link from 'next/link';
import { useState } from 'react';
import { QOOT_LOGO_BASE64 } from '@/lib/brand';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white" style={{ direction: 'rtl' }}>
      {/* Premium Navbar */}
      <nav className="fixed top-0 right-0 left-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-white flex items-center justify-center p-2">
              <img src={QOOT_LOGO_BASE64} alt="Logo" className="max-w-full max-h-full object-contain" />
            </div>
            <div>
              <div className="font-black text-gray-900 text-xl leading-none">جمعية قوت</div>
              <div className="text-xs text-[#6dbe45] font-black uppercase tracking-wider">المنصة الإدارية الذكية</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
             <div className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
               نسخة العرض 1.0
             </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Intro Section */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-[#2f5d2f]/5 text-[#2f5d2f] px-4 py-2 rounded-full text-sm font-black mb-6 border border-[#2f5d2f]/10 italic">
              ✨ نحو مستقبل بدون هدر
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight mb-8">
              نظام إدارة <span className="text-[#6dbe45]">جمعية قوت</span><br />
              المتكامل
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
              منصة رقمية موحدة تربط فريق الإدارة بالمناديب الميدانيين لتسهيل عمليات استلام فائض الطعام وتوزيعه بأقصى سرعة وأعلى كفاءة.
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-20 animate-slide-up">
            {/* Admin Card */}
            <Link href="/login?role=admin" 
              className="group relative bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 hover:border-[#2f5d2f] transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-[#2f5d2f]/10">
              <div className="w-16 h-16 bg-[#2f5d2f]/5 rounded-[1.5rem] flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-500">
                ⚙️
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-3">لوحة الإدارة</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                الدخول للوحة التحكم الرئيسية لإدارة الطلبات، تعيين المناديب، ومتابعة التقارير والإحصائيات اللحظية.
              </p>
              <div className="flex items-center gap-2 text-[#2f5d2f] font-black text-sm">
                دخول المدير <span className="text-lg group-hover:mr-2 transition-all">←</span>
              </div>
              <div className="absolute top-4 left-4 opacity-5 text-6xl font-black pointer-events-none">ADMIN</div>
            </Link>

            {/* Supervisor Card */}
            <Link href="/login?role=supervisor" 
              className="group relative bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 hover:border-[#b68a3a] transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-[#b68a3a]/10">
              <div className="w-16 h-16 bg-[#b68a3a]/5 rounded-[1.5rem] flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-500">
                👁️
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-3">نظام الرقابة</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                متابعة العمليات الميدانية والتقارير الحية بوضع "المشاهدة فقط" المخصص للمشرفين والجهات الرقابية.
              </p>
              <div className="flex items-center gap-2 text-[#b68a3a] font-black text-sm">
                دخول المشرف <span className="text-lg group-hover:mr-2 transition-all">←</span>
              </div>
              <div className="absolute top-4 left-4 opacity-5 text-6xl font-black pointer-events-none">SUPER</div>
            </Link>

            {/* Courier Card */}
            <Link href="/login?role=courier" 
              className="group relative bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 hover:border-[#6dbe45] transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-[#6dbe45]/10">
              <div className="w-16 h-16 bg-[#6dbe45]/5 rounded-[1.5rem] flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-500">
                🚗
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-3">بوابة المناديب</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                الدخول لمنصة المناديب لمتابعة المهام القادمة، تحديث حالات الاستلام، والتواصل مع العمليات.
              </p>
              <div className="flex items-center gap-2 text-[#6dbe45] font-black text-sm">
                دخول المندوب <span className="text-lg group-hover:mr-2 transition-all">←</span>
              </div>
              <div className="absolute top-4 left-4 opacity-5 text-6xl font-black pointer-events-none">COURIER</div>
            </Link>
          </div>

          {/* Quality Badges */}
          <div className="flex flex-wrap justify-center gap-10 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-1000">
            <div className="flex items-center gap-2 font-bold text-gray-900">🛡️ خدمة آمنة</div>
            <div className="flex items-center gap-2 font-bold text-gray-900">⚡ سرعة التنفيذ</div>
            <div className="flex items-center gap-2 font-bold text-gray-900">📊 تقارير ذكية</div>
            <div className="flex items-center gap-2 font-bold text-gray-900">🌍 تغطية مستدامة</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-10 border-t border-gray-50 text-center">
        <p className="text-sm text-gray-400 font-medium">
          © 2024 نظام جمعية قوت · جميع الحقوق محفوظة
        </p>
      </footer>
    </div>
  );
}
