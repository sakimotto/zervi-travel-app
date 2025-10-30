import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: requestingUser }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !requestingUser) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: " + (userError?.message || "Invalid token") }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("role")
      .eq("id", requestingUser.id)
      .maybeSingle();

    if (profileError || profile?.role !== "admin") {
      console.error("Profile check failed:", profileError, profile);
      return new Response(
        JSON.stringify({ error: "Forbidden - Admin access required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    const body = await req.json();
    const { userId, newPassword } = body;

    if (!userId || !newPassword) {
      return new Response(
        JSON.stringify({ error: "User ID and new password are required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 6 characters" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log("Attempting to reset password for user:", userId);

    // First, verify the user exists
    const { data: targetUserData, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (getUserError) {
      console.error("Failed to get user:", getUserError);
      return new Response(
        JSON.stringify({ error: `Database error loading user: ${getUserError.message}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (!targetUserData || !targetUserData.user) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Now update the password
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (updateError) {
      console.error("Password reset error:", updateError);
      return new Response(
        JSON.stringify({ error: `Failed to reset password: ${updateError.message}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log("Password reset successfully for user:", userId);

    return new Response(
      JSON.stringify({ success: true, message: "Password reset successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: `Server error: ${errorMessage}` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});