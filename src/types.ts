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
  flightNumber?: string;
  departureTime?: string;
  arrivalTime?: string;
  hotelName?: string;
  roomType?: string;
  checkInTime?: string;
  checkOutTime?: string;
  contactName?: string;
  contactPhone?: string;
  companyName?: string;
  entranceFee?: string;
  openingHours?: string;
  tourDuration?: string;
  tourGuide?: string;
  trainNumber?: string;
  trainClass?: string;
  platform?: string;
  busNumber?: string;
  busCompany?: string;
  busStop?: string;
  meetingRoom?: string;
  agenda?: string;
  meetingType?: string;
  conferenceHall?: string;
  registrationRequired?: boolean;
  factoryType?: string;
  safetyRequirements?: string;
  tourGuideRequired?: boolean;
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