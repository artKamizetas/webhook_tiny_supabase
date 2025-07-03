import { ItemERPComIdItem } from "../service/item_service.ts";
import {
  RequestItemSupabase,
  ResponseItemSupabase,
} from "../types/supabase/item.ts";

interface ItemWrapperWithId {
  item: ItemERPComIdItem;
}

export function processarItensDoPedido(
  itensERP: ItemWrapperWithId[],
  itensBanco: ResponseItemSupabase[],
): {
  itensParaAtualizar: ItemERPComIdItem[];
  itensParaCriar: ItemERPComIdItem[];
  itensParaDeletar: RequestItemSupabase[];
} {
  const itensERPGroup = new Map<number, ItemERPComIdItem[]>();
  const itensBancoGroup = new Map<number, ResponseItemSupabase[]>();

  for (const wrapper of itensERP) {
    const item = wrapper.item;
    const id_produto = Number(item.id_produto);
    if (!itensERPGroup.has(id_produto)) itensERPGroup.set(id_produto, []);
    itensERPGroup.get(id_produto)!.push(item);
  }

  for (const item of itensBanco) {
    const id_produto = item.id_produto_tiny;
    if (!itensBancoGroup.has(id_produto)) itensBancoGroup.set(id_produto, []);
    itensBancoGroup.get(id_produto)!.push(item);
  }

  const itensParaAtualizar: ItemERPComIdItem[] = [];
  const itensParaCriar: ItemERPComIdItem[] = [];
  const itensParaDeletar: RequestItemSupabase[] = [];

  const todosIds = new Set([
    ...itensERPGroup.keys(),
    ...itensBancoGroup.keys(),
  ]);
  //console.log("Todos IDs de produtos:", todosIds);

  for (const id_produto of todosIds) {
    const erpList = [...(itensERPGroup.get(id_produto) || [])];
    const bancoList = [...(itensBancoGroup.get(id_produto) || [])];

    const usadosBanco = new Set<string>();
    const usadosERP = new Set<number>();

    const usarComparacaoPorLayout = erpList.length > 1 || bancoList.length > 1;

    // Tenta casar por layout apenas se necessário
    for (let i = 0; i < erpList.length; i++) {
      const itemERP = erpList[i];

      const indexBanco = bancoList.findIndex(
        (itemBanco) =>
          !usadosBanco.has(itemBanco.id) &&
          (
            // Se não é necessário comparar por layout, casa com qualquer item
            !usarComparacaoPorLayout ||
            (
              // Se for necessário, pode casar se layout bater com info_adicional
              (itemBanco.layout != null &&
                itemERP.info_adicional?.trim() === itemBanco.layout.trim()) ||
              // ou, se layout for null, ainda pode casar com o primeiro disponível
              itemBanco.layout == null
            )
          ),
      );

      if (indexBanco !== -1) {
        const itemBanco = bancoList[indexBanco];
        itensParaAtualizar.push({ ...itemERP, id: itemBanco.id });
        usadosBanco.add(itemBanco.id);
        usadosERP.add(i);
      }
    }

    // Itens do banco que sobraram
    for (let i = 0; i < bancoList.length; i++) {
      const itemBanco = bancoList[i];
      if (!usadosBanco.has(itemBanco.id)) {
        itensParaDeletar.push(itemBanco);
      }
    }

    // Itens do ERP que sobraram
    for (let i = 0; i < erpList.length; i++) {
      if (!usadosERP.has(i)) {
        itensParaCriar.push(erpList[i]);
      }
    }
  }

  return {
    itensParaAtualizar,
    itensParaCriar,
    itensParaDeletar,
  };
}
