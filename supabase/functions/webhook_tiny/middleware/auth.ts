import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js";

import {
  supabaseEmail,
  supabaseKey,
  supabasePassword,
  supabaseUrl,
} from "../env/index.ts";


async function authenticateUser(): Promise<{ supabase: SupabaseClient }> {
  const email = supabaseEmail;
  const password = supabasePassword;
  
  const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase.auth
    .signInWithPassword({ email, password });

  if (error && !data) {
    console.error("Erro de autenticação:", error);
    throw new Error("Erro de autenticação");
  }

  console.log("Usuário autenticado com sucesso");
  return { supabase };
}


export {
  authenticateUser
}
