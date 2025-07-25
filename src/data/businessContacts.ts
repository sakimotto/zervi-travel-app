import { BusinessContact } from '../types';

export const sampleBusinessContacts: BusinessContact[] = [
  {
    id: 'contact-1',
    name: 'David Chen',
    nickname: 'Dave',
    title: 'International Sales Director',
    company: 'Shenzhen Tech Innovations Ltd.',
    email: 'david.chen@sztech.com.cn',
    phone: '+86 755 1234 5678',
    wechat: 'davidchen_sz',
    linkedin: 'linkedin.com/in/davidchen-sz',
    address: 'Futian CBD, Shenzhen',
    city: 'Shenzhen',
    industry: 'Technology',
    relationship: 'Client',
    importance: 'High',
    last_contact: '2024-01-18',
    website: 'https://www.sztech.com.cn',
    alibaba_store: 'https://sztech.en.alibaba.com',
    notes: 'Key decision maker for electronics procurement. Prefers WeChat communication.'
  },
  {
    id: 'contact-5',
    name: 'Sarah Wang',
    nickname: 'Sarah',
    title: 'Procurement Manager',
    company: 'Global Trading Corp',
    email: 'sarah.wang@globaltrading.com',
    phone: '+86 21 9876 5432',
    wechat: 'sarahw_trading',
    address: 'Lujiazui Financial District, Shanghai',
    city: 'Shanghai',
    industry: 'Import/Export',
    relationship: 'Partner',
    importance: 'High',
    last_contact: '2024-01-15',
    website: 'https://www.globaltrading.com',
    shopee_store: 'https://shopee.com/globaltrading',
    notes: 'Handles large volume orders. Very detail-oriented with documentation.'
  },
  {
    id: 'contact-2',
    name: 'Michael Zhang',
    title: 'Factory Manager',
    company: 'Guangzhou Manufacturing Hub',
    email: 'm.zhang@gzmfg.cn',
    phone: '+86 20 5555 7777',
    address: 'Industrial Zone, Panyu District, Guangzhou',
    city: 'Guangzhou',
    industry: 'Manufacturing',
    relationship: 'Supplier',
    importance: 'Medium',
    last_contact: '2024-01-10',
    website: 'https://www.gzmfg.cn',
    notes: 'Manages production schedules. Best to contact in the morning.'
  },
  {
    id: 'contact-3',
    name: 'Lisa Liu',
    title: 'Business Development Manager',
    company: 'China Trade Promotion Council',
    email: 'lisa.liu@ctpc.org.cn',
    phone: '+86 10 8888 9999',
    address: 'Chaoyang District, Beijing',
    city: 'Beijing',
    industry: 'Government',
    relationship: 'Government',
    importance: 'High',
    last_contact: '2024-01-20',
    website: 'https://www.ctpc.org.cn',
    notes: 'Helps with trade regulations and government relations. Very knowledgeable about export procedures.'
  },
  {
    id: 'contact-6',
    name: 'Tom Wu',
    title: 'Logistics Coordinator',
    company: 'Express Shipping Solutions',
    email: 'tom.wu@expressship.cn',
    phone: '+86 574 3333 4444',
    address: 'Port Area, Ningbo',
    city: 'Ningbo',
    industry: 'Logistics',
    relationship: 'Service Provider',
    importance: 'Medium',
    last_contact: '2024-01-12',
    website: 'https://www.expressship.cn',
    notes: 'Handles all shipping arrangements. Very reliable for urgent shipments.'
  },
  {
    id: 'contact-4',
    name: 'Amy Zhou',
    title: 'Quality Control Manager',
    company: 'Independent QC Services',
    email: 'amy.zhou@qcservices.com',
    phone: '+86 755 7777 8888',
    address: 'Nanshan District, Shenzhen',
    city: 'Shenzhen',
    industry: 'Quality Control',
    relationship: 'Service Provider',
    importance: 'High',
    last_contact: '2024-01-16',
    website: 'https://www.qcservices.com',
    amazon_store: 'https://amazon.com/stores/qcservices',
    linked_supplier_id: 'supplier-5',
    notes: 'Provides third-party quality inspections. Very thorough and professional.'
  },
  {
    id: 'contact-7',
    name: 'Kevin Liu',
    title: 'Sales Representative',
    company: 'Ningbo Packaging Solutions Co.',
    email: 'kevin.liu@nbpack.com',
    phone: '+86 574 8765 4322',
    wechat: 'kevinliu_nbpack',
    address: '99 Export Processing Zone, Beilun District',
    city: 'Ningbo',
    industry: 'Packaging & Printing',
    relationship: 'Supplier',
    importance: 'Medium',
    last_contact: '2024-01-14',
    website: 'https://www.nbpack.com',
    linked_supplier_id: 'supplier-5',
    notes: 'Direct sales contact at Ningbo Packaging. Handles quotations and order processing.'
  }
];