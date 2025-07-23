import React from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';

const Hero: React.FC = () => {
  const scrollToDestinations = () => {
    window.location.href = '/destinations';
  };

  return (
    <div className="flex flex-col">
      {/* Canton Fair Banner */}
      <div className="w-full bg-secondary text-white px-4 py-3 flex justify-between items-center">
        <p className="text-sm md:text-base">
          <span className="font-bold">Business Travel to China Made Easy!</span> Manage suppliers, meetings, and travel all in one place.
          <a 
            href="https://www.trade.gov/country-commercial-guides/china" 
            target="_blank" 
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-montserrat mb-4">
            className="ml-2 underline inline-flex items-center"
          >
        <p className="text-lg sm:text-xl text-white mb-8">
          </a>
        </p>
      </div>
      
      {/* Main Hero Section */}
      <div 
        id="home"
        className="min-h-[80vh] flex items-center justify-center bg-cover bg-center"
        style={{ 
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80")' 
        }}
      >
        <div className="text-center px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white font-montserrat mb-4">
            Zervi Travel
          </h1>
          <p className="text-xl sm:text-2xl text-white mb-8">
            Your complete solution for business travel, supplier management, and networking in Asia
          </p>
          <button 
            onClick={scrollToDestinations}
            className="bg-accent hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors duration-300"
          >
            Start Planning
          </button>
        </div>
        
        <div className="absolute bottom-8 left-0 right-0 flex justify-center animate-bounce">
          <button 
            onClick={scrollToDestinations}
            className="text-white p-2 rounded-full"
            aria-label="Scroll down"
          >
            <ChevronDown size={32} />
          </button>
        </div>
      </div>
    </div>
  )
  );
};

export default Hero;