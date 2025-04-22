import {VendedorController} from "../controllers/vendedorController.ts";
import { ApiTinyRequest } from "./api/tiny_service_api.ts";

const apiTiny = new ApiTinyRequest();
const vendedorController = new VendedorController(); 

class VendedorService {

  async fetchVendedorPorId(id_tiny_vendedor: number) {

    let vendedorRecord = await vendedorController.select(id_tiny_vendedor);
  
    if (vendedorRecord) {
      console.log("Vendedor encontrado no banco:", vendedorRecord);
      return vendedorRecord.id;
    }
    console.log("vendedor nao encontrado no banco")
    
    const vendedor = await apiTiny.APIpesquisaVendedor(id_tiny_vendedor);
  
    if (vendedor) {
      await vendedorController.create(vendedor);
      
      vendedorRecord = await vendedorController.select(id_tiny_vendedor);
      console.log("vendedor consultado apos inserção no banco:", vendedorRecord);
  
      
      return vendedorRecord?.id || null;
    }
  
    return null;
  }
}
export {
  VendedorService
}