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
  start_time?: string;
  location: string;
  assigned_to: string;
  confirmed: boolean;
  notes?: string;
  type_specific_data?: any;
  created_at?: string;
  updated_at?: string;
  
  // Type-specific fields (flattened for easier access)
  airline?: string;
  flight_number?: string;
  departure_time?: string;
  arrival_time?: string;
  hotel_name?: string;
  room_type?: string;
  check_in_time?: string;
  check_out_time?: string;
  contact_name?: string;
  contact_phone?: string;
  company_name?: string;
  entrance_fee?: string;
  opening_hours?: string;
  tour_duration?: string;
  tour_guide?: string;
  train_number?: string;
  train_class?: string;
  platform?: string;
  bus_number?: string;
  bus_company?: string;
  bus_stop?: string;
  meeting_room?: string;
  agenda?: string;
  meeting_type?: string;
  conference_hall?: string;
  registration_required?: boolean;
  factory_type?: string;
  safety_requirements?: string;
  tour_guide_required?: boolean;
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
  minimum_order: string;
  payment_terms: string;
  lead_time: string;
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
  nickname?: string;
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
  linked_supplier_id?: string;
  website?: string;
  alibaba_store?: string;
  shopee_store?: string;
  amazon_store?: string;
  other_ecommerce?: string;
  created_at?: string;
  updated_at?: string;
};

export type ContactType = 'Business' | 'Traveler' | 'Customer';

export type TravelerProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  passport_number?: string;
  passport_expiry?: string;
  passport_country?: string;
  visa_status?: 'Valid' | 'Expired' | 'Pending' | 'Not Required';
  visa_expiry?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  dietary_restrictions?: string[];
  preferred_airlines?: string[];
  frequent_flyer_numbers?: { [airline: string]: string };
  hotel_preferences?: string;
  travel_insurance?: string;
  medical_conditions?: string;
  created_at?: string;
  updated_at?: string;
};

export type TravelChecklist = {
  id: string;
  traveler_id: string;
  trip_name: string;
  departure_date: string;
  items: TravelChecklistItem[];
  created_at?: string;
  updated_at?: string;
};

export type TravelChecklistItem = {
  id: string;
  category: 'Documents' | 'Packing' | 'Health' | 'Technology' | 'Business' | 'Other';
  item: string;
  completed: boolean;
  required: boolean;
  notes?: string;
};

export type TravelAlert = {
  id: string;
  type: 'departure_reminder' | 'visa_expiry' | 'passport_expiry' | 'travel_time' | 'customs_prep';
  title: string;
  message: string;
  priority: 'High' | 'Medium' | 'Low';
  trigger_time: string;
  related_item_id?: string;
  dismissed: boolean;
  created_at?: string;
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
  assigned_to?: string; // Add traveler assignment
  created_at?: string;
  updated_at?: string;
};

export type Customer = {
  id: string;
  user_id: string;
  company_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  website?: string;
  country?: string;
  city?: string;
  address?: string;
  notes?: string;
  status: 'Lead' | 'Prospect' | 'Active' | 'Inactive';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  estimated_value?: number;
  created_at?: string;
  updated_at?: string;
};

export type CustomerCategory = {
  id: string;
  customer_id: string;
  is_oem: boolean;
  is_odm: boolean;
  is_importer: boolean;
  is_shop_owner: boolean;
  is_retail_chain: boolean;
  is_manufacturing_outsource: boolean;
  is_distributor: boolean;
  is_wholesaler: boolean;
  category_notes?: string;
};

export type TradeShow = {
  id: string;
  user_id: string;
  name: string;
  location?: string;
  venue?: string;
  start_date: string;
  end_date: string;
  booth_number?: string;
  booth_size?: string;
  booth_cost?: number;
  our_booth_details?: string;
  show_website?: string;
  notes?: string;
  created_at?: string;
};

export type TradeShowMeeting = {
  id: string;
  trade_show_id: string;
  customer_id?: string;
  contact_name: string;
  company_name: string;
  meeting_date: string;
  meeting_time?: string;
  location?: string;
  interest_level: 'Cold' | 'Warm' | 'Hot';
  products_interested?: string;
  follow_up_required: boolean;
  follow_up_date?: string;
  notes?: string;
  outcome?: string;
  created_at?: string;
};

export type Flight = {
  id: string;
  user_id: string;
  traveler_name: string;
  airline: string;
  flight_number?: string;
  confirmation_number?: string;
  departure_airport: string;
  departure_city?: string;
  arrival_airport: string;
  arrival_city?: string;
  departure_date: string;
  departure_time?: string;
  arrival_date: string;
  arrival_time?: string;
  seat_number?: string;
  class: 'Economy' | 'Premium Economy' | 'Business' | 'First';
  cost?: number;
  booking_reference?: string;
  status: 'Booked' | 'Confirmed' | 'Checked-in' | 'Completed' | 'Cancelled';
  notes?: string;
  created_at?: string;
};

export type Car = {
  id: string;
  user_id: string;
  rental_company: string;
  confirmation_number?: string;
  vehicle_type?: string;
  vehicle_make_model?: string;
  pickup_location: string;
  pickup_date: string;
  pickup_time?: string;
  dropoff_location: string;
  dropoff_date: string;
  dropoff_time?: string;
  driver_name?: string;
  cost_per_day?: number;
  total_cost?: number;
  insurance_included: boolean;
  gps_included: boolean;
  status: 'Reserved' | 'Picked-up' | 'Returned' | 'Cancelled';
  notes?: string;
  created_at?: string;
};

export type Hotel = {
  id: string;
  user_id: string;
  hotel_name: string;
  confirmation_number?: string;
  address?: string;
  city: string;
  country?: string;
  phone?: string;
  email?: string;
  check_in_date: string;
  check_in_time?: string;
  check_out_date: string;
  check_out_time?: string;
  room_type?: string;
  room_number?: string;
  guest_name: string;
  number_of_guests: number;
  cost_per_night?: number;
  total_nights: number;
  total_cost?: number;
  breakfast_included: boolean;
  wifi_included: boolean;
  status: 'Reserved' | 'Checked-in' | 'Checked-out' | 'Cancelled';
  notes?: string;
  created_at?: string;
};

export type Meeting = {
  id: string;
  user_id: string;
  customer_id?: string;
  title: string;
  meeting_type: 'In-person' | 'Phone' | 'Video' | 'Trade Show';
  meeting_date: string;
  meeting_time: string;
  duration_minutes: number;
  location?: string;
  attendees?: string;
  agenda?: string;
  meeting_notes?: string;
  action_items?: string;
  follow_up_required: boolean;
  follow_up_date?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  priority: 'Low' | 'Medium' | 'High';
  created_at?: string;
};