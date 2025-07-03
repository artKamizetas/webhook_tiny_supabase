import { z } from "https://deno.land/x/zod@v3.24.1/mod.ts";

// Função para carregar e validar variáveis de ambiente com Zod
const envSchema = z.object({
  MY_URL_TINY_OBTER_PEDIDO: z.string().url(),
  MY_TOKEN_API_TINY: z.string().min(10),
  MY_URL_TINY_PESQUISA_VENDEDOR: z.string().url(),
  MY_URL_TINY_OBTER_PRODUTO: z.string().url(),
  MY_URL_GOOGLE_SHEET_PROXY: z.string().url(),
  MY_SUPABASE_EMAIL: z.string(),
  MY_SUPABASE_PASSWORD: z.string(),
  MY_SUPABASE_URL: z.string().url(),
  MY_SUPABASE_KEY: z.string(),
  MY_URL_TINY_PESQUISA_CLIENTE: z.string().url(),
});

let validatedEnv;

// Validar as variáveis de ambiente com Zod
try {
  validatedEnv = envSchema.parse({
    MY_URL_TINY_OBTER_PEDIDO: Deno.env.get("MY_URL_TINY_OBTER_PEDIDO"),
    MY_TOKEN_API_TINY: Deno.env.get("MY_TOKEN_API_TINY"),
    MY_URL_TINY_PESQUISA_VENDEDOR: Deno.env.get(
      "MY_URL_TINY_PESQUISA_VENDEDOR",
    ),
    MY_URL_TINY_OBTER_PRODUTO: Deno.env.get("MY_URL_TINY_OBTER_PRODUTO"),
    MY_URL_GOOGLE_SHEET_PROXY: Deno.env.get("MY_URL_GOOGLE_SHEET_PROXY"),
    MY_SUPABASE_EMAIL: Deno.env.get("MY_SUPABASE_EMAIL"),
    MY_SUPABASE_PASSWORD: Deno.env.get("MY_SUPABASE_PASSWORD"),
    MY_SUPABASE_URL: Deno.env.get("MY_SUPABASE_URL"),
    MY_SUPABASE_KEY: Deno.env.get("MY_SUPABASE_KEY"),
    MY_URL_TINY_PESQUISA_CLIENTE: Deno.env.get("MY_URL_TINY_PESQUISA_CLIENTE"),
  });
} catch (error) {
  console.error("❌ Falha na validação das variáveis de ambiente:");

  if (error instanceof Error && "errors" in error) {
    // @ts-ignore
    console.error(error.errors);
  } else {
    console.error(error);
  }

  Deno.exit(1);
}

// Exportar as variáveis de ambiente validadas
const {
  MY_URL_TINY_OBTER_PEDIDO: urlObterPedido,
  MY_TOKEN_API_TINY: token,
  MY_URL_TINY_PESQUISA_VENDEDOR: urlPesquisaVendedores,
  MY_URL_TINY_OBTER_PRODUTO: urlObterProduto,
  MY_URL_GOOGLE_SHEET_PROXY: proxyUrl,
  MY_SUPABASE_EMAIL: supabaseEmail,
  MY_SUPABASE_PASSWORD: supabasePassword,
  MY_SUPABASE_URL: supabaseUrl,
  MY_SUPABASE_KEY: supabaseKey,
  MY_URL_TINY_PESQUISA_CLIENTE: urlPesquisaClientes,
} = validatedEnv;

export {
  proxyUrl,
  supabaseEmail,
  supabaseKey,
  supabasePassword,
  supabaseUrl,
  token,
  urlObterPedido,
  urlObterProduto,
  urlPesquisaClientes,
  urlPesquisaVendedores,
};
