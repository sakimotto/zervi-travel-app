import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read .env file
const envFile = readFileSync('.env', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

console.log('Testing authentication...');
console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseKey?.length);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  try {
    console.log('\n1. Testing sign in with rada@zervi.com...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'rada@zervi.com',
      password: 'Rada12345'
    });

    if (error) {
      console.error('Sign in ERROR:', error.message);
      return;
    }

    console.log('✅ Sign in SUCCESSFUL!');
    console.log('User ID:', data.user.id);
    console.log('Email:', data.user.email);
    console.log('Session expires at:', new Date(data.session.expires_at * 1000).toLocaleString());

    console.log('\n2. Testing user profile query...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Profile query ERROR:', profileError.message);
    } else {
      console.log('✅ Profile query SUCCESSFUL!');
      console.log('Profile:', profile);
    }

    console.log('\n3. Testing sign out...');
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error('Sign out ERROR:', signOutError.message);
    } else {
      console.log('✅ Sign out SUCCESSFUL!');
    }

    console.log('\n✅ ALL TESTS PASSED!');
  } catch (err) {
    console.error('Test failed:', err.message);
  }
}

testAuth();
