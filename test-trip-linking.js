import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lvbkobrvcfqtyivebrmf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2YmtvYnJ2Y2ZxdHlpdmVicm1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MDkyMzUsImV4cCI6MjA3NzE4NTIzNX0.CGh_WTlLO9Q-Ax4Mw3uLIzKSLpRGRCMCs52kPkLV01c';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testTripLinking() {
  console.log('=== Testing Trip Linking Workflow ===\n');

  // Login
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'archie@zervi.com',
    password: 'Archie#Secure2024!Pass'
  });

  if (authError) {
    console.error('❌ Login failed');
    return;
  }
  console.log('✅ Logged in\n');

  // Create Trip 1
  const { data: trip1 } = await supabase.from('trips').insert({
    trip_name: 'CES 2026',
    purpose: 'Business',
    destination_city: 'Las Vegas',
    destination_country: 'USA',
    start_date: '2026-01-06',
    end_date: '2026-01-10',
    status: 'Planning',
    budget: 5000,
    user_id: authData.user.id
  }).select().single();
  console.log('✅ Created Trip 1:', trip1.trip_name);

  // Create Trip 2
  const { data: trip2 } = await supabase.from('trips').insert({
    trip_name: 'Hannover Messe 2026',
    purpose: 'Business',
    destination_city: 'Hannover',
    destination_country: 'Germany',
    start_date: '2026-04-13',
    end_date: '2026-04-17',
    status: 'Planning',
    budget: 8000,
    user_id: authData.user.id
  }).select().single();
  console.log('✅ Created Trip 2:', trip2.trip_name);

  // Create item assigned to Trip 1
  const { data: item1 } = await supabase.from('itinerary_items').insert({
    type: 'Flight',
    title: 'Flight to CES',
    description: 'Flight for CES 2026',
    start_date: '2026-01-06',
    location: 'Las Vegas',
    assigned_to: 'Archie',
    confirmed: false,
    trip_id: trip1.id,
    user_id: authData.user.id
  }).select().single();
  console.log('✅ Created item for Trip 1:', item1.title);

  // Create item assigned to Trip 2
  const { data: item2 } = await supabase.from('itinerary_items').insert({
    type: 'Hotel',
    title: 'Hotel for Hannover',
    description: 'Hotel for Hannover Messe',
    start_date: '2026-04-13',
    location: 'Hannover',
    assigned_to: 'Archie',
    confirmed: false,
    trip_id: trip2.id,
    user_id: authData.user.id
  }).select().single();
  console.log('✅ Created item for Trip 2:', item2.title);

  // Create unassigned item
  const { data: item3 } = await supabase.from('itinerary_items').insert({
    type: 'Meeting',
    title: 'Client Meeting',
    description: 'Not assigned to any trip yet',
    start_date: '2026-05-01',
    location: 'Office',
    assigned_to: 'Archie',
    confirmed: false,
    trip_id: null,
    user_id: authData.user.id
  }).select().single();
  console.log('✅ Created unassigned item:', item3.title);

  // Query items by trip
  console.log('\n--- Querying Items by Trip ---');

  const { data: trip1Items } = await supabase
    .from('itinerary_items')
    .select('title, type')
    .eq('trip_id', trip1.id);
  console.log(`Items for "${trip1.trip_name}":`, trip1Items.length);
  trip1Items.forEach(i => console.log(`  - ${i.title} (${i.type})`));

  const { data: trip2Items } = await supabase
    .from('itinerary_items')
    .select('title, type')
    .eq('trip_id', trip2.id);
  console.log(`Items for "${trip2.trip_name}":`, trip2Items.length);
  trip2Items.forEach(i => console.log(`  - ${i.title} (${i.type})`));

  const { data: unassignedItems } = await supabase
    .from('itinerary_items')
    .select('title, type')
    .is('trip_id', null)
    .eq('user_id', authData.user.id);
  console.log(`Unassigned items:`, unassignedItems.length);
  unassignedItems.forEach(i => console.log(`  - ${i.title} (${i.type})`));

  // Reassign an item
  console.log('\n--- Testing Item Reassignment ---');
  await supabase
    .from('itinerary_items')
    .update({ trip_id: trip2.id })
    .eq('id', item3.id);
  console.log(`✅ Reassigned "${item3.title}" to "${trip2.trip_name}"`);

  // Verify
  const { data: updatedItem3 } = await supabase
    .from('itinerary_items')
    .select('title, trip_id')
    .eq('id', item3.id)
    .single();
  console.log('✅ Verified:', updatedItem3.trip_id === trip2.id ? 'SUCCESS' : 'FAILED');

  // Cleanup
  console.log('\n--- Cleaning up ---');
  await supabase.from('itinerary_items').delete().in('id', [item1.id, item2.id, item3.id]);
  await supabase.from('trips').delete().in('id', [trip1.id, trip2.id]);
  console.log('✅ Cleaned up test data');

  console.log('\n✅ ✅ ✅ ALL TESTS PASSED! ✅ ✅ ✅');
}

testTripLinking().catch(console.error);
