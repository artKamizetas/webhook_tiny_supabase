import { initEnv } from "../env/test-env.ts";

/**
 * Configura o ambiente de teste para os testes unitários
 * 
 * Esta função deve ser chamada no início de cada arquivo de teste
 * para garantir que as variáveis de ambiente estejam configuradas
 * corretamente antes da execução dos testes.
 * 
 * @returns Promise que resolve para as variáveis de ambiente configuradas
 */
export async function setupTestEnvironment() {
  console.log("Configurando ambiente de teste...");
  // Definir que estamos em ambiente de teste
  Deno.env.set("DENO_ENV", "test");
  
  // Inicializar as variáveis de ambiente de teste
  const env = await initEnv();
  console.log("Variáveis de ambiente iniciais:", env);
  
  // Configurar as variáveis de ambiente no objeto global Deno.env
  // para que possam ser acessadas por qualquer parte do código
  for (const [key, value] of Object.entries(env)) {
    Deno.env.set(key, value as string);
  }
  
  return env;
}

/**
 * Limpa o ambiente de teste após a execução dos testes
 * 
 * Esta função deve ser chamada após a execução dos testes
 * para garantir que as variáveis de ambiente sejam restauradas
 * ao seu estado original.
 */
export function cleanupTestEnvironment() {
  // Remover a variável que indica ambiente de teste
  Deno.env.delete("DENO_ENV");
  
  // Lista de variáveis de ambiente que foram definidas para testes
  const testEnvVars = [
    "MY_URL_TINY_OBTER_PEDIDO",
    "MY_TOKEN_API_TINY",
    "MY_URL_TINY_PESQUISA_VENDEDOR",
    "MY_URL_TINY_OBTER_PRODUTO",
    "MY_URL_GOOGLE_SHEET",
    "MY_SUPABASE_EMAIL",
    "MY_SUPABASE_PASSWORD",
    "MY_SUPABASE_URL",
    "MY_SUPABASE_KEY"
  ];
  
  // Remover todas as variáveis de ambiente de teste
  for (const key of testEnvVars) {
    Deno.env.delete(key);
  }
}
