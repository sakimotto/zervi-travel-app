import React from 'react';
import { BookOpen, MessageCircle, Map, Shield } from 'lucide-react';

const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-primary font-montserrat mb-3">About Zervi Travel</h2>
          <p className="text-base text-gray-700 max-w-3xl mx-auto">
            Your comprehensive platform for managing business travel, trade shows, and professional relationships worldwide
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
              alt="Business professionals at trade show"
              className="rounded-lg shadow-lg"
            />
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-primary font-montserrat mb-4">Our Mission</h3>
            <p className="text-gray-700 mb-6">
              Zervi Travel was created to help business professionals navigate trade shows, manage supplier relationships, and organize business travel worldwide. Whether you're attending SEMA, Canton Fair, CES, or any international trade show, we provide comprehensive tools for managing suppliers, tracking expenses, organizing meetings, and building lasting business relationships.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="p-2 bg-primary bg-opacity-10 rounded-full mr-3">
                  <BookOpen size={20} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Supplier Management</h4>
                  <p className="text-gray-700">Comprehensive database of suppliers with contact details, certifications, and performance tracking</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="p-2 bg-primary bg-opacity-10 rounded-full mr-3">
                  <MessageCircle size={20} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Business Networking</h4>
                  <p className="text-gray-700">Manage your professional contacts and track relationship importance</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="p-2 bg-primary bg-opacity-10 rounded-full mr-3">
                  <Map size={20} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Travel Planning</h4>
                  <p className="text-gray-700">Complete itinerary management with business meetings, factory visits, and travel arrangements</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="p-2 bg-primary bg-opacity-10 rounded-full mr-3">
                  <Shield size={20} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Expense Tracking</h4>
                  <p className="text-gray-700">Track business expenses with approval workflows and reimbursement management</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-16 bg-gray-50 rounded-lg p-8 shadow-sm">
          <h3 className="text-2xl font-semibold text-primary font-montserrat mb-4 text-center">How to Use This Platform</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-4xl font-montserrat font-bold text-secondary mb-4">01</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Manage Suppliers</h4>
              <p className="text-gray-700">
                Add and organize your supplier database with detailed contact information, product catalogs, and performance ratings.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-4xl font-montserrat font-bold text-secondary mb-4">02</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Plan Your Trip</h4>
              <p className="text-gray-700">
                Create detailed itineraries including flights, hotels, trade show schedules, supplier meetings, factory visits, and networking events.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-4xl font-montserrat font-bold text-secondary mb-4">03</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Track Expenses</h4>
              <p className="text-gray-700">
                Monitor business expenses with categorization, approval workflows, and generate reports for reimbursement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;