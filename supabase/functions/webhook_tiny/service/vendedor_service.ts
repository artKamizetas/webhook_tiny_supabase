import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js";
import { SupabaseServiceApi } from "./api/supabase_service_api.ts";
import { ApiTinyRequest } from "./api/tiny_service_api.ts";
import {
  Vendedor,
  VendedorSupabase,
} from "../types/response_api_tiny/vendedor.ts";

const apiTiny = new ApiTinyRequest();

class VendedorService {
  private db: SupabaseServiceApi;

  constructor(supabase: SupabaseClient) {
    this.db = new SupabaseServiceApi(supabase);
  }

  async fetchVendedorPorId(id_tiny_vendedor: string) {
    let vendedorRecord = await this.select(id_tiny_vendedor);

    if (vendedorRecord) {
      console.log("Vendedor encontrado no banco:", vendedorRecord);
      return vendedorRecord.id;
    }
    console.log("vendedor nao encontrado no banco");

    const vendedor = await apiTiny.APIpesquisaVendedor(id_tiny_vendedor);

    if (vendedor) {
      await this.create(vendedor);

      vendedorRecord = await this.select(id_tiny_vendedor);
      console.log(
        "vendedor consultado apos inserção no banco:",
        vendedorRecord,
      );

      return vendedorRecord?.id || null;
    }

    return null;
  }

  async create(vendedor_tiny: Vendedor) {
    const vendedor = {
      id_tiny: vendedor_tiny.id,
      nome: vendedor_tiny.nome,
      situacao: vendedor_tiny.situacao,
      equipe: vendedor_tiny.fantasia,
    };
    const vendedorCreated = await this.db.insert("vendedores", vendedor);

    return vendedorCreated;
  }

  async select(id_tiny: string): Promise<VendedorSupabase | null> {
    const vendedor: VendedorSupabase[] | null = await this.db.select(
      "vendedores",
      "id_tiny",
      Number(id_tiny),
    );
    return vendedor ? vendedor[0] : null;
  }

  async update(vendedor_tiny: Vendedor) {
    const vendedor = {
      id_tiny: vendedor_tiny.id,
      nome: vendedor_tiny.nome,
      situacao: vendedor_tiny.situacao,
      equipe: vendedor_tiny.fantasia,
    };
    const vendedorUpdated = await this.db.update("vendedores", vendedor, {
      id_tiny: vendedor_tiny.id,
    });

    return vendedorUpdated;
  }
}
export { VendedorService };
