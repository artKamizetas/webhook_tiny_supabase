import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.42.3?deno-compat";
import { SupabaseServiceApi } from "./api/supabase_service_api.ts";
import { ApiTinyRequest } from "./api/tiny_service_api.ts";
import { Vendedor } from "../types/response_api_tiny/vendedor.ts";
import { ResponseVendedorSupabase } from "../types/supabase/vendedor.ts";

const apiTiny = new ApiTinyRequest();

class VendedorService {
  private db: SupabaseServiceApi;

  constructor(supabase: SupabaseClient) {
    this.db = new SupabaseServiceApi(supabase);
  }

  async fetchVendedorPorId(
    id_tiny_vendedor: number,
    name_vendedor: string,
  ): Promise<string | null> {
    let vendedorRecord = await this.select(id_tiny_vendedor);
    const vendedor = await apiTiny.APIpesquisaVendedor(name_vendedor);

    if (vendedorRecord) {
      console.log("Vendedor encontrado no banco");
      await this.update(vendedor);
      return vendedorRecord.id;
    }
    console.log("vendedor nao encontrado no banco");

    if (vendedor) {
      await this.create(vendedor);

      vendedorRecord = await this.select(id_tiny_vendedor);
      console.log(
        "vendedor encontrado apos inserção no banco com dados vindos da api Tiny."
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

  async select(id_tiny: number): Promise<ResponseVendedorSupabase | null> {
    const vendedor: ResponseVendedorSupabase[] | null = await this.db.select(
      "vendedores",
      { id_tiny: id_tiny },
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
