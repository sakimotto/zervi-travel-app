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
  const content = generateWordCompatibleHTML(itinerary, suppliers, contacts, expenses);
  const blob = new Blob([content], { type: 'application/msword' });
  saveAs(blob, `China-Business-Travel-Report-${new Date().toISOString().split('T')[0]}.doc`);
};

/**
 * Generate Word-compatible HTML content
 */
const generateWordCompatibleHTML = (
  itinerary: ItineraryItem[],
  suppliers: Supplier[],
  contacts: BusinessContact[],
  expenses: Expense[]
): string => {
  // Sort itinerary by date
  const sortedItinerary = [...itinerary].sort((a, b) => 
    new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, expense) => {
    const usdAmount = expense.currency === 'CNY' ? expense.amount / 7.2 : 
                     expense.currency === 'EUR' ? expense.amount * 1.1 : 
                     expense.amount;
    return sum + usdAmount;
  }, 0);

  return `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>Zervi Travel Business Report</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>90</w:Zoom>
      <w:DoNotPromptForConvert/>
      <w:DoNotShowInsertionsAndDeletions/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    body {
      font-family: 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #000;
      margin: 0;
      padding: 0;
    }
    h1 {
      font-size: 18pt;
      font-weight: bold;
      text-align: center;
      color: #1a365d;
      margin-bottom: 20pt;
      border-bottom: 2pt solid #2a9d8f;
      padding-bottom: 10pt;
    }
    h2 {
      font-size: 14pt;
      font-weight: bold;
      color: #2a9d8f;
      margin-top: 20pt;
      margin-bottom: 10pt;
      border-bottom: 1pt solid #ccc;
      padding-bottom: 5pt;
    }
    h3 {
      font-size: 12pt;
      font-weight: bold;
      color: #1a365d;
      margin-top: 15pt;
      margin-bottom: 8pt;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10pt 0;
      font-size: 11pt;
    }
    th, td {
      border: 1pt solid #000;
      padding: 8pt;
      text-align: left;
      vertical-align: top;
    }
    th {
      background-color: #f0f0f0;
      font-weight: bold;
    }
    .summary-table {
      margin-bottom: 20pt;
    }
    .summary-table td {
      border: 1pt solid #ccc;
      padding: 6pt;
    }
    .item-confirmed {
      background-color: #f0f9ff;
    }
    .item-pending {
      background-color: #fffbeb;
    }
    .page-break {
      page-break-before: always;
    }
    .no-break {
      page-break-inside: avoid;
    }
    .center {
      text-align: center;
    }
    .footer {
      margin-top: 30pt;
      padding-top: 15pt;
      border-top: 1pt solid #ccc;
      font-size: 10pt;
      color: #666;
      text-align: center;
    }
  </style>
</head>
<body>
  <h1>🏢 Zervi Travel - Business Report</h1>
  
  <p class="center">Generated on ${format(new Date(), 'MMMM dd, yyyy')}</p>
  
  <h2>📋 Executive Summary</h2>
  <table class="summary-table">
    <tr>
      <td><strong>Total Itinerary Items:</strong></td>
      <td>${itinerary.length}</td>
      <td><strong>Confirmed Items:</strong></td>
      <td>${itinerary.filter(i => i.confirmed).length}</td>
    </tr>
    <tr>
      <td><strong>Active Suppliers:</strong></td>
      <td>${suppliers.filter(s => s.status === 'Active').length}</td>
      <td><strong>Business Contacts:</strong></td>
      <td>${contacts.length}</td>
    </tr>
    <tr>
      <td><strong>Total Expenses:</strong></td>
      <td>$${totalExpenses.toFixed(2)} USD</td>
  ${itinerary.length > 0 ? `
  <h2>✈️ Travel Itinerary</h2>
  <table>
    <thead>
      <tr>
        <th width="15%">Date</th>
        <th width="20%">Title</th>
        <th width="12%">Type</th>
        <th width="15%">Time</th>
        <th width="20%">Location</th>
        <th width="10%">Assigned</th>
        <th width="8%">Status</th>
      </tr>
    </thead>
    <tbody>
      ${sortedItinerary.map(item => `
        <tr class="${item.confirmed ? 'item-confirmed' : 'item-pending'}">
          <td>${format(parseISO(item.start_date), 'MMM dd, yyyy')}</td>
          <td><strong>${item.title}</strong><br><small>${item.description}</small></td>
          <td>${item.type}</td>
          <td>
            ${item.start_time || 'TBD'}
            ${item.end_time ? `<br>to ${item.end_time}` : ''}
          </td>
          <td>${item.location}</td>
          <td>${item.assigned_to}</td>
          <td>${item.confirmed ? '✅ Confirmed' : '⏳ Pending'}</td>
        </tr>
        ${item.type_specific_data && Object.keys(item.type_specific_data).length > 0 ? `
        <tr class="${item.confirmed ? 'item-confirmed' : 'item-pending'}">
          <td colspan="7">
            <small>
              ${item.type === 'Flight' && item.type_specific_data.airline ? 
                `<strong>Flight:</strong> ${item.type_specific_data.airline} ${item.type_specific_data.flightNumber || ''}<br>` : ''}
              ${item.type === 'Hotel' && item.type_specific_data.hotelName ? 
                `<strong>Hotel:</strong> ${item.type_specific_data.hotelName} (${item.type_specific_data.roomType || 'Standard'})<br>` : ''}
              ${item.type === 'BusinessVisit' && item.type_specific_data.contactName ? 
                `<strong>Contact:</strong> ${item.type_specific_data.contactName} at ${item.type_specific_data.companyName || ''}<br>` : ''}
              ${item.notes ? `<strong>Notes:</strong> ${item.notes}` : ''}
            </small>
          </td>
        </tr>
        ` : ''}
      `).join('')}
    </tbody>
  </table>
  ` : ''}
      <td><strong>Expense Items:</strong></td>
  ${suppliers.length > 0 ? `
  <div class="page-break"></div>
  <h2>🏢 Supplier Directory</h2>
  <table>
    <thead>
      <tr>
        <th width="25%">Company</th>
        <th width="20%">Contact Person</th>
        <th width="20%">Location</th>
        <th width="15%">Industry</th>
        <th width="10%">Status</th>
        <th width="10%">Rating</th>
      </tr>
    </thead>
    <tbody>
      ${suppliers.map(supplier => `
        <tr>
          <td>
            <strong>${supplier.company_name}</strong><br>
            <small>${supplier.email}<br>${supplier.phone}</small>
          </td>
          <td>${supplier.contact_person}</td>
          <td>${supplier.city}, ${supplier.province}</td>
          <td>${supplier.industry}</td>
          <td>${supplier.status}</td>
          <td>${supplier.rating ? `${supplier.rating}/5` : 'N/A'}</td>
        </tr>
        ${supplier.products.length > 0 || supplier.notes ? `
        <tr>
          <td colspan="6">
            <small>
              ${supplier.products.length > 0 ? `<strong>Products:</strong> ${supplier.products.join(', ')}<br>` : ''}
              ${supplier.notes ? `<strong>Notes:</strong> ${supplier.notes}` : ''}
            </small>
          </td>
        </tr>
        ` : ''}
      `).join('')}
    </tbody>
  </table>
  ` : ''}
      <td>${expenses.length}</td>
  ${contacts.length > 0 ? `
  <div class="page-break"></div>
  <h2>👥 Business Contacts</h2>
  <table>
    <thead>
      <tr>
        <th width="20%">Name</th>
        <th width="15%">Title</th>
        <th width="20%">Company</th>
        <th width="15%">Contact Info</th>
        <th width="15%">Location</th>
        <th width="15%">Relationship</th>
      </tr>
    </thead>
    <tbody>
      ${contacts.map(contact => `
        <tr>
          <td><strong>${contact.name}</strong></td>
          <td>${contact.title}</td>
          <td>${contact.company}</td>
          <td>
            <small>
              ${contact.email}<br>
              ${contact.phone}
              ${contact.wechat ? `<br>WeChat: ${contact.wechat}` : ''}
            </small>
          </td>
          <td>${contact.city}</td>
          <td>${contact.relationship}<br><small>${contact.importance} Priority</small></td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}
    </tr>
  ${expenses.length > 0 ? `
  <div class="page-break"></div>
  <h2>💰 Expense Report</h2>
  <table>
    <thead>
      <tr>
        <th width="12%">Date</th>
        <th width="25%">Description</th>
        <th width="15%">Category</th>
        <th width="12%">Amount</th>
        <th width="12%">Traveler</th>
        <th width="12%">Payment</th>
        <th width="12%">Status</th>
      </tr>
    </thead>
    <tbody>
      ${expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(expense => `
        <tr>
          <td>${format(parseISO(expense.date), 'MMM dd')}</td>
          <td>
            <strong>${expense.description}</strong><br>
            <small>${expense.business_purpose}</small>
          </td>
          <td>${expense.category}</td>
          <td>${expense.amount} ${expense.currency}</td>
          <td>${expense.assigned_to}</td>
          <td><small>${expense.payment_method}</small></td>
          <td>
            ${expense.approved ? '✅ Approved' : '⏳ Pending'}
            ${expense.reimbursable ? '<br><small>Reimbursable</small>' : ''}
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}
  </table>
  <div class="footer">
    <p><strong>Zervi Travel</strong> - Your Complete Business Travel Solution</p>
    <p>📞 (02) 415 2174 | 📧 info@zervi.com | 🌐 www.zervi.com</p>
    <p>9 Soi Bangkhuntien 11 Yaek 2-3 Samaedam, Bangkhuntien Bangkok 10150</p>
  </div>
</body>
</html>
  `;
};