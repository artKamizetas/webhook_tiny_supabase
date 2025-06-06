import {
  assertEquals,
  assertExists,
} from "https://deno.land/std@0.131.0/testing/asserts.ts";
import {
  assertSpyCalls,
  spy,
  stub,
} from "https://deno.land/std@0.203.0/testing/mock.ts";
import { WebhookHandler } from "../../webhook-handler.ts";
import { PedidoService } from "../../service/pedido_service.ts";
import { ItemService } from "../../service/item_service.ts";
import WebhookPayload from "../../types/webhook_payload.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js";

import {
  cleanupTestEnvironment,
  setupTestEnvironment,
} from "../setup/test-setup.ts";
import * as authModule from "../../middleware/auth.ts";

// Configuração do ambiente de teste
const setupTest = async () => {
  console.log("Configurando ambiente de teste...");
  await setupTestEnvironment();
};

// Limpeza do ambiente de teste
const cleanupTest = () => {
  cleanupTestEnvironment();
};
// Mock dos módulos externos
const mockSupabaseClient = {
  auth: {
    signInWithPassword: () => Promise.resolve({ data: {}, error: null }),
  },
  from: () => ({
    select: () => ({
      eq: () => Promise.resolve({ data: [], error: null }),
    }),
    insert: () => Promise.resolve({ data: {}, error: null }),
    update: () => Promise.resolve({ data: {}, error: null }),
  }),
} as unknown as SupabaseClient<any, "public", any>;

// Mock do payload de webhook
const mockWebhookPayload: WebhookPayload = {
  dados: {
    id: 12345,
    numero: "1001",
    data: "2025-04-24",
    idPedidoEcommerce: "EC-1001",
    codigoSituacao: "10",
    descricaoSituacao: "Aprovado",
    idContato: "C-1001",
    idNotaFiscal: "NF-1001",
    nomeEcommerce: "Loja Virtual",
    cliente: {
      nome: "Cliente Teste",
      cpfCnpj: "12345678901",
    },
    formaEnvio: {
      id: "1",
      descricao: "Sedex",
    },
  },
};

// Mock do pedido retornado pela API
const mockPedido = {
  id: 12345,
  numero: "1001",
  data_pedido: new Date("2025-04-24"),
  data_prevista: new Date("2025-04-30"),
  situacao: "Aprovado",
  cliente: {
    nome: "Cliente Teste",
    cpf_cnpj: "12345678901",
  },
  itens: [
    {
      id: 1,
      descricao: "Produto Teste",
      quantidade: 2,
      valor_unitario: 100.0,
    },
  ],
};

// Subclasse para testes que sobrescreve authenticateUser
class TestableWebhookHandler extends WebhookHandler {
  async authenticateUser() {
    return { supabase: mockSupabaseClient };
  }
}

Deno.test({
  name: "WebhookHandler - Inicialização",
  async fn() {
    console.log("Testando WebhookHandler - Inicialização...");
    await setupTest();
    try {
      const handler = new TestableWebhookHandler();
      await handler.initialize();
      assertExists((handler as any).supabase, "supabase deve ser inicializado");
      assertExists(
        (handler as any).pedidoService,
        "pedidoService deve ser inicializado",
      );
      assertExists(
        (handler as any).itemService,
        "itemService deve ser inicializado",
      );
    } finally {
      cleanupTest();
    }
  },
});

Deno.test({
  name: "WebhookHandler - Execução com pedido existente",
  async fn() {
    await setupTest();
    try {
      const handler = new TestableWebhookHandler();
      await handler.initialize();
      const pedidoServiceMock = {
        obterPedidoById: spy(() => Promise.resolve(mockPedido)),
        select: spy(() => Promise.resolve([{ id: "uuid-1", id_tiny: 12345 }])),
        update: spy(() => Promise.resolve("1001")),
      };
      const itemServiceMock = {
        update: spy(() => Promise.resolve()),
      };
      (handler as any).pedidoService = pedidoServiceMock;
      (handler as any).itemService = itemServiceMock;
      const result = await handler.execute(mockWebhookPayload);
      assertEquals(result.success, true, "A execução deve ser bem-sucedida");
      assertEquals(
        result.message,
        "Pedido 1001 atualizado com sucesso",
        "A mensagem deve indicar atualização",
      );
      assertSpyCalls(pedidoServiceMock.obterPedidoById, 1);
      assertSpyCalls(pedidoServiceMock.select, 1);
      assertSpyCalls(pedidoServiceMock.update, 1);
      assertSpyCalls(itemServiceMock.update, 1);
    } finally {
      cleanupTest();
    }
  },
});

Deno.test({
  name: "WebhookHandler - Execução com novo pedido",
  async fn() {
    await setupTest();
    try {
      const handler = new TestableWebhookHandler();
      await handler.initialize();
      const pedidoServiceMock = {
        obterPedidoById: spy(() => Promise.resolve(mockPedido)),
        select: spy(() => Promise.resolve(null)),
        create: spy(() => Promise.resolve("uuid-new")),
      };
      const itemServiceMock = {
        create: spy(() => Promise.resolve()),
      };
      (handler as any).pedidoService = pedidoServiceMock;
      (handler as any).itemService = itemServiceMock;
      const result = await handler.execute(mockWebhookPayload);
      assertEquals(result.success, true, "A execução deve ser bem-sucedida");
      assertEquals(
        result.message,
        "Pedido 12345 inserido com sucesso",
        "A mensagem deve indicar inserção",
      );
      assertSpyCalls(pedidoServiceMock.obterPedidoById, 1);
      assertSpyCalls(pedidoServiceMock.select, 1);
      assertSpyCalls(pedidoServiceMock.create, 1);
      assertSpyCalls(itemServiceMock.create, 1);
    } finally {
      cleanupTest();
    }
  },
});

Deno.test({
  name: "WebhookHandler - Tratamento de erro",
  async fn() {
    await setupTest();
    try {
      const handler = new TestableWebhookHandler();
      await handler.initialize();
      const pedidoServiceMock = {
        obterPedidoById: spy(() =>
          Promise.reject(new Error("Erro ao obter pedido"))
        ),
      };
      (handler as any).pedidoService = pedidoServiceMock;
      const result = await handler.execute(mockWebhookPayload);
      assertEquals(result.success, false, "A execução deve falhar");
      assertEquals(
        result.message,
        "Error processing webhook: Erro ao obter pedido",
        "A mensagem deve conter o erro",
      );
      assertSpyCalls(pedidoServiceMock.obterPedidoById, 1);
    } finally {
      cleanupTest();
    }
  },
});
