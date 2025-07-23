import { ItineraryItem } from '../types';
import { format, parseISO } from 'date-fns';

/**
 * Generate a printer-friendly HTML representation of the itinerary
 */
export const generatePrintableItinerary = (itinerary: ItineraryItem[]): string => {
  // Sort by date
  const sortedItinerary = [...itinerary].sort((a, b) => {
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });

  // Group items by date
  const itemsByDate: Record<string, ItineraryItem[]> = {};
  
  sortedItinerary.forEach(item => {
    const dateKey = item.startDate;
    if (!itemsByDate[dateKey]) {
      itemsByDate[dateKey] = [];
    }
    itemsByDate[dateKey].push(item);
  });

  // Generate HTML
  let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Zervi Travel Itinerary</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          text-align: center;
          color: #1a365d;
          margin-bottom: 30px;
        }
        h2 {
          color: #1a365d;
          border-bottom: 1px solid #ccc;
          padding-bottom: 5px;
          margin-top: 25px;
        }
        .item {
          margin-bottom: 20px;
          page-break-inside: avoid;
        }
        .item-header {
          display: flex;
          justify-content: space-between;
          background-color: #f8f9fa;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 10px;
        }
        .item-title {
          font-weight: bold;
          color: #2a9d8f;
        }
        .item-type {
          color: #666;
          font-size: 0.9em;
        }
        .item-details {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 10px;
        }
        .detail-label {
          font-size: 0.8em;
          color: #666;
          margin-bottom: 2px;
        }
        .detail-value {
          font-weight: 500;
        }
        .detail-full {
          grid-column: 1 / -1;
        }
        .specific-details {
          background-color: #f0f4f8;
          padding: 10px;
          border-radius: 4px;
          margin-top: 10px;
        }
        .assignee {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.8em;
          margin-left: 10px;
        }
        .assignee-archie {
          background-color: #dbeafe;
          color: #1e40af;
        }
        .assignee-yok {
          background-color: #dcfce7;
          color: #166534;
        }
        .assignee-both {
          background-color: #f3e8ff;
          color: #6b21a8;
        }
        .confirmed {
          color: #059669;
          font-weight: 500;
        }
        .unconfirmed {
          color: #d97706;
          font-weight: 500;
        }
        .notes {
          font-style: italic;
          margin-top: 10px;
          border-left: 3px solid #ccc;
          padding-left: 10px;
        }
        @media print {
          body {
            padding: 0;
            font-size: 11pt;
          }
          .page-break {
            page-break-after: always;
          }
        }
      </style>
    </head>
    <body>
      <h1>Zervi Travel Itinerary</h1>
  `;

  // Add itinerary items grouped by date
  Object.keys(itemsByDate).sort().forEach(dateKey => {
    const dateStr = format(parseISO(dateKey), 'EEEE, MMMM d, yyyy');
    html += `<h2>${dateStr}</h2>`;
    
    itemsByDate[dateKey].forEach(item => {
      const getAssigneeClass = (assignedTo: string) => {
        switch(assignedTo) {
          case 'Archie': return 'assignee-archie';
          case 'Yok': return 'assignee-yok';
          case 'Both': return 'assignee-both';
          default: return '';
        }
      };
      
      html += `
        <div class="item">
          <div class="item-header">
            <div>
              <span class="item-title">${item.title}</span>
              <span class="item-type">(${item.type})</span>
              <span class="assignee ${getAssigneeClass(item.assignedTo)}">${item.assignedTo}</span>
            </div>
            <div class="${item.confirmed ? 'confirmed' : 'unconfirmed'}">
              ${item.confirmed ? 'Confirmed' : 'Unconfirmed'}
            </div>
          </div>
          
          <div class="item-details">
            <div>
              <div class="detail-label">Date</div>
              <div class="detail-value">
                ${format(parseISO(item.startDate), 'MMM dd, yyyy')}
                ${item.endDate ? ` — ${format(parseISO(item.endDate), 'MMM dd, yyyy')}` : ''}
              </div>
            </div>
            
            <div>
              <div class="detail-label">Location</div>
              <div class="detail-value">${item.location}</div>
            </div>
            
            <div>
              <div class="detail-label">Status</div>
              <div class="detail-value ${item.confirmed ? 'confirmed' : 'unconfirmed'}">
                ${item.confirmed ? 'Confirmed' : 'Unconfirmed'}
              </div>
            </div>
            
            <div class="detail-full">
              <div class="detail-label">Description</div>
              <div class="detail-value">${item.description}</div>
            </div>
          </div>
      `;
      
      // Type-specific details
      if (item.type === 'Flight' && item.flightNumber) {
        html += `
          <div class="specific-details">
            <div class="detail-label">Flight Details</div>
            <div class="item-details">
              <div>
                <div class="detail-label">Airline & Flight</div>
                <div class="detail-value">${item.airline} ${item.flightNumber}</div>
              </div>
              <div>
                <div class="detail-label">Times</div>
                <div class="detail-value">
                  Departs: ${item.departureTime || 'N/A'} • Arrives: ${item.arrivalTime || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        `;
      }
      
      if (item.type === 'Hotel' && item.hotelName) {
        html += `
          <div class="specific-details">
            <div class="detail-label">Hotel Details</div>
            <div class="item-details">
              <div>
                <div class="detail-label">Hotel & Room</div>
                <div class="detail-value">${item.hotelName}: ${item.roomType || 'N/A'}</div>
              </div>
              <div>
                <div class="detail-label">Times</div>
                <div class="detail-value">
                  Check-in: ${item.checkInTime || 'N/A'} • Check-out: ${item.checkOutTime || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        `;
      }
      
      if (item.type === 'BusinessVisit' && item.contactName) {
        html += `
          <div class="specific-details">
            <div class="detail-label">Contact Details</div>
            <div class="item-details">
              <div>
                <div class="detail-label">Contact Person</div>
                <div class="detail-value">${item.contactName}</div>
              </div>
              <div>
                <div class="detail-label">Company</div>
                <div class="detail-value">${item.companyName || 'N/A'}</div>
              </div>
              ${item.contactPhone ? `
                <div>
                  <div class="detail-label">Phone</div>
                  <div class="detail-value">${item.contactPhone}</div>
                </div>
              ` : ''}
            </div>
          </div>
        `;
      }
      
      if (item.type === 'Sightseeing') {
        html += `
          <div class="specific-details">
            <div class="detail-label">Sightseeing Details</div>
            <div class="item-details">
              ${item.entranceFee ? `
                <div>
                  <div class="detail-label">Entrance Fee</div>
                  <div class="detail-value">${item.entranceFee}</div>
                </div>
              ` : ''}
              ${item.openingHours ? `
                <div>
                  <div class="detail-label">Opening Hours</div>
                  <div class="detail-value">${item.openingHours}</div>
                </div>
              ` : ''}
              ${item.tourDuration ? `
                <div>
                  <div class="detail-label">Tour Duration</div>
                  <div class="detail-value">${item.tourDuration}</div>
                </div>
              ` : ''}
              ${item.tourGuide ? `
                <div>
                  <div class="detail-label">Tour Guide</div>
                  <div class="detail-value">${item.tourGuide}</div>
                </div>
              ` : ''}
            </div>
          </div>
        `;
      }

      if (item.type === 'Train' && item.trainNumber) {
        html += `
          <div class="specific-details">
            <div class="detail-label">Fast Train Details</div>
            <div class="item-details">
              <div>
                <div class="detail-label">Train Number</div>
                <div class="detail-value">${item.trainNumber}</div>
              </div>
              ${item.trainClass ? `
                <div>
                  <div class="detail-label">Class</div>
                  <div class="detail-value">${item.trainClass}</div>
                </div>
              ` : ''}
              <div>
                <div class="detail-label">Times</div>
                <div class="detail-value">
                  Departs: ${item.departureTime || 'N/A'} • Arrives: ${item.arrivalTime || 'N/A'}
                </div>
              </div>
              ${item.platform ? `
                <div>
                  <div class="detail-label">Platform</div>
                  <div class="detail-value">${item.platform}</div>
                </div>
              ` : ''}
            </div>
          </div>
        `;
      }

      if (item.type === 'Bus' && item.busNumber) {
        html += `
          <div class="specific-details">
            <div class="detail-label">Bus Details</div>
            <div class="item-details">
              <div>
                <div class="detail-label">Bus Number</div>
                <div class="detail-value">${item.busNumber}</div>
              </div>
              ${item.busCompany ? `
                <div>
                  <div class="detail-label">Bus Company</div>
                  <div class="detail-value">${item.busCompany}</div>
                </div>
              ` : ''}
              <div>
                <div class="detail-label">Times</div>
                <div class="detail-value">
                  Departs: ${item.departureTime || 'N/A'} • Arrives: ${item.arrivalTime || 'N/A'}
                </div>
              </div>
              ${item.busStop ? `
                <div>
                  <div class="detail-label">Bus Stop/Station</div>
                  <div class="detail-value">${item.busStop}</div>
                </div>
              ` : ''}
            </div>
          </div>
        `;
      }
      
      if (item.notes) {
        html += `
          <div class="notes">
            <div class="detail-label">Notes:</div>
            <div>${item.notes}</div>
          </div>
        `;
      }
      
      html += `</div>`;
    });
  });
  
  html += `
      <div class="page-break"></div>
      <div style="text-align: center; margin-top: 20px; color: #666; font-size: 0.8em;">
        Generated on ${format(new Date(), 'MMMM d, yyyy')} via Zervi Travel
      </div>
    </body>
    </html>
  `;
  
  return html;
};

/**
 * Open a printable version of the itinerary in a new window
 */
export const printItinerary = (itinerary: ItineraryItem[]): void => {
  const printableHTML = generatePrintableItinerary(itinerary);
  const printWindow = window.open('', '_blank');
  
  if (printWindow) {
    printWindow.document.write(printableHTML);
    printWindow.document.close();
    
    // Wait for content to load before printing
    printWindow.onload = function() {
      printWindow.print();
    };
  } else {
    console.error('Could not open print window. Please check if pop-ups are blocked.');
    alert('Could not open print window. Please check if pop-ups are blocked.');
  }
};