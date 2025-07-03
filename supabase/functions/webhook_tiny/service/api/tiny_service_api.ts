import { ResponseApiTinyObterPedidoById } from "../../types/response_api_tiny/pedido.ts";
import {
  ResponseApiTinyPesquisaVendedores,
  Vendedor,
} from "../../types/response_api_tiny/vendedor.ts";
import {
  token,
  urlObterPedido,
  urlObterProduto,
  urlPesquisaClientes,
  urlPesquisaVendedores,
} from "../../env/index.ts";
import {
  ContatoApiTinyPesquisa,
  ResponseApiTinyPesquisaContato,
} from "../../types/response_api_tiny/cliente.ts";
import {
  ProdutoApiObterProdutoById,
  ResponseAPIObterProdutoById,
} from "../../types/response_api_tiny/produto.ts";
import { AppError } from "../../utils/appError.ts"; // ajuste o caminho conforme necessário

class ApiTinyRequest {
  async APIobterPedido(id: number): Promise<ResponseApiTinyObterPedidoById> {
    if (!urlObterPedido || !token) {
      throw new AppError("URL e token são necessários para obter um pedido", 500);
    }

    const data = `token=${token}&id=${id}&formato=JSON`;

    try {
      const response = await fetch(urlObterPedido, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: data,
      });

      const responseJson: ResponseApiTinyObterPedidoById = await response.json();

      return responseJson;
    } catch (error) {
      console.error("❌ Erro na APIobterPedido:", error);
      throw new AppError(`Erro ao obter pedido: ${error instanceof Error ? error.message : String(error)}`, 500);
    }
  }

  async APIpesquisaVendedor(name_vendedor: string): Promise<Vendedor> {
    if (!urlPesquisaVendedores || !token) {
      throw new AppError("URL e token são necessários para obter um vendedor", 500);
    }

    const data = `token=${token}&pesquisa=${name_vendedor}&formato=JSON`;

    try {
      const response = await fetch(urlPesquisaVendedores, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: data,
      });

      const responseJson: ResponseApiTinyPesquisaVendedores = await response.json();

      if (!responseJson.retorno.vendedores || responseJson.retorno.vendedores.length === 0) {
        throw new AppError("Vendedor não encontrado na API Tiny", 404);
      }

      return responseJson.retorno.vendedores[0].vendedor;
    } catch (error) {
      console.error("❌ Erro na APIpesquisaVendedor:", error);
      throw new AppError(`Erro ao pesquisar vendedor: ${error instanceof Error ? error.message : String(error)}`, 500);
    }
  }

  async APIobterProduto(id_tiny_produto: number): Promise<ProdutoApiObterProdutoById> {
    
    if (!urlObterProduto || !token) {
      throw new AppError("URL e token são necessários para obter um produto", 500);
    }
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    sleep(500);
    const data = `token=${token}&id=${id_tiny_produto}&formato=JSON`;

    try {
      const response = await fetch(urlObterProduto, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: data,
      });

      const responseJson: ResponseAPIObterProdutoById = await response.json();

      if (!responseJson.retorno.produto) {
        throw new AppError(
          `Produto não encontrado na API Tiny. Erros: ${JSON.stringify(responseJson.retorno.erros)}`,
          404,
        );
      }

      return responseJson.retorno.produto as ProdutoApiObterProdutoById;
    } catch (error) {
      console.error("❌ Erro na APIobterProduto:", error);
      throw new AppError(`Erro ao obter produto: ${error instanceof Error ? error.message : String(error)}`, 500);
    }
  }

  async APIpesquisaClient(codigo: string): Promise<ContatoApiTinyPesquisa> {
    if (!urlPesquisaClientes || !token) {
      throw new AppError("URL e token são necessários para obter um cliente", 500);
    }
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    sleep(500);
    const data = `token=${token}&pesquisa=${codigo}&formato=JSON`;

    try {
      const response = await fetch(urlPesquisaClientes, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: data,
      });

      const responseJson: ResponseApiTinyPesquisaContato = await response.json();

      if (!responseJson.retorno.contatos || responseJson.retorno.contatos.length === 0) {
         throw new AppError(
          `Cliente não encontrado na API Tiny. Erros: ${JSON.stringify(responseJson.retorno.erros)}`,
          404,
        );
      }

      return responseJson.retorno.contatos[0];
    } catch (error) {
      console.error("❌ Erro na APIpesquisaClient:", error);
      throw new AppError(`Erro ao pesquisar cliente: ${error instanceof Error ? error.message : String(error)}`, 500);
    }
  }
}

export { ApiTinyRequest };
