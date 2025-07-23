import React, { useState } from 'react';
import { phrases } from '../data/phrases';
import { Volume2, Copy, Check } from 'lucide-react';

const PhrasesSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState(phrases[0].category);
  const [copiedPhrase, setCopiedPhrase] = useState<string | null>(null);
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPhrase(text);
    setTimeout(() => setCopiedPhrase(null), 2000);
  };
  
  const activeTabPhrases = phrases.find(p => p.category === activeTab)?.phrases || [];

  return (
    <section id="phrases" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary font-montserrat mb-3">Useful Mandarin Phrases</h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Learn these essential Mandarin phrases to enhance your travel experience and connect with locals
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex overflow-x-auto border-b">
            {phrases.map(category => (
              <button
                key={category.category}
                onClick={() => setActiveTab(category.category)}
                className={`py-3 px-5 font-medium whitespace-nowrap ${
                  activeTab === category.category
                    ? 'border-b-2 border-secondary text-secondary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {category.category}
              </button>
            ))}
          </div>
          
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      English
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mandarin
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pronunciation
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activeTabPhrases.map((phrase, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {phrase.english}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                        {phrase.mandarin}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 italic">
                        {phrase.pronunciation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex gap-2">
                          <button 
                            className="p-1.5 text-gray-500 hover:text-secondary rounded-full hover:bg-gray-100"
                            aria-label={`Listen to pronunciation of ${phrase.english}`}
                          >
                            <Volume2 size={18} />
                          </button>
                          <button 
                            className="p-1.5 text-gray-500 hover:text-secondary rounded-full hover:bg-gray-100"
                            onClick={() => handleCopy(`${phrase.mandarin} (${phrase.pronunciation})`)}
                            aria-label={`Copy ${phrase.mandarin}`}
                          >
                            {copiedPhrase === `${phrase.mandarin} (${phrase.pronunciation})` ? (
                              <Check size={18} className="text-green-500" />
                            ) : (
                              <Copy size={18} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-600 italic">
            Tip: Try to learn a few basic phrases before your trip. Chinese people appreciate foreigners' efforts to speak their language!
          </p>
        </div>
      </div>
    </section>
  );
};

export default PhrasesSection;