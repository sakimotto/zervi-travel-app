import { Destination } from '../types';
import { hasCustomSampleData, getCustomSampleDestinations } from '../utils/localStorage';

// Get custom sample data if it exists
const customDestinations = hasCustomSampleData() ? getCustomSampleDestinations() : null;

// Default destinations if no custom data exists
const defaultDestinations: Destination[] = [
  {
    id: 'great-wall',
    name: 'The Great Wall',
    description: 'One of the greatest wonders of the world, the Great Wall of China is a series of fortifications stretching over 13,000 miles. The most popular sections near Beijing include Badaling, Mutianyu, and Jinshanling.',
    image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    region: 'Northern China',
    activities: ['Hiking', 'Photography', 'Historical Tours'],
    bestTimeToVisit: 'Spring (April-May) or Autumn (September-October)'
  },
  {
    id: 'forbidden-city',
    name: 'The Forbidden City',
    description: 'Located in the center of Beijing, the Forbidden City was the imperial palace of China\'s emperors for five centuries. It features stunning traditional Chinese architecture across 180 acres.',
    image: 'https://images.unsplash.com/photo-1584646098378-0874589d76b1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    region: 'Beijing',
    activities: ['Cultural Tours', 'Photography', 'Architecture Appreciation'],
    bestTimeToVisit: 'Spring (April-May) or Autumn (September-October)'
  },
  {
    id: 'terracotta-army',
    name: 'Terracotta Army',
    description: 'Discovered in 1974, the Terracotta Army is a collection of terracotta sculptures depicting the armies of Qin Shi Huang, the first Emperor of China. It\'s one of the greatest archaeological finds in history.',
    image: 'https://images.unsplash.com/photo-1591181061466-d111f95cf238?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    region: 'Xi\'an',
    activities: ['Archaeological Tours', 'Photography', 'Museum Visits'],
    bestTimeToVisit: 'March to May or September to November'
  },
  {
    id: 'li-river',
    name: 'Li River & Guilin',
    description: 'The Li River offers some of China\'s most picturesque scenery with its dramatic limestone karsts. A cruise from Guilin to Yangshuo reveals stunning landscapes that have inspired artists for centuries.',
    image: 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    region: 'Southern China',
    activities: ['River Cruises', 'Photography', 'Hiking', 'Cycling'],
    bestTimeToVisit: 'April to October'
  },
  {
    id: 'shanghai',
    name: 'Shanghai',
    description: 'China\'s largest city and financial hub, Shanghai blends historic charm with futuristic skylines. The waterfront Bund area showcases colonial architecture, while Pudong features ultramodern skyscrapers.',
    image: 'https://images.unsplash.com/photo-1548919973-5cef591cdbc9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    region: 'Eastern China',
    activities: ['Urban Exploration', 'Shopping', 'Food Tours', 'Architecture Tours'],
    bestTimeToVisit: 'September to November or March to May'
  },
  {
    id: 'chengdu',
    name: 'Chengdu & Giant Pandas',
    description: 'Chengdu is home to the famous Giant Panda Breeding Research Base, where you can observe these beloved animals in environments resembling their natural habitat.',
    image: 'https://images.unsplash.com/photo-1560343776-97e7d202ff0e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    region: 'Sichuan Province',
    activities: ['Panda Viewing', 'Culinary Experiences', 'Cultural Exploration'],
    bestTimeToVisit: 'March to June or September to November'
  }
];

// Export either custom or default destinations
export const destinations: Destination[] = customDestinations || defaultDestinations;