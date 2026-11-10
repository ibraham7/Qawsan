import { createClient } from "@supabase/supabase-js";

// Public values: the publishable key only grants what the RLS policies allow
// (read projects; writes need a signed-in qawsan admin).
const SUPABASE_URL =
    import.meta.env.VITE_SUPABASE_URL ??
    "https://ghdrumngrpttuihyklnc.supabase.co";
const SUPABASE_KEY =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
    "sb_publishable_T_twZtdNi64NoAQJkcz5VQ_GfWl_TyT";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const PROJECTS_TABLE = "qawsan_projects";
export const IMAGES_BUCKET = "qawsan-projects";
