'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { STATS, COURIERS, STATUS_LABELS, PRIORITY_LABELS } from '@/lib/mock-data';
import { getStatusColor, getPriorityColor, timeAgo } from '@/lib/utils';
import { Courier, FoodRequest } from '@/lib/types';
import { DataService } from '@/lib/data-service';

export default function SupervisorDashboard() {
  const [couriers] = useState<Courier[]>(COURIERS);
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [userName, setUserName] = useState<string>('المشرف');

  useEffect(() => {
    const name = localStorage.getItem('nema_user_name') || 'المشرف';
    setUserName(name);

    const fetchInitialData = async () => {
      const data = await DataService.getRequests();
      setRequests(data);
    };

    fetchInitialData();

    const subscription = DataService.subscribeToRequests(() => {
      fetchInitialData();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const recentRequests = requests.slice(0, 5);
  const availableCouriersCount = couriers.filter(c => c.availabilityStatus === 'available').length;

  const statCards = [
    { label: 'إجمالي البلاغات', value: requests.length, icon: '📋', color: '#b68a3a', bg: '#fffbeb', change: '+12 هذا الأسبوع' },
    { label: 'بلاغات جديدة', value: requests.filter(r => r.currentStatus === 'new').length, icon: '🆕', color: '#b68a3a', bg: '#f1f5f9', change: 'تحتاج مراجعة' },
    { label: 'قيد التنفيذ', value: requests.filter(r => !['completed', 'cancelled', 'new'].includes(r.currentStatus)).length, icon: '⚡', color: '#d79a2b', bg: '#fef3c7', change: 'نشطة الآن' },
    { label: 'مكتملة', value: requests.filter(r => r.currentStatus === 'completed').length, icon: '✅', color: '#6dbe45', bg: '#f0fdf4', change: '+8 اليوم' },
    { label: 'مناديب متاحون', value: availableCouriersCount, icon: '🚗', color: '#b68a3a', bg: '#f1f5f9', change: `من أصل ${couriers.length}` },
    { label: 'أسر مستفيدة', value: STATS.totalFamilies, icon: '👨‍👩‍👧‍👦', color: '#b68a3a', bg: '#fdf4ff', change: 'مسجلة في النظام' },
    { label: 'وجبات منقذة', value: STATS.totalMealsSaved.toLocaleString('ar'), icon: '🍽️', color: '#6dbe45', bg: '#f0fdf4', change: 'منذ بداية العمل' },
    { label: 'وقت الاستجابة', value: `${STATS.avgResponseTimeMinutes} د`, icon: '⏱️', color: '#ef4444', bg: '#fef2f2', change: 'متوسط الاستجابة' },
  ];

  return (
    <div className="space-y-8 animate-fade-in" style={{ direction: 'rtl' }}>
      {/* Welcome */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">مرحباً، {userName} 👋</h1>
          <p className="text-gray-500 mt-1">هنا ملخص عمليات جمعية قوت اليوم (وضع الرقابة)</p>
        </div>
        <div className="text-sm text-gray-400 bg-white border rounded-xl px-4 py-2">
          📅 {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', calendar: 'gregory' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="stat-card p-5 animate-count" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: stat.bg }}>
                {stat.icon}
              </div>
              <div className="text-xs text-gray-400 text-left">{stat.change}</div>
            </div>
            <div className="text-3xl font-black mb-1" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-gray-500 text-sm font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Requests */}
        <div className="lg:col-span-2 card-flat overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-black text-gray-900 text-lg">📋 أحدث الطلبات</h2>
            <Link href="/supervisor/requests" className="text-[#b68a3a] hover:text-[#b68a3a]/80 text-sm font-black">عرض الكل →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>رقم الطلب</th>
                  <th>الجهة</th>
                  <th>الأولوية</th>
                  <th>الحالة</th>
                  <th>الوقت</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map(req => (
                  <tr key={req.id} className="cursor-pointer" onClick={() => window.location.href=`/supervisor/requests/${req.id}`}>
                    <td><span className="font-mono text-sm font-bold text-[#b68a3a]">{req.requestNumber}</span></td>
                    <td>
                      <div className="font-semibold text-gray-800">{req.donorName}</div>
                      <div className="text-xs text-gray-400">{req.district}</div>
                    </td>
                    <td><span className={`badge ${getPriorityColor(req.priorityLevel)}`}>{PRIORITY_LABELS[req.priorityLevel]}</span></td>
                    <td><span className={`badge ${getStatusColor(req.currentStatus)}`}>{STATUS_LABELS[req.currentStatus]}</span></td>
                    <td className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(req.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Couriers Status */}
        <div className="card-flat overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-black text-gray-900 text-lg">🚗 حالة المناديب</h2>
          </div>
          <div className="p-4 space-y-3">
            {couriers.map(courier => {
              const cReqs = requests.filter(r => r.pickupCourierId === courier.id || r.distributionCourierId === courier.id);
              const activeCount = cReqs.filter(r => !['completed', 'cancelled', 'new', 'rejected'].includes(r.currentStatus)).length;
              return (
              <div key={courier.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                <div className="w-10 h-10 bg-[#b68a3a]/10 rounded-full flex items-center justify-center font-bold text-[#b68a3a] text-sm flex-shrink-0">
                  {courier.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-800 text-sm">{courier.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{courier.district} · <span className="font-bold text-orange-600">المتبقي: {activeCount} طلب</span></div>
                </div>
                <span className={`badge text-xs ${
                  courier.availabilityStatus === 'available' ? 'bg-green-100 text-green-700' :
                  courier.availabilityStatus === 'on_task' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {courier.availabilityStatus === 'available' ? 'متاح' :
                   courier.availabilityStatus === 'on_task' ? 'مشغول' : 'غير متاح'}
                </span>
              </div>
            )})}
            <Link href="/supervisor/couriers" className="btn-ghost w-full justify-center text-sm mt-2">عرض كل المناديب</Link>
          </div>
        </div>
      </div>

      {/* Urgent Alert */}
      {requests.filter(r => r.priorityLevel === 'urgent' && r.currentStatus !== 'completed').length > 0 && (
        <div className="border-2 border-orange-200 bg-orange-50 rounded-2xl p-5 flex items-start gap-4">
          <div className="text-3xl">🚨</div>
          <div>
            <div className="font-black text-orange-800 text-lg">تنبيه: طلبات عاجلة تحتاج متابعة</div>
            <div className="text-orange-600 text-sm mt-1">
              يوجد {requests.filter(r => r.priorityLevel === 'urgent' && r.currentStatus !== 'completed').length} طلب عاجل يتم معالجته حالياً.
            </div>
            <Link href="/supervisor/requests" className="bg-[#b68a3a] text-white py-2 px-6 rounded-xl mt-3 inline-flex items-center gap-2 text-sm font-bold shadow-lg shadow-[#b68a3a]/20">
              متابعة الطلبات ←
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
