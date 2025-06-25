import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.42.3?deno-compat";
import { SupabaseServiceApi } from "./api/supabase_service_api.ts";
import { ApiTinyRequest } from "./api/tiny_service_api.ts";
import { Vendedor } from "../types/response_api_tiny/vendedor.ts";
import { ResponseVendedorSupabase } from "../types/supabase/vendedor.ts";
import { AppError } from "../utils/appError.ts";

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
    try {
      let vendedorRecord = await this.select(id_tiny_vendedor);
      const vendedor = await apiTiny.APIpesquisaVendedor(name_vendedor);

      if (vendedorRecord) {
        console.log("Vendedor encontrado no banco");
        if (vendedor) await this.update(vendedor);
        return vendedorRecord.id;
      }

      console.log("Vendedor não encontrado no banco");

      if (vendedor) {
        await this.create(vendedor);

        vendedorRecord = await this.select(id_tiny_vendedor);
        if (!vendedorRecord) {
          throw new AppError("Vendedor não encontrado após inserção", 500);
        }

        console.log("Vendedor encontrado após inserção no banco.");
        return vendedorRecord.id;
      }

      return null;
    } catch (error) {
      console.error("Erro ao buscar ou criar vendedor:", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Erro interno ao buscar ou criar vendedor", 500);
    }
  }

  async create(vendedor_tiny: Vendedor) {
    try {
      const vendedor = {
        id_tiny: vendedor_tiny.id,
        nome: vendedor_tiny.nome,
        situacao: vendedor_tiny.situacao,
        equipe: vendedor_tiny.fantasia,
      };
      return await this.db.insert("vendedores", vendedor);
    } catch (error) {
      console.error("Erro ao criar vendedor:", error);
      throw new AppError("Erro ao criar vendedor no banco de dados", 500);
    }
  }

  async select(id_tiny: number): Promise<ResponseVendedorSupabase | null> {
    try {
      const vendedor: ResponseVendedorSupabase[] | null = await this.db.select(
        "vendedores",
        { id_tiny: id_tiny },
      );
      return vendedor ? vendedor[0] : null;
    } catch (error) {
      console.error("Erro ao selecionar vendedor:", error);
      throw new AppError("Erro ao buscar vendedor no banco de dados", 500);
    }
  }

  async update(vendedor_tiny: Vendedor) {
    try {
      const vendedor = {
        id_tiny: vendedor_tiny.id,
        nome: vendedor_tiny.nome,
        situacao: vendedor_tiny.situacao,
        equipe: vendedor_tiny.fantasia,
      };
      return await this.db.update("vendedores", vendedor, {
        id_tiny: vendedor_tiny.id,
      });
    } catch (error) {
      console.error("Erro ao atualizar vendedor:", error);
      throw new AppError("Erro ao atualizar vendedor no banco de dados", 500);
    }
  }
}

export { VendedorService };
