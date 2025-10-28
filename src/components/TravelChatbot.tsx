import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { ItineraryItem, Supplier, BusinessContact, Expense, TodoItem, Appointment } from '../types';
import useChatAPI from '../hooks/useChatAPI';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface TravelChatbotProps {
  itinerary: ItineraryItem[];
  suppliers: Supplier[];
  contacts: BusinessContact[];
  expenses: Expense[];
  todos: TodoItem[];
  appointments: Appointment[];
}

const TravelChatbot: React.FC<TravelChatbotProps> = ({
  itinerary,
  suppliers,
  contacts,
  expenses,
  todos,
  appointments
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { sendMessage: sendToAPI, isLoading: apiLoading, error: apiError } = useChatAPI();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        type: 'bot',
        content: "Hi! I'm your Zervi Travel assistant. I have full access to your travel data and can help you with:\n\n• 📅 Schedule & Itinerary Management\n• ✈️ Flight & Hotel Bookings\n• 🏢 Supplier & Contact Information\n• 💰 Expense Tracking & Budgets\n• ✅ Task Management & Reminders\n• 📍 Trade Show Planning (SEMA 2025)\n• 📊 Analytics & Insights\n\nI can search, analyze, and provide recommendations based on your complete travel data. What would you like to know?",
        timestamp: new Date()
      }]);
    }
  }, []);

  // Prepare context data for API
  const prepareContextData = () => {
    return {
      itinerary: itinerary.map(item => ({
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description,
        start_date: item.start_date,
        end_date: item.end_date,
        location: item.location,
        assigned_to: item.assigned_to,
        confirmed: item.confirmed,
        // Include type-specific details
        ...(item.type === 'Flight' && {
          airline: item.type_specific_data?.airline,
          flight_number: item.type_specific_data?.flight_number,
          departure_time: item.type_specific_data?.departure_time,
          arrival_time: item.type_specific_data?.arrival_time
        }),
        ...(item.type === 'Hotel' && {
          hotel_name: item.type_specific_data?.hotel_name,
          room_type: item.type_specific_data?.room_type,
          check_in_time: item.type_specific_data?.check_in_time,
          check_out_time: item.type_specific_data?.check_out_time
        }),
        ...(item.type === 'BusinessVisit' && {
          contact_name: item.type_specific_data?.contact_name,
          company_name: item.type_specific_data?.company_name,
          contact_phone: item.type_specific_data?.contact_phone
        }),
        notes: item.notes
      })),
      suppliers: suppliers.map(supplier => ({
        id: supplier.id,
        company_name: supplier.company_name,
        contact_person: supplier.contact_person,
        email: supplier.email,
        phone: supplier.phone,
        city: supplier.city,
        province: supplier.province,
        industry: supplier.industry,
        products: supplier.products,
        status: supplier.status,
        rating: supplier.rating,
        notes: supplier.notes
      })),
      contacts: contacts.map(contact => ({
        id: contact.id,
        name: contact.name,
        title: contact.title,
        company: contact.company,
        email: contact.email,
        phone: contact.phone,
        wechat: contact.wechat,
        city: contact.city,
        industry: contact.industry,
        relationship: contact.relationship,
        importance: contact.importance,
        notes: contact.notes
      })),
      expenses: expenses.map(expense => ({
        id: expense.id,
        date: expense.date,
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        currency: expense.currency,
        assigned_to: expense.assigned_to,
        business_purpose: expense.business_purpose,
        approved: expense.approved,
        reimbursable: expense.reimbursable
      })),
      todos: todos.map(todo => ({
        id: todo.id,
        title: todo.title,
        description: todo.description,
        completed: todo.completed,
        priority: todo.priority,
        due_date: todo.due_date,
        category: todo.category,
        assigned_to: todo.assigned_to
      })),
      appointments: appointments.map(appointment => ({
        id: appointment.id,
        title: appointment.title,
        description: appointment.description,
        start_date: appointment.start_date,
        start_time: appointment.start_time,
        end_time: appointment.end_time,
        location: appointment.location,
        attendees: appointment.attendees,
        type: appointment.type,
        status: appointment.status,
        notes: appointment.notes
      }))
    };
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare the context data
      const contextData = prepareContextData();
      
      // Use the custom hook to call your API
      const responseContent = await sendToAPI(userMessage.content, contextData);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: responseContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Chat API Error:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'I apologize, but I\'m having trouble connecting right now. Please check your connection and try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      type: 'bot',
      content: "Chat cleared! How can I help you with your travel plans?",
      timestamp: new Date()
    }]);
  };

  const quickQuestions = [
    "What's my schedule today?",
    "Show me my next flight",
    "What's my total expenses?",
    "List all suppliers",
    "Any pending tasks?",
    "SEMA 2025 schedule",
    "Upcoming meetings",
    "Budget summary"
  ];

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
    setTimeout(() => sendMessage(), 100);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 z-50 group"
        aria-label="Open travel assistant"
      >
        <MessageCircle size={24} />
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Travel Assistant
        </div>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white border border-gray-200 rounded-lg shadow-xl z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-80 md:w-96 h-96 md:h-[500px]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-primary text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <Bot size={20} />
          <span className="font-semibold">Zervi Travel Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded"
            aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded"
            aria-label="Close chat"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-64 md:h-80">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-2 max-w-[80%] ${
                  message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {message.type === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`px-3 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  <div className="bg-gray-100 text-gray-900 px-3 py-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-1">
                {quickQuestions.slice(0, 3).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your travel plans..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <button
                onClick={clearChat}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear chat
              </button>
              <p className="text-xs text-gray-400">
                Press Enter to send
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TravelChatbot;