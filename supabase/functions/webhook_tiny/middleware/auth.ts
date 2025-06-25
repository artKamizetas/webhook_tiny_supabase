import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.42.3?deno-compat";
import {
  supabaseEmail,
  supabaseKey,
  supabasePassword,
  supabaseUrl,
} from "../env/index.ts";
import { AppError } from "../utils/appError.ts";

async function authenticateUser(): Promise<{ supabase: SupabaseClient }> {
  const email = supabaseEmail;
  const password = supabasePassword;
  console.log("Autenticando usuário...");

  const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("Erro de autenticação:", error.message);
    throw new AppError("Erro de autenticação", 401);
  }

  if (!data?.user) {
    console.error("Falha na autenticação: usuário não retornado");
    throw new AppError("Erro de autenticação", 401);
  }
  return { supabase };
}

export {
  authenticateUser
}
