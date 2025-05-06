import { assertEquals, assertExists } from "https://deno.land/std@0.131.0/testing/asserts.ts";
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

import { setupTestEnvironment, cleanupTestEnvironment } from "../setup/test-setup.ts";

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
}as unknown as SupabaseClient<any, "public", any>;;

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


Deno.test({
  name: "WebhookHandler - Inicialização",
  async fn() {
    // Configurar ambiente de teste
    await setupTest();
    
    try {
      // Arrange
      const handler = new WebhookHandler();
      
      // Substituir o método authenticateUser para retornar o mock do Supabase
      const originalModule = await import("../../middleware/auth.ts");
      const authenticateUserStub = stub(
        originalModule,
        "authenticateUser",
        () => Promise.resolve({ supabase: mockSupabaseClient })
      );
      
      try {
        // Act
        await handler.initialize();
        
        // Assert
        assertSpyCalls(authenticateUserStub, 1);
        assertExists((handler as any).supabase, "supabase deve ser inicializado");
        assertExists((handler as any).pedidoService, "pedidoService deve ser inicializado");
        assertExists((handler as any).itemService, "itemService deve ser inicializado");
      } finally {
        authenticateUserStub.restore();
      }
    } finally {
      // Limpar ambiente de teste
      cleanupTest();
    }
  }
});



Deno.test({
  name: "WebhookHandler - Execução com pedido existente",
  async fn() {
    // Configurar ambiente de teste
    await setupTest();
    
    try {
      // Arrange
      const handler = new WebhookHandler();
      
      // Substituir o método authenticateUser
      const authModule = await import("../../middleware/auth.ts");
      const authenticateUserStub = stub(
        authModule,
        "authenticateUser",
        () => Promise.resolve({ supabase: mockSupabaseClient })
      );
      
      // Inicializar o handler
      await handler.initialize();
      
      // Criar spies para os métodos do PedidoService
      const pedidoServiceMock = {
        obterPedidoById: spy(() => Promise.resolve(mockPedido)),
        select: spy(() => Promise.resolve([{ id: "uuid-1", id_tiny: 12345 }])),
        update: spy(() => Promise.resolve("1001")),
      };
      
      // Criar spies para os métodos do ItemService
      const itemServiceMock = {
        update: spy(() => Promise.resolve()),
      };
      
      // Substituir os serviços no handler
      (handler as any).pedidoService = pedidoServiceMock;
      (handler as any).itemService = itemServiceMock;
      
      try {
        // Act
        const result = await handler.execute(mockWebhookPayload);
        
        // Assert
        assertEquals(result.success, true, "A execução deve ser bem-sucedida");
        assertEquals(result.message, "Pedido 1001 atualizado com sucesso", "A mensagem deve indicar atualização");
        assertSpyCalls(pedidoServiceMock.obterPedidoById, 1);
        assertSpyCalls(pedidoServiceMock.select, 1);
        assertSpyCalls(pedidoServiceMock.update, 1);
        assertSpyCalls(itemServiceMock.update, 1);
      } finally {
        authenticateUserStub.restore();
      }
    } finally {
      // Limpar ambiente de teste
      cleanupTest();
    }
  }
});


Deno.test({
  name: "WebhookHandler - Execução com novo pedido",
  async fn() {
    // Configurar ambiente de teste
    await setupTest();
    
    try {
      // Arrange
      const handler = new WebhookHandler();
      
      // Substituir o método authenticateUser
      const authModule = await import("../../middleware/auth.ts");
      const authenticateUserStub = stub(
        authModule,
        "authenticateUser",
        () => Promise.resolve({ supabase: mockSupabaseClient })
      );
      
      // Inicializar o handler
      await handler.initialize();
      
      // Criar spies para os métodos do PedidoService
      const pedidoServiceMock = {
        obterPedidoById: spy(() => Promise.resolve(mockPedido)),
        select: spy(() => Promise.resolve(null)), // Pedido não existe
        create: spy(() => Promise.resolve("uuid-new")),
      };
      
      // Criar spies para os métodos do ItemService
      const itemServiceMock = {
        create: spy(() => Promise.resolve()),
      };
      
      // Substituir os serviços no handler
      (handler as any).pedidoService = pedidoServiceMock;
      (handler as any).itemService = itemServiceMock;
      
      try {
        // Act
        const result = await handler.execute(mockWebhookPayload);
        
        // Assert
        assertEquals(result.success, true, "A execução deve ser bem-sucedida");
        assertEquals(result.message, "Pedido 12345 inserido com sucesso", "A mensagem deve indicar inserção");
        assertSpyCalls(pedidoServiceMock.obterPedidoById, 1);
        assertSpyCalls(pedidoServiceMock.select, 1);
        assertSpyCalls(pedidoServiceMock.create, 1);
        assertSpyCalls(itemServiceMock.create, 1);
      } finally {
        authenticateUserStub.restore();
      }
    } finally {
      // Limpar ambiente de teste
      cleanupTest();
    }
  }
});

Deno.test({
  name: "WebhookHandler - Tratamento de erro",
  async fn() {
    // Configurar ambiente de teste
    await setupTest();
    
    try {
      // Arrange
      const handler = new WebhookHandler();
      
      // Substituir o método authenticateUser
      const authModule = await import("../../middleware/auth.ts");
      const authenticateUserStub = stub(
        authModule,
        "authenticateUser",
        () => Promise.resolve({ supabase: mockSupabaseClient })
      );
      
      // Inicializar o handler
      await handler.initialize();
      
      // Criar spy para o método do PedidoService que lança erro
      const pedidoServiceMock = {
        obterPedidoById: spy(() => Promise.reject(new Error("Erro ao obter pedido"))),
      };
      
      // Substituir os serviços no handler
      (handler as any).pedidoService = pedidoServiceMock;
      
      try {
        // Act
        const result = await handler.execute(mockWebhookPayload);
        
        // Assert
        assertEquals(result.success, false, "A execução deve falhar");
        assertEquals(result.message, "Error processing webhook: Erro ao obter pedido", "A mensagem deve conter o erro");
        assertSpyCalls(pedidoServiceMock.obterPedidoById, 1);
      } finally {
        authenticateUserStub.restore();
      }
    } finally {
      // Limpar ambiente de teste
      cleanupTest();
    }
  }
});
