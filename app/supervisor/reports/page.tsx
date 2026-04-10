'use client';
import { useState } from 'react';
import { DATA_REPORTS } from '@/lib/mock-data';

export default function SupervisorReportsPage() {
  const [reports] = useState(DATA_REPORTS);

  return (
    <div className="space-y-6 animate-fade-in" style={{ direction: 'rtl' }}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">📊 التقارير والإحصائيات</h1>
          <p className="text-gray-500 mt-1">عرض الأداء العام والوجبات المنقذة (وضع الرقابة)</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي التقارير', value: '1,248', icon: '📝', color: '#b68a3a' },
          { label: 'نسبة الإنجاز', value: '98.5%', icon: '📈', color: '#16a34a' },
          { label: 'أسر مخدومة', value: '450', icon: '🏠', color: '#2563eb' },
          { label: 'ساعات العمل', value: '8,420', icon: '⏱️', color: '#9333ea' },
        ].map((s, i) => (
          <div key={i} className="card p-5 border-gray-100 shadow-sm">
             <div className="text-2xl mb-2">{s.icon}</div>
             <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
             <div className="text-gray-400 text-[10px] font-bold mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card-flat p-6 border-gray-100 shadow-sm">
          <h2 className="font-black text-gray-900 text-lg mb-6">📈 ملخص الأداء الأسبوعي</h2>
          <div className="h-64 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
             رسم بياني توضيحي (مراقبة فقط)
          </div>
        </div>
        <div className="card-flat p-6 border-gray-100 shadow-sm">
          <h2 className="font-black text-gray-900 text-lg mb-6">🥗 أنواع الفائض الموزع</h2>
          <div className="h-64 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
             رسم بياني دائري (مراقبة فقط)
          </div>
        </div>
      </div>

      <div className="card-flat overflow-hidden shadow-sm border-gray-100 italic">
        <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-700">سجل التقارير الدورية</div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>اسم التقرير</th>
                <th>الفترة الزمنية</th>
                <th>الحالة</th>
                <th>عدد الطلبات</th>
                <th>تاريخ الصدور</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, i) => (
                <tr key={i}>
                  <td className="font-bold text-gray-800">{report.title}</td>
                  <td className="text-sm text-gray-500">{report.period}</td>
                  <td><span className="badge bg-green-100 text-green-700">مؤرشف</span></td>
                  <td className="font-bold text-gray-800">{report.totalRequests}</td>
                  <td className="text-sm text-gray-400">{report.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
