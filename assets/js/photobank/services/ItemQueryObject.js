/**
 * Объект поиска товаров каталога для отправки на сервер
 */
class ItemQueryObject{

  constructor(){
    this.nodeId = null;
    this.name = null;
    this.parent_name = null;
    this.code = null;
    this.search_nested = 0;
    this.article = null;
  }

}

export {ItemQueryObject};
