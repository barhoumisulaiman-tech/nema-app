'use client';
import { useState, useEffect } from 'react';
import { FOOD_REQUESTS, COURIERS } from '@/lib/mock-data';
import { FoodRequest } from '@/lib/types';
import { DataService } from '@/lib/data-service';

export default function ReportsPage() {
  const [period, setPeriod] = useState('week');
  const [toast, setToast] = useState('');
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    const fetchData = async () => {
      const data = await DataService.getRequests();
      setRequests(data);
    };
    fetchData();
  }, []);

  // --- Dynamic Calculations ---
  
  // 1. Weekly Data Construction
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const weeklyData = days.map(day => {
    const dayRequests = requests.filter(r => {
      const d = new Date(r.createdAt);
      return days[d.getDay()] === day;
    });
    return {
      day,
      requests: dayRequests.length,
      meals: dayRequests.length * 20, // Estimate: 20 meals per request
      families: dayRequests.filter(r => r.currentStatus === 'completed').length * 2 // Estimate 2 families per completed request
    };
  });

  const maxRequests = Math.max(...weeklyData.map(d => d.requests), 1);

  // 2. Top Districts
  const districtsMap: Record<string, number> = {};
  requests.forEach(r => {
    if (r.district) districtsMap[r.district] = (districtsMap[r.district] || 0) + 1;
  });
  const topDistricts = Object.entries(districtsMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      requests: count,
      pct: requests.length > 0 ? (count / requests.length) * 100 : 0
    }));

  // 3. Courier Performance
  const courierPerf = COURIERS.map(c => {
    const courierRequests = requests.filter(r => r.pickupCourierId === c.id);
    const completed = courierRequests.filter(r => r.currentStatus === 'completed').length;
    return {
      name: c.name,
      completed: completed, // Show ONLY real results from user's current requests
      rating: c.rating,
      avgTime: c.avgResponseTime,
    };
  });

  // 4. Donor Types
  const typeLabels: Record<string, string> = {
    wedding_hall: 'قاعات أفراح',
    restaurant: 'مطاعم',
    rest_house: 'استراحات',
    hotel: 'فنادق',
    event: 'مناسبات',
    home: 'منازل',
    other: 'أخرى'
  };
  const typeIcons: Record<string, string> = {
    wedding_hall: '💒', restaurant: '🍽️', rest_house: '🏡', hotel: '🏨', event: '🎉', home: '🏠', other: '🏢'
  };
  
  const donorTypes = Object.entries(typeLabels).map(([key, label]) => {
    const count = requests.filter(r => r.donorType === key).length;
    return {
      label,
      count,
      icon: typeIcons[key] || '🏢',
      pct: requests.length > 0 ? Math.round((count / requests.length) * 100) : 0
    };
  });

  // KPIs
  const totalRequests = requests.length;
  const totalMeals = requests.length * 20;
  const completedCount = requests.filter(r => r.currentStatus === 'completed').length;
  const completionRate = totalRequests > 0 ? Math.round((completedCount / totalRequests) * 100) : 0;
  const totalFamilies = requests.filter(r => r.currentStatus === 'completed').length * 2;

  return (
    <div className="space-y-6 animate-fade-in" style={{ direction: 'rtl' }}>
      {toast && <div className="toast toast-success">{toast}</div>}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">📊 التقارير والإحصائيات</h1>
          <p className="text-gray-500 mt-1">بيانات حية بناءً على الطلبات الـ {requests.length} الفعلية</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-white rounded-xl border border-gray-200 overflow-hidden">
            {[['week','أسبوعي'],['month','شهري'],['year','سنوي']].map(([k,l]) => (
              <button key={k} onClick={() => setPeriod(k)}
                className={`px-4 py-2 text-sm font-semibold transition-all ${period === k ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>{l}</button>
            ))}
          </div>
          <button onClick={() => showToast('📥 جاري تصدير التقرير...')} className="btn-primary py-2 px-4 text-sm">📥 تصدير</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الطلبات', value: totalRequests, icon: '📋', color: '#16a34a', change: 'بناءً على طلباتك' },
          { label: 'تقدير الوجبات', value: totalMeals.toLocaleString('ar'), icon: '🍽️', color: '#d97706', change: `~20 وجبة/طلب` },
          { label: 'أسر مستفيدة', value: totalFamilies, icon: '🏡', color: '#0891b2', change: 'تقديري' },
          { label: 'نسبة الإنجاز', value: `${completionRate}%`, icon: '✅', color: '#7c3aed', change: `${completedCount} طلب مكتمل` },
        ].map((kpi, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="text-3xl">{kpi.icon}</div>
              <div className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">{kpi.change}</div>
            </div>
            <div className="text-3xl font-black mb-1" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="text-gray-500 text-sm">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Bar Chart */}
        <div className="card p-6">
          <h2 className="font-black text-gray-900 text-lg mb-6">📈 الطلبات حسب أيام الأسبوع</h2>
          <div className="flex items-end justify-between gap-2 h-48">
            {weeklyData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs font-bold text-green-600">{d.requests > 0 ? d.requests : ''}</div>
                <div className="w-full rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                  style={{
                    height: `${d.requests > 0 ? (d.requests / maxRequests) * 160 : 4}px`,
                    background: d.requests > 0 ? `linear-gradient(to top, #16a34a, #4ade80)` : '#f3f4f6',
                  }}
                  title={`${d.requests} طلبات`}
                />
                <div className="text-[10px] text-gray-400 font-medium rotate-[-45deg] lg:rotate-0 mt-2">{d.day.slice(0,3)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Meals Trend */}
        <div className="card p-6">
          <h2 className="font-black text-gray-900 text-lg mb-6">🍽️ الوجبات المنقذة (تقديري)</h2>
          <div className="space-y-3">
            {weeklyData.map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-16 text-sm font-medium text-gray-600 text-right">{d.day}</div>
                <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full flex items-center justify-end px-3 text-white text-xs font-bold transition-all"
                    style={{ 
                      width: `${d.meals > 0 ? Math.max((d.meals / (maxRequests * 20)) * 100, 5) : 0}%`, 
                      background: 'linear-gradient(90deg, #d97706, #f59e0b)' 
                    }}>
                    {d.meals > 0 ? d.meals : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Districts */}
        <div className="card p-6">
          <h2 className="font-black text-gray-900 text-lg mb-6">📍 توزيع الطلبات حسب الأحياء</h2>
          <div className="space-y-4">
            {topDistricts.length > 0 ? topDistricts.map((d, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <div className="font-semibold text-gray-700">
                    <span className="text-gray-400 ml-2">#{i + 1}</span>
                    حي {d.name}
                  </div>
                  <span className="font-bold text-green-600">{d.requests} طلب</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${d.pct}%`, background: `hsl(${142 - i * 15}, 70%, ${45 + i * 3}%)` }} />
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-gray-400 italic">لا توجد بيانات للأحياء بعد</div>
            )}
          </div>
        </div>

        {/* Courier Performance */}
        <div className="card p-6">
          <h2 className="font-black text-gray-900 text-lg mb-6">🚗 أداء المناديب في طلباتك</h2>
          <div className="space-y-4">
            {courierPerf.sort((a,b) => b.completed - a.completed).map((c, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {i + 1}
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-700 flex-shrink-0">
                  {c.name[0]}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-800">{c.name}</div>
                  <div className="text-xs text-gray-400">مناديب نشطون</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-green-600">{c.completed}</div>
                  <div className="text-xs text-gray-400">مهمة</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Donor Types Breakdown */}
      <div className="card p-6">
        <h2 className="font-black text-gray-900 text-lg mb-6">🏢 تصنيف الجهات المتبرعة</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {donorTypes.map((type, i) => (
            <div key={i} className={`text-center p-4 rounded-2xl transition-all ${type.count > 0 ? 'bg-green-50 border border-green-100' : 'bg-gray-50 opacity-60'}`}>
              <div className="text-3xl mb-2">{type.icon}</div>
              <div className="font-black text-2xl text-gray-800 mb-1">{type.count}</div>
              <div className="text-[10px] text-gray-500 font-medium">{type.label}</div>
              <div className="mt-2 text-[10px] text-green-600 font-bold">{type.pct}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="card p-6 border-2 border-green-100" style={{ background: 'linear-gradient(135deg, #f0fdf4, #fff)' }}>
        <h2 className="font-black text-gray-900 text-lg mb-4">💡 ملخص النشاط الفعلي</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white rounded-xl p-4 border border-green-100">
            <div className="text-green-600 font-bold mb-2">📊 حالة التنفيذ</div>
            <div className="text-gray-700">لقد تم إنجاز {completedCount} بنجاح من أصل {totalRequests} طلبات قمت بإنشائها.</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-green-100">
            <div className="text-blue-600 font-bold mb-2">📍 التركيز الجغرافي</div>
            <div className="text-gray-700">تتركز نشاطاتك الحالية في حي {topDistricts[0]?.name || 'غير محدد'} بنسبة {Math.round(topDistricts[0]?.pct || 0)}%.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
