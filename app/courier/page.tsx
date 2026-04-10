'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { TASKS, TASK_STATUS_LABELS, PRIORITY_LABELS } from '@/lib/mock-data';
import { getTaskStatusColor, getPriorityColor } from '@/lib/utils';
import { DataService } from '@/lib/data-service';
import { Task, FoodRequest } from '@/lib/types';

const COURIER = {
  id: 'c1',
  name: 'محمد العمري',
  badge: '👤',
  phone: '0501234567'
};

const taskActionsByStatus: Record<string, { label: string; nextStatus: string; color: string }[]> = {
  pending: [
    { label: '✅ قبول المهمة', nextStatus: 'accepted', color: 'btn-primary' },
    { label: '❌ رفض المهمة', nextStatus: 'failed', color: 'btn-danger' },
  ],
  accepted: [
    { label: '🚗 بدء المهمة', nextStatus: 'started', color: 'btn-primary' },
  ],
  started: [
    { label: '📍 تم الوصول', nextStatus: 'arrived', color: 'btn-primary' },
  ],
  arrived: [
    { label: '✅ تم التنفيذ / الإنجاز', nextStatus: 'executed', color: 'btn-primary' },
    { label: '⚠️ تعذر التنفيذ', nextStatus: 'failed', color: 'btn-danger' },
  ],
  executed: [
    { label: '🏁 إنهاء المهمة', nextStatus: 'completed', color: 'bg-[#2f5d2f] text-white hover:bg-[#1e3d1e]' },
  ],
  completed: [],
  failed: [],
};

const mapRequestToTask = (r: FoodRequest): Task => {
  const revStatusMap: Record<string, string> = {
    'new': 'pending',
    'pickup_assigned': 'pending',
    'accepted': 'accepted',
    'courier_on_way': 'started',
    'picked_up': 'arrived',
    'sorting': 'executed',
    'completed': 'completed',
    'cancelled': 'failed'
  };
  return {
    id: `t-${r.id}`,
    foodRequestId: r.id,
    requestNumber: r.requestNumber,
    taskType: 'pickup',
    assignedCourierId: COURIER.id,
    status: (revStatusMap[r.currentStatus] || 'pending') as Task['status'],
    donorName: r.donorName,
    district: r.district,
    phone: r.phone,
    pickupTime: r.pickupTime,
    priorityLevel: r.priorityLevel,
    createdAt: r.createdAt
  };
};

export default function CourierDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [rawRequests, setRawRequests] = useState<FoodRequest[]>([]);
  const [showNote, setShowNote] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [toast, setToast] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [courierStatus, setCourierStatus] = useState('متاح');
  const [gpsStatus, setGpsStatus] = useState<'searching' | 'active' | 'denied' | 'error'>('searching');
  const [notifPermission, setNotifPermission] = useState<'default' | 'granted' | 'denied'>('default');
  const [seenTaskIds, setSeenTaskIds] = useState<Set<string>>(new Set());
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const isFirstLoad = useRef(true);

  const loadTasks = async () => {
    // 1. Fetch from Supabase
    const savedRequests = await DataService.getRequests();
    
    // 2. Filter for today's tasks
    const todayStr = new Date().toISOString().split('T')[0];
    const dynamicTasks = savedRequests
      .filter(r => {
        const isToday = r.createdAt.startsWith(todayStr);
        const isMeOrPublic = r.pickupCourierId === COURIER.id || (!r.pickupCourierId && r.currentStatus === 'new');
        return isToday && isMeOrPublic;
      })
      .map(r => mapRequestToTask(r));

    const staticTasks = TASKS.filter(t => t.assignedCourierId === COURIER.id);
    setTasks([...dynamicTasks, ...staticTasks]);
    setRawRequests(savedRequests);

    return savedRequests;
  };

  useEffect(() => {
    // 1. Initial Load
    const init = async () => {
      const initialRequests = await loadTasks();
      // Initialize seen list to avoid notifying for existing tasks
      setSeenTaskIds(new Set(initialRequests.map(r => r.id)));
    };
    init();

    // 2. Realtime Subscription for New Tasks
    const subscription = DataService.subscribeToRequests((payload) => {
      const newRecord = payload.new as FoodRequest;
      const eventType = payload.eventType;

      if (eventType === 'INSERT') {
        const isMeOrPublic = newRecord.pickupCourierId === COURIER.id || (!newRecord.pickupCourierId && newRecord.currentStatus === 'new');
        if (isMeOrPublic) {
          triggerAlert(newRecord);
        }
      }
      
      // Refresh list on any change
      loadTasks();
    });

    // 3. Request permission state check
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission);
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const triggerAlert = (request: FoodRequest) => {
    if (seenTaskIds.has(request.id)) return;
    
    setSeenTaskIds(prev => new Set(prev).add(request.id));
    playNotificationSound(request.donorName);
    
    // Vibrate device
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }

    if (Notification.permission === 'granted') {
      new Notification('🚨 مهمة جديدة فورية!', {
        body: `جهة التبرع: ${request.donorName}\nالحي: ${request.district}\nانقر للتفاصيل...`,
        icon: '/favicon.ico',
        tag: 'new-task-' + request.id,
        requireInteraction: true,
      });
    }
    showToast(`🚨 تنبيه عاجل: مهمة جديدة من ${request.donorName}`);
  };

  const playNotificationSound = (donorName?: string) => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.8;
      audio.play().catch(e => console.error('Audio playback failed:', e));

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const message = new SpeechSynthesisUtterance();
        message.text = `لديك مهمة استلام جديدة`;
        message.lang = 'ar-SA';
        message.rate = 0.9;
        window.speechSynthesis.speak(message);
      }
    } catch (e) {
      console.error('Notification alert error:', e);
    }
  };

  const requestNotifPermission = () => {
    if (!('Notification' in window)) {
      alert('متصفحك لا يدعم الإشعارات');
      return;
    }
    Notification.requestPermission().then(permission => {
      setNotifPermission(permission);
      if (permission === 'granted') {
        playNotificationSound();
        showToast('✅ تم تفعيل التنبيهات بنجاح');
      }
    });
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    // Find the task in the state
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Map TaskStatus to FoodRequestStatus
    const statusMap: Record<string, string> = {
      'pending': 'pickup_assigned',
      'accepted': 'accepted',
      'started': 'courier_on_way',
      'arrived': 'picked_up',
      'executed': 'sorting',
      'completed': 'completed',
      'failed': 'cancelled'
    };
    
    const newReqStatus = statusMap[newStatus];
    if (!newReqStatus || !task.foodRequestId) return;

    try {
      const now = new Date().toISOString();
      const updates: any = { currentStatus: newReqStatus };

      // Field logic
      if (newStatus === 'accepted') {
        updates.pickupCourierId = COURIER.id;
        updates.pickupCourierName = COURIER.name;
        updates.acceptedAt = now;
      }
      if (newStatus === 'started') updates.startedAt = now;
      if (newStatus === 'arrived') updates.arrivedAt = now;
      if (newStatus === 'completed') updates.completedAt = now;

      await DataService.updateRequestStatus(task.foodRequestId, updates);
      
      showToast('✅ تم تحديث حالة المهمة بنجاح');
      loadTasks(); // Refresh UI
    } catch (e) {
      alert('خطأ في تحديث حالة المهمة');
    }
  };

  // --- Automated Geolocation Logic (STRICT HARDWARE-ONLY) ---
  useEffect(() => {
    // 1. Get Initial Position immediately
    if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition((pos) => {
         const { latitude, longitude } = pos.coords;
         setGpsStatus('active');
         initMap(latitude, longitude);
         updateLocation(latitude, longitude);
       }, (err) => {
         if (err.code === 1) setGpsStatus('denied');
         else setGpsStatus('error');
       }, { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 });
    } else {
       setGpsStatus('error');
    }

    function initMap(lat: number, lng: number) {
      if (typeof window !== 'undefined' && (window as any).L && !mapInstanceRef.current) {
        const L = (window as any).L;
        const map = L.map('courier-update-map', { 
          zoomControl: false, 
          scrollWheelZoom: false,
          dragging: false, // Pure follow mode
          touchZoom: false
        }).setView([lat, lng], 17);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        
        const curLocIcon = L.divIcon({
          className: 'cur-loc-icon',
          html: '<div class="w-12 h-12 bg-[#2f5d2f] rounded-full border-4 border-white shadow-2xl flex items-center justify-center animate-pulse-brand">🚗</div>',
          iconSize: [48, 48],
          iconAnchor: [24, 24]
        });

        markerRef.current = L.marker([lat, lng], { icon: curLocIcon }).addTo(map);
        mapInstanceRef.current = map;
        isFirstLoad.current = false;
      }
    }

    // 2. Continuous Automatic Tracking
    let watchId: number | null = null;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setGpsStatus('active');
          if (!mapInstanceRef.current) {
             initMap(latitude, longitude);
          }
          updateLocation(latitude, longitude);
        },
        () => setGpsStatus('error'),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const updateLocation = async (lat: number, lng: number) => {
    // Sync to Supabase
    await DataService.updateCourierLocation(COURIER.id, lat, lng);
    
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }
    
    if (mapInstanceRef.current) {
      // Direct hardware sync - map follows car smoothly
      mapInstanceRef.current.panTo([lat, lng], { animate: true, duration: 0.5 });
    }
  };

  const activeTasks = tasks.filter(t => !['completed', 'failed'].includes(t.status));
  const completedTasks = tasks.filter(t => ['completed', 'failed'].includes(t.status));

  return (
    <div className="min-h-screen bg-gray-50" style={{ direction: 'rtl' }}>
      {toast && <div className="toast toast-success">{toast}</div>}

      {/* Topbar */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-lg"
              style={{ background: 'linear-gradient(135deg, var(--color-primary), #1e3d1e)' }}>
              {COURIER.badge}
            </div>
            <div>
              <div className="font-black text-gray-900">لوحة المندوب</div>
              <div className="text-xs text-[#6dbe45] font-black uppercase tracking-wider">{COURIER.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {notifPermission !== 'granted' && (
              <button onClick={requestNotifPermission} className="btn-primary py-1.5 px-3 text-xs animate-bounce">
                🔔 تفعيل التنبيهات
              </button>
            )}
            <span className="badge text-xs bg-green-100 text-green-700">● متاح</span>
            <Link href="/login" className="btn-ghost py-1.5 px-3 text-sm">خروج</Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'الطلبات اليوم', value: tasks.length, icon: '📋', color: '#b68a3a' },
            { label: 'الطلبات المتبقية', value: activeTasks.length, icon: '⚡', color: '#d79a2b' },
            { label: 'الطلبات الماضية', value: completedTasks.length, icon: '✅', color: '#6dbe45' },
          ].map((s, i) => (
            <div key={i} className="card p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Hardware GPS ONLY Map Section */}
        <div className="card-flat overflow-hidden p-0 border-2 border-gray-100 shadow-2xl">
          <div className="relative h-96 w-full bg-slate-50">
            {/* Map Placeholder/Loading State */}
            <div id="courier-update-map" className="absolute inset-0 z-10" />
            
            {gpsStatus === 'searching' && (
              <div className="absolute inset-0 z-[2000] bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <div className="space-y-2">
                  <div className="font-black text-gray-900 text-lg">جاري تحديد الموقع من الحساسات...</div>
                  <div className="text-sm text-gray-500 max-w-xs">يرجى الانتظار بينما نقوم بالاتصال بـ GPS الجهاز للحصول على أدق إحداثيات.</div>
                </div>
              </div>
            )}

            {gpsStatus === 'denied' && (
              <div className="absolute inset-0 z-[2000] bg-red-50/95 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="text-5xl">🔒</div>
                <div className="space-y-2">
                  <div className="font-black text-red-800 text-lg">تم رفض الوصول للموقع</div>
                  <div className="text-sm text-red-600 max-w-xs">يرجى تفعيل "إذن الموقع" في إعدادات المتصفح ليعمل التتبع المباشر.</div>
                  <button onClick={() => window.location.reload()} className="btn-danger py-2 px-6 rounded-full mt-4">إعادة المحاولة</button>
                </div>
              </div>
            )}

            {gpsStatus === 'error' && (
              <div className="absolute inset-0 z-[2000] bg-orange-50/95 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="text-5xl">⚠️</div>
                <div className="space-y-2">
                  <div className="font-black text-orange-800 text-lg">تعذر التقاط إشارة GPS</div>
                  <div className="text-sm text-orange-600 max-w-xs">يرجى التأكد من تفعيل الموقع في جهازك والوقوف في مكان مفتوح.</div>
                </div>
              </div>
            )}
            
            {/* Live Indicator Overlays */}
            {gpsStatus === 'active' && (
              <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                 <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3">
                   <span className="relative flex h-3 w-3">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                   </span>
                   <span className="text-xs font-black text-gray-900">إشارة GPS حية ونشطة</span>
                 </div>
              </div>
            )}

            <div className="absolute bottom-4 left-4 z-[1000] bg-[#2f5d2f] text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-black flex items-center gap-3">
              🛰️ التتبع من الجهاز مباشرة (Live Mode)
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-2xl border border-gray-200 p-1">
          <button onClick={() => setActiveTab('active')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'active' ? 'bg-[#2f5d2f] text-white shadow-lg shadow-[#2f5d2f]/20' : 'text-gray-500'}`}>
            المهام النشطة ({activeTasks.length})
          </button>
          <button onClick={() => setActiveTab('completed')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'completed' ? 'bg-[#2f5d2f] text-white shadow-lg shadow-[#2f5d2f]/20' : 'text-gray-500'}`}>
            المكتملة ({completedTasks.length})
          </button>
        </div>

        {/* Tasks */}
        <div className="space-y-4">
          {(activeTab === 'active' ? activeTasks : completedTasks).map(task => (
            <div key={task.id} className="card p-5 animate-fade-in">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`badge text-xs ${task.taskType === 'pickup' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                      {task.taskType === 'pickup' ? '📦 استلام' : '🏡 توزيع'}
                    </span>
                    <span className={`badge text-xs ${getPriorityColor(task.priorityLevel)}`}>
                      {PRIORITY_LABELS[task.priorityLevel]}
                    </span>
                  </div>

                  {/* Personalized Message */}
                  <div className="bg-[#2f5d2f]/5 border-r-4 border-[#2f5d2f] p-3 rounded-l-xl mb-4 text-sm leading-relaxed">
                    <span className="font-black text-[#2f5d2f]">مرحباً {COURIER.name.split(' ')[0]}،</span> لديك مهمة استلام فائض طعام من <span className="font-bold">{task.donorName}</span> بحي <span className="font-bold">{task.district}</span>. 
                    يرجى محاولة الوصول في تمام <span className="font-black text-[#b68a3a] underline decoration-wavy decoration-[#b68a3a]/30 italic">{task.pickupTime}</span> وتحديث الحالة فور الاستلام.
                  </div>

                  <div className="font-black text-gray-900 text-lg">{task.donorName}</div>
                  <div className="text-gray-500 text-sm mt-1">📍 حي {task.district}</div>
                </div>
                <span className={`badge ${getTaskStatusColor(task.status)}`}>{TASK_STATUS_LABELS[task.status]}</span>
              </div>

              {/* Task Info */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-400 mb-1">رقم الجوال</div>
                  <div className="text-sm font-bold text-gray-700 leading-snug">{task.phone}</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 col-span-2">
                  <div className="text-xs text-blue-600 mb-1">وقت الاستلام</div>
                  <div className="text-sm font-black text-blue-700 leading-snug">{task.pickupTime}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-400 mb-1">رقم الطلب</div>
                  <div className="font-mono font-bold text-gray-800 text-sm">{task.requestNumber}</div>
                </div>
              </div>

              {/* Progress Bar for Active Tasks */}
              {!['completed','failed'].includes(task.status) && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>انتظار القبول</span>
                    <span>مكتمل</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{
                        width: task.status === 'pending' ? '10%' : task.status === 'accepted' ? '25%' : task.status === 'started' ? '45%' : task.status === 'arrived' ? '65%' : task.status === 'executed' ? '85%' : '100%',
                        background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))'
                      }} />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {taskActionsByStatus[task.status]?.length > 0 && (
                <div className="space-y-2">
                  {taskActionsByStatus[task.status].map((action, i) => (
                    <button key={i} onClick={() => updateTaskStatus(task.id, action.nextStatus)}
                      className={`w-full justify-center py-3 text-sm ${action.color}`}>
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Extra Actions */}
              {!['completed','failed'].includes(task.status) && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setShowNote(task.id)}
                    className="btn-ghost flex-1 justify-center text-xs py-2">💬 إضافة ملاحظة</button>
                  <label className="btn-ghost flex-1 justify-center text-xs py-2 cursor-pointer text-center m-0 flex items-center">
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = async () => {
                            const base64String = reader.result as string;
                            
                        // Find current request images from our state
                        const targetReq = rawRequests.find(r => r.id === task.foodRequestId);
                        if (!targetReq) return;

                        const labels: Record<string, string> = {
                              'pending': 'قبل القبول',
                              'accepted': 'عند الموافقة',
                              'started': 'عند الانطلاق',
                              'arrived': 'عند الوصول',
                              'executed': 'الاستلام',
                              'completed': 'إتمام المهمة',
                              'failed': 'تقرير تعذر'
                            };

                            const newImage = {
                              url: base64String,
                              label: labels[task.status] || 'صورة إضافية',
                              createdAt: new Date().toISOString()
                            };

                            try {
                              showToast('⏳ جاري رفع الصورة للسحابة...');
                              await DataService.updateRequestStatus(targetReq.id, {
                                images: [...(targetReq.images || []), newImage]
                              });
                              showToast('📷 تم حفظ الصورة في السحابة بنجاح');
                              loadTasks(); // Refresh to show new image if needed
                            } catch (error) {
                              console.error('Error saving image:', error);
                              alert('خطأ في حفظ الصورة');
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                    />
                    📷 تصوير
                  </label>
                  <a href={`https://maps.google.com/?q=${task.district}`} target="_blank" rel="noopener noreferrer"
                    className="btn-ghost flex-1 justify-center text-xs py-2">🗺️ خريطة</a>
                </div>
              )}

              {/* Note Input */}
              {showNote === task.id && (
                <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                  <textarea className="form-input h-20 resize-none text-sm" placeholder="اكتب ملاحظتك هنا..."
                    value={note} onChange={e => setNote(e.target.value)} />
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => { setShowNote(null); setNote(''); showToast('✅ تم حفظ الملاحظة'); }}
                      className="btn-primary flex-1 justify-center text-sm py-2">حفظ</button>
                    <button onClick={() => setShowNote(null)} className="btn-ghost flex-1 justify-center text-sm py-2">إلغاء</button>
                  </div>
                </div>
              )}

              {task.status === 'completed' && (
                <div className="text-center py-3 text-green-600 font-bold">
                  ✅ تم إنجاز المهمة بنجاح! شكراً لك
                </div>
              )}
            </div>
          ))}

          {(activeTab === 'active' ? activeTasks : completedTasks).length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <div className="text-6xl mb-3">{activeTab === 'active' ? '😊' : '📭'}</div>
              <div className="font-semibold">{activeTab === 'active' ? 'لا توجد مهام نشطة الآن' : 'لا توجد مهام مكتملة'}</div>
              <div className="text-sm mt-1">{activeTab === 'active' ? 'ستتلقى إشعاراً عند تعيين مهمة جديدة' : ''}</div>
            </div>
          )}
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-primary">← الصفحة الرئيسية</Link>
        </div>
      </div>
    </div>
  );
}
