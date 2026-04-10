'use client';
import Link from 'next/link';
import { useState, useEffect, use } from 'react';
import { FOOD_REQUESTS, ACTIVITY_LOGS, COURIERS, BENEFICIARY_FAMILIES, STATUS_LABELS, DONOR_TYPE_LABELS, PRIORITY_LABELS } from '@/lib/mock-data';
import { getStatusColor, getPriorityColor, getStatusProgress } from '@/lib/utils';
import { Courier, FoodRequest } from '@/lib/types';
import { DataService } from '@/lib/data-service';

const statusOrder = ['new','reviewing','accepted','pickup_assigned','courier_on_way','picked_up','sorting','distribution_assigned','distributing','distributed','completed'];

export default function RequestDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const [request, setRequest] = useState<FoodRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [toast, setToast] = useState('');
  const [couriers, setCouriers] = useState<Courier[]>(COURIERS);

  const fetchRequest = async () => {
    const data = await DataService.getRequestById(params.id);
    if (data) {
      setRequest(data);
    } else {
      // Fallback to static if not in DB (for backward compatibility during migration)
      const staticReq = FOOD_REQUESTS.find(r => r.id === params.id);
      setRequest(staticReq || null);
    }
    setLoading(false);
  };

  useEffect(() => {
    // 1. Initial Fetch
    fetchRequest();

    // 2. Real-time Subscription for this specific request
    const subscription = DataService.subscribeToRequests((payload) => {
      if (payload.new && payload.new.id === params.id) {
        setRequest(payload.new as FoodRequest);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [params.id]);

  if (loading) return <div className="p-10 text-center text-gray-500">جاري التحميل...</div>;

  if (!request) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">😔</div>
        <div className="text-xl font-bold">الطلب غير موجود</div>
        <Link href="/admin/requests" className="btn-primary mt-5 inline-flex">← العودة للطلبات</Link>
      </div>
    );
  }

  const logs = ACTIVITY_LOGS.filter(l => l.foodRequestId === request.id);
  const progress = getStatusProgress(request.currentStatus);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const refreshAI = async () => {
    setAiLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setAiLoading(false);
    showToast('✅ تم تحديث توصيات الذكاء الاصطناعي');
  };

  const aiRecommendation = {
    priority: request.priorityLevel,
    priorityReason: 'تم تحديد الأولوية بناءً على نوع الموقع وتوقيت البلاغ',
    suggestedPickupCourier: 'محمد العمري',
    suggestedPickupCourierReason: 'الأقرب جغرافياً · 127 مهمة مكتملة · تقييم 4.9',
    suggestedDistributionCourier: 'خالد الزهراني',
    suggestedDistributionCourierReason: 'متخصص في التوزيع · يغطي نفس النطاق الجغرافي',
    timeNote: `يُفضل إتمام الاستلام في التوقيت المحدد من قبل المتبرع: ${request.pickupTime}`,
    courierMessage: `مرحباً محمد، لديك مهمة استلام فائض طعام من ${request.donorName} بحي ${request.district}. يرجى محاولة الوصول في تمام ${request.pickupTime} وتحديث الحالة فور الاستلام.`,
  };

  return (
    <div className="space-y-6 animate-fade-in" style={{ direction: 'rtl' }}>
      {/* Toast */}
      {toast && <div className="toast toast-success">{toast}</div>}

      {/* Back + Header */}
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/admin/requests" className="btn-ghost py-2 px-4 text-sm">← الطلبات</Link>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black text-gray-900">{request.requestNumber}</h1>
            <span className={`badge ${getStatusColor(request.currentStatus)}`}>{STATUS_LABELS[request.currentStatus]}</span>
            <span className={`badge ${getPriorityColor(request.priorityLevel)}`}>{PRIORITY_LABELS[request.priorityLevel]}</span>
          </div>
          <p className="text-gray-500 mt-1">{request.donorName} · حي {request.district}</p>
        </div>
        <div className="flex gap-2">
          {typeof window !== 'undefined' && localStorage.getItem('nema_user_role') !== 'supervisor' && (
            <>
              <button onClick={() => showToast('✅ تم قبول الطلب')} className="btn-primary py-2 px-4 text-sm">✅ قبول</button>
              <button onClick={() => showToast('❌ تم رفض الطلب')} className="btn-danger py-2 px-4 text-sm">❌ رفض</button>
            </>
          )}
          <button onClick={() => window.print()} className="btn-ghost py-2 px-4 text-sm">🖨️ طباعة</button>
        </div>
      </div>

      {/* Progress */}
      <div className="card p-5">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>حالة تنفيذ الطلب</span>
          <span className="font-bold text-green-600">{progress}%</span>
          <span>مكتمل</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #16a34a, #059669)' }} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Donor Info */}
          <div className="card p-6">
            <h2 className="font-black text-gray-900 text-lg mb-5">📋 بيانات الجهة والمواعيد</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              {[
                { label: 'اسم المكان', value: request.donorName },
                { label: 'نوع المكان', value: DONOR_TYPE_LABELS[request.donorType] || 'أخرى' },
                { label: 'الحي', value: request.district },
                { label: 'رقم الجوال', value: request.phone },
                { label: 'وقت استلام الأكل', value: request.pickupTime },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3">
                  <div className="text-gray-400 text-xs mb-1">{item.label}</div>
                  <div className="font-semibold text-gray-800">{item.value}</div>
                </div>
              ))}
            </div>
            {request.googleMapsLink && (
              <div className="mt-4">
                <a href={request.googleMapsLink} target="_blank" rel="noreferrer" 
                   className="btn-secondary w-full justify-center text-sm py-2.5 flex items-center gap-2">
                  📍 فتح الموقع في قوقل ماب
                </a>
              </div>
            )}
          </div>

          {/* Couriers */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-gray-900 text-lg">👷 المناديب المعينون</h2>
              {typeof window !== 'undefined' && localStorage.getItem('nema_user_role') !== 'supervisor' && (
                <button onClick={() => setShowAssign(!showAssign)} className="btn-secondary py-2 px-4 text-sm">
                  تعيين مندوب +
                </button>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`rounded-2xl border-2 p-4 ${request.pickupCourierName ? 'border-green-200 bg-green-50' : 'border-dashed border-gray-200'}`}>
                <div className="text-xs font-bold text-gray-400 mb-3">مندوب الاستلام</div>
                {request.pickupCourierName ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">{request.pickupCourierName[0]}</div>
                    <div>
                      <div className="font-bold text-gray-800">{request.pickupCourierName}</div>
                      <div className="text-xs text-green-600">مكلف بالاستلام</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-2">
                    <div className="text-2xl mb-2">🚗</div>
                    <div className="text-sm">لم يتم التعيين بعد</div>
                  </div>
                )}
              </div>
              <div className={`rounded-2xl border-2 p-4 ${request.distributionCourierName ? 'border-blue-200 bg-blue-50' : 'border-dashed border-gray-200'}`}>
                <div className="text-xs font-bold text-gray-400 mb-3">مندوب التوزيع</div>
                {request.distributionCourierName ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">{request.distributionCourierName[0]}</div>
                    <div>
                      <div className="font-bold text-gray-800">{request.distributionCourierName}</div>
                      <div className="text-xs text-blue-600">مكلف بالتوزيع</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-2">
                    <div className="text-2xl mb-2">🏡</div>
                    <div className="text-sm">لم يتم التعيين بعد</div>
                  </div>
                )}
              </div>
            </div>

            {showAssign && (
              <div className="mt-5 p-4 bg-gray-50 rounded-xl">
                <div className="font-bold text-gray-700 mb-3 text-sm">اختر مندوباً:</div>
                <div className="space-y-2">
                  {couriers.filter(c => c.availabilityStatus !== 'unavailable').map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm">{c.name[0]}</div>
                        <div>
                          <div className="font-semibold text-sm">{c.name}</div>
                          <div className="text-xs text-gray-400">{c.district} · ⭐{c.rating}</div>
                        </div>
                      </div>
                      <button onClick={() => { showToast(`✅ تم تعيين ${c.name}`); setShowAssign(false); }}
                        className="btn-primary py-1.5 px-3 text-xs">تعيين</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Photos/Attachments */}
          {request.images && request.images.length > 0 && (
            <div className="card p-6">
              <h2 className="font-black text-gray-900 text-lg mb-5">📸 صور مرفقة من الميدان</h2>
              <div className="grid grid-cols-2 lg:grid-cols-2 gap-6">
                {request.images.map((img, i) => (
                  <div key={i} className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col">
                    <div className="relative aspect-video group">
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <button 
                           onClick={() => window.open(img.url, '_blank')}
                           className="bg-white text-gray-900 px-4 py-2 rounded-xl text-xs font-bold shadow-lg"
                         >
                           توسيع 🔍
                         </button>
                      </div>
                    </div>
                    <div className="p-4 flex justify-between items-center">
                      <div>
                        <div className="text-sm font-black text-gray-900">{img.label}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">📅 {new Date(img.createdAt).toLocaleString('ar-SA')}</div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs">✅</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="card p-6">
            <h2 className="font-black text-gray-900 text-lg mb-6">📅 التسلسل الزمني للطلب</h2>
            <div className="space-y-6">
              {[
                { label: 'تم استلام الطلب', time: request.createdAt, icon: '📩', color: 'bg-green-500' },
                { label: 'تم قبول المهمة', time: request.acceptedAt, icon: '✅', color: 'bg-green-600' },
                { label: 'بدء المندوب بالتوجه', time: request.startedAt, icon: '🚗', color: 'bg-blue-500' },
                { label: 'وصل المندوب للموقع', time: request.arrivedAt, icon: '📍', color: 'bg-blue-600' },
                { label: 'اكتملت المهمة بنجاح', time: request.completedAt, icon: '🎉', color: 'bg-purple-600' },
              ].map((item, i) => (
                <div key={i} className={`flex gap-4 ${!item.time ? 'opacity-30 grayscale' : ''}`}>
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 ${item.color} rounded-full flex items-center justify-center text-white text-lg shadow-lg relative z-10`}>
                      {item.time ? '✓' : item.icon}
                    </div>
                    {i < 4 && <div className="w-0.5 h-full bg-gray-100 -mt-1 -mb-4"></div>}
                  </div>
                  <div className="pb-6">
                    <div className="font-black text-gray-800">{item.label}</div>
                    <div className="text-sm font-bold mt-1" style={{ color: item.time ? '#16a34a' : '#9ca3af' }}>
                      {item.time 
                        ? new Date(item.time).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
                        : 'في الانتظار...'}
                    </div>
                    {item.time && (
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(item.time).toLocaleDateString('ar-SA')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Sidebar */}
        <div className="space-y-5">
          {/* AI Recommendations */}
          <div className="ai-card">
            <div className="ai-card-header">
              <span className="text-2xl">🤖</span>
              مساعد حفظ النعمة الذكي
            </div>

            {aiLoading ? (
              <div className="space-y-3">
                {[1,2,3,4].map(i => <div key={i} className="skeleton h-12 w-full" />)}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-white rounded-xl p-3 border border-green-100">
                  <div className="text-xs text-gray-400 mb-1">🚨 أولوية الطلب</div>
                  <div className={`font-bold text-sm ${aiRecommendation.priority === 'urgent' ? 'text-red-600' : 'text-yellow-600'}`}>
                    {aiRecommendation.priority === 'urgent' ? 'عاجل' : aiRecommendation.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{aiRecommendation.priorityReason}</div>
                </div>

                <div className="bg-white rounded-xl p-3 border border-green-100">
                  <div className="text-xs text-gray-400 mb-1">🚗 أفضل مندوب للاستلام</div>
                  <div className="font-bold text-sm text-gray-800">{aiRecommendation.suggestedPickupCourier}</div>
                  <div className="text-xs text-gray-500 mt-1">{aiRecommendation.suggestedPickupCourierReason}</div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                  <div className="text-xs text-yellow-600 mb-1">⏰ ملاحظة ذكية</div>
                  <div className="text-sm text-yellow-800 font-medium">{aiRecommendation.timeNote}</div>
                </div>

                {/* Courier Message */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <div className="text-xs text-blue-600 mb-2">💬 رسالة المندوب المقترحة</div>
                  <div className="text-xs text-blue-800 leading-relaxed">{aiRecommendation.courierMessage}</div>
                  <button onClick={() => { navigator.clipboard.writeText(aiRecommendation.courierMessage); showToast('✅ تم نسخ الرسالة'); }}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-semibold">نسخ الرسالة →</button>
                </div>
              </div>
            )}

            <button onClick={refreshAI} disabled={aiLoading}
              className="mt-4 w-full btn-secondary py-2.5 text-sm justify-center">
              {aiLoading ? '⏳ جاري التحليل...' : '🔄 تحديث التوصيات'}
            </button>
          </div>

          {/* Assigned Families */}
          {request.assignedFamilies && request.assignedFamilies.length > 0 && (
            <div className="card p-5">
              <div className="font-bold text-gray-700 mb-4 text-sm">🏡 الأسر المستفيدة ({request.assignedFamilies.length})</div>
              <div className="space-y-2">
                {BENEFICIARY_FAMILIES.filter(f => request.assignedFamilies?.includes(f.id)).map(family => (
                  <div key={family.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="text-lg">🏠</div>
                    <div>
                      <div className="font-semibold text-sm text-gray-800">{family.familyName}</div>
                      <div className="text-xs text-gray-400">{family.familySize} أفراد · {family.district}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
