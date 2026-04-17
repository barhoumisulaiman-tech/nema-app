'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { STATS, FOOD_REQUESTS, COURIERS, STATUS_LABELS, DONOR_TYPE_LABELS, PRIORITY_LABELS, BENEFICIARY_FAMILIES } from '@/lib/mock-data';
import { getStatusColor, getPriorityColor, formatDate, timeAgo } from '@/lib/utils';
import { Courier, FoodRequest } from '@/lib/types';
import { DataService } from '@/lib/data-service';

export default function AdminDashboard() {
  const [couriers, setCouriers] = useState<Courier[]>(COURIERS);
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('أ. حسان');
  
  // Add Request Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addStage, setAddStage] = useState<'select' | 'pickup' | 'distribution'>('select');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState('');
  const [newReq, setNewReq] = useState({
    donorName: '', donorType: '', phone: '',
    district: '', googleMapsLink: '',
    pickupTime: '', notes: '',
    assignedCourierId: '', selectedFamilyId: ''
  });

  useEffect(() => {
    // 1. Fetch role and name
    const role = localStorage.getItem('nema_user_role') || 'admin';
    const name = localStorage.getItem('nema_user_name') || (role === 'admin' ? 'أ. حسان' : 'المشرف');
    setUserRole(role);
    setUserName(name);

    // 2. Fetch initial data from Supabase
    const fetchInitialData = async () => {
      const data = await DataService.getRequests();
      setRequests(data);
    };

    fetchInitialData();

    // Real-time Subscription
    const subscription = DataService.subscribeToRequests(() => {
      fetchInitialData();
    });

    // Load and reflect exact courier status
    const savedCourierStatus = localStorage.getItem('nema_courier_status_c1');
    if (savedCourierStatus) {
      setCouriers(prev => prev.map(c => 
        c.id === 'c1' ? { ...c, availabilityStatus: savedCourierStatus as any } : c
      ));
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const recentRequests = requests.slice(0, 5);
  const availableCouriersCount = couriers.filter(c => c.availabilityStatus === 'available').length;

  const statCards = [
    { label: 'إجمالي البلاغات', value: requests.length, icon: '📋', color: '#b68a3a', bg: '#fffbeb', change: '+12 هذا الأسبوع' },
    { label: 'بلاغات جديدة', value: requests.filter(r => r.currentStatus === 'new').length, icon: '🆕', color: '#2f5d2f', bg: '#f1f5f9', change: 'تحتاج مراجعة' },
    { label: 'قيد التنفيذ', value: requests.filter(r => !['completed', 'cancelled', 'new'].includes(r.currentStatus)).length, icon: '⚡', color: '#d79a2b', bg: '#fef3c7', change: 'نشطة الآن' },
    { label: 'مكتملة', value: requests.filter(r => r.currentStatus === 'completed').length, icon: '✅', color: '#6dbe45', bg: '#f0fdf4', change: '+8 اليوم' },
    { label: 'مناديب متاحون', value: availableCouriersCount, icon: '🚗', color: '#2f5d2f', bg: '#f1f5f9', change: `من أصل ${couriers.length}` },
    { label: 'أسر مستفيدة', value: STATS.totalFamilies, icon: '👨‍👩‍👧‍👦', color: '#b68a3a', bg: '#fdf4ff', change: 'مسجلة في النظام' },
    { label: 'وجبات منقذة', value: STATS.totalMealsSaved.toLocaleString('ar'), icon: '🍽️', color: '#6dbe45', bg: '#f0fdf4', change: 'منذ بداية العمل' },
    { label: 'وقت الاستجابة', value: `${STATS.avgResponseTimeMinutes} د`, icon: '⏱️', color: '#ef4444', bg: '#fef2f2', change: 'متوسط الاستجابة' },
  ];

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleAddRequestClick = (e: any) => {
    e.preventDefault();
    setAddStage('select');
    setShowAddModal(true);
  };

  const handleAddRequest = async () => {
    if (userRole !== 'admin') return;
    if (addStage === 'pickup' && (!newReq.donorName || !newReq.phone)) {
      alert('يرجى ملء البيانات الأساسية للاستلام');
      return;
    }
    if (addStage === 'distribution' && !newReq.selectedFamilyId) {
      alert('يرجى اختيار الأسرة المستفيدة');
      return;
    }

    setIsSubmitting(true);
    const selectedCourierObj = couriers.find(c => c.id === newReq.assignedCourierId);
    const selectedFamily = BENEFICIARY_FAMILIES.find(f => f.id === newReq.selectedFamilyId);

    const newRequest: any = {
      id: Math.random().toString(36).substr(2, 9),
      requestNumber: `NM-${addStage === 'pickup' ? 'PCK' : 'DST'}-` + (Math.floor(Math.random() * 900) + 100),
      donorName: addStage === 'pickup' ? newReq.donorName : 'توزيع لأسر متعففة',
      donorType: addStage === 'pickup' ? (newReq.donorType as any || 'other') : 'other',
      phone: addStage === 'pickup' ? newReq.phone : '—',
      district: addStage === 'pickup' ? newReq.district : (selectedFamily?.district || '—'),
      googleMapsLink: addStage === 'pickup' ? newReq.googleMapsLink : '',
      pickupTime: addStage === 'pickup' ? newReq.pickupTime : newReq.notes || 'توزيع مباشر',
      currentStatus: addStage === 'pickup' 
        ? (newReq.assignedCourierId ? 'pickup_assigned' : 'new')
        : 'distribution_assigned',
      priorityLevel: addStage === 'pickup' ? 'medium' : (selectedFamily?.priorityLevel || 'medium'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pickupCourierId: addStage === 'pickup' ? (newReq.assignedCourierId || undefined) : undefined,
      pickupCourierName: addStage === 'pickup' ? (selectedCourierObj?.name || undefined) : undefined,
      distributionCourierId: addStage === 'distribution' ? (newReq.assignedCourierId || undefined) : undefined,
      distributionCourierName: addStage === 'distribution' ? (selectedCourierObj?.name || undefined) : undefined,
      assignedFamilies: addStage === 'distribution' ? [newReq.selectedFamilyId] : undefined,
    };

    try {
      await DataService.addRequest(newRequest);
      
      setShowAddModal(false);
      setIsSubmitting(false);
      setNewReq({
        donorName: '', donorType: '', phone: '',
        district: '', googleMapsLink: '',
        pickupTime: '', notes: '',
        assignedCourierId: '', selectedFamilyId: ''
      });
      setAddStage('select');
      showToastMsg('✅ تم إنشاء الطلب بنجاح');
    } catch (e: any) {
      setIsSubmitting(false);
      alert('خطأ في إضافة الطلب: ' + (e.message || 'فشل الاتصال بقاعدة البيانات'));
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" style={{ direction: 'rtl' }}>
      {toast && <div className="toast toast-success">{toast}</div>}
      
      {/* Welcome */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">مرحباً، {userName} 👋</h1>
          <p className="text-gray-500 mt-1">هنا ملخص عمليات جمعية قوت اليوم</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-400 bg-white border rounded-xl px-4 py-2">
            📅 {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', calendar: 'gregory' })}
          </div>
          {userRole === 'admin' && (
            <Link href="/admin/requests" className="btn-primary py-2 px-5 text-sm">عرض كل الطلبات</Link>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="stat-card animate-count" style={{ animationDelay: `${i * 0.05}s` }}>
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
            <Link href="/admin/requests" className="text-[#6dbe45] hover:text-[#2f5d2f] text-sm font-black">عرض الكل →</Link>
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
                  <tr key={req.id} className="cursor-pointer" onClick={() => window.location.href=`/admin/requests/${req.id}`}>
                    <td><span className="font-mono text-sm font-bold text-primary">{req.requestNumber}</span></td>
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
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-700 text-sm flex-shrink-0">
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
            <Link href="/admin/couriers" className="btn-ghost w-full justify-center text-sm mt-2">إدارة المناديب</Link>
          </div>
        </div>
      </div>

      {/* Quick Actions - Hidden for Supervisor */}
      {userRole === 'admin' && (
        <div className="card p-6">
          <h2 className="font-black text-gray-900 text-lg mb-5">⚡ إجراءات سريعة</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'طلب جديد', icon: '➕', href: '/admin/requests?add=true', color: '#6dbe45' },
              { label: 'تعيين مندوب', icon: '👷', href: '/admin/requests', color: '#b68a3a' },
              { label: 'إضافة أسرة', icon: '🏡', href: '/admin/families', color: '#2f5d2f' },
              { label: 'عرض التقارير', icon: '📊', href: '/admin/reports', color: '#d79a2b' },
            ].map((action, i) => (
              action.label === 'طلب جديد' ? (
                <button key={i} onClick={handleAddRequestClick}
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-dashed border-gray-200 hover:border-current hover:bg-gray-50 transition-all text-center w-full"
                  style={{ color: action.color }}>
                  <div className="text-4xl">{action.icon}</div>
                  <div className="font-bold text-sm">{action.label}</div>
                </button>
              ) : (
                <Link key={i} href={action.href}
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-dashed border-gray-200 hover:border-current hover:bg-gray-50 transition-all text-center"
                  style={{ color: action.color }}>
                  <div className="text-4xl">{action.icon}</div>
                  <div className="font-bold text-sm">{action.label}</div>
                </Link>
              )
            ))}
          </div>
        </div>
      )}

      {/* Urgent Alert */}
      {requests.filter(r => r.priorityLevel === 'urgent' && r.currentStatus !== 'completed').length > 0 && (
        <div className="border-2 border-red-200 bg-red-50 rounded-2xl p-5 flex items-start gap-4">
          <div className="text-3xl">🚨</div>
          <div>
            <div className="font-black text-red-800 text-lg">تنبيه: طلبات عاجلة تحتاج متابعة فورية</div>
            <div className="text-red-600 text-sm mt-1">
              {requests.filter(r => r.priorityLevel === 'urgent' && r.currentStatus !== 'completed').length} طلب عاجل يحتاج استجابة سريعة
            </div>
            <Link href="/admin/requests" className="btn-danger mt-3 inline-flex items-center gap-2 text-sm">
              عرض الطلبات العاجلة ←
            </Link>
          </div>
        </div>
      )}

      {/* Add Request Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-gray-900 italic">
                {addStage === 'select' ? '✨ اختر نوع الطلب' : 
                 addStage === 'pickup' ? '🚗 إنشاء طلب استلام (Pickup)' : 
                 '🏡 إنشاء طلب تسليم لأسر (Delivery)'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            {addStage === 'select' && (
              <div className="grid md:grid-cols-2 gap-6 py-4">
                <button 
                  onClick={() => setAddStage('pickup')}
                  className="p-8 rounded-[2rem] border-2 border-dashed border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all text-center group"
                >
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🍗</div>
                  <div className="text-xl font-black text-gray-900 mb-2">استلام طلب</div>
                  <p className="text-sm text-gray-500">اسم المكان والموقع وبقية التفاصيل</p>
                </button>

                <button 
                  onClick={() => setAddStage('distribution')}
                  className="p-8 rounded-[2rem] border-2 border-dashed border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-center group"
                >
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🏡</div>
                  <div className="text-xl font-black text-gray-900 mb-2">تسليم طلب للأسر المتعففة</div>
                  <p className="text-sm text-gray-500">بيانات تخص الأسر المتعففة المسجلة</p>
                </button>
              </div>
            )}

            {(addStage === 'pickup' || addStage === 'distribution') && (
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
                {addStage === 'pickup' ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 mr-1">اسم المكان *</label>
                      <input className="form-input" value={newReq.donorName} onChange={e => setNewReq({...newReq, donorName: e.target.value})} placeholder="مثال: قاعة السعادة" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 mr-1">نوع المكان</label>
                      <select className="form-input" value={newReq.donorType} onChange={e => setNewReq({...newReq, donorType: e.target.value})}>
                        <option value="">اختر النوع</option>
                        {Object.entries(DONOR_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 mr-1">الموقع / الحي</label>
                      <input className="form-input" value={newReq.district} onChange={e => setNewReq({...newReq, district: e.target.value})} placeholder="الحي" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 mr-1">رقم الجوال *</label>
                      <input className="form-input font-mono" value={newReq.phone} onChange={e => setNewReq({...newReq, phone: e.target.value})} placeholder="05XXXXXXXX" dir="ltr" />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-gray-500 mr-1">وقت استلام الأكل *</label>
                      <input className="form-input border-green-100 bg-green-50/20" value={newReq.pickupTime} onChange={e => setNewReq({...newReq, pickupTime: e.target.value})} placeholder="مثلاً: 9:30 مساءً" />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-gray-500 mr-1">رابط قوقل ماب</label>
                      <input className="form-input font-mono text-xs" value={newReq.googleMapsLink} onChange={e => setNewReq({...newReq, googleMapsLink: e.target.value})} placeholder="https://maps.google.com/..." dir="ltr" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-gray-500 mr-1">اختر الأسرة المتعففة *</label>
                      <select 
                        className="form-input bg-blue-50/50 border-blue-100" 
                        value={newReq.selectedFamilyId} 
                        onChange={e => setNewReq({...newReq, selectedFamilyId: e.target.value})}
                      >
                        <option value="">-- اختر الأسرة --</option>
                        {BENEFICIARY_FAMILIES.map(f => (
                          <option key={f.id} value={f.id}>
                            {f.familyName} ({f.district}) - {f.familySize} أفراد
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-gray-500 mr-1">بيانات التسليم والملاحظات</label>
                      <textarea 
                        className="form-input h-24 resize-none" 
                        placeholder="ماذا سيتم توزيعه للأسر المتعففة؟ (مثال: 5 وجبات أرز مع دجاج)"
                        value={newReq.notes}
                        onChange={e => setNewReq({...newReq, notes: e.target.value})}
                      />
                    </div>
                  </>
                )}

                <div className="md:col-span-2 mt-4 pt-6 border-t border-gray-100">
                  <label className="text-sm font-black text-green-700 block mb-3">
                    👤 تخصيص مندوب {addStage === 'pickup' ? 'الاستلام' : 'التوصيل'} (اختياري)
                  </label>
                  <select 
                    className="form-input bg-green-50/50 border-green-100" 
                    value={newReq.assignedCourierId} 
                    onChange={e => setNewReq({...newReq, assignedCourierId: e.target.value})}
                  >
                    <option value="">-- بدون إسناد حالياً --</option>
                    {couriers.filter(c => c.availabilityStatus !== 'unavailable').map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.district}) - {c.availabilityStatus === 'available' ? '✅ متاح' : '🕔 مشغول'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-8">
              {addStage !== 'select' ? (
                <>
                  <button onClick={() => setAddStage('select')} className="btn-ghost flex-1 py-4">رجوع للنوع</button>
                  <button onClick={handleAddRequest} disabled={isSubmitting} className={`btn-primary flex-1 justify-center py-4 text-lg ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {isSubmitting ? '⏳ جاري الحفظ...' : '🚀 حفظ الطلب'}
                  </button>
                </>
              ) : (
                <button onClick={() => setShowAddModal(false)} className="btn-ghost w-full py-4 text-lg">إلغاء</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
