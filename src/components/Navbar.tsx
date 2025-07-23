import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Building2, Info, Lightbulb, Calendar, MessageCircle, ChevronUp, ListTodo, Users, DollarSign, LayoutDashboard, Calendar as CalendarIcon } from 'lucide-react';
import UserMenu from './UserMenu';
import { useAuth } from '../hooks/useAuth';

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, text, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to === '/' && location.pathname === '/');
  
  return (
    <Link 
      to={to} 
      className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-200 whitespace-nowrap ${
        isActive 
          ? 'text-primary bg-primary bg-opacity-10 font-medium' 
          : 'text-gray-700 hover:text-primary hover:bg-gray-100'
      }`}
      onClick={onClick}
    >
      <span className="mr-1.5">{icon}</span>
      <span>{text}</span>
    </Link>
  );
};

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <Building2 className="h-8 w-8 text-primary" />
                <span className="ml-2 text-lg font-montserrat font-bold text-primary">Zervi Travel</span>
              </Link>
            </div>
            
            <div className="hidden md:flex md:items-center md:space-x-4">
              <NavLink to="/dashboard" icon={<LayoutDashboard size={16} />} text="Dashboard" />
              <NavLink to="/destinations" icon={<Building2 size={16} />} text="Destinations" />
              <NavLink to="/suppliers" icon={<Building2 size={16} />} text="Suppliers" />
              <NavLink to="/contacts" icon={<Users size={16} />} text="Contacts" />
              <NavLink to="/itinerary" icon={<ListTodo size={16} />} text="Itinerary" />
              <NavLink to="/calendar" icon={<Calendar size={16} />} text="Calendar" />
              <NavLink to="/expenses" icon={<DollarSign size={16} />} text="Expenses" />
              <UserMenu />
            </div>
            
            <div className="flex items-center md:hidden">
              {user && <UserMenu />}
              <button
                className="p-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
        
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <NavLink to="/dashboard" icon={<LayoutDashboard size={18} />} text="Dashboard" onClick={closeMenu} />
              <NavLink to="/destinations" icon={<Building2 size={18} />} text="Cities" onClick={closeMenu} />
              <NavLink to="/suppliers" icon={<Building2 size={18} />} text="Suppliers" onClick={closeMenu} />
              <NavLink to="/contacts" icon={<Users size={18} />} text="Contacts" onClick={closeMenu} />
              <NavLink to="/itinerary" icon={<ListTodo size={18} />} text="Itinerary" onClick={closeMenu} />
              <NavLink to="/calendar" icon={<CalendarIcon size={18} />} text="Calendar" onClick={closeMenu} />
              <NavLink to="/expenses" icon={<DollarSign size={18} />} text="Expenses" onClick={closeMenu} />
            </div>
          </div>
        )}
      </nav>
      
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-opacity-90 transition-all duration-300 z-50"
          aria-label="Scroll to top"
        >
          <ChevronUp size={24} />
        </button>
      )}
    </>
  );
};

export default Navbar;