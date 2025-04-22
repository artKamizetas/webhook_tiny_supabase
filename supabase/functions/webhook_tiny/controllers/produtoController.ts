import { Produto, ResponseAPIObterProduto, ProdutoSupabase } from "../types/response_api_tiny/produto.ts";
//import { ItensController } from "./itensController.ts";
import { SupabaseServiceApi } from "../service/api/supabase_service_api.ts";


const supabase = new SupabaseServiceApi();


class ProdutoController {
  async select(id_produto_tiny: number): Promise<ProdutoSupabase[]| null> {
    try {
      const produto: ProdutoSupabase[]| null = await supabase.select('pedidos', "id_tiny", id_produto_tiny);
    
     return produto
    } catch (err) {
      console.error("Erro inesperado no select ProdutoControlle:", err);
      throw new Error(`Erro select ProdutoController: ${err.message}`);
    }
  }
}

export { ProdutoController };
