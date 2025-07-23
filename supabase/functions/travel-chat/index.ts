import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ChatRequest {
  message: string;
  context: {
    itinerary: any[];
    suppliers: any[];
    contacts: any[];
    expenses: any[];
    todos: any[];
    appointments: any[];
  };
  timestamp?: string;
  metadata?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, context, timestamp, metadata }: ChatRequest = await req.json()

    // Validate input
    if (!message || !context) {
      return new Response(
        JSON.stringify({ error: 'Missing message or context' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Format context for AI
    const currentDate = metadata?.currentDate || new Date().toISOString().split('T')[0];
    const contextString = formatContextForAI(context, currentDate);

    // Prepare the system prompt
    const systemPrompt = `You are a helpful travel assistant for Zervi Travel. You have access to the user's complete business travel data including itinerary, suppliers, contacts, expenses, todos, and appointments.

Guidelines:
- Be concise and helpful
- Use the provided context data to answer questions accurately
- Format responses clearly with bullet points when listing multiple items
- Include relevant details like times, locations, contact info
- If asked about expenses, calculate totals when helpful
- For schedule questions, focus on today/upcoming items
- Always be professional and business-focused
- Use emojis sparingly but appropriately for travel context

Current date: ${currentDate}
User timezone: ${metadata?.timezone || 'Asia/Bangkok'}

Here is the user's current travel data:

${contextString}`;

    // Call Deepseek API
    const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer sk-b00a204fd1894f1aa9229a92ff9b340e`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        stream: false
      })
    });

    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text();
      console.error('Deepseek API error:', errorText);
      throw new Error(`Deepseek API error: ${deepseekResponse.status}`);
    }

    const deepseekData = await deepseekResponse.json();
    const aiResponse = deepseekData.choices?.[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Chat function error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'I apologize, but I\'m having trouble processing your request right now. Please try again.',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function formatContextForAI(context: any, currentDate: string): string {
  const { itinerary, suppliers, contacts, expenses, todos, appointments } = context;
  
  return `
CURRENT DATE: ${currentDate}

=== TRAVEL ITINERARY (${itinerary.length} items) ===
${itinerary.map(item => 
  `📅 ${item.startDate}: ${item.title} (${item.type})
   📍 Location: ${item.location}
   👥 Assigned: ${item.assignedTo}
   ✅ Status: ${item.confirmed ? 'CONFIRMED' : 'PENDING'}
   ${item.airline && item.flightNumber ? `✈️ Flight: ${item.airline} ${item.flightNumber}` : ''}
   ${item.departureTime ? `🕐 Time: ${item.departureTime}` : ''}
   ${item.hotelName ? `🏨 Hotel: ${item.hotelName}` : ''}
   ${item.contactName ? `👤 Contact: ${item.contactName}` : ''}
   ${item.notes ? `📝 Notes: ${item.notes}` : ''}`
).join('\n\n')}

=== SUPPLIERS (${suppliers.length} companies) ===
${suppliers.map(supplier => 
  `🏢 ${supplier.company_name} (${supplier.industry})
   👤 Contact: ${supplier.contact_person}
   📧 Email: ${supplier.email}
   📞 Phone: ${supplier.phone}
   📍 Location: ${supplier.city}, ${supplier.province}
   🔄 Status: ${supplier.status}
   ⭐ Rating: ${supplier.rating || 'N/A'}/5
   🛍️ Products: ${supplier.products.join(', ')}
   ${supplier.notes ? `📝 Notes: ${supplier.notes}` : ''}`
).join('\n\n')}

=== BUSINESS CONTACTS (${contacts.length} people) ===
${contacts.map(contact => 
  `👤 ${contact.name} (${contact.title})
   🏢 Company: ${contact.company}
   📧 Email: ${contact.email}
   📞 Phone: ${contact.phone}
   📍 City: ${contact.city}
   🤝 Relationship: ${contact.relationship}
   ⚡ Importance: ${contact.importance}
   ${contact.wechat ? `💬 WeChat: ${contact.wechat}` : ''}
   ${contact.notes ? `📝 Notes: ${contact.notes}` : ''}`
).join('\n\n')}

=== EXPENSES (${expenses.length} items) ===
${expenses.map(expense => 
  `💰 ${expense.date}: ${expense.description}
   💵 Amount: ${expense.amount} ${expense.currency}
   📂 Category: ${expense.category}
   👤 Traveler: ${expense.assigned_to}
   ✅ Status: ${expense.approved ? 'APPROVED' : 'PENDING'}
   💳 Payment: ${expense.payment_method}
   🎯 Purpose: ${expense.business_purpose}`
).join('\n\n')}

=== TODOS (${todos.length} tasks) ===
${todos.map(todo => 
  `✅ ${todo.title} (${todo.priority} priority)
   📅 Due: ${todo.due_date || 'No date set'}
   👤 Assigned: ${todo.assigned_to}
   📂 Category: ${todo.category}
   🔄 Status: ${todo.completed ? 'COMPLETED' : 'PENDING'}
   ${todo.description ? `📝 Description: ${todo.description}` : ''}`
).join('\n\n')}

=== APPOINTMENTS (${appointments.length} meetings) ===
${appointments.map(appointment => 
  `📅 ${appointment.startDate} ${appointment.startTime}: ${appointment.title}
   📍 Location: ${appointment.location || 'TBD'}
   👥 Attendees: ${appointment.attendees?.join(', ') || 'None listed'}
   📂 Type: ${appointment.type}
   🔄 Status: ${appointment.status}
   ${appointment.endTime ? `⏰ Duration: ${appointment.startTime} - ${appointment.endTime}` : ''}
   ${appointment.notes ? `📝 Notes: ${appointment.notes}` : ''}`
).join('\n\n')}
  `.trim();
}