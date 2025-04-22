import { Pedido } from "../types/response_api_tiny/pedido.ts";
import { ItemController } from "../controllers/itemController.ts";
import { Item } from "../types/response_api_tiny/item.ts";


const itemController = new ItemController();

class ItemService {

  //deletar e cria
  async update(pedido: Pedido) {
    await itemController.delete(pedido.id)
    await itemController.create(pedido);

    console.log("itens atualizados:", pedido.numero);
   
  }
  //criar
  async create(pedido: Pedido) {
    await itemController.create(pedido);
    console.log("Novo pedido inserido:", pedido.numero);
    
  }
}

export { ItemService };
