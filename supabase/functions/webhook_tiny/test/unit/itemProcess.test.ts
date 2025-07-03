import {
  assertEquals,
  assertStrictEquals,
} from "https://deno.land/std@0.224.0/testing/asserts.ts";

import { processarItensDoPedido } from "../../utils/itemProcess.ts";
import {
  ResponseItemSupabase,
} from "../../types/supabase/item.ts";
import { ItemERPComIdItem } from "../../service/item_service.ts";
import { assert } from "https://deno.land/std@0.224.0/assert/assert.ts";

Deno.test("Validaçao para itens com id_produto diferentes. Caso 1- atualiza 1, cria 1 e deleta 1", () => {
  const itensERP: { item: ItemERPComIdItem }[] = [
    {
      item: {
        id_produto: "101",
        codigo: "P001",
        descricao: "Produto 1",
        unidade: "un",
        quantidade: 2,
        valor_unitario: 50,
        info_adicional: "Nenhuma",
      },
    },
    {
      item: {
        id_produto: "102",
        codigo: "P002",
        descricao: "Produto 2",
        unidade: "un",
        quantidade: 1,
        valor_unitario: 100,
        info_adicional: "Nenhuma",
      },
    },
  ];

  const itensBanco: ResponseItemSupabase[] = [
    {
      id: "item-1",
      id_pedido_tiny: 999,
      quantidade: 2,
      valor: 50,
      layout: null,
      id_produto_tiny: 101,
      id_pedido: "pedido-uuid",
      updated_at: new Date(),
      id_produto: "101",
    },
    {
      id: "item-3",
      id_pedido_tiny: 999,
      quantidade: 1,
      valor: 150,
      layout: null,
      id_produto_tiny: 103,
      id_pedido: "pedido-uuid",
      updated_at: new Date(),
      id_produto: "103",
    },
  ];

  const resultado = processarItensDoPedido(itensERP, itensBanco);
  console.log("Resultado:", JSON.stringify(resultado, null, 2));

  // Esperado:
  // - Produto 101 → existe no ERP e banco → atualização
  // - Produto 102 → só no ERP → criação
  // - Produto 103 → só no banco → deleção

  assertEquals(resultado.itensParaAtualizar.length, 1);
  assertEquals(resultado.itensParaCriar.length, 1);
  assertEquals(resultado.itensParaDeletar.length, 1);

  assertStrictEquals(resultado.itensParaAtualizar[0].id, "item-1");
  assertStrictEquals(resultado.itensParaCriar[0].id_produto, "102");
  assertStrictEquals(resultado.itensParaDeletar[0].id, "item-3");

  console.log("✅ Teste passou com sucesso.");
});


Deno.test("Validaçao para itens com id_produto iguais, usando info_adicional para diferenciar. Caso 2- atualiza 1, cria 1 e deleta 1", () => {
  const itensERP = [
    {
      item: {
        id_produto: "201",
        codigo: "PRD-A",
        descricao: "Camisa",
        unidade: "un",
        quantidade: 1,
        valor_unitario: 50,
        info_adicional: "01", // deve casar com layout "01"
      },
    },
    {
      item: {
        id_produto: "201",
        codigo: "PRD-A",
        descricao: "Camisa",
        unidade: "un",
        quantidade: 1,
        valor_unitario: 50,
        info_adicional: "02", // não tem equivalente no banco → deve criar
      },
    },
  ];

  const itensBanco: ResponseItemSupabase[] = [
    {
      id: "abc-1",
      id_pedido_tiny: 123,
      quantidade: 1,
      valor: 50,
      layout: "01", // deve casar com info_adicional acima
      id_produto_tiny: 201,
      id_pedido: "pedido-xyz",
      updated_at: new Date(),
      id_produto: "201",
    },
    {
      id: "abc-2",
      id_pedido_tiny: 123,
      quantidade: 1,
      valor: 50,
      layout: "03", // não casa com nenhum info_adicional → deve deletar
      id_produto_tiny: 201,
      id_pedido: "pedido-xyz",
      updated_at: new Date(),
      id_produto: "201",
    },
  ];

  const resultado = processarItensDoPedido(itensERP, itensBanco);
  console.log("Resultado:", JSON.stringify(resultado, null, 2));

  // Esperado:
  // - Atualizar: item com "frente pequena"
  // - Criar: item com "costas grande"
  // - Deletar: item com layout "gola polo"

  assertEquals(resultado.itensParaAtualizar.length, 1);
  assertStrictEquals(resultado.itensParaAtualizar[0].id, "abc-1");
  assertStrictEquals(resultado.itensParaAtualizar[0].info_adicional, "01");

  assertEquals(resultado.itensParaCriar.length, 1);
  assertStrictEquals(resultado.itensParaCriar[0].info_adicional, "02");

  assertEquals(resultado.itensParaDeletar.length, 1);
  assertStrictEquals(resultado.itensParaDeletar[0].id, "abc-2");
});

Deno.test("Validaçao para um item enviado do ERP com layout 01 e no banco  2 itens com mesmo id_produto e layout no banco. Caso 3 - atualiza 1 e deleta 1", () => {
  const itensERP = [
    {
      item: {
        id_produto: "200",
        codigo: "REP-01",
        descricao: "Repetido",
        unidade: "un",
        quantidade: 1,
        valor_unitario: 99.9,
        info_adicional: "01",
      },
    },
  ];

  const itensBanco: ResponseItemSupabase[] = [
    {
      id: "banco-1",// a ideia é manter um desses id do banco e deletar o outro
      id_pedido_tiny: 1,
      quantidade: 1,
      valor: 99.9,
      layout: null,
      id_produto_tiny: 200,
      id_pedido: "pedido-1",
      updated_at: new Date(),
      id_produto: "200",
    },
    {
      id: "banco-2",
      id_pedido_tiny: 1,
      quantidade: 1,
      valor: 99.9,
      layout: '02',
      id_produto_tiny: 200,
      id_pedido: "pedido-1",
      updated_at: new Date(),
      id_produto: "200",
    },
  ];

  const resultado = processarItensDoPedido(itensERP, itensBanco);
  console.log("Resultado:", JSON.stringify(resultado, null, 2));
  assertEquals(resultado.itensParaAtualizar.length, 1);
  assertEquals(resultado.itensParaCriar.length, 0);
  assertEquals(resultado.itensParaDeletar.length, 1);

  // Confirma que o id de deletar é diferente do que foi atualizado
  const idAtualizado = resultado.itensParaAtualizar[0].id;
  const idDeletado = resultado.itensParaDeletar[0].id;
  assert(idAtualizado !== idDeletado);

  console.log("✅ Atualizou um item com layout null e deletou o outro corretamente.");
});

Deno.test("Validaçao para um item enviado do ERP com layout e 2 itens com mesmo id_produto e layout no banco. Caso 4 - atualiza 1 e deleta 1", () => {
  const itensERP = [
    {
      item: {
        id_produto: "200",
        codigo: "REP-01",
        descricao: "Repetido",
        unidade: "un",
        quantidade: 1,
        valor_unitario: 99.9,
        info_adicional: "01",
      },
    },
  ];

  const itensBanco: ResponseItemSupabase[] = [
    {
      id: "banco-1",
      id_pedido_tiny: 1,
      quantidade: 1,
      valor: 99.9,
      layout: "01",
      id_produto_tiny: 200,
      id_pedido: "pedido-1",
      updated_at: new Date(),
      id_produto: "200",
    },
    {
      id: "banco-2",
      id_pedido_tiny: 1,
      quantidade: 1,
      valor: 99.9,
      layout: null,
      id_produto_tiny: 200,
      id_pedido: "pedido-1",
      updated_at: new Date(),
      id_produto: "200",
    },
  ];

  const resultado = processarItensDoPedido(itensERP, itensBanco);
  console.log("Resultado:", JSON.stringify(resultado, null, 2));
  assertEquals(resultado.itensParaAtualizar.length, 1);
  assertEquals(resultado.itensParaCriar.length, 0);
  assertEquals(resultado.itensParaDeletar.length, 1);

  // Confirma que o id de deletar é diferente do que foi atualizado
  const idAtualizado = resultado.itensParaAtualizar[0].id;
  const idDeletado = resultado.itensParaDeletar[0].id;
  assert(idAtualizado !== idDeletado);

  console.log("✅ Atualizou um item com layout null e deletou o outro corretamente.");
});


Deno.test("Validaçao para itens repetidos no banco incluindo layouts iguais. Caso 4 - atualiza 1 e deleta 1", () => {
  const itensERP = [
    {
      item: {
        id_produto: "200",
        codigo: "REP-01",
        descricao: "Repetido",
        unidade: "un",
        quantidade: 1,
        valor_unitario: 99.9,
        info_adicional: "01",
      },
    },
  ];

  const itensBanco: ResponseItemSupabase[] = [
    {
      id: "banco-1",
      id_pedido_tiny: 1,
      quantidade: 1,
      valor: 99.9,
      layout: "01",
      id_produto_tiny: 200,
      id_pedido: "pedido-1",
      updated_at: new Date(),
      id_produto: "200",
    },
    {
      id: "banco-2",
      id_pedido_tiny: 1,
      quantidade: 1,
      valor: 99.9,
      layout: "01",
      id_produto_tiny: 200,
      id_pedido: "pedido-1",
      updated_at: new Date(),
      id_produto: "200",
    },
  ];

  const resultado = processarItensDoPedido(itensERP, itensBanco);
  console.log("Resultado:", JSON.stringify(resultado, null, 2));
  assertEquals(resultado.itensParaAtualizar.length, 1);
  assertEquals(resultado.itensParaCriar.length, 0);
  assertEquals(resultado.itensParaDeletar.length, 1);

  // Confirma que o id de deletar é diferente do que foi atualizado
  const idAtualizado = resultado.itensParaAtualizar[0].id;
  const idDeletado = resultado.itensParaDeletar[0].id;
  assert(idAtualizado !== idDeletado);

  console.log("✅ Atualizou um item com layout null e deletou o outro corretamente.");
});

Deno.test("itens do ERP com ids de produtos diferentes em mudança de layout", () => {
  const itensERP = [
    {
      item: {
        id_produto: "201",
        codigo: "REP-01",
        descricao: "Repetido",
        unidade: "un",
        quantidade: 2,
        valor_unitario: 99.9,
        info_adicional: "01",
      },  
    },
    {
      item: {
        id_produto: "200",
        codigo: "REP-01",
        descricao: "Repetido",
        unidade: "un",
        quantidade: 5,
        valor_unitario: 0.00,
        info_adicional: "02",
      },
    },
  ];

  const itensBanco: ResponseItemSupabase[] = [
    {
      id: "banco-1",
      id_pedido_tiny: 1,
      quantidade: 5,
      valor: 99.9,
      layout: "02",
      id_produto_tiny: 201,
      id_pedido: "pedido-1",
      updated_at: new Date(),
      id_produto: "200",
    },
    {
      id: "banco-2",
      id_pedido_tiny: 1,
      quantidade: 2,
      valor: 99.9,
      layout: null,
      id_produto_tiny: 200,
      id_pedido: "pedido-1",
      updated_at: new Date(),
      id_produto: "200",
    },
  ];

  const resultado = processarItensDoPedido(itensERP, itensBanco);
  console.log("Resultado:", JSON.stringify(resultado, null, 2));

  assertEquals(resultado.itensParaAtualizar.length, 2);
  assertEquals(resultado.itensParaCriar.length, 0);
  assertEquals(resultado.itensParaDeletar.length, 0);

  assertStrictEquals(resultado.itensParaAtualizar[0].id, "banco-1");
  assertStrictEquals(resultado.itensParaAtualizar[0].info_adicional, "01");
  assertStrictEquals(resultado.itensParaAtualizar[1].id, "banco-2");
  assertStrictEquals(resultado.itensParaAtualizar[1].info_adicional, "02");


  console.log("✅ Atualizou um item com layout null e deletou o outro corretamente.");
});

