import {
  Courier, FoodRequest, BeneficiaryFamily,
  ActivityLog, Task, Distribution, Stats
} from './types';

export const COURIERS: Courier[] = [
  {
    id: 'c1', userId: 'u2', name: 'محمد العمري', phone: '0501234567',
    city: 'الزلفي', district: 'حي الروضة', serviceArea: 'شمال الزلفي',
    availabilityStatus: 'available', taskTypes: ['pickup', 'distribution'],
    currentLat: 26.2929, currentLng: 44.8217,
    rating: 4.9, completedTasks: 127, avgResponseTime: '18 دقيقة',
    vehicleType: 'van', createdAt: '2024-01-10'
  },
  {
    id: 'c2', userId: 'u3', name: 'خالد الزهراني', phone: '0509876543',
    city: 'الزلفي', district: 'حي الصديق', serviceArea: 'جنوب الزلفي',
    availabilityStatus: 'on_task', taskTypes: ['distribution'],
    currentLat: 26.3012, currentLng: 44.8150,
    rating: 4.7, completedTasks: 84, avgResponseTime: '22 دقيقة',
    vehicleType: 'car', createdAt: '2024-02-15'
  },
  {
    id: 'c3', userId: 'u4', name: 'أحمد الشمري', phone: '0551112233',
    city: 'الزلفي', district: 'حي عسيلة', serviceArea: 'وسط الزلفي',
    availabilityStatus: 'available', taskTypes: ['pickup'],
    currentLat: 26.2850, currentLng: 44.8300,
    rating: 4.6, completedTasks: 63, avgResponseTime: '25 دقيقة',
    vehicleType: 'car', createdAt: '2024-03-20'
  },
  {
    id: 'c4', userId: 'u5', name: 'فهد الحربي', phone: '0564445566',
    city: 'الزلفي', district: 'حي القدس', serviceArea: 'شرق الزلفي',
    availabilityStatus: 'unavailable', taskTypes: ['pickup', 'distribution'],
    currentLat: 26.2780, currentLng: 44.8100,
    rating: 4.5, completedTasks: 45, avgResponseTime: '30 دقيقة',
    vehicleType: 'motorcycle', createdAt: '2024-04-05'
  },
];

export const FOOD_REQUESTS: FoodRequest[] = [];

export const BENEFICIARY_FAMILIES: BeneficiaryFamily[] = [
  {
    id: 'f1',
    familyName: 'أسرة الجهني - حي النرجس',
    city: 'الرياض',
    district: 'النرجس',
    address: 'شارع 5، حي النرجس',
    latitude: 24.7750,
    longitude: 43.7350,
    familySize: 8,
    childrenCount: 5,
    priorityLevel: 'urgent',
    lastServedAt: '2024-12-10',
    isActive: true,
    notes: 'أسرة كبيرة، رب الأسرة مريض',
    totalServings: 23,
    createdAt: '2024-01-15',
  },
  {
    id: 'f2',
    familyName: 'أسرة القحطاني - حي الياسمين',
    city: 'الرياض',
    district: 'الياسمين',
    address: 'شارع الياسمين الرئيسي',
    latitude: 24.7600,
    longitude: 46.7300,
    familySize: 6,
    childrenCount: 3,
    priorityLevel: 'medium',
    lastServedAt: '2024-12-08',
    isActive: true,
    notes: '',
    totalServings: 18,
    createdAt: '2024-02-20',
  },
  {
    id: 'f3',
    familyName: 'أسرة الشهري - حي العارض',
    city: 'الرياض',
    district: 'العارض',
    address: 'حي العارض، بلوك 3',
    latitude: 24.8000,
    longitude: 46.8000,
    familySize: 10,
    childrenCount: 7,
    priorityLevel: 'urgent',
    lastServedAt: '2024-12-12',
    isActive: true,
    notes: 'أسرة كثيرة الأفراد، يُفضل إرسال كميات كبيرة',
    totalServings: 31,
    createdAt: '2024-01-05',
  },
  {
    id: 'f4',
    familyName: 'أسرة الدوسري - حي القيروان',
    city: 'الرياض',
    district: 'القيروان',
    address: 'شارع القيروان',
    latitude: 24.7200,
    longitude: 46.6900,
    familySize: 5,
    childrenCount: 2,
    priorityLevel: 'medium',
    lastServedAt: '2024-12-05',
    isActive: true,
    notes: '',
    totalServings: 12,
    createdAt: '2024-03-10',
  },
  {
    id: 'f5',
    familyName: 'أسرة المطيري - حي الملقا',
    city: 'الرياض',
    district: 'الملقا',
    address: 'حي الملقا، قرب الجامع الكبير',
    latitude: 24.7900,
    longitude: 46.6600,
    familySize: 7,
    childrenCount: 4,
    priorityLevel: 'low',
    lastServedAt: '2024-11-28',
    isActive: true,
    notes: 'أحد أفراد الأسرة لديه حساسية من الأسماك',
    totalServings: 9,
    createdAt: '2024-04-22',
  },
];

export const TASKS: Task[] = [];

export const DISTRIBUTIONS: Distribution[] = [];

export const ACTIVITY_LOGS: ActivityLog[] = [];

export const STATS: Stats = {
  totalRequests: 0,
  newRequests: 0,
  inProgressRequests: 0,
  completedRequests: 0,
  cancelledRequests: 0,
  availableCouriers: 2,
  totalFamilies: 156,
  totalMealsSaved: 18420,
  avgResponseTimeMinutes: 14,
};

export const STATUS_LABELS: Record<string, string> = {
  new: 'جديد',
  reviewing: 'قيد المراجعة',
  accepted: 'تم القبول',
  pickup_assigned: 'تم تعيين مندوب الاستلام',
  courier_on_way: 'المندوب في الطريق',
  picked_up: 'تم الاستلام',
  sorting: 'قيد الفرز',
  distribution_assigned: 'تم تعيين مندوب التوزيع',
  distributing: 'جاري التوزيع',
  distributed: 'تم التوزيع',
  completed: 'مكتمل',
  cancelled: 'ملغي',
  rejected: 'مرفوض',
};

export const DONOR_TYPE_LABELS: Record<string, string> = {
  wedding_hall: 'قاعة أفراح',
  rest_house: 'استراحة',
  restaurant: 'مطعم',
  hotel: 'فندق',
  home: 'منزل',
  event: 'مناسبة خاصة',
  other: 'أخرى',
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'منخفضة',
  medium: 'متوسطة',
  urgent: 'عاجل',
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  pending: 'في الانتظار',
  accepted: 'تم القبول',
  started: 'بدأت المهمة',
  arrived: 'وصل الموقع',
  executed: 'تم التنفيذ',
  completed: 'مكتملة',
  failed: 'تعذر التنفيذ',
};

export const FOOD_STATUS_LABELS: Record<string, string> = {
  ready: 'جاهز للاستلام',
  needs_packaging: 'يحتاج تغليف',
  refrigerated: 'مبرد',
};

export const COURIER_STATUS_LABELS: Record<string, string> = {
  available: 'متاح',
  on_task: 'في مهمة',
  unavailable: 'غير متاح',
};
