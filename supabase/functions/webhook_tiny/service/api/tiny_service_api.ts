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
import { ContatoApiTinyPesquisa, ResponseApiTinyObterContato, ResponseApiTinyPesquisaContato } from "../../types/response_api_tiny/cliente.ts";
import {ProdutoApiObterProdutoById, ResponseAPIObterProdutoById} from "../../types/response_api_tiny/produto.ts";

class ApiTinyRequest {
  
  async APIobterPedido(id: number): Promise<ResponseApiTinyObterPedidoById> {
    const data = `token=${token}&id=${id}&formato=JSON`;

    try {
      const response = await fetch(urlObterPedido, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: data,
      });
      const responseJson: ResponseApiTinyObterPedidoById = await response
        .json();

      return responseJson;
    } catch (error) {
      console.error("Erro na APIobterPedido:", error);
      throw error;
    }
  }
  async APIpesquisaVendedor(name_vendedor: string): Promise<Vendedor> {
    if (!urlPesquisaVendedores || !token) {
      throw new Error("URL e token sao necessarios para obter um vendedor");
    }

    const data = `token=${token}&pesquisa=${name_vendedor}&formato=JSON`;
    try {
      const response = await fetch(urlPesquisaVendedores, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: data,
      });

      const responseJson: ResponseApiTinyPesquisaVendedores = await response
        .json();
      
      if (!responseJson.retorno.vendedores) {
        throw new Error("Vendedor nao encontrado na API Tiny");
      }
      const vendedor = responseJson.retorno.vendedores[0].vendedor;

      return vendedor;
    } catch (error) {
      console.error("Erro na APIpesquisaVendedor:", error);
      throw error;
    }
  }
  async APIobterProduto(
    id_tiny_produto: number,
  ): Promise<ProdutoApiObterProdutoById> {
    if (!urlObterProduto || !token) {
      throw new Error("URL e token sao necessarios para obter um produto");
    }

    const data = `token=${token}&id=${id_tiny_produto}&formato=JSON`;

    try {
      const response = await fetch(urlObterProduto, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: data,
      });
      const responseJson: ResponseAPIObterProdutoById = await response.json();
      if (!responseJson.retorno.produto) {
        throw new Error("Produto não encontrado na API Tiny");
      }
      return responseJson.retorno.produto as ProdutoApiObterProdutoById;
    } catch (error) {
      console.error("Erro na APIObterProduto:", error);
      throw error;
    }
  }
  async APIpesquisaClient(codigo: string): Promise<ContatoApiTinyPesquisa> {
    if (!urlPesquisaClientes || !token) {
      throw new Error("URL e token sao necessarios para obter um vendedor");
    }
    const data = `token=${token}&pesquisa=${codigo}&formato=JSON`;

    try {
      const response = await fetch(urlPesquisaClientes, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: data,
      });

      const responseJson: ResponseApiTinyPesquisaContato = await response
        .json();

      if (!responseJson.retorno.contatos) {
        throw new Error("Contato nao encontrado na API Tiny");
      }
      const contato = responseJson.retorno.contatos[0];

      return contato;
    } catch (error) {
      console.error("Erro na APIpesquisaVendedor:", error);
      throw error;
    }
  }
}

export { ApiTinyRequest };
