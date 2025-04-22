import { ProdutoController } from "../controllers/produtoController.ts";
import { ProdutoSupabase } from "../types/response_api_tiny/produto.ts";

const produtoController = new ProdutoController();

class ProdutoService {

  async select(id_produto_tiny: number): Promise<ProdutoSupabase[]| null> {
    try{
      const produto = await produtoController.select(id_produto_tiny);
      
      if(!produto) {
        console.log("Produto não encontrado:", id_produto_tiny);
      }
      
      return produto
    } catch (err) {
      console.error("Erro ao selecionar o produto:", err);
      throw new Error("Erro ao selecionar o produto");
    }
    }
}

export { ProdutoService };
