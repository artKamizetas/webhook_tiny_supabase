import { initEnv } from "../env/test-env.ts";

console.log("[test-setup.ts] Módulo sendo carregado.");

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
  console.log("[test-setup.ts] setupTestEnvironment: Iniciando configuração do ambiente de teste.");
  // Definir que estamos em ambiente de teste
  Deno.env.set("DENO_ENV", "test");
  console.log("[test-setup.ts] setupTestEnvironment: DENO_ENV definido como 'test'.");
  
  // Inicializar as variáveis de ambiente de teste
  const env = await initEnv();
  console.log("[test-setup.ts] setupTestEnvironment: initEnv() concluído. Variáveis recebidas:", env ? Object.keys(env) : "null");
  
  // Configurar as variáveis de ambiente no objeto global Deno.env
  // para que possam ser acessadas por qualquer parte do código
  if (env) {
    for (const [key, value] of Object.entries(env)) {
      Deno.env.set(key, value as string);
      console.log(`[test-setup.ts] setupTestEnvironment: Deno.env.set("${key}", "${value as string}")`);
    }
    console.log("[test-setup.ts] setupTestEnvironment: Variáveis de ambiente configuradas no Deno.env.");
  } else {
    console.error("[test-setup.ts] setupTestEnvironment: Erro - initEnv() retornou nulo ou indefinido. Variáveis de ambiente não foram configuradas.");
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
  console.log("[test-setup.ts] cleanupTestEnvironment: Iniciando limpeza do ambiente de teste.");
  // Remover a variável que indica ambiente de teste
  Deno.env.delete("DENO_ENV");
  console.log("[test-setup.ts] cleanupTestEnvironment: DENO_ENV removido.");
  
  // Lista de variáveis de ambiente que foram definidas para testes
  const testEnvVars = [
    "MY_URL_TINY_OBTER_PEDIDO",
    "MY_TOKEN_API_TINY",
    "MY_URL_TINY_PESQUISA_VENDEDOR",
    "MY_URL_TINY_OBTER_PRODUTO",
    "MY_URL_GOOGLE_SHEET_PROXY", // Chave atualizada conforme o schema do usuário
    "MY_SUPABASE_EMAIL",
    "MY_SUPABASE_PASSWORD",
    "MY_SUPABASE_URL",
    "MY_SUPABASE_KEY"
  ];
  
  // Remover todas as variáveis de ambiente de teste
  for (const key of testEnvVars) {
    Deno.env.delete(key);
    console.log(`[test-setup.ts] cleanupTestEnvironment: Deno.env.delete("${key}")`);
  }
  console.log("[test-setup.ts] cleanupTestEnvironment: Variáveis de ambiente de teste removidas.");
}

console.log("[test-setup.ts] Módulo carregado e funções exportadas.");
