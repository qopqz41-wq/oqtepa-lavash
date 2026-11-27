const SUPABASE_URL = "PROJECT_URL";
const SUPABASE_ANON_KEY = "PUBLISHABLE_KEY";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
