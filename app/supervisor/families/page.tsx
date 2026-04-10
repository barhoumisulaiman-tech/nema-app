'use client';
import { useState } from 'react';
import { BENEFICIARY_FAMILIES, PRIORITY_LABELS } from '@/lib/mock-data';
import { getPriorityColor } from '@/lib/utils';

export default function SupervisorFamiliesPage() {
  const [filterPriority, setFilterPriority] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = BENEFICIARY_FAMILIES.filter(f => {
    const matchPriority = filterPriority === 'all' || f.priorityLevel === filterPriority;
    const matchSearch = !search || f.familyName.includes(search) || f.district.includes(search);
    return matchPriority && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in" style={{ direction: 'rtl' }}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">👨‍👩‍👧‍👦 سجل الأسر المستفيدة</h1>
          <p className="text-gray-500 mt-1">عرض ومتابعة بيانات الأسر المسجلة في النظام (وضع الرقابة)</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'حالات عاجلة', value: BENEFICIARY_FAMILIES.filter(f => f.priorityLevel === 'urgent').length, color: '#dc2626', icon: '🔴' },
          { label: 'إجمالي الأسر', value: BENEFICIARY_FAMILIES.length, color: '#b68a3a', icon: '📋' },
          { label: 'إجمالي الأفراد', value: BENEFICIARY_FAMILIES.reduce((s, f) => s + f.familySize, 0), color: '#16a34a', icon: '👥' },
        ].map((s, i) => (
          <div key={i} className="card p-5 text-center border-gray-100 shadow-sm">
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-3xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-gray-400 text-xs font-bold mt-1 uppercase">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card-flat p-5 border-gray-100 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center">
          <input className="form-input max-w-sm flex-1" placeholder="🔍 بحث باسم الأسرة أو الحي..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <div className="flex gap-2">
            {[
              ['all','الكل'],
              ['urgent','عاجلة'],
              ['medium','متوسطة'],
              ['low','منخفضة']
            ].map(([k,l]) => (
              <button key={k} onClick={() => setFilterPriority(k)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                  filterPriority === k 
                    ? 'bg-[#b68a3a] text-white border-[#b68a3a] shadow-md' 
                    : 'bg-white text-gray-500 border-gray-200 hover:border-[#b68a3a]/30'
                }`}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card-flat overflow-hidden shadow-sm border-gray-100 italic">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead className="bg-gray-50/50">
              <tr>
                <th>اسم الأسرة</th>
                <th>الحي / المدينة</th>
                <th>عدد الأفراد</th>
                <th>الأطفال</th>
                <th>الأولوية</th>
                <th>آخر استفادة</th>
                <th>إجمالي الاستفادات</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(family => (
                <tr key={family.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#b68a3a]/10 rounded-full flex items-center justify-center text-lg">🏠</div>
                      <div>
                        <div className="font-semibold text-gray-800">{family.familyName}</div>
                        {family.notes && <div className="text-[10px] text-gray-400 max-w-48 truncate">{family.notes}</div>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm font-medium text-gray-700">{family.district}</div>
                    <div className="text-xs text-gray-400">{family.city}</div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-gray-800 text-lg">{family.familySize}</span>
                      <span className="text-gray-400 text-[10px] font-bold">فرد</span>
                    </div>
                  </td>
                  <td>
                    <span className="font-bold text-blue-600 text-sm">{family.childrenCount} 👶</span>
                  </td>
                  <td>
                    <span className={`badge ${getPriorityColor(family.priorityLevel)}`}>
                      {PRIORITY_LABELS[family.priorityLevel]}
                    </span>
                  </td>
                  <td className="text-sm text-gray-500">
                    {family.lastServedAt ? new Date(family.lastServedAt).toLocaleDateString('ar-SA') : '—'}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                       <span className="text-sm font-black text-[#b68a3a]">{family.totalServings}</span>
                       <div className="h-1.5 bg-gray-100 rounded-full flex-1 max-w-16 overflow-hidden">
                        <div className="h-full bg-[#b68a3a]/50 rounded-full" style={{ width: `${Math.min(family.totalServings * 5, 100)}%` }} />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${family.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {family.isActive ? 'نشطة' : 'غير نشطة'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
