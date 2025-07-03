import {
  PedidoApiTinyObterPedidoById,
} from "../types/response_api_tiny/pedido.ts";
import { SupabaseServiceApi } from "./api/supabase_service_api.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.42.3?deno-compat";
import { PedidoFormatter } from "../utils/formater.ts";
import { ResponsePedidoSupabase } from "../types/supabase/pedido.ts";
import { AppError } from "../utils/appError.ts";
import {
  RequestItemSupabase,
  ResponseItemSupabase,
} from "../types/supabase/item.ts";
import { separarRepetidosUnicos } from "../utils/index.ts";
import { Item } from "../types/response_api_tiny/item.ts";
import { processarItensDoPedido } from "../utils/itemProcess.ts";

export interface ItemERPComIdItem extends Item {
  id?: string;
}

class ItemService {
  private db: SupabaseServiceApi;
  private pedidoFormatter: PedidoFormatter;

  constructor(supabase: SupabaseClient) {
    this.db = new SupabaseServiceApi(supabase);
    this.pedidoFormatter = new PedidoFormatter(supabase);
  }

  async update(
    pedido: PedidoApiTinyObterPedidoById["pedido"],
    pedidoSupabase: ResponsePedidoSupabase,
  ) {
    try {
      const idPedidoTiny = pedido.id;
      const itensERP = pedido.itens;

      const itensNoBanco: ResponseItemSupabase[] | null = await this.db.select(
        "itens",
        {
          id_pedido_tiny: idPedidoTiny,
        },
      );

      // Caso não existam itens no banco, criamos todos diretamente
      if (!itensNoBanco) {
        console.warn(
          `Nenhum item no banco para o pedido Tiny ID: ${idPedidoTiny}`,
        );
        await this.create(pedido);
        console.log(`Itens do pedido ${pedido.numero} criados com sucesso.`);
        return;
      }

      const {
        itensParaAtualizar,
        itensParaCriar,
        itensParaDeletar,
      } = processarItensDoPedido(itensERP, itensNoBanco);

      // === 5. Logs finais ===
      console.log("🟢 Quantidade de Itens para atualizar:", itensParaAtualizar.length);
      console.log("🆕 Quantidade de Itens para criar:", itensParaCriar.length);
      console.log("❌ Quantidade de Itens para deletar:", itensParaDeletar.length);
      //acrescentando no banco
      let itensParaCriarFormatados: RequestItemSupabase[] = [];
      for (const item of itensParaCriar) {
        const itemFormatado = await this.pedidoFormatter.formatItem(
          item,
          pedidoSupabase,
        );
       
        itensParaCriarFormatados.push(itemFormatado);
      }
      await this.db.insert("itens", itensParaCriarFormatados);

      //atualizando no banco
      let itensParaAtualizarFormatados: RequestItemSupabase[] = [];
      for (const item of itensParaAtualizar) {
        const itemFormatado = await this.pedidoFormatter.formatItem(
          item,
          pedidoSupabase,
        );
        itensParaAtualizarFormatados.push(itemFormatado);
        await this.db.update("itens", itemFormatado, { id: itemFormatado.id });
      }

      //deletando no banco
      for (const item of itensParaDeletar) {
        if (item.id) {
          await this.db.delete("itens", "id", item.id);
          console.log(`Item ${item.id} deletado com sucesso.`);
        }
      }

      // === 6. Atualiza os itens ===
      // await this.db.update("itens", itensParaAtualizar, { id: "id" });
      //await this.db.insert("itens", itensParaCriar);
      //await this.db.delete("itens", itensParaDeletar);
    } catch (error) {
      console.error("❌ Erro ao atualizar itens:", error);
      if (error instanceof Error) {
        throw new AppError(`Erro ao atualizar itens: ${error.message}`, 500);
      }
      throw new AppError("Erro desconhecido ao atualizar itens", 500);
    }

    console.log("✅ Itens atualizados para pedido número:", pedido.numero);
  }

  async create(pedido_tiny: PedidoApiTinyObterPedidoById["pedido"]) {
    const pedidoSupabase: ResponsePedidoSupabase[] | null = await this.db
      .select("pedidos", { id_tiny: pedido_tiny.id });

    if (!pedidoSupabase) {
      throw new AppError(
        `Erro ao consultar pedido com ID Tiny: ${pedido_tiny.id}`,
        500,
      );
    }

    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const itemDataArray = [];

    for (const item of pedido_tiny.itens) {
      const data = await this.pedidoFormatter.formatItem(
        item.item,
        pedidoSupabase[0],
      );
      itemDataArray.push(data);
      await sleep(1000); // Espera 1 segundo entre cada requisição
    }

    console.log("📝 Dados formatados para inserção em itens");
    try {
      await this.db.insert("itens", itemDataArray);
      console.log(
        "🆕 Novos itens inseridos para pedido número:",
        pedido_tiny.numero,
      );
    } catch (error) {
      console.error("❌ Erro ao inserir em itens:", error);
      if (error instanceof Error) {
        throw new AppError(`Erro ao inserir itens: ${error.message}`, 500);
      }
      throw new AppError(
        "Erro desconhecido ao inserir itens. Pedido não foi finalizado.",
        500,
      );
    }
  }
}

export { ItemService };
