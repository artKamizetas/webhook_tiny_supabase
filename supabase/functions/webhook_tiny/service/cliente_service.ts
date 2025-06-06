import { ApiTinyRequest } from "./api/tiny_service_api.ts";
import { SupabaseServiceApi } from "./api/supabase_service_api.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.42.3?deno-compat";
import { ContatoApiTinyPesquisa } from "../types/response_api_tiny/cliente.ts";

import {
  RequestClientSupabase,
  ResponseClientSupabase,
} from "../types/supabase/client.ts";


class ClientService {
  private db: SupabaseServiceApi;
  private apiTiny: ApiTinyRequest;

  constructor(supabase: SupabaseClient) {
    this.db = new SupabaseServiceApi(supabase);
    this.apiTiny = new ApiTinyRequest();
  }

  async fetchClientPorCodigo(codigo: string) {
    let clientRecord = await this.select(codigo);
    const clienteApi = await this.apiTiny.APIpesquisaClient(codigo);

    if (clientRecord) {
      console.log("Cliente encontrado no banco");
      await this.update(clienteApi.contato);
      return clientRecord.id;
    }
    console.log("Cliente nao encontrado no banco");

    if (clienteApi) {
      await this.create(clienteApi.contato);

      clientRecord = await this.select(codigo);
      console.log(
        "cliente consultado após inserção no banco:",
        clientRecord,
      );

      return clientRecord?.id || null;
    }

    return null;
  }
  async create(client_tiny: ContatoApiTinyPesquisa["contato"]) {
    const contatoRequest = this.formatClient(client_tiny);
    const clienteCreated = await this.db.insert("clientes", contatoRequest);

    return clienteCreated;
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
    } catch (err) {
      console.error("Erro inesperado:", err);
      if (err instanceof Error) {
        throw new Error(`Erro select clientService: ${err.message}`);
      } else {
        throw new Error(`Erro select clientService: ${String(err)}`);
      }
    }
  }
  async update(client_tiny: ContatoApiTinyPesquisa["contato"]) {
    const contatoRequest = this.formatClient(client_tiny);
    const clientUpdated = await this.db.update("clientes", contatoRequest, {
      id_tiny: client_tiny.id,
    });

    return clientUpdated;
  }

  formatClient(
    client_tiny: ContatoApiTinyPesquisa["contato"],
  ): RequestClientSupabase {
    return {
      bairro: client_tiny.bairro ? client_tiny.bairro : null,
      cep: client_tiny.cep ? Number(client_tiny.cep) : null,
      cidade: client_tiny.cidade ? client_tiny.cidade : null,
      complemento: client_tiny.complemento ? client_tiny.complemento : null,
      codigo: client_tiny.codigo ? Number(client_tiny.codigo) : null,
      cpf_cnpj: client_tiny.cpf_cnpj
        ? Number(client_tiny.cpf_cnpj.replace(/[.-]/g, ""))
        : null,
      email: client_tiny.email ? client_tiny.email : null,
      endereco: client_tiny.endereco ? client_tiny.endereco : null,
      fone: client_tiny.fone
        ? Number(client_tiny.fone.replace(/[.-]/g, ""))
        : null,
      id_tiny: client_tiny.id ? client_tiny.id : null,
      nome: client_tiny.nome ? client_tiny.nome : null,
      id_vendedor_bling: client_tiny.id_vendedor
        ? client_tiny.id_vendedor
        : null,
      nome_fantasia: client_tiny.fantasia ? client_tiny.fantasia : null,
      numero: client_tiny.numero ? client_tiny.numero : null,
      situacao: client_tiny.situacao ? client_tiny.situacao : null,
      tipo: client_tiny.tipo_pessoa ? client_tiny.tipo_pessoa : null,
      uf: client_tiny.uf ? client_tiny.uf : null,
    };
  }
}

export { ClientService };
