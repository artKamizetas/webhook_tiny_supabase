import { ApiTinyRequest } from "./api/tiny_service_api.ts";
import { SupabaseServiceApi } from "./api/supabase_service_api.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.42.3?deno-compat";
import { ContatoApiTinyPesquisa } from "../types/response_api_tiny/cliente.ts";

import {
  RequestClientSupabase,
  ResponseClientSupabase,
} from "../types/supabase/client.ts";

import { AppError } from "../utils/appError.ts";

class ClientService {
  private db: SupabaseServiceApi;
  private apiTiny: ApiTinyRequest;

  constructor(supabase: SupabaseClient) {
    this.db = new SupabaseServiceApi(supabase);
    this.apiTiny = new ApiTinyRequest();
  }

  async fetchClientPorCodigo(codigo: string) {
    try {
      let clientRecord = await this.select(codigo);
      const clienteApi = await this.apiTiny.APIpesquisaClient(codigo);

      if (clientRecord) {
        console.log("Cliente encontrado no banco");
        await this.update(clienteApi.contato);
        return clientRecord.id;
      }

      console.log("Cliente não encontrado no banco");

      if (clienteApi) {
        await this.create(clienteApi.contato);

        clientRecord = await this.select(codigo);
        console.log("Cliente consultado após inserção no banco:", clientRecord);

        return clientRecord?.id || null;
      }

      return null;
    } catch (error) {
      console.error("❌ Erro ao buscar ou criar cliente:", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Erro interno ao buscar ou criar cliente", 500);
    }
  }

  async create(client_tiny: ContatoApiTinyPesquisa["contato"]) {
    try {
      const contatoRequest = this.formatClient(client_tiny);
      const clienteCreated = await this.db.insert("clientes", contatoRequest);
      return clienteCreated;
    } catch (error) {
      console.error("❌ Erro ao criar cliente:", error);
      throw new AppError("Erro ao criar cliente no banco de dados", 500);
    }
  }

  async select(codigo_client: string) {
    try {
      const clientes: ResponseClientSupabase[] | null = await this.db.select(
        "clientes",
        { codigo: codigo_client },
      );
      if (!clientes || clientes.length === 0) {
        console.log(`Cliente com código ${codigo_client} não encontrado.`);
        return null;
      }
      return clientes[0];
    } catch (error) {
      console.error("❌ Erro ao selecionar cliente:", error);
      if (error instanceof Error) {
        throw new AppError(`Erro select clientService: ${error.message}`, 500);
      } else {
        throw new AppError(`Erro select clientService: ${String(error)}`, 500);
      }
    }
  }

  async update(client_tiny: ContatoApiTinyPesquisa["contato"]) {
    try {
      const contatoRequest = this.formatClient(client_tiny);
      const clientUpdated = await this.db.update("clientes", contatoRequest, {
        id_tiny: client_tiny.id,
      });
      return clientUpdated;
    } catch (error) {
      console.error("❌ Erro ao atualizar cliente:", error);
      throw new AppError("Erro ao atualizar cliente no banco de dados", 500);
    }
  }

  formatClient(
    client_tiny: ContatoApiTinyPesquisa["contato"],
  ): RequestClientSupabase {
    return {
      bairro: client_tiny.bairro ?? null,
      cep: client_tiny.cep ? Number(client_tiny.cep) : null,
      cidade: client_tiny.cidade ?? null,
      complemento: client_tiny.complemento ?? null,
      codigo: client_tiny.codigo ? Number(client_tiny.codigo) : null,
      cpf_cnpj: client_tiny.cpf_cnpj
        ? Number(client_tiny.cpf_cnpj.replace(/[.-]/g, ""))
        : null,
      email: client_tiny.email ?? null,
      endereco: client_tiny.endereco ?? null,
      fone: client_tiny.fone
        ? Number(client_tiny.fone.replace(/[.-]/g, ""))
        : null,
      id_tiny: client_tiny.id ?? null,
      nome: client_tiny.nome ?? null,
      id_vendedor_bling: client_tiny.id_vendedor ?? null,
      nome_fantasia: client_tiny.fantasia ?? null,
      numero: client_tiny.numero ?? null,
      situacao: client_tiny.situacao ?? null,
      tipo: client_tiny.tipo_pessoa ?? null,
      uf: client_tiny.uf ?? null,
    };
  }
}

export { ClientService };
