import { ItineraryItem, Supplier, BusinessContact, Expense } from '../types';
import { format, parseISO } from 'date-fns';
import { saveAs } from 'file-saver';

/**
 * Generate a beautifully formatted A4-sized HTML document for itinerary export
 */
export const exportItineraryToHTML = (
  itinerary: ItineraryItem[],
  suppliers: Supplier[] = [],
  contacts: BusinessContact[] = [],
  expenses: Expense[] = []
): void => {
  const content = generateFormattedItineraryHTML(itinerary, suppliers, contacts, expenses);
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
  saveAs(blob, `Zervi-Travel-Itinerary-${new Date().toISOString().split('T')[0]}.html`);
};

/**
 * Generate a Word-compatible document
 */
export const exportItineraryToWord = (
  itinerary: ItineraryItem[],
  suppliers: Supplier[] = [],
  contacts: BusinessContact[] = [],
  expenses: Expense[] = []
): void => {
  const content = generateWordCompatibleDocument(itinerary, suppliers, contacts, expenses);
  const blob = new Blob([content], { 
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
  });
  saveAs(blob, `Zervi-Travel-Itinerary-${new Date().toISOString().split('T')[0]}.docx`);
};

/**
 * Print the itinerary directly
 */
export const printItinerary = (
  itinerary: ItineraryItem[],
  suppliers: Supplier[] = [],
  contacts: BusinessContact[] = [],
  expenses: Expense[] = []
): void => {
  const content = generateFormattedItineraryHTML(itinerary, suppliers, contacts, expenses);
  const printWindow = window.open('', '_blank');
  
  if (printWindow) {
    printWindow.document.write(content);
    printWindow.document.close();
    
    printWindow.onload = function() {
      printWindow.print();
    };
  } else {
    alert('Could not open print window. Please check if pop-ups are blocked.');
  }
};

/**
 * Generate beautifully formatted HTML content
 */
const generateFormattedItineraryHTML = (
  itinerary: ItineraryItem[],
  suppliers: Supplier[],
  contacts: BusinessContact[],
  expenses: Expense[]
): string => {
  // Sort itinerary by date
  const sortedItinerary = [...itinerary].sort((a, b) => 
    new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );

  // Group items by date
  const itemsByDate: Record<string, ItineraryItem[]> = {};
  sortedItinerary.forEach(item => {
    const dateKey = item.start_date;
    if (!itemsByDate[dateKey]) {
      itemsByDate[dateKey] = [];
    }
    itemsByDate[dateKey].push(item);
  });

  // Calculate trip summary
  const tripStart = sortedItinerary.length > 0 ? sortedItinerary[0].start_date : '';
  const tripEnd = sortedItinerary.length > 0 ? sortedItinerary[sortedItinerary.length - 1].start_date : '';
  const totalDays = tripStart && tripEnd ? 
    Math.ceil((new Date(tripEnd).getTime() - new Date(tripStart).getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zervi Travel - Business Itinerary</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background: white;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding: 20px 0;
      border-bottom: 3px solid #1a365d;
    }
    
    .company-logo {
      font-size: 28px;
      font-weight: bold;
      color: #1a365d;
      margin-bottom: 5px;
    }
    
    .document-title {
      font-size: 24px;
      color: #2a9d8f;
      margin-bottom: 10px;
    }
    
    .trip-summary {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 30px;
      border-left: 5px solid #2a9d8f;
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    
    .summary-item {
      text-align: center;
      padding: 10px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .summary-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .summary-value {
      font-size: 18px;
      font-weight: bold;
      color: #1a365d;
      margin-top: 5px;
    }
    
    .day-section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }
    
    .day-header {
      background: linear-gradient(135deg, #1a365d 0%, #2a9d8f 100%);
      color: white;
      padding: 15px 20px;
      border-radius: 10px 10px 0 0;
      font-size: 18px;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .day-content {
      border: 1px solid #e0e0e0;
      border-top: none;
      border-radius: 0 0 10px 10px;
      overflow: hidden;
    }
    
    .itinerary-item {
      padding: 20px;
      border-bottom: 1px solid #f0f0f0;
      position: relative;
    }
    
    .itinerary-item:last-child {
      border-bottom: none;
    }
    
    .item-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 15px;
    }
    
    .item-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      color: white;
      flex-shrink: 0;
    }
    
    .icon-flight { background: #3b82f6; }
    .icon-hotel { background: #6366f1; }
    .icon-taxi { background: #eab308; }
    .icon-train { background: #f59e0b; }
    .icon-bus { background: #84cc16; }
    .icon-business { background: #8b5cf6; }
    .icon-meeting { background: #06b6d4; }
    .icon-sightseeing { background: #10b981; }
    .icon-other { background: #6b7280; }
    
    .item-title {
      font-size: 18px;
      font-weight: bold;
      color: #1a365d;
      margin-bottom: 5px;
    }
    
    .item-type {
      font-size: 14px;
      color: #666;
      background: #f8f9fa;
      padding: 4px 8px;
      border-radius: 4px;
      display: inline-block;
    }
    
    .item-status {
      position: absolute;
      top: 20px;
      right: 20px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }
    
    .status-confirmed {
      background: #dcfce7;
      color: #166534;
    }
    
    .status-pending {
      background: #fef3c7;
      color: #92400e;
    }
    
    .item-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin: 15px 0;
    }
    
    .detail-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .detail-icon {
      width: 16px;
      height: 16px;
      color: #666;
    }
    
    .detail-label {
      font-weight: 600;
      color: #374151;
      min-width: 60px;
    }
    
    .detail-value {
      color: #1f2937;
    }
    
    .item-description {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
      border-left: 4px solid #2a9d8f;
    }
    
    .type-specific-details {
      background: #fff7ed;
      padding: 15px;
      border-radius: 8px;
      margin-top: 15px;
      border: 1px solid #fed7aa;
    }
    
    .type-specific-title {
      font-weight: bold;
      color: #ea580c;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .notes-section {
      background: #f0f9ff;
      padding: 15px;
      border-radius: 8px;
      margin-top: 15px;
      border-left: 4px solid #0ea5e9;
    }
    
    .notes-title {
      font-weight: bold;
      color: #0c4a6e;
      margin-bottom: 8px;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
    
    .contact-info {
      margin-top: 30px;
      background: #f8f9fa;
      padding: 20px;
      border-radius: 10px;
      border: 1px solid #e5e7eb;
    }
    
    .contact-title {
      font-size: 16px;
      font-weight: bold;
      color: #1a365d;
      margin-bottom: 15px;
      text-align: center;
    }
    
    .contact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
    }
    
    .contact-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
    }
    
    @media print {
      body {
        font-size: 12pt;
      }
      
      .day-section {
        page-break-inside: avoid;
      }
      
      .itinerary-item {
        page-break-inside: avoid;
      }
      
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-logo">🏢 Zervi Travel</div>
    <div class="document-title">Business Travel Itinerary</div>
    <div style="color: #666; font-size: 14px;">Generated on ${format(new Date(), 'MMMM dd, yyyy \'at\' HH:mm')}</div>
  </div>

  <div class="trip-summary">
    <h2 style="color: #1a365d; margin-bottom: 15px;">📋 Trip Overview</h2>
    <div class="summary-grid">
      <div class="summary-item">
        <div class="summary-label">Trip Duration</div>
        <div class="summary-value">${totalDays} Days</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Total Items</div>
        <div class="summary-value">${sortedItinerary.length}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Confirmed</div>
        <div class="summary-value">${sortedItinerary.filter(i => i.confirmed).length}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Pending</div>
        <div class="summary-value">${sortedItinerary.filter(i => !i.confirmed).length}</div>
      </div>
    </div>
    ${tripStart && tripEnd ? `
    <div style="text-align: center; margin-top: 15px; font-size: 16px;">
      <strong>📅 ${format(parseISO(tripStart), 'MMMM dd, yyyy')} → ${format(parseISO(tripEnd), 'MMMM dd, yyyy')}</strong>
    </div>
    ` : ''}
  </div>

  ${Object.keys(itemsByDate).length === 0 ? `
    <div style="text-align: center; padding: 40px; color: #666;">
      <h3>No itinerary items found</h3>
      <p>Add items to your itinerary to see them in this export.</p>
    </div>
  ` : Object.keys(itemsByDate).sort().map(dateKey => {
    const dayItems = itemsByDate[dateKey].sort((a, b) => 
      (a.start_time || '00:00').localeCompare(b.start_time || '00:00')
    );
    
    return `
    <div class="day-section">
      <div class="day-header">
        📅 ${format(parseISO(dateKey), 'EEEE, MMMM dd, yyyy')}
        <span style="margin-left: auto; font-size: 14px; opacity: 0.9;">
          ${dayItems.length} event${dayItems.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div class="day-content">
        ${dayItems.map(item => {
          const getItemIcon = (type: string) => {
            switch (type) {
              case 'Flight': return '✈️';
              case 'Hotel': return '🏨';
              case 'Taxi': return '🚕';
              case 'Train': return '🚄';
              case 'Bus': return '🚌';
              case 'TradeShow': return '🏢';
              case 'BusinessVisit': return '🤝';
              case 'Meeting': return '👥';
              case 'Conference': return '🎤';
              case 'Factory Visit': return '🏭';
              case 'Sightseeing': return '🗺️';
              default: return '📋';
            }
          };
          
          const getIconClass = (type: string) => {
            switch (type) {
              case 'Flight': return 'icon-flight';
              case 'Hotel': return 'icon-hotel';
              case 'Taxi': return 'icon-taxi';
              case 'Train': return 'icon-train';
              case 'Bus': return 'icon-bus';
              case 'TradeShow': case 'BusinessVisit': case 'Factory Visit': return 'icon-business';
              case 'Meeting': case 'Conference': return 'icon-meeting';
              case 'Sightseeing': return 'icon-sightseeing';
              default: return 'icon-other';
            }
          };

          return `
          <div class="itinerary-item">
            <div class="item-status ${item.confirmed ? 'status-confirmed' : 'status-pending'}">
              ${item.confirmed ? '✅ Confirmed' : '⏳ Pending'}
            </div>
            
            <div class="item-header">
              <div class="item-icon ${getIconClass(item.type)}">
                ${getItemIcon(item.type)}
              </div>
              <div>
                <div class="item-title">${item.title}</div>
                <div class="item-type">${item.type}</div>
              </div>
            </div>

            <div class="item-details">
              ${item.start_time ? `
                <div class="detail-item">
                  <span class="detail-icon">🕐</span>
                  <span class="detail-label">Time:</span>
                  <span class="detail-value">${item.start_time}${item.end_time ? ` - ${item.end_time}` : ''}</span>
                </div>
              ` : ''}
              
              <div class="detail-item">
                <span class="detail-icon">📍</span>
                <span class="detail-label">Location:</span>
                <span class="detail-value">${item.location}</span>
              </div>
              
              <div class="detail-item">
                <span class="detail-icon">👤</span>
                <span class="detail-label">Assigned:</span>
                <span class="detail-value">${item.assigned_to}</span>
              </div>
              
              ${item.end_date && item.end_date !== item.start_date ? `
                <div class="detail-item">
                  <span class="detail-icon">📅</span>
                  <span class="detail-label">Until:</span>
                  <span class="detail-value">${format(parseISO(item.end_date), 'MMM dd, yyyy')}</span>
                </div>
              ` : ''}
            </div>

            <div class="item-description">
              <strong>Description:</strong> ${item.description}
            </div>

            ${item.type_specific_data && Object.keys(item.type_specific_data).length > 0 ? `
              <div class="type-specific-details">
                <div class="type-specific-title">
                  ${getItemIcon(item.type)} ${item.type} Details
                </div>
                <div class="item-details">
                  ${item.type === 'Flight' && item.type_specific_data.airline ? `
                    <div class="detail-item">
                      <span class="detail-label">Airline:</span>
                      <span class="detail-value">${item.type_specific_data.airline} ${item.type_specific_data.flight_number || ''}</span>
                    </div>
                    ${item.type_specific_data.departure_time ? `
                      <div class="detail-item">
                        <span class="detail-label">Departure:</span>
                        <span class="detail-value">${item.type_specific_data.departure_time}</span>
                      </div>
                    ` : ''}
                    ${item.type_specific_data.arrival_time ? `
                      <div class="detail-item">
                        <span class="detail-label">Arrival:</span>
                        <span class="detail-value">${item.type_specific_data.arrival_time}</span>
                      </div>
                    ` : ''}
                  ` : ''}
                  
                  ${item.type === 'Hotel' && item.type_specific_data.hotel_name ? `
                    <div class="detail-item">
                      <span class="detail-label">Hotel:</span>
                      <span class="detail-value">${item.type_specific_data.hotel_name}</span>
                    </div>
                    ${item.type_specific_data.room_type ? `
                      <div class="detail-item">
                        <span class="detail-label">Room:</span>
                        <span class="detail-value">${item.type_specific_data.room_type}</span>
                      </div>
                    ` : ''}
                    ${item.type_specific_data.check_in_time ? `
                      <div class="detail-item">
                        <span class="detail-label">Check-in:</span>
                        <span class="detail-value">${item.type_specific_data.check_in_time}</span>
                      </div>
                    ` : ''}
                    ${item.type_specific_data.check_out_time ? `
                      <div class="detail-item">
                        <span class="detail-label">Check-out:</span>
                        <span class="detail-value">${item.type_specific_data.check_out_time}</span>
                      </div>
                    ` : ''}
                  ` : ''}
                  
                  ${item.type === 'BusinessVisit' && item.type_specific_data.contact_name ? `
                    <div class="detail-item">
                      <span class="detail-label">Contact:</span>
                      <span class="detail-value">${item.type_specific_data.contact_name}</span>
                    </div>
                    ${item.type_specific_data.company_name ? `
                      <div class="detail-item">
                        <span class="detail-label">Company:</span>
                        <span class="detail-value">${item.type_specific_data.company_name}</span>
                      </div>
                    ` : ''}
                    ${item.type_specific_data.contact_phone ? `
                      <div class="detail-item">
                        <span class="detail-label">Phone:</span>
                        <span class="detail-value">${item.type_specific_data.contact_phone}</span>
                      </div>
                    ` : ''}
                  ` : ''}
                  
                  ${item.type === 'Train' && item.type_specific_data.train_number ? `
                    <div class="detail-item">
                      <span class="detail-label">Train:</span>
                      <span class="detail-value">${item.type_specific_data.train_number}</span>
                    </div>
                    ${item.type_specific_data.train_class ? `
                      <div class="detail-item">
                        <span class="detail-label">Class:</span>
                        <span class="detail-value">${item.type_specific_data.train_class}</span>
                      </div>
                    ` : ''}
                    ${item.type_specific_data.platform ? `
                      <div class="detail-item">
                        <span class="detail-label">Platform:</span>
                        <span class="detail-value">${item.type_specific_data.platform}</span>
                      </div>
                    ` : ''}
                  ` : ''}
                </div>
              </div>
            ` : ''}

            ${item.notes ? `
              <div class="notes-section">
                <div class="notes-title">📝 Notes</div>
                <div>${item.notes}</div>
              </div>
            ` : ''}
          </div>
          `;
        }).join('')}
      </div>
    </div>
    `;
  }).join('')}

  ${suppliers.length > 0 ? `
    <div style="page-break-before: always;">
      <h2 style="color: #1a365d; margin-bottom: 20px; border-bottom: 2px solid #2a9d8f; padding-bottom: 10px;">
        🏢 Key Suppliers & Contacts
      </h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
        ${suppliers.slice(0, 6).map(supplier => `
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; background: #f8f9fa;">
            <h4 style="color: #1a365d; margin-bottom: 10px;">${supplier.company_name}</h4>
            <div style="font-size: 14px; color: #666; margin-bottom: 8px;">
              <strong>Contact:</strong> ${supplier.contact_person}
            </div>
            <div style="font-size: 14px; color: #666; margin-bottom: 8px;">
              <strong>Phone:</strong> ${supplier.phone}
            </div>
            <div style="font-size: 14px; color: #666; margin-bottom: 8px;">
              <strong>Email:</strong> ${supplier.email}
            </div>
            <div style="font-size: 14px; color: #666;">
              <strong>Location:</strong> ${supplier.city}, ${supplier.province}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  ` : ''}

  <div class="contact-info">
    <div class="contact-title">📞 Zervi Travel Contact Information</div>
    <div class="contact-grid">
      <div class="contact-item">
        <span>🏢</span>
        <span><strong>Company:</strong> Zervi Asia - Manufacturing & Development</span>
      </div>
      <div class="contact-item">
        <span>📍</span>
        <span><strong>Address:</strong> 9 Soi Bangkhuntien 11 Yaek 2-3 Samaedam, Bangkhuntien Bangkok 10150</span>
      </div>
      <div class="contact-item">
        <span>📞</span>
        <span><strong>Phone:</strong> (02) 415 2174</span>
      </div>
      <div class="contact-item">
        <span>📧</span>
        <span><strong>Email:</strong> info@zervi.com</span>
      </div>
      <div class="contact-item">
        <span>🌐</span>
        <span><strong>Website:</strong> www.zervi.com</span>
      </div>
    </div>
  </div>

  <div class="footer">
    <p><strong>Zervi Travel</strong> - Your Complete Business Travel Solution</p>
    <p>Generated on ${format(new Date(), 'MMMM dd, yyyy \'at\' HH:mm')} | Document Version: ${new Date().getTime()}</p>
    <p style="margin-top: 10px; font-size: 12px; color: #999;">
      This document contains confidential business travel information. Please handle accordingly.
    </p>
  </div>
</body>
</html>
  `;
};

/**
 * Generate Word-compatible document content
 */
const generateWordCompatibleDocument = (
  itinerary: ItineraryItem[],
  suppliers: Supplier[],
  contacts: BusinessContact[],
  expenses: Expense[]
): string => {
  // For Word compatibility, we'll generate a simplified HTML that Word can import
  const sortedItinerary = [...itinerary].sort((a, b) => 
    new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );

  return `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>Zervi Travel Itinerary</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.4; }
    h1 { color: #1a365d; font-size: 18pt; text-align: center; margin-bottom: 20pt; }
    h2 { color: #2a9d8f; font-size: 14pt; margin-top: 20pt; margin-bottom: 10pt; }
    h3 { color: #1a365d; font-size: 12pt; margin-top: 15pt; margin-bottom: 8pt; }
    .item { margin-bottom: 15pt; padding: 10pt; border: 1pt solid #ccc; }
    .confirmed { background-color: #f0f9ff; }
    .pending { background-color: #fffbeb; }
    table { width: 100%; border-collapse: collapse; margin: 10pt 0; }
    td, th { padding: 6pt; border: 1pt solid #ddd; text-align: left; }
    th { background-color: #f8f9fa; font-weight: bold; }
  </style>
</head>
<body>
  <h1>🏢 Zervi Travel - Business Itinerary</h1>
  <p style="text-align: center; margin-bottom: 30pt;">
    Generated on ${format(new Date(), 'MMMM dd, yyyy')}
  </p>

  ${sortedItinerary.map(item => `
    <div class="item ${item.confirmed ? 'confirmed' : 'pending'}">
      <h3>${item.title} (${item.type})</h3>
      <table>
        <tr>
          <th width="20%">Date</th>
          <td>${format(parseISO(item.start_date), 'MMMM dd, yyyy')}${item.end_date ? ` - ${format(parseISO(item.end_date), 'MMMM dd, yyyy')}` : ''}</td>
        </tr>
        ${item.start_time ? `
        <tr>
          <th>Time</th>
          <td>${item.start_time}${item.end_time ? ` - ${item.end_time}` : ''}</td>
        </tr>
        ` : ''}
        <tr>
          <th>Location</th>
          <td>${item.location}</td>
        </tr>
        <tr>
          <th>Assigned To</th>
          <td>${item.assigned_to}</td>
        </tr>
        <tr>
          <th>Status</th>
          <td>${item.confirmed ? 'Confirmed' : 'Pending Confirmation'}</td>
        </tr>
        <tr>
          <th>Description</th>
          <td>${item.description}</td>
        </tr>
        ${item.notes ? `
        <tr>
          <th>Notes</th>
          <td>${item.notes}</td>
        </tr>
        ` : ''}
      </table>
    </div>
  `).join('')}

  <p style="text-align: center; margin-top: 30pt; font-size: 10pt; color: #666;">
    Zervi Asia - Manufacturing & Development<br>
    📞 (02) 415 2174 | 📧 info@zervi.com | 🌐 www.zervi.com
  </p>
</body>
</html>
  `;
};