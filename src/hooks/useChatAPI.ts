import { useState } from 'react';

interface ChatAPIResponse {
  response: string;
  error?: string;
}

interface ChatContext {
  itinerary: any[];
  suppliers: any[];
  contacts: any[];
  expenses: any[];
  todos: any[];
  appointments: any[];
}

export const useChatAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (message: string, context: ChatContext): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      // This will call your existing API endpoint
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/travel-chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context,
          timestamp: new Date().toISOString(),
          // Add any additional metadata
          metadata: {
            userAgent: navigator.userAgent,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            currentDate: new Date().toISOString().split('T')[0]
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data: ChatAPIResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      return data.response || 'I apologize, but I received an empty response. Please try again.';

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      // Return a helpful fallback message
      return `I'm having trouble connecting to my knowledge base right now. Error: ${errorMessage}. Please try again in a moment.`;
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format context for better AI understanding
  const formatContextForAI = (context: ChatContext): string => {
    const today = new Date().toISOString().split('T')[0];
    
    return `
Current Date: ${today}

TRAVEL ITINERARY (${context.itinerary.length} items):
${context.itinerary.map(item => 
  `- ${item.startDate}: ${item.title} (${item.type}) at ${item.location} - ${item.confirmed ? 'CONFIRMED' : 'PENDING'}`
).join('\n')}

SUPPLIERS (${context.suppliers.length} companies):
${context.suppliers.map(supplier => 
  `- ${supplier.companyName} (${supplier.industry}) - Contact: ${supplier.contactPerson} (${supplier.email}) - Status: ${supplier.status}`
).join('\n')}

BUSINESS CONTACTS (${context.contacts.length} people):
${context.contacts.map(contact => 
  `- ${contact.name} (${contact.title}) at ${contact.company} - ${contact.email} - Relationship: ${contact.relationship}`
).join('\n')}

EXPENSES (${context.expenses.length} items):
${context.expenses.map(expense => 
  `- ${expense.date}: ${expense.description} - ${expense.amount} ${expense.currency} (${expense.category}) - ${expense.approved ? 'APPROVED' : 'PENDING'}`
).join('\n')}

TODOS (${context.todos.length} tasks):
${context.todos.map(todo => 
  `- ${todo.title} (${todo.priority} priority) - Due: ${todo.dueDate || 'No date'} - ${todo.completed ? 'COMPLETED' : 'PENDING'}`
).join('\n')}

APPOINTMENTS (${context.appointments.length} meetings):
${context.appointments.map(appointment => 
  `- ${appointment.startDate} ${appointment.startTime}: ${appointment.title} at ${appointment.location} - Status: ${appointment.status}`
).join('\n')}
    `.trim();
  };

  return {
    sendMessage,
    isLoading,
    error,
    formatContextForAI
  };
};

export default useChatAPI;