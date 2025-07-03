// src/utils/pedido_formatter.ts
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.42.3?deno-compat";
import { PedidoApiTinyObterPedidoById } from "../types/response_api_tiny/pedido.ts";
import {
  RequestPedidoSupabase,
  ResponsePedidoSupabase,
} from "../types/supabase/pedido.ts";
import { RequestItemSupabase } from "../types/supabase/item.ts";
import { RequestLogPedidosSupabase } from "../types/supabase/log.ts";
import { ProdutoService } from "../service/produto_service.ts";
import { VendedorService } from "../service/vendedor_service.ts";
import { ClientService } from "../service/cliente_service.ts";
import { extrairOC } from "./index.ts";
import { ItemERPComIdItem } from "../service/item_service.ts";

export class PedidoFormatter {
  private produtoService: ProdutoService;
  private vendedorService: VendedorService;
  private clientService: ClientService;

  constructor(supabase: SupabaseClient) {
    this.produtoService = new ProdutoService(supabase);
    this.vendedorService = new VendedorService(supabase);
    this.clientService = new ClientService(supabase);
  }

  private parseData(d: string): Date {
    const [dia, mes, ano] = d.split("/");
    return new Date(Number(ano), Number(mes) - 1, Number(dia));
  }

  private async getCommonPedidoData(
    pedido: PedidoApiTinyObterPedidoById["pedido"],
  ) {
    const data = this.parseData(pedido.data_pedido);
    const previsto = this.parseData(pedido.data_prevista);

    const id_vendedor = await this.vendedorService.fetchVendedorPorId(
      pedido.id_vendedor,
      pedido.nome_vendedor,
    );
    const id_cliente = await this.clientService.fetchClientPorCodigo(
      pedido.cliente.codigo,
    );

    const quantidadeTotal = pedido.itens
      .map((item) => Number(item.item.quantidade))
      .reduce((a, b) => a + b, 0);

    const marcadores = pedido.marcadores.map((m) => m.marcador.descricao);

    return {
      id_vendedor,
      id_cliente,
      data,
      previsto,
      quantidadeTotal,
      marcadores,
    };
  }

  async formatPedido(
    pedido: PedidoApiTinyObterPedidoById["pedido"],
  ): Promise<RequestPedidoSupabase> {
    const {
      id_vendedor,
      id_cliente,
      data,
      previsto,
      quantidadeTotal,
      marcadores,
    } = await this.getCommonPedidoData(pedido);
    const oc = extrairOC(pedido.obs);
    return {
      id_tiny: Number(pedido.id),
      numero: Number(pedido.numero),
      id_vendedor,
      id_vendedor_tiny: Number(pedido.id_vendedor),
      data,
      previsto,
      valor: Number(pedido.total_pedido),
      situacao: pedido.situacao,
      quantidade: quantidadeTotal,
      marcadores,
      observacoes: pedido.obs,
      codigo_cliente: Number(pedido.cliente.codigo),
      nome_fantasia: pedido.cliente.nome_fantasia || null,
      nome_cliente: pedido.cliente.nome,
      updated_at: new Date(),
      forma_envio: pedido.forma_envio || null,
      forma_frete: pedido.forma_frete || null,
      frete_por_conta: pedido.frete_por_conta || null,
      valor_frete: pedido.valor_frete || null,
      observacoes_fabrica: pedido.obs || null,
      oc: oc,
      prorrogavel: null,
      programado: null,
      trigger_movimento: null,
      id_cliente,
    };
  }

  async formatLogPedido(
    pedido: PedidoApiTinyObterPedidoById["pedido"],
  ): Promise<RequestLogPedidosSupabase> {
    const {
      id_vendedor,
      id_cliente,
      data,
      previsto,
      quantidadeTotal,
      marcadores,
    } = await this.getCommonPedidoData(pedido);
    const oc = extrairOC(pedido.obs);
    return {
      id_tiny: Number(pedido.id),
      numero: Number(pedido.numero),
      id_vendedor,
      id_vendedor_tiny: Number(pedido.id_vendedor),
      data,
      previsto,
      valor: Number(pedido.total_pedido),
      situacao: pedido.situacao,
      quantidade: quantidadeTotal,
      marcadores,
      observacoes: pedido.obs,
      codigo_cliente: Number(pedido.cliente.codigo),
      nome_fantasia: pedido.cliente.nome_fantasia || null,
      nome_cliente: pedido.cliente.nome,
      forma_envio: pedido.forma_envio || null,
      forma_frete: pedido.forma_frete || null,
      frete_por_conta: pedido.frete_por_conta || null,
      valor_frete: pedido.valor_frete || null,
      observacoes_fabrica: pedido.obs || null,
      oc: oc,
      prorrogavel: null,
      programado: null,
      trigger_movimento: null,
      id_cliente,
    };
  }

  async formatItem(
    item: ItemERPComIdItem,
    pedidoSupabase: ResponsePedidoSupabase,
  ): Promise<RequestItemSupabase> {
    if (!pedidoSupabase.id) {
      throw new Error("Pedido Supabase selecionado nao possui ID");
    }

    const id_produto = await this.produtoService.fetchProdutoById(
      Number(item.id_produto),
    );

    const itemformatado = {
      id_pedido_tiny: pedidoSupabase.id_tiny,
      quantidade: Number(item.quantidade),
      valor: Number(item.valor_unitario),
      id_produto_tiny: Number(item.id_produto),
      layout: item.info_adicional || null,
      updated_at: new Date(),
      id_pedido: pedidoSupabase.id,
      id_produto: id_produto || null,
      ...(item.id !== undefined ? { id: item.id } : {}),
    };

    return itemformatado;
  }
}
