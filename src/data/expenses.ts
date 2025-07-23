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
    paymentMethod: 'WeChat Pay',
    businessPurpose: 'Meeting with Shenzhen Electronics Manufacturing Co.',
    assignedTo: 'Archie',
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
    paymentMethod: 'Credit Card',
    businessPurpose: 'Relationship building with Guangzhou Textile Solutions',
    assignedTo: 'Both',
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
    paymentMethod: 'Credit Card',
    businessPurpose: 'Business trip accommodation',
    assignedTo: 'Both',
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
    paymentMethod: 'Credit Card',
    businessPurpose: 'Travel to supplier meetings in Shanghai',
    assignedTo: 'Both',
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
    paymentMethod: 'Cash',
    businessPurpose: 'Client relationship building with Beijing Precision Machinery',
    assignedTo: 'Archie',
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
    paymentMethod: 'Credit Card',
    businessPurpose: 'Business communications during trip',
    assignedTo: 'Yok',
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
    paymentMethod: 'Cash',
    businessPurpose: 'Networking materials for trade show',
    assignedTo: 'Both',
    reimbursable: true,
    approved: true
  }
];