export type Destination = {
  id: string;
  name: string;
  description: string;
  image: string;
  region: string;
  activities: string[];
  best_time_to_visit: string;
  business_district?: string;
  major_industries?: string[];
  transportation_hubs?: string[];
  created_at?: string;
  updated_at?: string;
};

export type TravelTip = {
  id: string;
  category: string;
  title: string;
  content: string;
  icon: string;
};

export type PhrasesCategory = {
  category: string;
  phrases: {
    english: string;
    mandarin: string;
    pronunciation: string;
  }[];
};

export type Traveler = string; // Now supports any traveler name

export type TravelerOption = {
  id: string;
  name: string;
  role?: string;
  active: boolean;
};

export type ItineraryItemType = 'Flight' | 'Hotel' | 'Taxi' | 'TradeShow' | 'BusinessVisit' | 'Sightseeing' | 'Train' | 'Bus' | 'Meeting' | 'Conference' | 'Factory Visit' | 'Other';

export type ItineraryItem = {
  id: string;
  type: ItineraryItemType;
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  location: string;
  assigned_to: string;
  confirmed: boolean;
  notes?: string;
  type_specific_data?: any;
  created_at?: string;
  updated_at?: string;
};

export type Supplier = {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  industry: string;
  products: string[];
  certifications: string[];
  minimum_order?: string;
  payment_terms?: string;
  lead_time?: string;
  notes?: string;
  website?: string;
  established?: string;
  employees?: string;
  rating?: number;
  last_contact?: string;
  status: 'Active' | 'Potential' | 'Inactive';
  created_at?: string;
  updated_at?: string;
};

export type BusinessContact = {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  wechat?: string;
  linkedin?: string;
  address: string;
  city: string;
  industry: string;
  notes?: string;
  last_contact?: string;
  relationship: 'Client' | 'Supplier' | 'Partner' | 'Government' | 'Service Provider' | 'Other';
  importance: 'High' | 'Medium' | 'Low';
  created_at?: string;
  updated_at?: string;
};

export type Expense = {
  id: string;
  date: string;
  category: 'Transportation' | 'Accommodation' | 'Meals' | 'Entertainment' | 'Supplies' | 'Communication' | 'Other';
  description: string;
  amount: number;
  currency: 'CNY' | 'USD' | 'EUR';
  payment_method: 'Cash' | 'Credit Card' | 'WeChat Pay' | 'Alipay' | 'Bank Transfer';
  receipt?: string;
  business_purpose: string;
  assigned_to: string;
  reimbursable: boolean;
  approved?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type TodoItem = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'High' | 'Medium' | 'Low';
  due_date?: string;
  category: 'Business' | 'Travel' | 'Personal' | 'Supplier' | 'Meeting';
  assigned_to: string;
  created_at?: string;
  updated_at?: string;
};

export type Appointment = {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  start_time: string;
  end_time?: string;
  location?: string;
  attendees?: string[];
  type: 'Meeting' | 'Call' | 'Factory Visit' | 'Supplier Meeting' | 'Conference' | 'Other';
  status: 'Scheduled' | 'Confirmed' | 'Cancelled' | 'Completed';
  reminder?: number; // minutes before
  notes?: string;
  supplier_id?: string;
  contact_id?: string;
  created_at?: string;
  updated_at?: string;
};