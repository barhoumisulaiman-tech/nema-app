'use client';
import { useState, useEffect } from 'react';
import { COURIERS, COURIER_STATUS_LABELS } from '@/lib/mock-data';
import { getCourierStatusColor } from '@/lib/utils';
import { Courier } from '@/lib/types';

export default function SupervisorCouriersPage() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [couriers] = useState<Courier[]>(COURIERS);
  const [courierStats, setCourierStats] = useState<Record<string, {active: number, completed: number, total: number}>>({});

  useEffect(() => {
    // Calculate Stats from localStorage if available
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

  const filtered = couriers.filter(c => filterStatus === 'all' || c.availabilityStatus === filterStatus);

  return (
    <div className="space-y-6 animate-fade-in" style={{ direction: 'rtl' }}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">🚗 متابعة المناديب</h1>
          <p className="text-gray-500 mt-1">عرض حالة الكادر الميداني وتوزيعه الجغرافي (وضع الرقابة)</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'متاحون حالياً', value: couriers.filter(c => c.availabilityStatus === 'available').length, color: '#16a34a', icon: '✅' },
          { label: 'في مهام نشطة', value: couriers.filter(c => c.availabilityStatus === 'on_task').length, color: '#d97706', icon: '⚡' },
          { label: 'خارج العمل', value: couriers.filter(c => c.availabilityStatus === 'unavailable').length, color: '#6b7280', icon: '⏸️' },
        ].map((s, i) => (
          <div key={i} className="card p-5 text-center border-gray-100 shadow-sm">
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-3xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-gray-400 text-xs font-bold mt-1 uppercase">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        {[
          ['all','كافة المناديب'],
          ['available','المتاحون فقط'],
          ['on_task','المشغولون بمهام'],
          ['unavailable','غير المتاحين']
        ].map(([k,l]) => (
          <button key={k} onClick={() => setFilterStatus(k)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all border ${
              filterStatus === k 
                ? 'bg-[#b68a3a] text-white border-[#b68a3a] shadow-lg shadow-[#b68a3a]/20' 
                : 'bg-white text-gray-500 border-gray-200 hover:border-[#b68a3a]/30'
            }`}>{l}</button>
        ))}
      </div>

      {/* Couriers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filtered.map(courier => (
          <div key={courier.id} className="card p-6 border-gray-100 shadow-sm transition-transform hover:scale-[1.01] bg-white">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl"
                    style={{ background: 'linear-gradient(135deg, #b68a3a, #8f6a2b)' }}>
                    {courier.name[0]}
                  </div>
                  <div className={`absolute -bottom-1 -left-1 w-5 h-5 rounded-full border-4 border-white ${
                    courier.availabilityStatus === 'available' ? 'bg-green-500' :
                    courier.availabilityStatus === 'on_task' ? 'bg-orange-500' : 'bg-gray-400'
                  }`} />
                </div>
                <div>
                  <div className="font-black text-gray-900 text-lg leading-tight">{courier.name}</div>
                  <div className="text-gray-400 text-xs mt-1 font-mono">{courier.phone}</div>
                </div>
              </div>
              <span className={`badge px-3 py-1 font-bold text-[10px] ${getCourierStatusColor(courier.availabilityStatus)}`}>
                {COURIER_STATUS_LABELS[courier.availabilityStatus]}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: 'المهام الحالية', value: courierStats[courier.id]?.active || 0 },
                { label: 'المهام المكتملة اليوم', value: courierStats[courier.id]?.completed || 0 },
                { label: 'إجمالي التاريخي', value: `${courier.completedTasks || 0} مهمة` },
                { label: 'النطاق الجغرافي', value: courier.district },
              ].map((info, i) => (
                <div key={i} className="bg-gray-50/80 rounded-2xl p-3 border border-gray-50">
                  <div className="text-[10px] text-gray-400 mb-1 font-bold">{info.label}</div>
                  <div className="font-bold text-gray-800 text-xs">{info.value}</div>
                </div>
              ))}
            </div>

            {/* Rating */}
            <div className="flex items-center justify-between p-3 bg-yellow-50/50 rounded-2xl border border-yellow-100/50">
              <div className="text-xs font-bold text-yellow-800 flex items-center gap-1">
                <span>⭐</span> تقييم المندوب
              </div>
              <div className="font-black text-yellow-700">{courier.rating}</div>
            </div>
            
            <div className="mt-4 flex gap-2">
               <span className="badge bg-[#b68a3a]/10 text-[#b68a3a] text-[10px] font-black">حساب رقابي (مشرف)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
