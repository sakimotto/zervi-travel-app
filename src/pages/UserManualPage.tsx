import React, { useState } from 'react';
import { 
  BookOpen, 
  LayoutDashboard, 
  Building2, 
  Users, 
  ListTodo, 
  Calendar, 
  DollarSign,
  ArrowRight,
  CheckCircle,
  Info,
  Play,
  ChevronDown,
  ChevronRight,
  MapPin,
  Plane,
  Hotel,
  Car,
  Briefcase,
  QrCode,
  FileText,
  Navigation,
  Clock,
  AlertTriangle,
  Target,
  Zap,
  Globe,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';
import Footer from '../components/Footer';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children, icon }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center">
          {icon && <span className="mr-3 text-primary">{icon}</span>}
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        </div>
        {isExpanded ? <ChevronDown className="text-gray-500" /> : <ChevronRight className="text-gray-500" />}
      </button>
      {isExpanded && (
        <div className="px-6 pb-6">
          {children}
        </div>
      )}
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; route?: string }> = ({ icon, title, description, route }) => (
  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
    <div className="flex items-center mb-2">
      <span className="text-primary mr-2">{icon}</span>
      <h4 className="font-semibold text-gray-800">{title}</h4>
    </div>
    <p className="text-gray-600 text-sm mb-2">{description}</p>
    {route && (
      <div className="text-xs text-blue-600 font-mono bg-blue-100 px-2 py-1 rounded">
        Route: {route}
      </div>
    )}
  </div>
);

const FlowStep: React.FC<{ number: number; title: string; description: string; isLast?: boolean }> = ({ number, title, description, isLast }) => (
  <div className="flex items-start">
    <div className="flex flex-col items-center mr-4">
      <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold text-sm">
        {number}
      </div>
      {!isLast && <div className="w-0.5 h-12 bg-gray-300 mt-2"></div>}
    </div>
    <div className="flex-1 pb-8">
      <h4 className="font-semibold text-gray-800 mb-1">{title}</h4>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  </div>
);

const UserManualPage: React.FC = () => {
  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <BookOpen className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Zervi Travel User Manual</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete guide to using Zervi Travel - your comprehensive business travel management platform
            </p>
          </div>

          {/* Quick Start Guide */}
          <Section title="🚀 Quick Start Guide" icon={<Play />}>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Getting Started in 5 Steps</h3>
                <FlowStep 
                  number={1} 
                  title="Dashboard Overview" 
                  description="Start at the dashboard to see your travel overview, upcoming flights, and quick stats."
                />
                <FlowStep 
                  number={2} 
                  title="Add Destinations" 
                  description="Navigate to Destinations to add cities you'll be visiting with details and notes."
                />
                <FlowStep 
                  number={3} 
                  title="Build Itinerary" 
                  description="Create detailed itineraries with flights, hotels, meetings, and activities."
                />
                <FlowStep 
                  number={4} 
                  title="Manage Contacts" 
                  description="Add business contacts and suppliers for easy access during travel."
                />
                <FlowStep 
                  number={5} 
                  title="Track Expenses" 
                  description="Log expenses and generate reports for business accounting."
                  isLast
                />
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                  <Target className="mr-2 text-green-600" />
                  Key Benefits
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Centralized travel management
                  </li>
                  <li className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Real-time flight tracking
                  </li>
                  <li className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Expense tracking & reporting
                  </li>
                  <li className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Contact & supplier management
                  </li>
                  <li className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Document status monitoring
                  </li>
                </ul>
              </div>
            </div>
          </Section>

          {/* Navigation Overview */}
          <Section title="🧭 Navigation & Features" icon={<Navigation />}>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <FeatureCard 
                icon={<LayoutDashboard size={20} />}
                title="Dashboard"
                description="Central hub with travel overview, flight countdowns, QR codes, and document tracking"
                route="/dashboard"
              />
              <FeatureCard 
                icon={<Building2 size={20} />}
                title="Destinations"
                description="Manage cities and locations with detailed information and travel notes"
                route="/destinations"
              />
              <FeatureCard 
                icon={<Building2 size={20} />}
                title="Suppliers"
                description="Business suppliers, vendors, and service providers directory"
                route="/suppliers"
              />
              <FeatureCard 
                icon={<Users size={20} />}
                title="Contacts"
                description="Business contacts with detailed information and communication history"
                route="/contacts"
              />
              <FeatureCard 
                icon={<ListTodo size={20} />}
                title="Itinerary"
                description="Detailed travel plans with flights, hotels, meetings, and activities"
                route="/itinerary"
              />
              <FeatureCard 
                icon={<Calendar size={20} />}
                title="Calendar"
                description="Schedule management with appointments and travel timeline"
                route="/calendar"
              />
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Info className="text-yellow-600 mr-2" />
                <span className="font-semibold text-yellow-800">Navigation Tip</span>
              </div>
              <p className="text-yellow-700 text-sm">
                The expenses feature is available in the bottom menu for quick access during travel.
              </p>
            </div>
          </Section>

          {/* Dashboard Features */}
          <Section title="📊 Dashboard Features" icon={<LayoutDashboard />}>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Real-time Features</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Plane className="w-5 h-5 text-blue-500 mr-3 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-800">Flight Status & Countdowns</h4>
                      <p className="text-sm text-gray-600">Live flight tracking with departure countdowns and urgency alerts</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <QrCode className="w-5 h-5 text-green-500 mr-3 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-800">QR Code Center</h4>
                      <p className="text-sm text-gray-600">Quick connect QR codes for WeChat and WhatsApp (editable)</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FileText className="w-5 h-5 text-purple-500 mr-3 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-800">Document Tracker</h4>
                      <p className="text-sm text-gray-600">Monitor passport, visa, and certificate expiry dates (editable)</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Navigation className="w-5 h-5 text-orange-500 mr-3 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-800">Transportation Hub</h4>
                      <p className="text-sm text-gray-600">Traffic conditions, ride booking, train schedules, and metro planning</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                  <Zap className="mr-2 text-blue-600" />
                  Smart Features
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-700">
                    <Clock className="w-4 h-4 text-blue-500 mr-2" />
                    Automatic countdown calculations
                  </li>
                  <li className="flex items-center text-sm text-gray-700">
                    <AlertTriangle className="w-4 h-4 text-orange-500 mr-2" />
                    Urgency alerts for upcoming flights
                  </li>
                  <li className="flex items-center text-sm text-gray-700">
                    <FileText className="w-4 h-4 text-purple-500 mr-2" />
                    Document expiry monitoring
                  </li>
                  <li className="flex items-center text-sm text-gray-700">
                    <Globe className="w-4 h-4 text-green-500 mr-2" />
                    Real-time data integration
                  </li>
                </ul>
              </div>
            </div>
          </Section>

          {/* Data Management */}
          <Section title="💾 Data Management" icon={<FileText />}>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                  <CheckCircle className="mr-2" />
                  Schema-Connected
                </h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Flight Status & Countdowns</li>
                  <li>• Quick Stats (Tasks, Meetings)</li>
                  <li>• Upcoming Travel</li>
                  <li>• Recent Activity Feed</li>
                </ul>
                <p className="text-xs text-green-600 mt-2 italic">Data from itinerary, todos, appointments</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <Users className="mr-2" />
                  User Editable
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• QR Code Contacts</li>
                  <li>• Document Expiry Dates</li>
                  <li>• Personal Information</li>
                  <li>• Preferences</li>
                </ul>
                <p className="text-xs text-blue-600 mt-2 italic">Stored in localStorage</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-orange-800 mb-3 flex items-center">
                  <Globe className="mr-2" />
                  Future Integration
                </h3>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Transportation Hub</li>
                  <li>• Live Traffic Data</li>
                  <li>• Ride Booking APIs</li>
                  <li>• Train Schedules</li>
                </ul>
                <p className="text-xs text-orange-600 mt-2 italic">Currently placeholder data</p>
              </div>
            </div>
          </Section>

          {/* Responsive Design */}
          <Section title="📱 Responsive Design" icon={<Smartphone />}>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <Monitor className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Desktop</h3>
                <p className="text-sm text-gray-600">Full feature access with expanded navigation and detailed views</p>
              </div>
              <div className="text-center">
                <Tablet className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Tablet</h3>
                <p className="text-sm text-gray-600">Optimized layout with touch-friendly interface and grid adjustments</p>
              </div>
              <div className="text-center">
                <Smartphone className="w-12 h-12 text-purple-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Mobile</h3>
                <p className="text-sm text-gray-600">Collapsible navigation with bottom menu for quick expense tracking</p>
              </div>
            </div>
          </Section>

          {/* Workflow Examples */}
          <Section title="🔄 Common Workflows" icon={<ArrowRight />}>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Planning a Business Trip</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs mr-3">1</span>
                    <span>Add destination cities</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs mr-3">2</span>
                    <span>Create itinerary with flights & hotels</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs mr-3">3</span>
                    <span>Add business contacts & suppliers</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs mr-3">4</span>
                    <span>Schedule meetings in calendar</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs mr-3">5</span>
                    <span>Monitor dashboard for updates</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">During Travel</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs mr-3">1</span>
                    <span>Check flight countdowns on dashboard</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs mr-3">2</span>
                    <span>Use QR codes for quick connections</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs mr-3">3</span>
                    <span>Track expenses via bottom menu</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs mr-3">4</span>
                    <span>Access contacts for meetings</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs mr-3">5</span>
                    <span>Use transportation hub for local travel</span>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* Tips & Best Practices */}
          <Section title="💡 Tips & Best Practices" icon={<Info />}>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Efficiency Tips</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    Update document expiry dates regularly
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    Set up QR codes before travel for quick networking
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    Use the dashboard as your travel command center
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    Add detailed notes to destinations for future reference
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    Export itineraries for offline access
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Data Management</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-orange-500 mr-2 mt-0.5" />
                    Editable data is stored locally in your browser
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-orange-500 mr-2 mt-0.5" />
                    Clear browser data will reset QR codes and document dates
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-orange-500 mr-2 mt-0.5" />
                    Flight data comes from your itinerary entries
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-orange-500 mr-2 mt-0.5" />
                    Transportation hub features are planned for future updates
                  </li>
                </ul>
              </div>
            </div>
          </Section>

          {/* Missing Routes & Future Features */}
          <Section title="🚧 Development Roadmap" icon={<AlertTriangle />}>
            <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-lg border border-red-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <AlertTriangle className="mr-2 text-red-600" />
                Identified Missing Routes & Features
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Missing Routes</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• /user-manual (✅ Added in this update)</li>
                    <li>• /settings - User preferences</li>
                    <li>• /reports - Expense & travel reports</li>
                    <li>• /notifications - Alert management</li>
                    <li>• /profile - User profile management</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Future Integrations</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Real-time flight APIs</li>
                    <li>• Live traffic data integration</li>
                    <li>• Ride booking service APIs</li>
                    <li>• Train schedule APIs</li>
                    <li>• Weather integration</li>
                    <li>• Currency exchange rates</li>
                  </ul>
                </div>
              </div>
            </div>
          </Section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserManualPage;