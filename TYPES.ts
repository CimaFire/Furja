// Global types for Furja API

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  avatar_url?: string;
  is_verified: boolean;
  is_broadcaster: boolean;
  is_banned: boolean;
  created_at: Date;
  updated_at: Date;
}

interface Stream {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  thumbnail_url?: string;
  stream_key: string;
  rtmp_url?: string;
  hls_url?: string;
  status: 'scheduled' | 'live' | 'ended';
  viewer_count: number;
  started_at?: Date;
  ended_at?: Date;
  duration: number;
  is_public: boolean;
  created_at: Date;
  updated_at: Date;
}

interface Message {
  id: number;
  stream_id: number;
  user_id: number;
  content: string;
  created_at: Date;
}

interface Gift {
  id: number;
  stream_id: number;
  sender_id: number;
  gift_type: string;
  amount: number;
  points: number;
  created_at: Date;
}

interface Payment {
  id: number;
  user_id: number;
  amount: number;
  currency: string;
  payment_method: string;
  transaction_id?: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: Date;
}

interface Subscription {
  id: number;
  user_id: number;
  stripe_subscription_id: string;
  plan_id: string;
  status: string;
  created_at: Date;
}

interface Report {
  id: number;
  user_id: number;
  content_type: string;
  content_id: number;
  reason: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: Date;
}

interface Analytics {
  id: number;
  stream_id: number;
  total_viewers: number;
  peak_viewers: number;
  average_duration: number;
  total_gifts_amount: number;
  created_at: Date;
}

export {
  User,
  Stream,
  Message,
  Gift,
  Payment,
  Subscription,
  Report,
  Analytics
};
