'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { COURIERS, COURIER_STATUS_LABELS } from '@/lib/mock-data';
import { getCourierStatusColor } from '@/lib/utils';
import { Courier } from '@/lib/types';

export default function CouriersPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [toast, setToast] = useState('');
  const [couriers, setCouriers] = useState<Courier[]>(COURIERS);
  const [courierStats, setCourierStats] = useState<Record<string, {active: number, completed: number, total: number}>>({});
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // 0. Fetch role
    setUserRole(localStorage.getItem('nema_user_role') || 'admin');

    // 1. Load overrides from localStorage
    const savedStatus = localStorage.getItem('nema_courier_status_c1');
    if (savedStatus) {
      setCouriers(prev => prev.map(c => 
        c.id === 'c1' ? { ...c, availabilityStatus: savedStatus as any } : c
      ));
    }

    // Calculate Stats
    const savedRequestsStr = localStorage.getItem('nema_food_requests');
    const savedRequests: any[] = savedRequestsStr ? JSON.parse(savedRequestsStr) : [];
    
    const stats: Record<string, {active: number, completed: number, total: number}> = {};
    COURIERS.forEach(c => {
       const courierReqs = savedRequests.filter((r: any) => r.pickupCourierId === c.id || r.distributionCourierId === c.id);
       const activeStatuses = ['pickup_assigned', 'accepted', 'courier_on_way', 'picked_up', 'sorting', 'distribution_assigned', 'distributing'];
       const completedStatuses = ['distributed', 'completed'];
       
       stats[c.id] = {
         active: courierReqs.filter((r: any) => activeStatuses.includes(r.currentStatus)).length,
         completed: courierReqs.filter((r: any) => completedStatuses.includes(r.currentStatus)).length,
         total: courierReqs.length
       };
    });
    setCourierStats(stats);
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const filtered = couriers.filter(c => filterStatus === 'all' || c.availabilityStatus === filterStatus);

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <div className="toast toast-success">{toast}</div>}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">🚗 إدارة المناديب</h1>
          <p className="text-gray-500 mt-1">{couriers.length} مندوبين مسجلين</p>
        </div>
        {userRole === 'admin' && (
          <button onClick={() => setShowAdd(true)} className="btn-primary">+ إضافة مندوب</button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'متاحون', value: couriers.filter(c => c.availabilityStatus === 'available').length, color: '#16a34a', bg: '#f0fdf4', icon: '✅' },
          { label: 'في مهمة', value: couriers.filter(c => c.availabilityStatus === 'on_task').length, color: '#d97706', bg: '#fffbeb', icon: '⚡' },
          { label: 'غير متاح', value: couriers.filter(c => c.availabilityStatus === 'unavailable').length, color: '#6b7280', bg: '#f9fafb', icon: '⏸️' },
        ].map((s, i) => (
          <div key={i} className="stat-card text-center">
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-3xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-gray-500 text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        {[['all','الكل'],['available','متاح'],['on_task','في مهمة'],['unavailable','غير متاح']].map(([k,l]) => (
          <button key={k} onClick={() => setFilterStatus(k)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
              filterStatus === k ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
            }`}>{l}</button>
        ))}
      </div>

      {/* Couriers Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-5">
        {filtered.map(courier => (
          <div key={courier.id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #16a34a, #059669)' }}>
                    {courier.name[0]}
                  </div>
                  <div className={`absolute -bottom-1 -left-1 w-5 h-5 rounded-full border-2 border-white ${
                    courier.availabilityStatus === 'available' ? 'bg-green-500' :
                    courier.availabilityStatus === 'on_task' ? 'bg-orange-500' : 'bg-gray-400'
                  }`} />
                </div>
                <div>
                  <div className="font-black text-gray-900 text-lg">{courier.name}</div>
                  <div className="text-gray-500 text-sm">📱 {courier.phone}</div>
                </div>
              </div>
              <span className={`badge ${getCourierStatusColor(courier.availabilityStatus)}`}>
                {COURIER_STATUS_LABELS[courier.availabilityStatus]}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'إجمالي الطلبات (اليوم)', value: courierStats[courier.id]?.total || 0 },
                { label: 'الطلبات المتبقية (النشطة)', value: courierStats[courier.id]?.active || 0 },
                { label: 'المهام المنجزة', value: `${(courier.completedTasks || 0) + (courierStats[courier.id]?.completed || 0)} مهمة` },
                { label: 'المنطقة', value: `${courier.district}، ${courier.city}` },
              ].map((info, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-400 mb-1">{info.label}</div>
                  <div className="font-semibold text-gray-800 text-sm">{info.value}</div>
                </div>
              ))}
            </div>

            {/* Rating */}
            <div className="flex items-center justify-between mb-4 bg-yellow-50 rounded-xl p-3">
              <div className="text-sm font-bold text-gray-700">التقييم</div>
              <div className="flex items-center gap-1">
                {'⭐'.repeat(Math.floor(courier.rating))}
                <span className="font-black text-yellow-600 mr-1">{courier.rating}</span>
              </div>
            </div>

            {/* Task Types */}
            <div className="flex gap-2 mb-4">
              {courier.taskTypes.includes('pickup') && <span className="badge bg-green-100 text-green-700">استلام</span>}
              {courier.taskTypes.includes('distribution') && <span className="badge bg-blue-100 text-blue-700">توزيع</span>}
            </div>

            {userRole === 'admin' && (
              <div className="flex gap-2">
                <button onClick={() => showToast(`✅ تم تعديل بيانات ${courier.name}`)} className="btn-ghost flex-1 justify-center text-sm">تعديل</button>
                <button onClick={() => showToast(`${courier.availabilityStatus === 'unavailable' ? '✅ تم تفعيل' : '⏸️ تم إيقاف'} ${courier.name}`)}
                  className={`flex-1 text-sm font-semibold py-2 px-4 rounded-xl transition-all border ${
                    courier.availabilityStatus === 'unavailable'
                      ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                      : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                  }`}>
                  {courier.availabilityStatus === 'unavailable' ? '✅ تفعيل' : '⏸️ إيقاف'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in">
            <h3 className="text-xl font-black text-gray-900 mb-5">إضافة مندوب جديد</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: 'الاسم الكامل', placeholder: 'مثال: عمر المطيري', field: 'name' },
                { label: 'رقم الجوال', placeholder: '05XXXXXXXX', field: 'phone' },
                { label: 'المدينة', placeholder: 'الرياض', field: 'city' },
                { label: 'الحي', placeholder: 'النرجس', field: 'district' },
                { label: 'البريد الإلكتروني', placeholder: 'courier@nema.org.sa', field: 'email' },
                { label: 'كلمة المرور', placeholder: '••••••', field: 'password' },
              ].map((f, i) => (
                <div key={i} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <input className="form-input" placeholder={f.placeholder} type={f.field === 'password' ? 'password' : 'text'} />
                </div>
              ))}
              <div className="form-group md:col-span-2">
                <label className="form-label">نوع المركبة</label>
                <select className="form-input">
                  <option value="car">🚗 سيارة</option>
                  <option value="van">🚐 فان</option>
                  <option value="motorcycle">🏍️ دراجة نارية</option>
                </select>
              </div>
              <div className="form-group md:col-span-2">
                <label className="form-label">نوع المهام</label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4" defaultChecked /> استلام
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4" defaultChecked /> توزيع
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAdd(false)} className="btn-ghost flex-1">إلغاء</button>
              <button onClick={() => { setShowAdd(false); showToast('✅ تم إضافة المندوب بنجاح'); }} className="btn-primary flex-1 justify-center">إضافة المندوب</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
