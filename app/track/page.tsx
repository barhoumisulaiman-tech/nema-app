'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FOOD_REQUESTS, STATUS_LABELS, ACTIVITY_LOGS } from '@/lib/mock-data';
import { getStatusColor, getStatusProgress, formatDate } from '@/lib/utils';
import { DataService } from '@/lib/data-service';

const timelineSteps = [
  { key: 'new', label: 'تم استلام البلاغ', icon: '📋', desc: 'تم تسجيل بلاغك بنجاح في النظام' },
  { key: 'reviewing', label: 'قيد المراجعة', icon: '🔍', desc: 'فريق الجمعية يراجع تفاصيل البلاغ' },
  { key: 'accepted', label: 'تم قبول الطلب', icon: '✅', desc: 'تم الموافقة على البلاغ ويجري التجهيز' },
  { key: 'pickup_assigned', label: 'تم تعيين مندوب الاستلام', icon: '👤', desc: 'تم تعيين مندوب للتوجه لموقعك' },
  { key: 'courier_on_way', label: 'المندوب في الطريق', icon: '🚗', desc: 'المندوب متوجه إليك الآن' },
  { key: 'picked_up', label: 'تم استلام الطعام', icon: '📦', desc: 'تم استلام الطعام بنجاح' },
  { key: 'distribution_assigned', label: 'جاري إعداد التوزيع', icon: '🗺️', desc: 'يتم تحديد الأسر المستفيدة' },
  { key: 'distributing', label: 'جاري التوزيع', icon: '🏃', desc: 'المندوب يوزع الطعام الآن' },
  { key: 'completed', label: 'اكتمل الطلب ✨', icon: '🎉', desc: 'تم توزيع الطعام بنجاح على الأسر المحتاجة' },
];

const statusOrder = ['new','reviewing','accepted','pickup_assigned','courier_on_way','picked_up','sorting','distribution_assigned','distributing','distributed','completed'];

function getStepIndex(status: string) {
  const mappedSteps = ['new','reviewing','accepted','pickup_assigned','courier_on_way','picked_up','distribution_assigned','distributing','completed'];
  return mappedSteps.indexOf(status);
}

export default function TrackPage() {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<typeof FOOD_REQUESTS[0] | null>(null);

  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setIsSearching(true);
    setSearched(true);

    const allRequests = await DataService.getRequests();
    const found = allRequests.find(r =>
      r.requestNumber.toLowerCase() === query.trim().toLowerCase() ||
      r.phone === query.trim()
    );
    
    setResult(found || null);
    setIsSearching(false);
  };

  const logs = result ? ACTIVITY_LOGS.filter(l => l.foodRequestId === result.id) : [];
  const currentStepIndex = result ? getStepIndex(result.currentStatus) : -1;
  const progress = result ? getStatusProgress(result.currentStatus) : 0;

  // Courier Location Sync for the Live Map
  useEffect(() => {
    let interval: any;
    if (result && result.currentStatus === 'courier_on_way' && result.pickupCourierId) {
      interval = setInterval(async () => {
        const locations = await DataService.getCourierLocations();
        const courierLoc = locations.find(l => l.courier_id === result.pickupCourierId);
        if (courierLoc && (window as any).updateDonorMap) {
          (window as any).updateDonorMap(courierLoc.lat, courierLoc.lng);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [result]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white" style={{ direction: 'rtl' }}>
      {/* Header */}
      <div className="hero-gradient text-white py-14">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-green-200 hover:text-white mb-6 text-sm">
            ← العودة للرئيسية
          </Link>
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-4xl font-black mb-3">تتبع حالة الطلب</h1>
          <p className="text-green-200 mb-8">أدخل رقم الطلب أو رقم الجوال</p>
          <div className="flex gap-3 max-w-lg mx-auto">
            <input className="form-input flex-1 text-gray-900" placeholder="مثال: NM-2024-001 أو رقم الجوال"
              value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            <button className="btn-primary whitespace-nowrap" onClick={handleSearch}>بحث</button>
          </div>
          <p className="text-green-300 text-sm mt-3">جرب: NM-2024-001 أو NM-2024-002</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {!searched && (
          <div className="text-center py-20 text-gray-400">
            <div className="text-8xl mb-4">📦</div>
            <div className="text-xl font-semibold mb-2">ابحث عن طلبك</div>
            <div className="text-sm">أدخل رقم الطلب أو رقم جوال المرسل للمتابعة</div>
          </div>
        )}

        {searched && !result && (
          <div className="text-center py-20">
            <div className="text-8xl mb-4">😔</div>
            <div className="text-xl font-bold text-gray-800 mb-2">لم يتم العثور على الطلب</div>
            <div className="text-gray-500 mb-6">تأكد من رقم الطلب أو رقم الجوال وحاول مجدداً</div>
            <button className="btn-ghost" onClick={() => { setSearched(false); setQuery(''); }}>بحث جديد</button>
          </div>
        )}

        {result && (
          <div className="animate-fade-in space-y-6">
            {/* Status Card */}
            <div className="card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-500 mb-1">رقم الطلب</div>
                  <div className="text-2xl font-black text-gray-900">{result.requestNumber}</div>
                  <div className="text-gray-500 mt-1">{result.donorName}</div>
                </div>
                <div className={`badge text-sm px-4 py-2 ${getStatusColor(result.currentStatus)}`}>
                  {STATUS_LABELS[result.currentStatus]}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-2 flex justify-between text-xs text-gray-400">
                <span>تم إنشاء البلاغ</span>
                <span>{progress}%</span>
                <span>مكتمل</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-6">
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))' }}
                />
              </div>

              {/* Live Map for Courier Tracking */}
              {result.currentStatus === 'courier_on_way' && (
                <div className="mb-6 animate-fade-in">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-black text-gray-900 flex items-center gap-2">
                       📍 موقع المندوب الآن
                       <span className="w-2 h-2 bg-[#6dbe45] rounded-full animate-pulse-brand"></span>
                    </h3>
                    <div className="text-xs font-bold text-[#b68a3a]">المندوب متوجه إليك الآن</div>
                  </div>
                  <div className="relative rounded-2xl overflow-hidden border-2 border-gray-100 h-64 shadow-md">
                    <div id="donor-live-map" className="h-full z-10" />
                    <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 p-3 rounded-xl shadow-2xl border border-gray-100 min-w-32">
                       <div className="text-[10px] text-gray-400 mb-1">المسافة التقريبية</div>
                       <div className="font-black text-[#2f5d2f] text-sm">أقل من 2 كم</div>
                    </div>
                  </div>
                  <script dangerouslySetInnerHTML={{ __html: `
                    setTimeout(() => {
                      if (typeof L !== 'undefined') {
                        const map = L.map('donor-live-map', { zoomControl: false }).setView([26.2929, 44.8217], 13);
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                        
                        const courierIcon = L.divIcon({
                          className: 'donor-courier-icon',
                          html: '<div class="w-10 h-10 bg-[#2f5d2f] rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white text-xl animate-pulse">🚗</div>',
                          iconSize: [40, 40],
                          iconAnchor: [20, 20]
                        });

                        const donorIcon = L.divIcon({
                          className: 'donor-house-icon',
                          html: '<div class="text-3xl">🏠</div>',
                          iconSize: [40, 40]
                        });

                        L.marker([26.2950, 44.8250], { icon: donorIcon }).addTo(map).bindPopup('موقعك');
                        let marker = L.marker([26.2929, 44.8217], { icon: courierIcon }).addTo(map).bindPopup('المندوب قادم');

                        // Global function for React to call
                        window.updateDonorMap = (lat, lng) => {
                          if (marker) {
                            marker.setLatLng([lat, lng]);
                            map.panTo([lat, lng]);
                          }
                        };
                      }
                    }, 500);
                  `}} />
                </div>
              )}

              {/* Quick Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {[
                  { label: 'الطعام', value: result.foodType },
                  { label: 'الكمية', value: result.estimatedQuantity },
                  { label: 'الوجبات', value: `${result.estimatedMeals} وجبة` },
                  { label: 'الموقع', value: `${result.district}، ${result.city}` },
                ].map((info, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-400 mb-1">{info.label}</div>
                    <div className="font-bold text-gray-800 text-sm">{info.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="card p-6">
              <h3 className="text-xl font-black text-gray-900 mb-8">مسار الطلب</h3>
              <div className="timeline">
                {timelineSteps.map((step, i) => {
                  const isCompleted = i < currentStepIndex;
                  const isActive = i === currentStepIndex;
                  return (
                    <div key={step.key} className="timeline-item flex gap-4">
                      <div className={`timeline-dot flex-shrink-0 ${isActive ? 'active' : isCompleted ? 'completed' : ''}`}>
                        {isCompleted && <span className="text-white text-xs">✓</span>}
                        {isActive && <span className="text-white text-xs animate-pulse">●</span>}
                      </div>
                      <div className={`pb-6 ${isCompleted || isActive ? '' : 'opacity-40'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span>{step.icon}</span>
                          <span className={`font-bold ${isActive ? 'text-green-600' : 'text-gray-800'}`}>{step.label}</span>
                          {isActive && <span className="badge bg-green-100 text-green-700 text-xs">الحالة الآن</span>}
                        </div>
                        <p className="text-gray-500 text-sm">{step.desc}</p>
                        {isActive && result.pickupCourierName && (
                          <div className="mt-2 text-sm text-green-600 font-medium">
                            👷 المندوب: {result.pickupCourierName}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Activity Log */}
            {logs.length > 0 && (
              <div className="card p-6">
                <h3 className="text-xl font-black text-gray-900 mb-6">سجل الأحداث</h3>
                <div className="space-y-3">
                  {logs.map(log => (
                    <div key={log.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                        {log.actorRole === 'admin' ? '⚙️' : '🚗'}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 text-sm">{log.description}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {log.actorName} · {new Date(log.createdAt).toLocaleString('ar-SA', { calendar: 'gregory' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button className="btn-ghost flex-1" onClick={() => { setSearched(false); setQuery(''); setResult(null); }}>
                بحث جديد
              </button>
              <Link href="/" className="btn-primary flex-1 justify-center">العودة للرئيسية</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
