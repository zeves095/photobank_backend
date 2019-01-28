import {Map, Set, List, Record} from 'immutable';

import {
  CATALOGUE_DATA_FETCH,
  CATALOGUE_ROOT_NODES_FETCH,
  NODE_CHOICE,
  ITEM_CHOICE,
  ITEMS_FETCH,
  SUCCESS,
  FAIL
 } from '../../constants'

 import {
   CatalogueService,
   ItemQueryObject
 } from '../../services/';


let defaultState = Map({
  catalogue_data: List([]),
  items: List([]),
  current_node: null,
  current_item: null,
  item_query_object: null
})

export default (catalogue = defaultState, action) => {
  catalogue = Map(catalogue);
  switch(action.type){
    case CATALOGUE_ROOT_NODES_FETCH+SUCCESS:
      const root_nodes = List(action.payload);
      return catalogue.set('catalogue_data',root_nodes)
      break;
    case CATALOGUE_DATA_FETCH+SUCCESS:
      let fetched_data = List(action.payload);
      let fetchCatalogueData = catalogue.get('catalogue_data');
      //let newData = existingCatalogueData.concat(fetched_data));
      fetched_data.forEach((node)=>{
        if(!fetchCatalogueData.find((existing)=>node.id===existing.id)){
          fetchCatalogueData = fetchCatalogueData.push(node);
        }
      });
      if(catalogue.get('catalogue_data').equals(fetchCatalogueData)){return catalogue}
      return catalogue.set('catalogue_data',fetchCatalogueData)
      break;
    case NODE_CHOICE:
      return catalogue.set('current_node',action.payload)
      break;
    case ITEM_CHOICE:
      return catalogue.set('current_item',action.payload)
      break;
    case ITEMS_FETCH+SUCCESS:
      let newItems = List(action.payload);
      let prefetchedItems = List(catalogue.get('items'));
      let chosenItem = prefetchedItems.find((item)=>item.id===catalogue.get('current_item'));
      if(chosenItem&&!newItems.find(item=>item.id===chosenItem.id))newItems = newItems.push(chosenItem);
      if(newItems.equals(catalogue.get('items'))){return catalogue}
      return catalogue.set('items',newItems)
      break;
  }
  return catalogue
}
