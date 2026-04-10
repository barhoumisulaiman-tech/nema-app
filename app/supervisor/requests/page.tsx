'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { STATUS_LABELS, DONOR_TYPE_LABELS, PRIORITY_LABELS } from '@/lib/mock-data';
import { getStatusColor, getPriorityColor } from '@/lib/utils';
import { DataService } from '@/lib/data-service';
import { FoodRequest } from '@/lib/types';

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

export default function SupervisorRequestsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const data = await DataService.getRequests();
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const subscription = DataService.subscribeToRequests(() => {
      fetchData();
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">📋 سجل الطلبات</h1>
          <p className="text-gray-500 mt-1">عرض ومتابعة كافة الطلبات في النظام (وضع الرقابة)</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-5 space-y-4 shadow-sm border-gray-100">
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
                  ? 'bg-[#b68a3a] text-white border-[#b68a3a] shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#b68a3a]/30 hover:text-[#b68a3a]'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card-flat overflow-hidden shadow-sm border-gray-100 italic">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr className="bg-gray-50/50">
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
                    <Link href={`/supervisor/requests/${req.id}`}
                      className="font-mono font-bold text-[#b68a3a] hover:underline text-sm">
                      {req.requestNumber}
                    </Link>
                  </td>
                  <td>
                    <div className="font-semibold text-gray-800 max-w-40 truncate">{req.donorName}</div>
                    {req.pickupCourierName && <div className="text-[10px] text-[#2f5d2f] font-bold">👤 المندوب: {req.pickupCourierName}</div>}
                  </td>
                  <td className="text-sm text-gray-600">{DONOR_TYPE_LABELS[req.donorType] || '—'}</td>
                  <td className="text-sm text-gray-700">{req.district}</td>
                  <td className="text-sm font-mono">{req.phone}</td>
                  <td className="text-sm">{req.pickupTime}</td>
                  <td><span className={`badge ${getStatusColor(req.currentStatus)}`}>{STATUS_LABELS[req.currentStatus]}</span></td>
                  <td>
                    <Link href={`/supervisor/requests/${req.id}`}
                      className="p-1.5 rounded-lg bg-[#b68a3a]/10 text-[#b68a3a] hover:bg-[#b68a3a]/20 transition text-xs font-bold">
                      📄 عرض التفاصيل
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && (
          <div className="text-center py-20 text-gray-400">
             <div className="w-8 h-8 border-4 border-[#b68a3a]/20 border-t-[#b68a3a] rounded-full animate-spin mx-auto mb-4"></div>
             <div>جاري تحديث البيانات...</div>
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-6xl mb-3">📭</div>
            <div className="font-semibold">لا توجد طلبات تطابق الفلتر</div>
          </div>
        )}
      </div>
    </div>
  );
}
