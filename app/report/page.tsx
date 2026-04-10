'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FoodRequest, Courier } from '@/lib/types';
import { COURIERS, DONOR_TYPE_LABELS } from '@/lib/mock-data';
import { DataService } from '@/lib/data-service';

const donorTypes = [
  { value: 'wedding_hall', label: 'قاعة أفراح' },
  { value: 'rest_house', label: 'استراحة' },
  { value: 'restaurant', label: 'مطعم' },
  { value: 'hotel', label: 'فندق' },
  { value: 'home', label: 'منزل' },
  { value: 'event', label: 'مناسبة خاصة' },
  { value: 'other', label: 'أخرى' },
];

export default function ReportPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [requestNumber] = useState('NM-2024-' + (Math.floor(Math.random() * 900) + 100));
  const [couriers, setCouriers] = useState<Courier[]>(COURIERS);
  const [form, setForm] = useState({
    donorName: '', donorType: '', phone: '',
    district: '', googleMapsLink: '',
    pickupTime: '',
    assignedCourierId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const selectedCourierObj = couriers.find(c => c.id === form.assignedCourierId);

    const newRequest: FoodRequest = {
      id: Math.random().toString(36).substr(2, 9),
      requestNumber,
      donorName: form.donorName,
      donorType: form.donorType as any,
      phone: form.phone,
      district: form.district,
      googleMapsLink: form.googleMapsLink,
      pickupTime: form.pickupTime,
      currentStatus: form.assignedCourierId ? 'pickup_assigned' : 'new',
      priorityLevel: 'medium',
      createdAt: new Date().toISOString(),
      pickupCourierId: form.assignedCourierId || undefined,
      pickupCourierName: selectedCourierObj?.name || undefined,
    };

    try {
      await DataService.addRequest(newRequest);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('حدث خطأ أثناء إرسال البلاغ. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6" style={{ direction: 'rtl' }}>
        <div className="max-w-lg w-full text-center">
          <div className="card p-12 animate-fade-in">
            <div className="text-8xl mb-6">🎉</div>
            <h2 className="text-3xl font-black text-gray-900 mb-3">تم إرسال البلاغ!</h2>
            <p className="text-gray-500 mb-6">سيتواصل معك فريقنا خلال 15 دقيقة</p>
            <div className="ai-card mb-6">
              <div className="font-bold text-green-800 mb-1">رقم طلبك</div>
              <div className="text-3xl font-black text-green-600">{requestNumber}</div>
              <div className="text-sm text-green-700 mt-2">احتفظ بهذا الرقم لمتابعة حالة طلبك</div>
            </div>
            {form.assignedCourierId && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                <div className="text-sm text-blue-700">👤 تم إرسال الطلب للمندوب:</div>
                <div className="font-black text-blue-900">{couriers.find(c => c.id === form.assignedCourierId)?.name}</div>
              </div>
            )}
            <div className="flex gap-3">
              <Link href="/track" className="btn-primary flex-1 justify-center">تتبع الطلب</Link>
              <Link href="/" className="btn-ghost flex-1 justify-center">العودة للرئيسية</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white" style={{ direction: 'rtl' }}>
      {/* Header */}
      <div className="hero-gradient text-white py-12">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-green-200 hover:text-white mb-6 text-sm font-medium">
            ← العودة للرئيسية
          </Link>
          <div className="text-5xl mb-4">📢</div>
          <h1 className="text-4xl font-black mb-3">إرسال بلاغ حفظ النعمة</h1>
          <p className="text-green-200 text-lg">بيانات بسيطة ونحن نتولى الباقي</p>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center gap-4 mb-10">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                step >= s ? 'text-white shadow-lg' : 'bg-gray-100 text-gray-400'
              }`} style={step >= s ? { background: 'linear-gradient(135deg, #16a34a, #059669)' } : {}}>
                {step > s ? '✓' : s}
              </div>
              <div className={`text-sm font-medium ${step >= s ? 'text-green-600' : 'text-gray-400'}`}>
                {s === 1 ? 'بيانات الجهة والمواعيد' : 'المراجعة والإرسال'}
              </div>
              {s < 2 && <div className={`w-12 h-0.5 ${step > s ? 'bg-green-400' : 'bg-gray-200'}`}></div>}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="card p-8 animate-fade-in">
            <h2 className="text-2xl font-black text-gray-900 mb-6">بيانات الجهة والمواعيد</h2>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="form-group">
                <label className="form-label">اسم المكان *</label>
                <input className="form-input" placeholder="مثال: قاعة السعادة"
                  value={form.donorName} onChange={e => update('donorName', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">نوع المكان *</label>
                <select className="form-input" value={form.donorType} onChange={e => update('donorType', e.target.value)}>
                  <option value="">اختر النوع</option>
                  {donorTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">الحي *</label>
                <input className="form-input" placeholder="اسم الحي"
                  value={form.district} onChange={e => update('district', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">رقم الجوال *</label>
                <input className="form-input" placeholder="05XXXXXXXX" dir="ltr"
                  value={form.phone} onChange={e => update('phone', e.target.value)} />
              </div>
              <div className="form-group md:col-span-2">
                <label className="form-label">رابط Google Maps (اختياري)</label>
                <input className="form-input" placeholder="https://maps.google.com/..." dir="ltr"
                  value={form.googleMapsLink} onChange={e => update('googleMapsLink', e.target.value)} />
              </div>
              
              <div className="form-group md:col-span-2">
                <label className="form-label text-green-700 font-bold">وقت استلام الأكل *</label>
                <input className="form-input border-green-200 focus:ring-green-500" placeholder="مثال: الساعة 10:30 مساءً"
                  value={form.pickupTime} onChange={e => update('pickupTime', e.target.value)} />
              </div>

              {/* Courier Selection Injected Here */}
              <div className="form-group md:col-span-2 border-t pt-6 mt-4">
                <label className="form-label font-black text-green-700 flex items-center gap-2">
                  <span>🚗 إسناد لمندوب (خاص بالإدارة - اختياري)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {couriers.filter(c => c.availabilityStatus !== 'unavailable').map(c => (
                    <label key={c.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      form.assignedCourierId === c.id ? 'border-green-400 bg-green-50' : 'border-gray-100 hover:border-gray-200'
                    }`}>
                      <input type="radio" name="courierReport" className="hidden" 
                        checked={form.assignedCourierId === c.id}
                        onChange={() => update('assignedCourierId', c.id)} />
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-700 text-xs">{c.name[0]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-800 text-xs truncate">{c.name}</div>
                        <div className="text-[10px] text-gray-400">{c.district}</div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${c.availabilityStatus === 'available' ? 'bg-green-500' : 'bg-orange-500'}`} />
                    </label>
                  ))}
                  <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    form.assignedCourierId === '' ? 'border-gray-400 bg-gray-50' : 'border-gray-100 hover:border-gray-200'
                  }`}>
                    <input type="radio" name="courierReport" className="hidden" 
                      checked={form.assignedCourierId === ''}
                      onChange={() => update('assignedCourierId', '')} />
                    <div className="text-xs font-bold text-gray-500 italic">بدون إسناد حالياً</div>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-8">
              <button className="btn-primary" onClick={() => setStep(2)}>مراجعة البيانات ←</button>
            </div>
          </div>
        )}

        {/* Step 2 Review */}
        {step === 2 && (
          <div className="card p-8 animate-fade-in">
            <h2 className="text-2xl font-black text-gray-900 mb-6">مراجعة البلاغ</h2>
            <div className="space-y-4">
              <div className="ai-card">
                <div className="ai-card-header">📋 بيانات الجهة</div>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">المكان:</span> <span className="font-semibold">{form.donorName || '—'}</span></div>
                  <div><span className="text-gray-500">النوع:</span> <span className="font-semibold">{donorTypes.find(t => t.value === form.donorType)?.label || '—'}</span></div>
                  <div><span className="text-gray-500">الحي:</span> <span className="font-semibold">{form.district || '—'}</span></div>
                  <div><span className="text-gray-500">رقم الجوال:</span> <span className="font-semibold">{form.phone || '—'}</span></div>
                </div>
              </div>
              <div className="ai-card">
                <div className="ai-card-header">⏰ المواعيد</div>
                <div className="grid md:grid-cols-1 gap-3 text-sm">
                  <div><span className="text-gray-500">وقت الاستلام المؤكد:</span> <span className="font-semibold text-green-700">{form.pickupTime || '—'}</span></div>
                </div>
              </div>
              {form.assignedCourierId && (
                <div className="ai-card border-blue-200 bg-blue-50">
                  <div className="ai-card-header text-blue-800">👤 المندوب المسؤول</div>
                  <div className="font-bold text-blue-900 px-2">{couriers.find(c => c.id === form.assignedCourierId)?.name}</div>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-8">
              <button className="btn-ghost" onClick={() => setStep(1)}>← تعديل البيانات</button>
              <button className="btn-primary px-10" onClick={handleSubmit}>
                📤 إرسال البلاغ الآن
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
