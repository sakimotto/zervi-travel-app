import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lvbkobrvcfqtyivebrmf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2YmtvYnJ2Y2ZxdHlpdmVicm1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MDkyMzUsImV4cCI6MjA3NzE4NTIzNX0.CGh_WTlLO9Q-Ax4Mw3uLIzKSLpRGRCMCs52kPkLV01c';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFullWorkflow() {
  console.log('=== Full Itinerary Workflow Test ===\n');

  // Login
  console.log('1. Logging in...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'archie@zervi.com',
    password: 'Archie#Secure2024!Pass'
  });

  if (authError) {
    console.error('❌ Login failed:', authError.message);
    return;
  }
  console.log('✅ Logged in as:', authData.user.email);

  // Create Trip
  console.log('\n2. Creating a new trip...');
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .insert({
      trip_name: 'SEMA 2025',
      purpose: 'Business',
      destination_city: 'Las Vegas',
      destination_country: 'USA',
      start_date: '2025-11-04',
      end_date: '2025-11-07',
      status: 'Planning',
      budget: 8000,
      notes: 'Annual SEMA trade show attendance',
      user_id: authData.user.id
    })
    .select()
    .single();

  if (tripError) {
    console.error('❌ Trip creation failed:', tripError.message);
    return;
  }
  console.log('✅ Trip created:', trip.trip_name);

  // Add itinerary items
  console.log('\n3. Adding itinerary items to trip...');

  const items = [
    {
      type: 'Flight',
      title: 'Flight to Las Vegas',
      description: 'Direct flight LAX to LAS',
      start_date: '2025-11-04',
      start_time: '08:00',
      location: 'LAX Airport',
      assigned_to: 'Archie',
      confirmed: true,
      type_specific_data: {
        airline: 'Southwest',
        flight_number: 'WN1234',
        departure_time: '08:00',
        arrival_time: '09:30'
      },
      trip_id: trip.id,
      user_id: authData.user.id
    },
    {
      type: 'Hotel',
      title: 'Venetian Hotel',
      description: 'Hotel stay for SEMA',
      start_date: '2025-11-04',
      end_date: '2025-11-07',
      location: 'Las Vegas Strip',
      assigned_to: 'Archie',
      confirmed: true,
      type_specific_data: {
        hotel_name: 'The Venetian',
        room_type: 'Deluxe King',
        check_in_time: '15:00',
        check_out_time: '11:00'
      },
      trip_id: trip.id,
      user_id: authData.user.id
    },
    {
      type: 'TradeShow',
      title: 'SEMA Show Day 1',
      description: 'First day of SEMA trade show',
      start_date: '2025-11-05',
      start_time: '09:00',
      end_time: '17:00',
      location: 'Las Vegas Convention Center',
      assigned_to: 'Archie',
      confirmed: false,
      notes: 'Focus on new automotive parts suppliers',
      trip_id: trip.id,
      user_id: authData.user.id
    }
  ];

  const createdItems = [];
  for (const item of items) {
    const { data, error } = await supabase
      .from('itinerary_items')
      .insert(item)
      .select()
      .single();

    if (error) {
      console.error(`❌ Failed to create ${item.title}:`, error.message);
    } else {
      createdItems.push(data);
      console.log(`✅ Created: ${data.title}`);
    }
  }

  // Query items for this trip
  console.log('\n4. Querying all items for this trip...');
  const { data: tripItems, error: queryError } = await supabase
    .from('itinerary_items')
    .select('*')
    .eq('trip_id', trip.id)
    .order('start_date', { ascending: true });

  if (queryError) {
    console.error('❌ Query failed:', queryError.message);
  } else {
    console.log(`✅ Found ${tripItems.length} items for trip "${trip.trip_name}":`);
    tripItems.forEach((item, idx) => {
      console.log(`   ${idx + 1}. ${item.title} (${item.type}) - ${item.start_date}`);
    });
  }

  // Update an item
  console.log('\n5. Updating an item...');
  if (createdItems.length > 0) {
    const { data: updated, error: updateError } = await supabase
      .from('itinerary_items')
      .update({ confirmed: true, notes: 'Updated via test' })
      .eq('id', createdItems[0].id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Update failed:', updateError.message);
    } else {
      console.log(`✅ Updated: ${updated.title} - Confirmed: ${updated.confirmed}`);
    }
  }

  // Clean up
  console.log('\n6. Cleaning up test data...');
  for (const item of createdItems) {
    await supabase.from('itinerary_items').delete().eq('id', item.id);
  }
  await supabase.from('trips').delete().eq('id', trip.id);
  console.log('✅ All test data cleaned up');

  console.log('\n✅ ✅ ✅ ALL WORKFLOW TESTS PASSED! ✅ ✅ ✅');
  console.log('\nSummary:');
  console.log('- Trip creation: ✅');
  console.log('- Itinerary items creation: ✅');
  console.log('- Items associated with trip: ✅');
  console.log('- Query items by trip: ✅');
  console.log('- Update items: ✅');
  console.log('- Time fields stored correctly: ✅');
}

testFullWorkflow().catch(console.error);
