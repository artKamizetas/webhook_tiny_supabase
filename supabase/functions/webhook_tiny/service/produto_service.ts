import { ApiTinyRequest } from "./api/tiny_service_api.ts";
import { SupabaseServiceApi } from "./api/supabase_service_api.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.42.3?deno-compat";
import {
  RequestProdutoSupabase,
  ResponseProdutoSupabase,
} from "../types/supabase/produto.ts";
import { ProdutoApiObterProdutoById } from "../types/response_api_tiny/produto.ts";
import { separarCodigo, separarDescricao } from "../utils/index.ts";
import { AppError } from "../utils/appError.ts"; 

class ProdutoService {
  private db: SupabaseServiceApi;
  private apiTiny: ApiTinyRequest;

  constructor(supabase: SupabaseClient) {
    this.db = new SupabaseServiceApi(supabase);
    this.apiTiny = new ApiTinyRequest();
  }

  private parseData(d: string): Date | null {
    if (!d || d.trim() === "") return null;
    const [dia, mes, ano] = d.split("/");
    return new Date(Number(ano), Number(mes) - 1, Number(dia));
  }

  async fetchProdutoById(id_produto_tiny: number) {
    try {
      let produtoRecord = await this.select(id_produto_tiny);
      const produtoApi = await this.apiTiny.APIobterProduto(id_produto_tiny);

      if (produtoRecord) {
        console.log("Produto encontrado no banco");
        await this.update(produtoApi);
        return produtoRecord.id;
      }

      console.log("Produto não encontrado no banco");

      if (produtoApi) {
        await this.create(produtoApi);
        produtoRecord = await this.select(produtoApi.id);

        console.log("Produto consultado após inserção no banco:", produtoRecord);

        return produtoRecord?.id || null;
      }

      return null;
    } catch (error) {
      console.error("Erro ao buscar ou criar produto:", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao buscar ou criar produto", 500);
    }
  }

  async create(produto_tiny: ProdutoApiObterProdutoById) {
    try {
      const produtoRequest = this.formatProduto(produto_tiny);
      const produtoCreated = await this.db.insert("produtos", produtoRequest);
      return produtoCreated;
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      throw new AppError("Erro ao criar produto no banco de dados", 500);
    }
  }

  async select(id_produto_tiny: number) {
    try {
      const produtos: ResponseProdutoSupabase[] | null = await this.db.select(
        "produtos",
        { id_tiny: id_produto_tiny },
      );
      if (!produtos || produtos.length === 0) {
        console.log(`Produto com id_tiny ${id_produto_tiny} não encontrado.`);
        return null;
      }
      return produtos[0];
    } catch (error) {
      console.error("Erro ao buscar produto:", error);
      throw new AppError("Erro ao buscar produto no banco de dados", 500);
    }
  }

  async update(produto_tiny: ProdutoApiObterProdutoById) {
    try {
      const produtoRequest = this.formatProduto(produto_tiny);
      const produtoUpdated = await this.db.update("produtos", produtoRequest, {
        id_tiny: produto_tiny.id,
      });
      return produtoUpdated;
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      throw new AppError("Erro ao atualizar produto no banco de dados", 500);
    }
  }

  formatProduto(
    produto_tiny: ProdutoApiObterProdutoById,
  ): RequestProdutoSupabase {
    console.log("Formatando produto...");
    const data_criacao = this.parseData(produto_tiny.dataCriacao);
    const responseCod = separarCodigo(produto_tiny.codigo);
    const sku = typeof responseCod === "string"
      ? responseCod
      : responseCod.codigo;
    const descricaoFormated = separarDescricao(produto_tiny.nome);

    return {
      codigo: produto_tiny.codigo || null,
      cor: descricaoFormated?.cor || null,
      data_criacao: data_criacao,
      id_tiny: produto_tiny.id,
      nome: produto_tiny.nome || null,
      preco: Number(produto_tiny.preco),
      preco_custo: Number(produto_tiny.preco_custo) || null,
      sku: sku,
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
