'use client';
import { useState, useEffect } from 'react';
import { BENEFICIARY_FAMILIES, PRIORITY_LABELS } from '@/lib/mock-data';
import { getPriorityColor } from '@/lib/utils';

export default function FamiliesPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [filterPriority, setFilterPriority] = useState('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    setUserRole(localStorage.getItem('nema_user_role') || 'admin');
  }, []);

  const filtered = BENEFICIARY_FAMILIES.filter(f => {
    const matchPriority = filterPriority === 'all' || f.priorityLevel === filterPriority;
    const matchSearch = !search || f.familyName.includes(search) || f.district.includes(search);
    return matchPriority && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <div className="toast toast-success">{toast}</div>}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">👨‍👩‍👧‍👦 الأسر المستفيدة</h1>
          <p className="text-gray-500 mt-1">{BENEFICIARY_FAMILIES.length} أسرة مسجلة في النظام</p>
        </div>
        {userRole === 'admin' && (
          <button onClick={() => setShowAdd(true)} className="btn-primary">+ إضافة أسرة</button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'أولوية عاجلة', value: BENEFICIARY_FAMILIES.filter(f => f.priorityLevel === 'urgent').length, color: '#dc2626', icon: '🔴' },
          { label: 'أولوية متوسطة', value: BENEFICIARY_FAMILIES.filter(f => f.priorityLevel === 'medium').length, color: '#d97706', icon: '🟡' },
          { label: 'إجمالي الأفراد', value: BENEFICIARY_FAMILIES.reduce((s, f) => s + f.familySize, 0), color: '#16a34a', icon: '👥' },
        ].map((s, i) => (
          <div key={i} className="stat-card text-center">
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-3xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-gray-500 text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input className="form-input max-w-xs" placeholder="🔍 بحث بالاسم أو الحي..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <div className="flex gap-2">
          {[['all','الكل'],['urgent','عاجل'],['medium','متوسطة'],['low','منخفضة']].map(([k,l]) => (
            <button key={k} onClick={() => setFilterPriority(k)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                filterPriority === k ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
              }`}>{l}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card-flat overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>اسم الأسرة</th>
                <th>الحي / المدينة</th>
                <th>عدد الأفراد</th>
                <th>الأطفال</th>
                <th>الأولوية</th>
                <th>آخر استفادة</th>
                <th>إجمالي الاستفادات</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(family => (
                <tr key={family.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center text-lg">🏠</div>
                      <div>
                        <div className="font-semibold text-gray-800">{family.familyName}</div>
                        {family.notes && <div className="text-xs text-gray-400 max-w-48 truncate">{family.notes}</div>}
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
                      <span className="text-gray-400 text-xs">فرد</span>
                    </div>
                  </td>
                  <td>
                    <span className="font-medium text-blue-600">{family.childrenCount} 👶</span>
                  </td>
                  <td>
                    <span className={`badge ${getPriorityColor(family.priorityLevel)}`}>
                      {PRIORITY_LABELS[family.priorityLevel]}
                    </span>
                  </td>
                  <td className="text-sm text-gray-500">
                    {family.lastServedAt ? new Date(family.lastServedAt).toLocaleDateString('ar-SA', {calendar:'gregory'}) : '—'}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="h-2 bg-gray-100 rounded-full flex-1 max-w-20 overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(family.totalServings * 3, 100)}%` }} />
                      </div>
                      <span className="text-sm font-bold text-[#6dbe45]">{family.totalServings}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${family.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {family.isActive ? 'نشطة' : 'غير نشطة'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      {userRole === 'admin' && (
                        <button onClick={() => showToast(`✅ تم تعديل بيانات ${family.familyName}`)}
                          className="text-xs p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600">تعديل</button>
                      )}
                      <button onClick={() => showToast('📋 عرض سجل الاستفادة')}
                        className="text-xs p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600">السجل</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in">
            <h3 className="text-xl font-black text-gray-900 mb-5">إضافة أسرة جديدة</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="form-group md:col-span-2">
                <label className="form-label">اسم الأسرة / المعرف</label>
                <input className="form-input" placeholder="مثال: أسرة المطيري - حي العليا" />
              </div>
              <div className="form-group">
                <label className="form-label">المدينة</label>
                <select className="form-input">
                  {['الرياض','جدة','مكة','المدينة','الدمام'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">الحي</label>
                <input className="form-input" placeholder="اسم الحي" />
              </div>
              <div className="form-group md:col-span-2">
                <label className="form-label">العنوان التفصيلي</label>
                <input className="form-input" placeholder="عنوان السكن" />
              </div>
              <div className="form-group">
                <label className="form-label">عدد الأفراد الكلي</label>
                <input className="form-input" type="number" placeholder="0" />
              </div>
              <div className="form-group">
                <label className="form-label">عدد الأطفال</label>
                <input className="form-input" type="number" placeholder="0" />
              </div>
              <div className="form-group md:col-span-2">
                <label className="form-label">أولوية الاستحقاق</label>
                <select className="form-input">
                  <option value="urgent">عاجلة</option>
                  <option value="medium">متوسطة</option>
                  <option value="low">منخفضة</option>
                </select>
              </div>
              <div className="form-group md:col-span-2">
                <label className="form-label">ملاحظات صحية أو خاصة (اختياري)</label>
                <textarea className="form-input h-20 resize-none" placeholder="أي ملاحظات مهمة للمندوب..." />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAdd(false)} className="btn-ghost flex-1">إلغاء</button>
              <button onClick={() => { setShowAdd(false); showToast('✅ تم إضافة الأسرة بنجاح'); }} className="btn-primary flex-1 justify-center">إضافة الأسرة</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
