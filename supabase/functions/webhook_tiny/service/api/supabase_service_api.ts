import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js";

type TablesNames =
  | "acao"
  | "customizacoes"
  | "itens"
  | "itens_movimentacao"
  | "lotes"
  | "lotes_movimentacao"
  | "pedidos"
  | "produtos"
  | "setores"
  | "status"
  | "vendedores";

class SupabaseServiceApi {
  constructor(private supabase: SupabaseClient) {
    if (!supabase) throw new Error("SupabaseClient não foi fornecido.");
    console.log("SupabaseServiceApi inicializado.");
  }

  async update(table: TablesNames, data: object, conditions: object) {
    try {
      const { error, data: updatedData } = await this.supabase
        .from(table)
        .update(data)
        .match(conditions);

      if (error) {
        throw new Error(`Erro ao atualizar ${table}: ${error.message}`);
      }

      return updatedData;
    } catch (error) {
      console.error("Erro de conexão ao atualizar", table, ":", error);
      throw new Error(`Erro ao atualizar ${table}: ${error.message}`);
    }
  }

  async insert(table: TablesNames, data: object) {
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
      throw new Error(`Erro ao inserir em ${table}: ${error.message}`);
    }
  }

  async delete(table: TablesNames, column: string, value: string | number) {
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
      throw new Error(`Erro ao deletar em ${table}: ${error.message}`);
    }
  }

  async select(table: TablesNames, column: string, value: string | number) {
    console.log("table:", table, "column:", column, "value:", value);
    try {
      const { data, error } = await this.supabase
        .from(table)
        .select()
        .eq(column, value);

      if (error) {
        throw new Error(`Erro ao consultar ${table}: ${error.message}`);
      }

      return data.length > 0 ? data : null;
    } catch (error) {
      console.error("Erro de conexão ao consultar", table, ":", error);
      throw new Error(`Erro ao consultar ${table}: ${error.message}`);
    }
  }
}

export { SupabaseServiceApi };
