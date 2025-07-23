import { TravelTip } from '../types';

export const travelTips: TravelTip[] = [
  {
    id: 'visa',
    category: 'Preparation',
    title: 'Visa Requirements',
    content: 'Most foreign visitors to China require a visa. Apply at your local Chinese embassy or consulate at least one month before your trip. Ensure your passport is valid for at least six months beyond your planned stay.',
    icon: 'FileText'
  },
  {
    id: 'internet',
    category: 'Technology',
    title: 'Internet Access',
    content: 'Many Western websites and apps (Google, Facebook, Instagram, etc.) are blocked in China. Consider downloading a VPN before your trip, and get essential Chinese apps like WeChat, Baidu Maps, and Didi (ride-hailing).',
    icon: 'Wifi'
  },
  {
    id: 'payment',
    category: 'Money',
    title: 'Payment Methods',
    content: 'China is increasingly cashless, with most locals using mobile payment apps (WeChat Pay and Alipay). However, these require a Chinese bank account to set up. Bring cash to exchange and a credit card for hotels and larger establishments.',
    icon: 'CreditCard'
  },
  {
    id: 'transportation',
    category: 'Getting Around',
    title: 'Transportation Options',
    content: 'China has excellent public transportation. High-speed trains connect major cities, while metros serve urban areas effectively. Download metro maps in advance and consider getting a transportation card in each city you visit.',
    icon: 'Train'
  },
  {
    id: 'culture',
    category: 'Cultural Awareness',
    title: 'Cultural Etiquette',
    content: 'Respect local customs: remove shoes when entering homes, accept business cards with both hands, and avoid public displays of affection. Tipping is not common practice in most situations.',
    icon: 'UserCheck'
  },
  {
    id: 'food',
    category: 'Dining',
    title: 'Food Safety and Etiquette',
    content: 'Chinese cuisine varies greatly by region. Stick to bottled water and be cautious with street food if you have a sensitive stomach. Learn to use chopsticks before your trip, and it\'s polite to try everything offered at group meals.',
    icon: 'Utensils'
  },
  {
    id: 'weather',
    category: 'Preparation',
    title: 'Seasonal Considerations',
    content: 'China\'s climate varies dramatically by region. Northern areas have cold winters, while southern regions can be hot and humid year-round. Research the weather for your specific destinations and time of year.',
    icon: 'Cloud'
  },
  {
    id: 'health',
    category: 'Health',
    title: 'Health Precautions',
    content: 'Consult your doctor for recommended vaccinations before traveling to China. Bring any prescription medications in their original packaging with a doctor\'s note. Consider travel insurance that covers medical evacuation.',
    icon: 'Heart'
  }
];