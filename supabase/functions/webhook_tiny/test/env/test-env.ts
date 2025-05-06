import { z } from "https://deno.land/x/zod@v3.24.1/mod.ts";

// Função para carregar e validar variáveis de ambiente com Zod para testes
const envSchema = z.object({
  MY_URL_TINY_OBTER_PEDIDO: z.string().url(),
  MY_TOKEN_API_TINY: z.string().min(10),
  MY_URL_TINY_PESQUISA_VENDEDOR: z.string().url(),
  MY_URL_TINY_OBTER_PRODUTO: z.string().url(),
  MY_URL_GOOGLE_SHEET: z.string().url(),
  MY_SUPABASE_EMAIL: z.string().email(),
  MY_SUPABASE_PASSWORD: z.string(),
  MY_SUPABASE_URL: z.string().url(),
  MY_SUPABASE_KEY: z.string(),
});

// Função para carregar variáveis de ambiente de um arquivo .env
async function loadEnvFromFile(filePath: string): Promise<Record<string, string>> {
  try {
    const text = await Deno.readTextFile(filePath);
    const result: Record<string, string> = {};
    
    const lines = text.split("\n");
    for (const line of lines) {
      const trimmedLine = line.trim();
      // Pular linhas vazias e comentários
      if (!trimmedLine || trimmedLine.startsWith("#")) {
        continue;
      }
      
      const equalSignIndex = trimmedLine.indexOf("=");
      if (equalSignIndex !== -1) {
        const key = trimmedLine.substring(0, equalSignIndex).trim();
        let value = trimmedLine.substring(equalSignIndex + 1).trim();
        
        // Remover aspas se existirem
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.substring(1, value.length - 1);
        }
        
        result[key] = value;
      }
    }
    
    return result;
  } catch (error) {
    console.error(`Erro ao carregar arquivo .env: ${error.message}`);
    return {};
  }
}

// Função para obter variáveis de ambiente para testes
export async function getTestEnv() {
  let envVars: Record<string, string> = {};
  
  // Verificar se estamos em ambiente de teste
  const isTestEnv = Deno.env.get("DENO_ENV") === "test";
  
  if (isTestEnv) {
    // Carregar variáveis do arquivo de teste
    const testEnvPath = new URL("./test.env", import.meta.url).pathname;
    console.log("Carregando variáveis de ambiente de teste:", testEnvPath);

    envVars = await loadEnvFromFile(testEnvPath);
  } else {
    // Em ambiente de produção, usar as variáveis do sistema
    envVars = {
      MY_URL_TINY_OBTER_PEDIDO: Deno.env.get("MY_URL_TINY_OBTER_PEDIDO") || "",
      MY_TOKEN_API_TINY: Deno.env.get("MY_TOKEN_API_TINY") || "",
      MY_URL_TINY_PESQUISA_VENDEDOR: Deno.env.get("MY_URL_TINY_PESQUISA_VENDEDOR") || "",
      MY_URL_TINY_OBTER_PRODUTO: Deno.env.get("MY_URL_TINY_OBTER_PRODUTO") || "",
      MY_URL_GOOGLE_SHEET: Deno.env.get("MY_URL_GOOGLE_SHEET") || "",
      MY_SUPABASE_EMAIL: Deno.env.get("MY_SUPABASE_EMAIL") || "",
      MY_SUPABASE_PASSWORD: Deno.env.get("MY_SUPABASE_PASSWORD") || "",
      MY_SUPABASE_URL: Deno.env.get("MY_SUPABASE_URL") || "",
      MY_SUPABASE_KEY: Deno.env.get("MY_SUPABASE_KEY") || "",
    };
    console.log("Carregando variáveis de ambiente de produção...", envVars);
  }
  
  // Validar as variáveis de ambiente
  try {
    const validatedEnv = envSchema.parse(envVars);
    
    return validatedEnv;
  } catch (error) {
    console.error("❌ Falha na validação das variáveis de ambiente para testes:");
    console.error(error.errors);
    throw new Error("Falha na validação das variáveis de ambiente para testes");
  }
}

// Exportar as variáveis de ambiente validadas
let validatedEnv: z.infer<typeof envSchema> | null = null;

export async function initEnv() {
  if (!validatedEnv) {
    validatedEnv = await getTestEnv();
  }
  return validatedEnv;
}

export async function getEnv() {
  if (!validatedEnv) {
    await initEnv();
  }
  return validatedEnv!;
}
