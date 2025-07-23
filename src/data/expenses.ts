import { Expense } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Get dates for sample expenses
const getYesterday = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

const getTwoDaysAgo = () => {
  const twoDays = new Date();
  twoDays.setDate(twoDays.getDate() - 2);
  return twoDays.toISOString().split('T')[0];
};

const getThreeDaysAgo = () => {
  const threeDays = new Date();
  threeDays.setDate(threeDays.getDate() - 3);
  return threeDays.toISOString().split('T')[0];
};

export const sampleExpenses: Expense[] = [
  {
    id: uuidv4(),
    date: getYesterday(),
    category: 'Transportation',
    description: 'Taxi from hotel to supplier meeting',
    amount: 85,
    currency: 'CNY',
    payment_method: 'WeChat Pay',
    business_purpose: 'Meeting with Shenzhen Electronics Manufacturing Co.',
    assigned_to: 'Archie',
    reimbursable: true,
    approved: false
  },
  {
    id: uuidv4(),
    date: getYesterday(),
    category: 'Meals',
    description: 'Business lunch with potential supplier',
    amount: 320,
    currency: 'CNY',
    payment_method: 'Credit Card',
    business_purpose: 'Relationship building with Guangzhou Textile Solutions',
    assigned_to: 'Both',
    reimbursable: true,
    approved: false
  },
  {
    id: uuidv4(),
    date: getTwoDaysAgo(),
    category: 'Accommodation',
    description: 'Hotel stay - Grand Hyatt Shanghai',
    amount: 1200,
    currency: 'CNY',
    payment_method: 'Credit Card',
    business_purpose: 'Business trip accommodation',
    assigned_to: 'Both',
    reimbursable: true,
    approved: true
  },
  {
    id: uuidv4(),
    date: getTwoDaysAgo(),
    category: 'Transportation',
    description: 'High-speed train Beijing to Shanghai',
    amount: 553,
    currency: 'CNY',
    payment_method: 'Credit Card',
    business_purpose: 'Travel to supplier meetings in Shanghai',
    assigned_to: 'Both',
    reimbursable: true,
    approved: true
  },
  {
    id: uuidv4(),
    date: getThreeDaysAgo(),
    category: 'Entertainment',
    description: 'Client dinner at upscale restaurant',
    amount: 680,
    currency: 'CNY',
    payment_method: 'Cash',
    business_purpose: 'Client relationship building with Beijing Precision Machinery',
    assigned_to: 'Archie',
    reimbursable: true,
    approved: false
  },
  {
    id: uuidv4(),
    date: getThreeDaysAgo(),
    category: 'Communication',
    description: 'International roaming charges',
    amount: 45,
    currency: 'USD',
    payment_method: 'Credit Card',
    business_purpose: 'Business communications during trip',
    assigned_to: 'Yok',
    reimbursable: true,
    approved: false
  },
  {
    id: uuidv4(),
    date: getThreeDaysAgo(),
    category: 'Supplies',
    description: 'Business cards printing',
    amount: 120,
    currency: 'CNY',
    payment_method: 'Cash',
    business_purpose: 'Networking materials for trade show',
    assigned_to: 'Both',
    reimbursable: true,
    approved: true
  }
];