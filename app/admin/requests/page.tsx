'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { STATUS_LABELS, DONOR_TYPE_LABELS, PRIORITY_LABELS, COURIERS } from '@/lib/mock-data';
import { getStatusColor, getPriorityColor, timeAgo } from '@/lib/utils';
import { DataService } from '@/lib/data-service';
import { RequestStatus, Courier, FoodRequest } from '@/lib/types';

const statusFilters: { key: string; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'new', label: 'جديد' },
  { key: 'reviewing', label: 'قيد المراجعة' },
  { key: 'accepted', label: 'تم القبول' },
  { key: 'pickup_assigned', label: 'تعيين مندوب' },
  { key: 'courier_on_way', label: 'في الطريق' },
  { key: 'picked_up', label: 'تم الاستلام' },
  { key: 'distributing', label: 'جاري التوزيع' },
  { key: 'completed', label: 'مكتمل' },
  { key: 'cancelled', label: 'ملغي' },
];

export default function RequestsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null);
  const [selectedCourier, setSelectedCourier] = useState('');
  const [couriers, setCouriers] = useState<Courier[]>(COURIERS);
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for new manual request
  const [newReq, setNewReq] = useState({
    donorName: '', donorType: '', phone: '',
    district: '', googleMapsLink: '',
    pickupTime: '',
    assignedCourierId: ''
  });

  const fetchInitialData = async () => {
    const data = await DataService.getRequests();
    setRequests(data);
  };

  useEffect(() => {
    // 1. Fetch initial data from Supabase
    fetchInitialData();

    // 2. Real-time Subscription
    const subscription = DataService.subscribeToRequests((payload) => {
      // Refresh list on any DB change
      fetchInitialData();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAssignCourier = async () => {
    if (!showAssignModal) return;
    
    const selectedCourierObj = couriers.find(c => c.id === selectedCourier);
    
    try {
      await DataService.updateRequestStatus(showAssignModal, {
        currentStatus: 'pickup_assigned' as any,
        pickupCourierId: selectedCourier,
        pickupCourierName: selectedCourierObj?.name,
      });
      
      setShowAssignModal(null);
      showToast('✅ تم تعيين المندوب بنجاح');
    } catch (e: any) {
      alert('خطأ في تعيين المندوب: ' + (e.message || 'فشل الاتصال بقاعدة البيانات'));
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleAddRequest = async () => {
    if (!newReq.donorName || !newReq.phone) {
      alert('يرجى ملء البيانات الأساسية');
      return;
    }

    setIsSubmitting(true);
    const selectedCourierObj = couriers.find(c => c.id === newReq.assignedCourierId);

    const newRequest: any = {
      requestNumber: 'NM-MAN-' + (Math.floor(Math.random() * 900) + 100),
      donorName: newReq.donorName,
      donorType: newReq.donorType as any || 'other',
      phone: newReq.phone,
      district: newReq.district,
      googleMapsLink: newReq.googleMapsLink,
      pickupTime: newReq.pickupTime,
      currentStatus: newReq.assignedCourierId ? 'pickup_assigned' : 'new',
      priorityLevel: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pickupCourierId: newReq.assignedCourierId || undefined,
      pickupCourierName: selectedCourierObj?.name || undefined,
    };

    try {
      await DataService.addRequest(newRequest);
      
      setShowAddModal(false);
      setIsSubmitting(false);
      setNewReq({
        donorName: '', donorType: '', phone: '',
        district: '', googleMapsLink: '',
        pickupTime: '',
        assignedCourierId: ''
      });
      showToast('✅ تم إضافة الطلب وإسناده بنجاح');
    } catch (e: any) {
      setIsSubmitting(false);
      alert('خطأ في إضافة الطلب: ' + (e.message || 'فشل الاتصال بقاعدة البيانات'));
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا الطلب؟')) return;
    
    try {
      await DataService.deleteRequest(id);
      showToast('🗑️ تم حذف الطلب بنجاح');
    } catch (e: any) {
      alert('خطأ في حذف الطلب: ' + (e.message || 'فشل الاتصال بقاعدة البيانات'));
    }
  };

  const clearAllData = async () => {
    if (window.confirm('⚠️ هل أنت متأكد من حذف كافة البيانات والبدء من جديد؟')) {
      try {
        await DataService.deleteAllRequests();
        showToast('🗑️ تم مسح كافة البيانات');
      } catch (e) {
        alert('حدث خطأ أثناء مسح البيانات');
      }
    }
  };

  const filtered = requests.filter(r => {
    const matchStatus = statusFilter === 'all' || r.currentStatus === statusFilter;
    const matchPriority = priorityFilter === 'all' || r.priorityLevel === priorityFilter;
    const matchSearch = !search || 
      (r.donorName?.includes(search)) || 
      (r.requestNumber?.includes(search)) || 
      (r.district?.includes(search));
    return matchStatus && matchPriority && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in" style={{ direction: 'rtl' }}>
      {toast && <div className="toast toast-success">{toast}</div>}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">📋 إدارة الطلبات</h1>
          <p className="text-gray-500 mt-1">منصة جمعية قوت - {filtered.length} طلب من أصل {requests.length}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={clearAllData} className="btn-ghost text-red-600 border-red-100 hover:bg-red-50 py-2 px-4 text-sm">🗑️ مسح الكل</button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary">+ إنشاء طلب وإسناد</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-5 space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <input className="form-input max-w-xs" placeholder="🔍 بحث بالاسم أو رقم الطلب أو الحي..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <select className="form-input max-w-40" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option value="all">كل الأولويات</option>
            <option value="urgent">عاجل</option>
            <option value="medium">متوسطة</option>
            <option value="low">منخفضة</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          {statusFilters.map(f => (
            <button key={f.key} onClick={() => setStatusFilter(f.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${
                statusFilter === f.key
                  ? 'bg-[#2f5d2f] text-white border-[#2f5d2f] shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#2f5d2f]/30 hover:text-[#2f5d2f]'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card-flat overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>رقم الطلب</th>
                <th>المكان</th>
                <th>النوع</th>
                <th>الحي</th>
                <th>رقم الجوال</th>
                <th>وقت الاستلام</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(req => (
                <tr key={req.id}>
                  <td>
                    <Link href={`/admin/requests/${req.id}`}
                      className="font-mono font-bold text-[#2f5d2f] hover:underline text-sm">
                      {req.requestNumber}
                    </Link>
                  </td>
                  <td>
                    <div className="font-semibold text-gray-800 max-w-40 truncate">{req.donorName}</div>
                    {req.pickupCourierName && <div className="text-[10px] text-[#6dbe45] font-bold">👤 المندوب: {req.pickupCourierName}</div>}
                  </td>
                  <td className="text-sm text-gray-600">{DONOR_TYPE_LABELS[req.donorType] || '—'}</td>
                  <td className="text-sm text-gray-700">{req.district}</td>
                  <td className="text-sm font-mono">{req.phone}</td>
                  <td className="text-sm">{req.pickupTime}</td>
                  <td><span className={`badge ${getStatusColor(req.currentStatus)}`}>{STATUS_LABELS[req.currentStatus]}</span></td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/requests/${req.id}`}
                        className="p-1.5 rounded-lg bg-[#2f5d2f]/5 text-[#2f5d2f] hover:bg-[#2f5d2f]/10 transition text-xs font-medium">
                        📄 تفاصيل
                      </Link>
                      <button onClick={() => handleDeleteRequest(req.id)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition text-xs font-medium">
                        🗑️ حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-6xl mb-3">📭</div>
            <div className="font-semibold">لا توجد طلبات تطابق الفلتر</div>
          </div>
        )}
      </div>

      {/* Add Request Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-gray-900 italic">✨ إنشاء طلب وإسناد سريع</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
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
                <label className="text-xs font-bold text-gray-500 mr-1">الحي</label>
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

              <div className="md:col-span-2 mt-4 pt-6 border-t border-gray-100">
                <label className="text-sm font-black text-green-700 block mb-3">👤 إسناد لمندوب (اختياري)</label>
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

            <div className="flex gap-4 mt-8">
              <button disabled={isSubmitting} onClick={() => setShowAddModal(false)} className="btn-ghost flex-1 py-4">إلغاء</button>
              <button onClick={handleAddRequest} disabled={isSubmitting} className={`btn-primary flex-1 justify-center py-4 text-lg ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {isSubmitting ? '⏳ جاري الحفظ...' : '🚀 حفظ وإرسال الطلب'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal (Existing) */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-scale-in">
            <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-3xl">🚗</span> تعيين مندوب للطلب
            </h3>
            
            <div className="space-y-4 mb-8">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 mr-1">اختر المندوب الميداني</label>
                <select 
                  className="form-input border-2 border-gray-100 focus:border-green-500" 
                  value={selectedCourier} 
                  onChange={e => setSelectedCourier(e.target.value)}
                >
                  <option value="">-- اختر المندوب --</option>
                  {couriers.filter(c => c.availabilityStatus !== 'unavailable').map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.district} ({c.completedTasks} مهمة)
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedCourier && (
                <div className="p-4 bg-green-50 rounded-2xl border border-green-100 text-sm text-green-800 animate-fade-in">
                  💡 سيتم إرسال إشعار فوري للمندوب لبدء المهمة.
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowAssignModal(null)} className="btn-ghost flex-1 py-3 text-sm">تراجع</button>
              <button 
                onClick={handleAssignCourier} 
                className={`btn-primary flex-1 justify-center py-3 text-sm ${!selectedCourier ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!selectedCourier}
              >
                تأكيد التعيين
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
