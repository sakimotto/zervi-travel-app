import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lvbkobrvcfqtyivebrmf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2YmtvYnJ2Y2ZxdHlpdmVicm1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MDkyMzUsImV4cCI6MjA3NzE4NTIzNX0.CGh_WTlLO9Q-Ax4Mw3uLIzKSLpRGRCMCs52kPkLV01c';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testItineraryCreation() {
  console.log('Testing itinerary item creation...\n');

  // Step 1: Login
  console.log('Step 1: Logging in as archie@zervi.com...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'archie@zervi.com',
    password: 'Archie#Secure2024!Pass'
  });

  if (authError) {
    console.error('❌ Login failed:', authError.message);
    return;
  }

  console.log('✅ Logged in successfully');
  console.log('User ID:', authData.user.id);

  // Step 2: Create a trip first
  console.log('\nStep 2: Creating a test trip...');
  const { data: tripData, error: tripError } = await supabase
    .from('trips')
    .insert({
      trip_name: 'Test Trip for Itinerary',
      purpose: 'Business',
      destination_city: 'Shanghai',
      destination_country: 'China',
      start_date: '2025-11-01',
      end_date: '2025-11-07',
      status: 'Planning',
      budget: 5000,
      notes: 'Test trip',
      user_id: authData.user.id
    })
    .select()
    .single();

  if (tripError) {
    console.error('❌ Trip creation failed:', tripError.message);
    return;
  }

  console.log('✅ Trip created successfully');
  console.log('Trip ID:', tripData.id);
  console.log('Trip Name:', tripData.trip_name);

  // Step 3: Create an itinerary item
  console.log('\nStep 3: Creating itinerary item...');
  const newItem = {
    type: 'Flight',
    title: 'Flight to Shanghai',
    description: 'International flight from LAX to PVG',
    start_date: '2025-11-01',
    end_date: null,
    start_time: '14:30',
    end_time: null,
    location: 'Los Angeles International Airport',
    assigned_to: 'Archie',
    confirmed: false,
    notes: 'Check-in 3 hours early',
    type_specific_data: {
      airline: 'Air China',
      flight_number: 'CA988',
      departure_time: '14:30',
      arrival_time: '18:30'
    },
    trip_id: tripData.id,
    user_id: authData.user.id
  };

  const { data: itemData, error: itemError } = await supabase
    .from('itinerary_items')
    .insert(newItem)
    .select()
    .single();

  if (itemError) {
    console.error('❌ Itinerary item creation failed:', itemError.message);
    console.error('Full error:', itemError);
    return;
  }

  console.log('✅ Itinerary item created successfully!');
  console.log('Item ID:', itemData.id);
  console.log('Item Title:', itemData.title);
  console.log('Item Type:', itemData.type);
  console.log('Start Time:', itemData.start_time);
  console.log('Associated Trip:', itemData.trip_id);

  // Step 4: Verify we can query it back
  console.log('\nStep 4: Querying the item back...');
  const { data: queriedItem, error: queryError } = await supabase
    .from('itinerary_items')
    .select('*')
    .eq('id', itemData.id)
    .single();

  if (queryError) {
    console.error('❌ Query failed:', queryError.message);
    return;
  }

  console.log('✅ Successfully queried item back!');
  console.log('Verified:', queriedItem.title);

  // Step 5: Clean up
  console.log('\nStep 5: Cleaning up test data...');
  await supabase.from('itinerary_items').delete().eq('id', itemData.id);
  await supabase.from('trips').delete().eq('id', tripData.id);
  console.log('✅ Test data cleaned up');

  console.log('\n✅ ALL TESTS PASSED!');
}

testItineraryCreation().catch(console.error);
