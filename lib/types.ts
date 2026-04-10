// ===== Types for جمعية حفظ النعمة =====

export type UserRole = 'admin' | 'courier' | 'supervisor' | 'visitor';

export type RequestStatus =
  | 'new'
  | 'reviewing'
  | 'accepted'
  | 'pickup_assigned'
  | 'courier_on_way'
  | 'picked_up'
  | 'sorting'
  | 'distribution_assigned'
  | 'distributing'
  | 'distributed'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export type DonorType =
  | 'wedding_hall'
  | 'rest_house'
  | 'restaurant'
  | 'hotel'
  | 'home'
  | 'event'
  | 'other';

export type PriorityLevel = 'low' | 'medium' | 'urgent';

export type CourierStatus = 'available' | 'on_task' | 'unavailable';

export type TaskType = 'pickup' | 'distribution';

export type TaskStatus =
  | 'pending'
  | 'accepted'
  | 'started'
  | 'arrived'
  | 'executed'
  | 'completed'
  | 'failed';

export type FoodStatus = 'ready' | 'needs_packaging' | 'refrigerated';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Courier {
  id: string;
  userId: string;
  name: string;
  phone: string;
  city: string;
  district: string;
  serviceArea: string;
  availabilityStatus: CourierStatus;
  taskTypes: ('pickup' | 'distribution')[];
  currentLat?: number;
  currentLng?: number;
  rating: number;
  completedTasks: number;
  avgResponseTime: string;
  vehicleType: 'car' | 'motorcycle' | 'van';
  createdAt: string;
}

export interface FoodRequest {
  id: string;
  requestNumber: string;
  donorName: string;
  donorType: DonorType;
  district: string;
  city?: string;
  foodType?: string;
  estimatedQuantity?: string;
  estimatedMeals?: number;
  phone: string;
  googleMapsLink?: string;
  pickupTime: string;    // وقت استلام الأكل
  currentStatus: RequestStatus;
  priorityLevel: PriorityLevel;
  pickupCourierId?: string;
  pickupCourierName?: string;
  distributionCourierId?: string;
  distributionCourierName?: string;
  assignedFamilies?: string[];
  acceptedAt?: string;
  startedAt?: string;
  arrivedAt?: string;
  completedAt?: string;
  images?: { url: string; label: string; createdAt: string }[];
  createdAt: string;
  updatedAt?: string;
}

export interface Task {
  id: string;
  foodRequestId: string;
  requestNumber: string;
  taskType: TaskType;
  assignedCourierId: string;
  status: TaskStatus;
  startedAt?: string;
  arrivedAt?: string;
  completedAt?: string;
  proofImageUrl?: string;
  courierNotes?: string;
  donorName: string;
  district: string;
  phone: string;
  pickupTime: string;
  priorityLevel: PriorityLevel;
  createdAt: string;
}

export interface BeneficiaryFamily {
  id: string;
  familyName: string;
  city: string;
  district: string;
  address: string;
  latitude?: number;
  longitude?: number;
  familySize: number;
  childrenCount: number;
  priorityLevel: PriorityLevel;
  lastServedAt?: string;
  isActive: boolean;
  notes?: string;
  totalServings: number;
  createdAt: string;
}

export interface Distribution {
  id: string;
  foodRequestId: string;
  familyId: string;
  familyName: string;
  assignedCourierId: string;
  status: 'pending' | 'delivered' | 'failed';
  deliveredAt?: string;
  notes?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  foodRequestId: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  actionType: string;
  description: string;
  createdAt: string;
}

export interface AIRecommendation {
  priority: PriorityLevel;
  priorityReason: string;
  suggestedPickupCourier: string;
  suggestedPickupCourierReason: string;
  suggestedDistributionCourier: string;
  suggestedDistributionCourierReason: string;
  suggestedFamiliesCount: number;
  suggestedFamilies: string[];
  timeNote: string;
  additionalNotes: string;
  courierMessage: string;
}

export interface Stats {
  totalRequests: number;
  newRequests: number;
  inProgressRequests: number;
  completedRequests: number;
  cancelledRequests: number;
  availableCouriers: number;
  totalFamilies: number;
  totalMealsSaved: number;
  avgResponseTimeMinutes: number;
}
