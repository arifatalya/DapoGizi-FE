const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[ALERT] Supabase credentials not found. Please add SUPABASE_URL and SUPABASE_ANON_KEY to .env file.");
}

const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

module.exports = { supabase };
