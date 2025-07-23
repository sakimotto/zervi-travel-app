import { ItineraryItem, Supplier, BusinessContact, Expense } from '../types';
import { format, parseISO } from 'date-fns';
import { saveAs } from 'file-saver';

/**
 * Generate a Word-compatible document with all business data
 */
export const exportToWord = (
  itinerary: ItineraryItem[],
  suppliers: Supplier[],
  contacts: BusinessContact[],
  expenses: Expense[]
): void => {
  const content = generateWordContent(itinerary, suppliers, contacts, expenses);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `China-Business-Travel-Report-${new Date().toISOString().split('T')[0]}.txt`);
};

/**
 * Generate formatted content for Word document
 */
const generateWordContent = (
  itinerary: ItineraryItem[],
  suppliers: Supplier[],
  contacts: BusinessContact[],
  expenses: Expense[]
): string => {
  let content = '';

  // Document Header
  content += '='.repeat(80) + '\n';
  content += 'ZERVI TRAVEL REPORT\n';
  content += '='.repeat(80) + '\n';
  content += `Generated on: ${format(new Date(), 'MMMM dd, yyyy')}\n\n`;

  // Executive Summary
  content += 'EXECUTIVE SUMMARY\n';
  content += '-'.repeat(40) + '\n';
  content += `• Total Itinerary Items: ${itinerary.length}\n`;
  content += `• Active Suppliers: ${suppliers.filter(s => s.status === 'Active').length}\n`;
  content += `• Business Contacts: ${contacts.length}\n`;
  content += `• Total Expenses: ${expenses.length} items\n\n`;

  // Itinerary Section
  if (itinerary.length > 0) {
    content += 'TRAVEL ITINERARY\n';
    content += '='.repeat(50) + '\n\n';

    const sortedItinerary = [...itinerary].sort((a, b) => 
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );

    sortedItinerary.forEach((item, index) => {
      content += `${index + 1}. ${item.title}\n`;
      content += `   Type: ${item.type}\n`;
      content += `   Date: ${format(parseISO(item.start_date), 'MMMM dd, yyyy')}`;
      if (item.end_date) {
        content += ` - ${format(parseISO(item.end_date), 'MMMM dd, yyyy')}`;
      }
      content += '\n';
      content += `   Location: ${item.location}\n`;
      content += `   Assigned To: ${item.assigned_to}\n`;
      content += `   Status: ${item.confirmed ? 'Confirmed' : 'Unconfirmed'}\n`;
      content += `   Description: ${item.description}\n`;

      // Add type-specific details
      if (item.type === 'Flight' && item.type_specific_data?.flightNumber) {
        content += `   Flight: ${item.type_specific_data?.airline} ${item.type_specific_data?.flightNumber}\n`;
        if (item.type_specific_data?.departureTime && item.type_specific_data?.arrivalTime) {
          content += `   Times: ${item.type_specific_data?.departureTime} - ${item.type_specific_data?.arrivalTime}\n`;
        }
      }

      if (item.type === 'Hotel' && item.type_specific_data?.hotelName) {
        content += `   Hotel: ${item.type_specific_data?.hotelName}\n`;
        if (item.type_specific_data?.roomType) content += `   Room: ${item.type_specific_data?.roomType}\n`;
        if (item.type_specific_data?.checkInTime && item.type_specific_data?.checkOutTime) {
          content += `   Check-in: ${item.type_specific_data?.checkInTime}, Check-out: ${item.type_specific_data?.checkOutTime}\n`;
        }
      }

      if (item.type === 'BusinessVisit' && item.type_specific_data?.contactName) {
        content += `   Contact: ${item.type_specific_data?.contactName}\n`;
        if (item.type_specific_data?.companyName) content += `   Company: ${item.type_specific_data?.companyName}\n`;
        if (item.type_specific_data?.contactPhone) content += `   Phone: ${item.type_specific_data?.contactPhone}\n`;
      }

      if (item.notes) {
        content += `   Notes: ${item.notes}\n`;
      }

      content += '\n';
    });
  }

  // Suppliers Section
  if (suppliers.length > 0) {
    content += 'SUPPLIER DIRECTORY\n';
    content += '='.repeat(50) + '\n\n';

    suppliers.forEach((supplier, index) => {
      content += `${index + 1}. ${supplier.company_name}\n`;
      content += `   Contact: ${supplier.contact_person}\n`;
      content += `   Email: ${supplier.email}\n`;
      content += `   Phone: ${supplier.phone}\n`;
      content += `   Location: ${supplier.city}, ${supplier.province}\n`;
      content += `   Industry: ${supplier.industry}\n`;
      content += `   Status: ${supplier.status}\n`;
      
      if (supplier.products.length > 0) {
        content += `   Products: ${supplier.products.join(', ')}\n`;
      }
      
      if (supplier.minimum_order) {
        content += `   Min Order: ${supplier.minimum_order}\n`;
      }
      
      if (supplier.lead_time) {
        content += `   Lead Time: ${supplier.lead_time}\n`;
      }
      
      if (supplier.rating) {
        content += `   Rating: ${supplier.rating}/5\n`;
      }
      
      if (supplier.notes) {
        content += `   Notes: ${supplier.notes}\n`;
      }
      
      content += '\n';
    });
  }

  // Business Contacts Section
  if (contacts.length > 0) {
    content += 'BUSINESS CONTACTS\n';
    content += '='.repeat(50) + '\n\n';

    contacts.forEach((contact, index) => {
      content += `${index + 1}. ${contact.name}\n`;
      content += `   Title: ${contact.title}\n`;
      content += `   Company: ${contact.company}\n`;
      content += `   Email: ${contact.email}\n`;
      content += `   Phone: ${contact.phone}\n`;
      content += `   City: ${contact.city}\n`;
      content += `   Industry: ${contact.industry}\n`;
      content += `   Relationship: ${contact.relationship}\n`;
      content += `   Importance: ${contact.importance}\n`;
      
      if (contact.wechat) {
        content += `   WeChat: ${contact.wechat}\n`;
      }
      
      if (contact.linkedin) {
        content += `   LinkedIn: ${contact.linkedin}\n`;
      }
      
      if (contact.notes) {
        content += `   Notes: ${contact.notes}\n`;
      }
      
      content += '\n';
    });
  }

  // Expenses Section
  if (expenses.length > 0) {
    content += 'EXPENSE REPORT\n';
    content += '='.repeat(50) + '\n\n';

    // Calculate totals
    const totalAmount = expenses.reduce((sum, expense) => {
      const usdAmount = expense.currency === 'CNY' ? expense.amount / 7.2 : 
                       expense.currency === 'EUR' ? expense.amount * 1.1 : 
                       expense.amount;
      return sum + usdAmount;
    }, 0);

    const reimbursableAmount = expenses
      .filter(expense => expense.reimbursable)
      .reduce((sum, expense) => {
        const usdAmount = expense.currency === 'CNY' ? expense.amount / 7.2 : 
                         expense.currency === 'EUR' ? expense.amount * 1.1 : 
                         expense.amount;
        return sum + usdAmount;
      }, 0);

    content += `EXPENSE SUMMARY\n`;
    content += `Total Expenses: $${totalAmount.toFixed(2)} USD (estimated)\n`;
    content += `Reimbursable: $${reimbursableAmount.toFixed(2)} USD (estimated)\n`;
    content += `Total Items: ${expenses.length}\n\n`;

    content += `DETAILED EXPENSES\n`;
    content += '-'.repeat(30) + '\n';

    const sortedExpenses = [...expenses].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    sortedExpenses.forEach((expense, index) => {
      content += `${index + 1}. ${expense.description}\n`;
      content += `   Date: ${format(parseISO(expense.date), 'MMMM dd, yyyy')}\n`;
      content += `   Category: ${expense.category}\n`;
      content += `   Amount: ${expense.amount} ${expense.currency}\n`;
      content += `   Payment: ${expense.payment_method}\n`;
      content += `   Traveler: ${expense.assigned_to}\n`;
      content += `   Status: ${expense.approved ? 'Approved' : 'Pending'}\n`;
      content += `   Reimbursable: ${expense.reimbursable ? 'Yes' : 'No'}\n`;
      content += `   Purpose: ${expense.business_purpose}\n`;
      content += '\n';
    });
  }

  // Footer
  content += '='.repeat(80) + '\n';
  content += 'End of Report\n';
  content += `Generated by Zervi Travel on ${format(new Date(), 'MMMM dd, yyyy \'at\' HH:mm')}\n`;
  content += '='.repeat(80) + '\n';

  return content;
};