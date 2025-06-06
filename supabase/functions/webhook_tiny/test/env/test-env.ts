import { z } from "https://deno.land/x/zod@v3.24.1/mod.ts";

console.log("[test-env.ts] Módulo sendo carregado.");

// Função para carregar e validar variáveis de ambiente com Zod para testes
const envSchema = z.object({
  MY_URL_TINY_OBTER_PEDIDO: z.string().url(),
  MY_TOKEN_API_TINY: z.string().min(10),
  MY_URL_TINY_PESQUISA_VENDEDOR: z.string().url(),
  MY_URL_TINY_OBTER_PRODUTO: z.string().url(),
  MY_URL_GOOGLE_SHEET_PROXY: z.string().url(), // Chave atualizada conforme o schema do usuário
  MY_SUPABASE_EMAIL: z.string().email(),
  MY_SUPABASE_PASSWORD: z.string(),
  MY_SUPABASE_URL: z.string().url(),
  MY_SUPABASE_KEY: z.string(),
});

console.log("[test-env.ts] Schema Zod definido.");

// Função para carregar variáveis de ambiente de um arquivo .env
async function loadEnvFromFile(
  filePath: string,
): Promise<Record<string, string>> {
  console.log(
    `[test-env.ts] loadEnvFromFile: Tentando ler o arquivo: ${filePath}`,
  );
  try {
    const text = await Deno.readTextFile(filePath);
    console.log(
      `[test-env.ts] loadEnvFromFile: Conteúdo bruto do arquivo ${filePath}:\n${text}`,
    );
    const result: Record<string, string> = {};
    const lines = text.split("\n");
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith("#")) {
        continue;
      }
      const equalSignIndex = trimmedLine.indexOf("=");
      if (equalSignIndex !== -1) {
        const key = trimmedLine.substring(0, equalSignIndex).trim();
        let value = trimmedLine.substring(equalSignIndex + 1).trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.substring(1, value.length - 1);
        }
        result[key] = value;
        console.log(`[test-env.ts] loadEnvFromFile: Chave carregada: ${key}`);
      }
    }
    if (Object.keys(result).length === 0) {
      console.warn(
        `[test-env.ts] loadEnvFromFile: Nenhuma chave/valor foi parseada do arquivo ${filePath}. O arquivo pode estar vazio ou mal formatado.`,
      );
    }
    return result;
  } catch (error) {
    console.error(
      `[test-env.ts] loadEnvFromFile: Erro ao carregar arquivo .env (${filePath}): ${error.message}`,
    );
    return {};
  }
}

// Função para obter variáveis de ambiente para testes
export async function getTestEnv() {
  console.log(
    "[test-env.ts] getTestEnv: Iniciando obtenção de variáveis de ambiente.",
  );
  let envVars: Record<string, string> = {};
  const denoEnvValue = Deno.env.get("DENO_ENV");
  console.log(`[test-env.ts] getTestEnv: Valor de DENO_ENV: ${denoEnvValue}`);
  const isTestEnv = denoEnvValue === "test";

  if (isTestEnv) {
    console.log(
      "[test-env.ts] getTestEnv: DENO_ENV é 'test'. Tentando carregar do arquivo .env.",
    );
    let testEnvPath = "";
    try {
      // Tenta resolver o caminho relativo ao módulo atual.
      // Isso assume que test-env.ts está em 'test/env/' e test.env está em 'test/env/' também.
      testEnvPath = new URL("./test.env", import.meta.url).pathname;
      console.log(
        `[test-env.ts] getTestEnv: Caminho construído para test.env: ${testEnvPath}`,
      );
    } catch (e) {
      console.error(
        "[test-env.ts] getTestEnv: Erro ao construir URL para test.env: ",
        e,
      );
      // Fallback para um caminho relativo se a resolução da URL falhar (menos robusto)
      // Este caminho é relativo ao CWD (diretório de onde o 'deno test' é executado)
      // Se executado da raiz do projeto, e test.env está em supabase/functions/webhook_tiny/test/env/test.env
      testEnvPath = "./supabase/functions/webhook_tiny/test/env/test.env";
      console.warn(
        `[test-env.ts] getTestEnv: Usando caminho de fallback para test.env: ${testEnvPath}`,
      );
    }
    envVars = await loadEnvFromFile(testEnvPath);
    if (Object.keys(envVars).length === 0) {
      console.warn(
        "[test-env.ts] getTestEnv: Nenhuma variável de ambiente foi carregada do arquivo test.env. Verifique o caminho e o conteúdo do arquivo.",
      );
    }
  } else {
    console.log(
      "[test-env.ts] getTestEnv: DENO_ENV não é 'test' (valor: ${denoEnvValue}). Carregando variáveis do ambiente do sistema.",
    );
    envVars = {
      MY_URL_TINY_OBTER_PEDIDO: Deno.env.get("MY_URL_TINY_OBTER_PEDIDO") || "",
      MY_TOKEN_API_TINY: Deno.env.get("MY_TOKEN_API_TINY") || "",
      MY_URL_TINY_PESQUISA_VENDEDOR:
        Deno.env.get("MY_URL_TINY_PESQUISA_VENDEDOR") || "",
      MY_URL_TINY_OBTER_PRODUTO: Deno.env.get("MY_URL_TINY_OBTER_PRODUTO") ||
        "",
      MY_URL_GOOGLE_SHEET_PROXY: Deno.env.get("MY_URL_GOOGLE_SHEET_PROXY") ||
        "",
      MY_SUPABASE_EMAIL: Deno.env.get("MY_SUPABASE_EMAIL") || "",
      MY_SUPABASE_PASSWORD: Deno.env.get("MY_SUPABASE_PASSWORD") || "",
      MY_SUPABASE_URL: Deno.env.get("MY_SUPABASE_URL") || "",
      MY_SUPABASE_KEY: Deno.env.get("MY_SUPABASE_KEY") || "",
    };
  }

  console.log(
    "[test-env.ts] getTestEnv: Variáveis antes da validação Zod:",
    JSON.stringify(envVars, null, 2),
  );
  try {
    const validatedEnv = envSchema.parse(envVars);
    console.log(
      "[test-env.ts] getTestEnv: Variáveis de ambiente validadas com sucesso.",
    );
    return validatedEnv;
  } catch (error) {
    console.error(
      "❌ [test-env.ts] getTestEnv: Falha na validação das variáveis de ambiente para testes:",
    );
    if (error instanceof z.ZodError) {
      console.error(
        "Detalhes da validação Zod:",
        JSON.stringify(error.errors, null, 2),
      );
    } else {
      console.error("Erro inesperado durante a validação:", error);
    }
    throw new Error(
      "Falha na validação das variáveis de ambiente para testes. Verifique os logs para detalhes.",
    );
  }
}

let validatedEnv: z.infer<typeof envSchema> | null = null;

export async function initEnv() {
  console.log("[test-env.ts] initEnv: Chamado.");
  if (!validatedEnv) {
    console.log(
      "[test-env.ts] initEnv: validatedEnv é nulo, chamando getTestEnv().",
    );
    validatedEnv = await getTestEnv();
  } else {
    console.log("[test-env.ts] initEnv: validatedEnv já está definido.");
  }
  return validatedEnv;
}

export async function getEnv() {
  console.log("[test-env.ts] getEnv: Chamado.");
  if (!validatedEnv) {
    console.log(
      "[test-env.ts] getEnv: validatedEnv é nulo, chamando initEnv().",
    );
    await initEnv();
  }
  return validatedEnv!;
}

console.log("[test-env.ts] Módulo carregado e funções exportadas.");
