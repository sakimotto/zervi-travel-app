# Zervi Travel Chatbot API Integration Guide

## 🚀 **Your API Endpoint Setup**

The chatbot is ready to connect to your existing API! Here's what you need to know:

### **Expected API Endpoint:**
```
POST /api/chat
```

### **Request Format:**
```json
{
  "message": "What's my schedule today?",
  "context": {
    "itinerary": [...],
    "suppliers": [...],
    "contacts": [...],
    "expenses": [...],
    "todos": [...],
    "appointments": [...]
  },
  "timestamp": "2024-01-23T10:30:00.000Z",
  "metadata": {
    "userAgent": "Mozilla/5.0...",
    "timezone": "Asia/Bangkok",
    "currentDate": "2024-01-23"
  }
}
```

### **Expected Response Format:**
```json
{
  "response": "Here's your schedule for today:\n\n• 9:00 AM - Flight to Shanghai (CA123)\n• 2:00 PM - Meeting with Li Wei at Sunshine Tech\n• 7:00 PM - Business dinner at Jade Garden",
  "error": null
}
```

## 📊 **Context Data Structure**

The chatbot automatically sends all your travel data as context:

### **Itinerary Items:**
```json
{
  "id": "uuid",
  "type": "Flight|Hotel|Meeting|etc",
  "title": "Flight to Shanghai",
  "startDate": "2024-01-23",
  "location": "Shanghai Pudong Airport",
  "assignedTo": "Both",
  "confirmed": true,
  "airline": "Air China",
  "flightNumber": "CA123",
  "notes": "..."
}
```

### **Suppliers:**
```json
{
  "id": "uuid",
  "companyName": "Shenzhen Electronics",
  "contactPerson": "Li Wei",
  "email": "li.wei@example.com",
  "phone": "+86 755 1234567",
  "city": "Shenzhen",
  "industry": "Electronics",
  "products": ["Smartphones", "Tablets"],
  "status": "Active",
  "rating": 4.5
}
```

### **Business Contacts:**
```json
{
  "id": "uuid",
  "name": "David Chen",
  "title": "Sales Director",
  "company": "Tech Innovations Ltd",
  "email": "david@example.com",
  "phone": "+86 21 1234567",
  "wechat": "davidchen_sz",
  "relationship": "Client",
  "importance": "High"
}
```

## 🤖 **Recommended AI Prompts**

Here's what you can include in your API to make the AI more helpful:

### **System Prompt:**
```
You are a helpful travel assistant for Zervi Travel. You have access to the user's complete travel data including itinerary, suppliers, contacts, expenses, todos, and appointments.

Guidelines:
- Be concise and helpful
- Use the provided context data to answer questions
- Format responses clearly with bullet points when listing multiple items
- Include relevant details like times, locations, contact info
- If asked about expenses, calculate totals when helpful
- For schedule questions, focus on today/upcoming items
- Always be professional and business-focused

Current date: {currentDate}
User timezone: {timezone}
```

### **Example Queries to Handle:**
- "What's my schedule today?"
- "Show me my next flight"
- "Find electronics suppliers in Shenzhen"
- "Contact details for Li Wei"
- "What's my total expenses this trip?"
- "Any pending tasks?"
- "When is my next factory visit?"
- "Which suppliers are in Beijing?"
- "Show me all confirmed meetings this week"

## 🔧 **Integration Steps**

1. **Set up your API endpoint** at `/api/chat`
2. **Configure your AI model** (Deepseek/Anthropic) with the system prompt
3. **Process the context data** to answer user questions
4. **Return formatted responses** in the expected JSON format

## 📱 **Mobile Optimization**

The chatbot is designed for mobile use while traveling:
- ✅ Responsive design
- ✅ Touch-friendly interface
- ✅ Minimizable for screen space
- ✅ Quick question buttons
- ✅ Offline-friendly (shows connection errors gracefully)

## 🚀 **Ready to Connect!**

The frontend is complete and ready for your API. Just provide your API endpoint URL and the chatbot will start working immediately!