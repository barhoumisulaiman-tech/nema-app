'use client';
import Link from 'next/link';
import { useState, useEffect, use } from 'react';
import { ACTIVITY_LOGS, COURIERS, BENEFICIARY_FAMILIES, STATUS_LABELS, DONOR_TYPE_LABELS, PRIORITY_LABELS } from '@/lib/mock-data';
import { getStatusColor, getPriorityColor, getStatusProgress } from '@/lib/utils';
import { FoodRequest } from '@/lib/types';
import { DataService } from '@/lib/data-service';

export default function SupervisorRequestDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const [request, setRequest] = useState<FoodRequest | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRequest = async () => {
    const data = await DataService.getRequestById(params.id);
    setRequest(data || null);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequest();
    const subscription = DataService.subscribeToRequests((payload) => {
      if (payload.new && payload.new.id === params.id) {
        setRequest(payload.new as FoodRequest);
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [params.id]);

  if (loading) return <div className="p-10 text-center text-gray-500 italic">جاري تحميل بيانات الطلب...</div>;

  if (!request) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">😔</div>
        <div className="text-xl font-bold">الطلب غير موجود</div>
        <Link href="/supervisor/requests" className="btn-primary mt-5 inline-flex">← العودة للطلبات</Link>
      </div>
    );
  }

  const progress = getStatusProgress(request.currentStatus);

  const aiRecommendation = {
    priority: request.priorityLevel,
    priorityReason: 'تم تحديد الأولوية بناءً على نوع الموقع وتوقيت البلاغ (تحليل ذكاء اصطناعي)',
    suggestedPickupCourier: 'محمد العمري',
    suggestedPickupCourierReason: 'الأقرب جغرافياً بناءً على تتبع الحساسات',
    timeNote: `يُفضل إتمام الاستلام في التوقيت المحدد من قبل المتبرع: ${request.pickupTime}`,
    courierMessage: `مرحباً محمد، لديك مهمة استلام فائض طعام من ${request.donorName} بحي ${request.district}. يرجى محاولة الوصول في تمام ${request.pickupTime} وتحديث الحالة فور الاستلام.`,
  };

  return (
    <div className="space-y-6 animate-fade-in" style={{ direction: 'rtl' }}>
      {/* Back + Header */}
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/supervisor/requests" className="btn-ghost py-2 px-4 text-sm font-bold">← العودة للطلبات</Link>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black text-gray-900">{request.requestNumber}</h1>
            <span className={`badge ${getStatusColor(request.currentStatus)}`}>{STATUS_LABELS[request.currentStatus]}</span>
            <span className={`badge ${getPriorityColor(request.priorityLevel)}`}>{PRIORITY_LABELS[request.priorityLevel]}</span>
          </div>
          <p className="text-gray-500 mt-1">{request.donorName} · حي {request.district} (وضع الرقابة)</p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => window.print()} className="btn-ghost py-2 px-4 text-sm border-gray-200">🖨️ طباعة التقرير</button>
        </div>
      </div>

      {/* Progress */}
      <div className="card p-5 border-gray-100 shadow-sm transition-all hover:shadow-md">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>حالة تنفيذ الطلب الفعلي</span>
          <span className="font-bold text-[#b68a3a]">{progress}%</span>
          <span>مرحلة الإنجاز</span>
        </div>
        <div className="h-3 bg-gray-50 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #b68a3a, #d79a2b)' }} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6 border-gray-100 shadow-sm">
            <h2 className="font-black text-gray-900 text-lg mb-5">📋 تفاصيل البيانات والمواعيد</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              {[
                { label: 'اسم الجهة/المتبرع', value: request.donorName },
                { label: 'فئة الموقع', value: DONOR_TYPE_LABELS[request.donorType] || 'أخرى' },
                { label: 'المنطقة/الحي', value: request.district },
                { label: 'رقم الاتصال المسجل', value: request.phone },
                { label: 'وقت الاستلام المفضل', value: request.pickupTime },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50/50 rounded-xl p-3 border border-gray-50 hover:bg-white hover:border-gray-100 transition-colors">
                  <div className="text-gray-400 text-xs mb-1">{item.label}</div>
                  <div className="font-semibold text-gray-800">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6 border-gray-100 shadow-sm">
            <h2 className="font-black text-gray-900 text-lg mb-5">👷 الكادر الميداني</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`rounded-2xl border-2 p-4 ${request.pickupCourierName ? 'border-[#b68a3a]/20 bg-[#b68a3a]/5' : 'border-dashed border-gray-200'}`}>
                <div className="text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-wider">المندوب القائم بالاستلام</div>
                {request.pickupCourierName ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#b68a3a] rounded-full flex items-center justify-center text-white font-bold">{request.pickupCourierName[0]}</div>
                    <div>
                      <div className="font-bold text-gray-800">{request.pickupCourierName}</div>
                      <div className="text-xs text-[#b68a3a] font-bold">تتبع مباشر نشط 🛰️</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-2 italic text-sm">لم يتم تعيين مندوب استلام بعد</div>
                )}
              </div>
              <div className={`rounded-2xl border-2 p-4 ${request.distributionCourierName ? 'border-blue-200 bg-blue-50' : 'border-dashed border-gray-200'}`}>
                <div className="text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-wider">المندوب القائم بالتوزيع</div>
                {request.distributionCourierName ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">{request.distributionCourierName[0]}</div>
                    <div>
                      <div className="font-bold text-gray-800">{request.distributionCourierName}</div>
                      <div className="text-xs text-blue-600 font-bold">تتبع توزيع نشط 🏠</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-2 italic text-sm">لم يتم تعيين مندوب توزيع بعد</div>
                )}
              </div>
            </div>
          </div>

          {request.images && request.images.length > 0 && (
            <div className="card p-6 border-gray-100 shadow-sm">
              <h2 className="font-black text-gray-900 text-lg mb-5">📸 صور التوثيق الميدانية</h2>
              <div className="grid grid-cols-2 gap-4">
                {request.images.map((img, i) => (
                  <div key={i} className="group relative aspect-video rounded-2xl overflow-hidden border border-gray-100">
                    <img src={img.url} alt={img.label} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute bottom-0 inset-x-0 p-3 bg-black/50 text-white text-[10px] font-bold backdrop-blur-sm">
                      {img.label} · {new Date(img.createdAt).toLocaleTimeString('ar-SA')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card p-6 border-gray-100 shadow-sm">
            <h2 className="font-black text-gray-900 text-lg mb-6">📅 حركة الطلب (Log)</h2>
            <div className="space-y-6">
              {[
                { label: 'استلام البلاغ الأصلي', time: request.createdAt, icon: '📩', color: 'bg-green-500' },
                { label: 'تأكيد وقبول الطلب', time: request.acceptedAt, icon: '✅', color: 'bg-[#b68a3a]' },
                { label: 'تحرك المندوب للموقع', time: request.startedAt, icon: '🚗', color: 'bg-blue-500' },
                { label: 'تم الاستلام والفرز', time: request.arrivedAt, icon: '📍', color: 'bg-orange-500' },
                { label: 'إغلاق الطلب نهائياً', time: request.completedAt, icon: '🎉', color: 'bg-purple-600' },
              ].map((item, i) => (
                <div key={i} className={`flex gap-4 ${!item.time ? 'opacity-30' : ''}`}>
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 ${item.color} rounded-full flex items-center justify-center text-white text-sm shadow relative z-10`}>
                      {item.time ? '✓' : item.icon}
                    </div>
                    {i < 4 && <div className="w-0.5 h-full bg-gray-100 -mt-1 -mb-4"></div>}
                  </div>
                  <div className="pb-6">
                    <div className="font-black text-gray-800 text-sm">{item.label}</div>
                    <div className="text-xs font-bold mt-0.5" style={{ color: item.time ? '#b68a3a' : '#9ca3af' }}>
                      {item.time ? new Date(item.time).toLocaleTimeString('ar-SA') : 'بانتظار اكمال المرحلة...'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="ai-card border-orange-100 bg-orange-50/10">
            <div className="ai-card-header text-orange-800">
              <span className="text-2xl">🤖</span>
              تحليل الذكاء الاصطناعي (رقابة)
            </div>
            <div className="p-4 space-y-4">
               <div className="bg-white rounded-xl p-3 border border-orange-100">
                  <div className="text-[10px] text-gray-400 mb-1 font-bold">الأولوية المحسوبة</div>
                  <div className="font-black text-[#b68a3a]">{aiRecommendation.priorityReason}</div>
               </div>
               <div className="bg-white rounded-xl p-3 border border-orange-100">
                  <div className="text-[10px] text-gray-400 mb-1 font-bold">التوقيت المستهدف</div>
                  <div className="font-bold text-gray-700 text-sm">{aiRecommendation.timeNote}</div>
               </div>
               <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-100 italic">
                  ⚠️ تنبيه: وضع الرقابة لا يسمح بتعديل بيانات الذكاء الاصطناعي أو إرسال رسائل للمناديب.
               </div>
            </div>
          </div>

          {request.assignedFamilies && request.assignedFamilies.length > 0 && (
            <div className="card p-5 shadow-sm border-gray-100">
              <div className="font-black text-gray-800 mb-4 text-sm flex items-center gap-2">
                <span>🏡</span> الأسر المرتبطة للطلب
              </div>
              <div className="space-y-2">
                {BENEFICIARY_FAMILIES.filter(f => request.assignedFamilies?.includes(f.id)).map(family => (
                  <div key={family.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-50">
                    <div className="text-lg">🏠</div>
                    <div>
                      <div className="font-bold text-sm text-gray-800">{family.familyName}</div>
                      <div className="text-[10px] text-gray-400">{family.familySize} أفراد · {family.district}</div>
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
