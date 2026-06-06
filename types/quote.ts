export interface LineItem {
  description: string;
  amount: number;
}

export interface Quote {
  id: string;
  created_at: string;
  quote_number: string;
  quote_date: string;
  client_name: string;
  client_address?: string;
  client_email?: string;
  client_city?: string;
  project_address?: string;
  project_city?: string;
  line_items: LineItem[];
  subtotal: number;
  hst: number;
  total: number;
  commission_10?: number;
  commission_12?: number;
  status: 'unpaid' | 'paid' | 'deleted';
  notes?: string;
  paid_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'contractor';
}
