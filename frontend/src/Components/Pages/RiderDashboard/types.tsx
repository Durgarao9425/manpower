export interface CardData {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  icon?: string;
}

export interface SliderImage {
  id: number;
  url: string;
  alt: string;
}

export interface PaymentStatement {
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
}

export interface AttendanceRecord {
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'present' | 'absent' | 'half-day';
}