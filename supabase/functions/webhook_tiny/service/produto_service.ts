import { ApiTinyRequest } from "./api/tiny_service_api.ts";
import { SupabaseServiceApi } from "./api/supabase_service_api.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.42.3?deno-compat";
import {
  RequestProdutoSupabase,
  ResponseProdutoSupabase,
} from "../types/supabase/produto.ts";
import { ProdutoApiObterProdutoById } from "../types/response_api_tiny/produto.ts";
import { separarDescricao } from "../utils/index.ts";

class ProdutoService {
  private db: SupabaseServiceApi;
  private apiTiny: ApiTinyRequest;

  constructor(supabase: SupabaseClient) {
    this.db = new SupabaseServiceApi(supabase);
    this.apiTiny = new ApiTinyRequest();
  }
  private parseData(d: string): Date|null {
    if(!d || d.trim() === "") {
      return null;
    }
    const [dia, mes, ano] = d.split("/");
    return new Date(Number(ano), Number(mes) - 1, Number(dia));
  }

  async fetchProdutoById(id_produto_tiny: number) {
    let produtoRecord = await this.select(id_produto_tiny);
    const produtoApi = await this.apiTiny.APIobterProduto(id_produto_tiny);

    if (produtoRecord) {
      console.log("Produto encontrado no banco");
      await this.update(produtoApi);
      return produtoRecord.id;
    }
    console.log("produto não encontrado no banco");

    if (produtoApi) {
      await this.create(produtoApi);

      produtoRecord = await this.select(produtoApi.id);
      console.log(
        "produto consultado após inserção no banco:",
        produtoRecord,
      );

      return produtoRecord?.id || null;
    }

    return null;
  }
  async create(produto_tiny: ProdutoApiObterProdutoById) {
    const produtoRequest = this.formatProduto(produto_tiny);
    const produtoCreated = await this.db.insert("produtos", produtoRequest);

    return produtoCreated;
  }

  async select(id_produto_tiny: number) {
    try {
      const produtos: ResponseProdutoSupabase[] | null = await this.db.select(
        "produtos",
        { id_tiny: id_produto_tiny },
      );
      if (!produtos || produtos.length === 0) {
        console.log(`Produtos com id_tiny ${id_produto_tiny} não encontrado.`);
        return null;
      }
      return produtos[0];
    } catch (err) {
      console.error("Erro inesperado:", err);
      if (err instanceof Error) {
        throw new Error(`Erro select produtoService: ${err.message}`);
      } else {
        throw new Error(`Erro select produtoService: ${String(err)}`);
      }
    }
  }
  async update(produto_tiny: ProdutoApiObterProdutoById) {
    const produtoRequest = this.formatProduto(produto_tiny);
    const produtoUpdated = await this.db.update("produtos", produtoRequest, {
      id_tiny: produto_tiny.id,
    });

    return produtoUpdated;
  }

  formatProduto(
    produto_tiny: ProdutoApiObterProdutoById,
  ): RequestProdutoSupabase {
    
    const data_criacao = this.parseData(produto_tiny.dataCriacao);
    
    const descricaoFormated = separarDescricao(produto_tiny.nome);

    return {
      codigo: produto_tiny.codigo || null,
      cor: descricaoFormated?.tamanho || null,
      data_criacao: data_criacao,
      id_tiny: produto_tiny.id,
      nome: produto_tiny.nome || null,
      preco: Number(produto_tiny.preco),
      preco_custo: Number(produto_tiny.preco_custo) || null,
      sku: produto_tiny.codigo || null,
      situacao: produto_tiny.situacao || null,
      tamanho: descricaoFormated?.tamanho || null,
      unidade: produto_tiny.unidade || null,
      tipo_variacao: produto_tiny.tipoVariacao || null,
      tempo_base_producao: null,
      updated_at: new Date(),
    };
  }
}

export { ProdutoService };
