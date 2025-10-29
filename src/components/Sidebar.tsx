import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Building2,
  LayoutDashboard,
  MapPin,
  Users,
  Briefcase,
  ListTodo,
  Calendar,
  DollarSign,
  BookOpen,
  Lightbulb,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  TrendingUp,
  Plane,
  Car,
  Hotel,
  Video,
  UserCheck,
  Shield
} from 'lucide-react';
import UserMenu from './UserMenu';

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  onClick?: () => void;
  collapsed?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, text, onClick, collapsed = false }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to === '/' && location.pathname === '/');

  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-primary text-white'
          : 'text-gray-700 hover:bg-gray-100'
      } ${collapsed ? 'justify-center' : ''}`}
      onClick={onClick}
      title={collapsed ? text : undefined}
    >
      <span className={`flex-shrink-0 ${collapsed ? '' : 'mr-3'}`}>{icon}</span>
      {!collapsed && <span className="whitespace-nowrap">{text}</span>}
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, text: 'Dashboard' },
    { to: '/trips', icon: <MapPin size={20} />, text: 'Trips' },
    { to: '/entities', icon: <Users size={20} />, text: 'Unified Entities' },
    { to: '/customers', icon: <UserCircle size={20} />, text: 'Customers CRM' },
    { to: '/tradeshows', icon: <TrendingUp size={20} />, text: 'Trade Shows' },
    { to: '/flights', icon: <Plane size={20} />, text: 'Flights' },
    { to: '/cars', icon: <Car size={20} />, text: 'Cars' },
    { to: '/hotels', icon: <Hotel size={20} />, text: 'Hotels' },
    { to: '/meetings', icon: <Video size={20} />, text: 'Meetings' },
    { to: '/suppliers', icon: <Building2 size={20} />, text: 'Suppliers' },
    { to: '/contacts', icon: <Users size={20} />, text: 'Contacts' },
    { to: '/itinerary', icon: <ListTodo size={20} />, text: 'Itinerary' },
    { to: '/calendar', icon: <Calendar size={20} />, text: 'Calendar' },
    { to: '/expenses', icon: <DollarSign size={20} />, text: 'Expenses' },
    { to: '/destinations', icon: <MapPin size={20} />, text: 'Destinations' },
    { to: '/tips', icon: <Lightbulb size={20} />, text: 'Travel Tips' },
    { to: '/phrases', icon: <MessageCircle size={20} />, text: 'Phrases' },
    { to: '/delegations', icon: <UserCheck size={20} />, text: 'Access Management' },
    { to: '/users', icon: <Shield size={20} />, text: 'User Management' },
    { to: '/user-manual', icon: <BookOpen size={20} />, text: 'User Manual' }
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="flex justify-between items-center px-4 h-16">
          <Link to="/" className="flex items-center">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="ml-2 text-lg font-bold text-primary">Zervi Travel</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[60] lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex lg:flex-col fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-40 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {!isCollapsed && (
            <Link to="/" className="flex items-center">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="ml-2 text-lg font-bold text-primary">Zervi Travel</span>
            </Link>
          )}
          {isCollapsed && (
            <Link to="/" className="flex items-center justify-center w-full">
              <Building2 className="h-8 w-8 text-primary" />
            </Link>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                icon={item.icon}
                text={item.text}
                collapsed={isCollapsed}
              />
            ))}
          </div>
        </nav>

        {/* User Menu & Collapse Button */}
        <div className="border-t border-gray-200">
          {!isCollapsed && (
            <div className="p-4">
              <UserMenu />
            </div>
          )}
          <button
            onClick={toggleCollapse}
            className="w-full flex items-center justify-center p-4 text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-white z-[70] transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-2xl`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white">
          <Link to="/" className="flex items-center" onClick={closeMobileMenu}>
            <Building2 className="h-8 w-8 text-primary" />
            <span className="ml-2 text-lg font-bold text-primary">Zervi Travel</span>
          </Link>
          <button
            onClick={closeMobileMenu}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links - Always show full text on mobile */}
        <nav className="h-[calc(100vh-4rem)] overflow-y-auto py-2 bg-white">
          <div className="space-y-0">
            {menuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                icon={item.icon}
                text={item.text}
                onClick={closeMobileMenu}
                collapsed={false}
              />
            ))}
          </div>
        </nav>
      </aside>

      {/* Mobile spacer to prevent content from going under fixed header */}
      <div className="h-16 lg:hidden"></div>
    </>
  );
};

export default Sidebar;
