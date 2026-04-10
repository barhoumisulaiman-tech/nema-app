import { RequestStatus, PriorityLevel, CourierStatus, TaskStatus } from './types';

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    calendar: 'gregory',
  }).format(date);
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ar-SA', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    calendar: 'gregory',
  }).format(date);
}

export function generateRequestNumber(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(Math.random() * 900) + 100;
  return `NM-${year}-${num}`;
}

export function getStatusColor(status: RequestStatus): string {
  const colors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700 border-blue-200',
    reviewing: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    accepted: 'bg-purple-100 text-purple-700 border-purple-200',
    pickup_assigned: 'bg-orange-100 text-orange-700 border-orange-200',
    courier_on_way: 'bg-orange-200 text-orange-800 border-orange-300',
    picked_up: 'bg-teal-100 text-teal-700 border-teal-200',
    sorting: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    distribution_assigned: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    distributing: 'bg-lime-100 text-lime-700 border-lime-200',
    distributed: 'bg-green-100 text-green-700 border-green-200',
    completed: 'bg-green-200 text-green-800 border-green-300',
    cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-600';
}

export function getPriorityColor(priority: PriorityLevel): string {
  const colors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-yellow-100 text-yellow-700',
    urgent: 'bg-red-100 text-red-700',
  };
  return colors[priority] || 'bg-gray-100 text-gray-600';
}

export function getCourierStatusColor(status: CourierStatus): string {
  const colors: Record<string, string> = {
    available: 'bg-green-100 text-green-700',
    on_task: 'bg-orange-100 text-orange-700',
    unavailable: 'bg-gray-100 text-gray-500',
  };
  return colors[status] || 'bg-gray-100 text-gray-600';
}

export function getTaskStatusColor(status: TaskStatus): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-blue-100 text-blue-700',
    started: 'bg-orange-100 text-orange-700',
    arrived: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-600';
}

export function getStatusProgress(status: RequestStatus): number {
  const progressMap: Record<string, number> = {
    new: 5,
    reviewing: 15,
    accepted: 25,
    pickup_assigned: 35,
    courier_on_way: 45,
    picked_up: 55,
    sorting: 65,
    distribution_assigned: 75,
    distributing: 85,
    distributed: 93,
    completed: 100,
    cancelled: 0,
    rejected: 0,
  };
  return progressMap[status] || 0;
}

export function timeAgo(dateString: string): string {
  const now = new Date('2024-12-15T22:00:00');
  const date = new Date(dateString);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'الآن';
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  if (hours < 24) return `منذ ${hours} ساعة`;
  return `منذ ${days} يوم`;
}
