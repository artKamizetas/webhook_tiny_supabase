import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js";
import { ProdutoSupabase } from "../types/response_api_tiny/produto.ts";
import { SupabaseServiceApi } from "./api/supabase_service_api.ts";

class ProdutoService {
  private db: SupabaseServiceApi;
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
    this.db = new SupabaseServiceApi(supabase);
  }
  async select(id_produto_tiny: string): Promise<ProdutoSupabase[] | null> {
    try {
      const produto: ProdutoSupabase[] | null = await this.db.select(
        "produtos",
        "id_tiny",
        id_produto_tiny,
      );

      return produto;
    } catch (err) {
      console.error("Erro inesperado no select ProdutoControlle:", err);
      throw new Error(`Erro select ProdutoController: ${err.message}`);
    }
  }
}

export { ProdutoService };
