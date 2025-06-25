import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.42.3?deno-compat";
import { AppError } from "../../utils/appError.ts"; // ajuste o caminho conforme necessário

class SupabaseServiceApi {
  constructor(private supabase: SupabaseClient) {
    if (!supabase) throw new AppError("SupabaseClient não foi fornecido.", 500);
  }

  async update(table: string, data: object, conditions: object) {
    try {
      const { error, data: updatedData } = await this.supabase
        .from(table)
        .update(data)
        .match(conditions);

      if (error) {
        console.error(`❌ Erro ao atualizar ${table}:`, error.message);
        throw new AppError(`Erro na atualização do Supabase para ${table}: ${error.message}`, 500);
      }

      return updatedData;
    } catch (error: any) {
      console.error(`❌ Erro inesperado ao atualizar ${table}:`, error.message || error);
      throw new AppError(`Erro de conexão ou exceção inesperada ao atualizar ${table}: ${error.message || error}`, 500);
    }
  }

  async insert(table: string, data: object) {
    try {
      const { error, data: insertedData } = await this.supabase
        .from(table)
        .insert(data);

      if (error) {
        console.error(`❌ Erro ao inserir em ${table}:`, error.message);
        throw new AppError(`Erro ao inserir em ${table}: ${error.message}`, 500);
      }

      return insertedData;
    } catch (error) {
      console.error(`❌ Erro de conexão ao inserir em ${table}:`, error);
      throw new AppError(`Erro ao inserir em ${table}: ${error instanceof Error ? error.message : String(error)}`, 500);
    }
  }

  async delete(table: string, column: string, value: string | number) {
    try {
      const { data: deletedData, error } = await this.supabase
        .from(table)
        .delete()
        .eq(column, value);

      if (error) {
        console.error(`❌ Erro ao deletar em ${table}:`, error.message);
        throw new AppError(`Erro ao deletar em ${table}: ${error.message}`, 500);
      }

      return deletedData;
    } catch (error) {
      console.error(`❌ Erro de conexão ao deletar em ${table}:`, error);
      throw new AppError(`Erro ao deletar em ${table}: ${error instanceof Error ? error.message : String(error)}`, 500);
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
        console.error(`❌ Erro ao consultar ${table}:`, error.message);
        throw new AppError(`Erro ao consultar ${table}: ${error.message}`, 500);
      }

      return data && data.length > 0 ? data : null;
    } catch (error) {
      console.error(`❌ Erro de conexão ao consultar ${table}:`, error);
      throw new AppError(`Erro ao consultar ${table}: ${error instanceof Error ? error.message : String(error)}`, 500);
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
      if (countError) {
        console.error(`❌ Erro ao contar registros em ${table}:`, countError.message);
        throw new AppError(`Erro ao contar registros em ${table}: ${countError.message}`, 500);
      }
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
        if (error) {
          console.error(`❌ Erro ao consultar página ${i + 1} em ${table}:`, error.message);
          throw new AppError(`Erro ao consultar página ${i + 1} em ${table}: ${error.message}`, 500);
        }
        if (data) results.push(...data);
      }

      return results.length ? results : null;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`❌ Erro de conexão ao consultar ${table}:`, msg);
      throw new AppError(`Erro ao consultar ${table}: ${msg}`, 500);
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
        });

      if (error) {
        console.error(`❌ Erro ao upsert em ${table}:`, error.message);
        throw new AppError(`Erro ao upsert em ${table}: ${error.message}`, 500);
      }

      return upsertedData;
    } catch (error) {
      console.error(`❌ Erro de conexão ao upsert em ${table}:`, error);
      throw new AppError(`Erro ao upsert em ${table}: ${error instanceof Error ? error.message : String(error)}`, 500);
    }
  }
}

export { SupabaseServiceApi };
