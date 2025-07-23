import React, { useState } from 'react';
import { travelTips } from '../data/travelTips';
import * as LucideIcons from 'lucide-react';

const TravelTipsSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Extract unique categories for filter
  const categories = ['All', ...new Set(travelTips.map(tip => tip.category))];
  
  const filteredTips = selectedCategory === 'All' 
    ? travelTips 
    : travelTips.filter(tip => tip.category === selectedCategory);

  return (
    <section id="tips" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-primary font-montserrat mb-3">Essential Travel Tips</h2>
          <p className="text-base text-gray-700 max-w-3xl mx-auto">
            Make the most of your journey through China with these practical insights and cultural advice
          </p>
        </div>
        
        <div className="flex justify-center mb-8 overflow-x-auto pb-2">
          <div className="flex space-x-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-secondary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTips.map(tip => {
            // @ts-ignore - Dynamically accessing Lucide icons
            const Icon = LucideIcons[tip.icon] || LucideIcons.Info;
            
            return (
              <div key={tip.id} className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-primary bg-opacity-10 rounded-full mr-3">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-primary font-montserrat">{tip.title}</h3>
                </div>
                <p className="text-gray-700">{tip.content}</p>
                <div className="mt-4">
                  <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                    {tip.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TravelTipsSection;