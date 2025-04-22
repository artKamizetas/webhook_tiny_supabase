
import { Vendedor, VendedorSupabase } from "../types/response_api_tiny/vendedor.ts";
import { SupabaseServiceApi} from "../service/api/supabase_service_api.ts";

const supabase = new SupabaseServiceApi()

class VendedorController {

  async create(vendedor_tiny: Vendedor) {
    const vendedor = {
      id_tiny: vendedor_tiny.id,
      nome: vendedor_tiny.nome,
      situacao: vendedor_tiny.situacao,
      equipe: vendedor_tiny.fantasia
    }
    const vendedorCreated = await supabase.insert('vendedores', vendedor);

    return vendedorCreated;
  }
  async select(id_tiny: number): Promise<VendedorSupabase | null > {
    const vendedor: VendedorSupabase[]| null = await supabase.select('vendedores', "id_tiny", Number(id_tiny));
    return vendedor ? vendedor[0] : null;
   
  }
  async update(vendedor_tiny: Vendedor) {
    const vendedor = {
      id_tiny: vendedor_tiny.id,
      nome: vendedor_tiny.nome,
      situacao: vendedor_tiny.situacao,
      equipe: vendedor_tiny.fantasia
    }
    const vendedorUpdated = await supabase.update('vendedores', vendedor, {
      id_tiny: vendedor_tiny.id
    });

    return vendedorUpdated;
  }
}

export  {
  VendedorController 
}