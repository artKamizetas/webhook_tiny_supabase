import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.42.3?deno-compat";

class SupabaseServiceApi {
  constructor(private supabase: SupabaseClient) {
    if (!supabase) throw new Error("SupabaseClient não foi fornecido.");
  }

  async update(table: string, data: object, conditions: object) {
    try {
      const { error, data: updatedData } = await this.supabase
        .from(table)
        .update(data)
        .match(conditions);

      if (error) {
        console.error(`Erro ao atualizar ${table}:`, error.message);
        throw new Error(
          `Erro na atualização do Supabase para ${table}: ${error.message}`,
        );
      }

      return updatedData;
    } catch (error: any) {
      console.error(
        `Erro inesperado ao atualizar ${table}:`,
        error.message || error,
      );
      throw new Error(
        `Erro de conexão ou exceção inesperada ao atualizar ${table}: ${
          error.message || error
        }`,
      );
    }
  }

  async insert(table: string, data: object) {
    try {
      const { error, data: insertedData } = await this.supabase
        .from(table)
        .insert(data);

      if (error) {
        throw new Error(`Erro ao inserir em ${table}: ${error.message}`);
      }

      return insertedData;
    } catch (error) {
      console.error("Erro de conexão ao inserir em", table, ":", error);
      throw new Error(
        `Erro ao inserir em ${table}: ${
          error instanceof Error ? error.message : String(error)
        } `,
      );
    }
  }

  async delete(table: string, column: string, value: string | number) {
    try {
      const { data: deletedData, error } = await this.supabase
        .from(table)
        .delete()
        .eq(column, value);

      if (error) {
        throw new Error(`Erro ao deletar em ${table}: ${error.message}`);
      }

      return deletedData;
    } catch (error) {
      console.error("Erro de conexão ao deletar em", table, ":", error);
      throw new Error(
        `Erro ao deletar em ${table}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async select(
    table: string,
    filters?: Record<string, string | number>,
  ) {
    try {
      let query = this.supabase.from(table).select();

      if (filters) {
        for (const [column, value] of Object.entries(filters)) {
          query = query.eq(column, value);
        }
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Erro ao consultar ${table}: ${error.message}`);
      }

      return data.length > 0 ? data : null;
    } catch (error) {
      console.log("Erro de conexão ao consultar", table, ":", String(error));
      throw new Error(
        `Erro ao consultar ${table}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async selectPaginado(
    table: string,
    column?: string,
    value?: string | number | null,
  ) {
    const pageSize = 100;
    try {
      // Contagem com filtro fixo de 'situacao = A'
      let countQuery = this.supabase
        .from(table)
        .select("*", { count: "exact", head: true })
        .eq("situacao", "A");

      if (column && value !== undefined) {
        countQuery = countQuery.eq(column, value);
      }

      const { count, error: countError } = await countQuery;
      if (countError) throw countError;
      if (!count) return null;

      const pages = Math.ceil(count / pageSize);
      const results = [];

      for (let i = 0; i < pages; i++) {
        let q = this.supabase
          .from(table)
          .select("*")
          .eq("situacao", "A") // filtro fixo
          .range(i * pageSize, (i + 1) * pageSize - 1);

        if (column && value !== undefined) {
          q = q.eq(column, value);
        }

        const { data, error } = await q;
        if (error) throw error;
        if (data) results.push(...data);
      }

      return results.length ? results : null;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`Erro de conexão ao consultar ${table}:`, msg);
      throw new Error(`Erro ao consultar ${table}: ${msg}`);
    }
  }

  async upsert(
    table: string,
    data: object[],
    onConflictFields?: string[],
  ) {
    try {
      const { data: upsertedData, error } = await this.supabase
        .from(table)
        .upsert(data, {
          onConflict: onConflictFields?.join(","), // converte array para string com vírgulas
        })

      if (error) {
        throw new Error(`Erro ao upsert em ${table}: ${error.message}`);
      }

      return upsertedData;
    } catch (error) {
      console.error("❌ Erro de conexão ao upsert em", table, ":", error);
      throw new Error(
        `Erro ao upsert em ${table}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}

export { SupabaseServiceApi };
