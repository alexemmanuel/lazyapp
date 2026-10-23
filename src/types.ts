export type CountryCode = string;

export interface CountryInfo {
  code: string;
  name: string;
  flag: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  initials: string;
  category: 'ride' | 'delivery' | string;
  price: number;
  time: number;
  surge?: number;
  available: boolean;
  color: string;
  textColor: string;
  borderColor: string;
  isIdentityVerified?: boolean;
  safetyScore?: number;
  reportCount?: number;
}

export interface ApartmentItem {
  id: string;
  platform: string;
  name: string;
  distanceKm: number;
  pricePerNight: number;
  rating: number;
  reviews: number;
  verifiedSafe: boolean;
  isIdentityVerified: boolean;
  safetyScore: number;
  reportCount: number;
  emoji: string;
  color: string;
  textColor: string;
  borderColor: string;
}

export interface Recipe {
  name: string;
  emoji: string;
  prepMins: number;
  servings: number;
  tags: string[];
  funFact: string;
  steps: string[];
}

export interface ContactItem {
  id: number | string;
  name: string;
  category: string;
  phone: string;
  notes?: string;
  country: string;
  isIdentityVerified?: boolean;
  safetyScore?: number;
  reportCount?: number;
}

export interface MarketProvider {
  id: string;
  name: string;
  category: string;
  distance: string;
  phone: string;
  badge: string;
  isIdentityVerified: boolean;
  safetyScore: number;
  reportCount: number;
  startingPrice: number;
  rating: number;
  reviews: number;
}

export interface ScheduleItem {
  id: string;
  title: string;
  dateTime: string;
  notes?: string;
  category?: string;
  completed?: boolean;
}

export interface TimerItem {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  endedAt?: number;
}

export interface LazyAiMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  properties?: {
    name: string;
    platform: string;
    price: number;
    city: string;
  }[];
  provider?: {
    name: string;
    phone: string;
    source: string;
    verification: string;
  };
}

export interface ReportTarget {
  kind: 'apartment' | 'service' | 'provider';
  id: string;
  name: string;
}
