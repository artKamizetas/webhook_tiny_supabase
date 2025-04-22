import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js";
import { authenticateUser } from "../../middleware/auth.ts";

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
// SEMPRE QUE CHAMAR ESSA FUCÇÃO
// DECLARAR A TABLE SEMPRE COM ASPAS *SIMPLES*
class SupabaseServiceApi {
  private supabase!: SupabaseClient;

  constructor() {
    
    this.initialize()
      .then(() => console.log("Supabase inicializado com sucesso"))
      .catch((error) => {
        console.error("Erro durante a inicialização:", error.message);
        throw error;
      });
  }

  private async initialize() {
    const { supabase } = await authenticateUser();
    if (!(supabase instanceof SupabaseClient)) {
      throw new Error(
        "Retorno de authenticateUser não contém um SupabaseClient válido.",
      );
    }
    this.supabase = supabase; 
  }
  async update(table: string, data: object, conditions: object) {
    try{
      const { error, data: updatedData } = await this.supabase
        .from(table)
        .update(data)
        .match(conditions);
  
      if (error) {
        throw new Error(`Erro ao atualizar ${table}: ${error.message}`);
      }
  
      return updatedData;
    }catch(error){
      console.error("Erro de conexão ao atualizar", table, ":", error);
      throw new Error(`Erro ao atualizar ${table}: ${error.message}`);
    }
  }

  async insert(table: string, data: object) {
    console.log("data:", data, "table:", table);
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
    try{
      const { data, error } = await this.supabase
        .from(table)
        .select()
        .eq(column, value);
  
      if (error) {
        throw new Error(`Erro ao consultar o banco de dados na tabela ${table}: ${error.message}`);
      }
      if (data.length > 0) {
        return data;
      } else {
        return null;
      }
    }catch(error){
      console.error("Erro de conexão ao consultar o banco de dados na tabela", table, ":", error);
      throw new Error(`Erro ao consultar o banco de dados na tabela ${table}: ${error.message}`);
    }
    
  }
}

export { SupabaseServiceApi };
