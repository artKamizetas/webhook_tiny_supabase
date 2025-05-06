import { ResponseApiTinyObterPedido } from "../../types/response_api_tiny/pedido.ts";
import { ResponseApiTinyPesquisaVendedores, Vendedor} from "../../types/response_api_tiny/vendedor.ts";
import {
  token,
  urlObterPedido,
  urlObterProduto,
  urlPesquisaVendedores,
} from "../../env/index.ts";

class ApiTinyRequest {
  async APIobterPedido(id: number): Promise<ResponseApiTinyObterPedido> {
    const data = `token=${token}&id=${id}&formato=JSON`;

    try {
      const response = await fetch(urlObterPedido, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: data,
      });
      const responseJson: ResponseApiTinyObterPedido = await response.json();

      return responseJson;
    } catch (error) {
      console.error("Erro na APIobterPedido:", error);
      throw error;
    }
  }
  async APIpesquisaVendedor(id_tiny:string): Promise<Vendedor> {
    if (!urlPesquisaVendedores || !token) {
      throw new Error("URL e token sao necessarios para obter um vendedor");
    }

    const data = "token=" + token + "&pesquisa= " + id_tiny + "&formato=JSON";

    try {
      const response = await fetch(urlPesquisaVendedores, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: data,
      });

      console.log("response:  ", response)
      const responseJson: ResponseApiTinyPesquisaVendedores = await response
        .json();
      
      if(!responseJson.retorno.vendedores){
        throw new Error("Vendedor nao encontrado")
      }
      const vendedor = responseJson.retorno.vendedores[0].vendedor

      return vendedor;
    } catch (error) {
      console.error("Erro na APIpesquisaVendedor:", error);
      throw error;
    }
  }
  async APIobterProduto(
    id_tiny_produto: string,
  ): Promise<ResponseApiTinyObterPedido> {
    if (!urlObterProduto || !token) {
      throw new Error("URL e token sao necessarios para obter um produto");
    }

    var data = "token=" + token + "&id=" + id_tiny_produto + "&formato=JSON";

    try {
      const response = await fetch(urlObterProduto, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: data,
      });
      const responseJson: ResponseApiTinyObterPedido = await response.json();

      return responseJson;
    } catch (error) {
      console.error("Erro na APIObterProduto:", error);
      throw error;
    }
  }
}

export { ApiTinyRequest };
