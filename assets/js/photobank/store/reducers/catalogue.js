import {Map, Set, List, Record} from 'immutable';

import {
  CATALOGUE_DATA_FETCH,
  ITEM_INFO_FETCH,
  CATALOGUE_ROOT_NODES_FETCH,
  NODE_CHOICE,
  ITEM_CHOICE,
  ITEMS_FETCH,
  CRUMBS_UPDATE,
  CHOOSE_COLLECTION,
  START,
  SUCCESS,
  FAIL
 } from '../../constants'

 import {
   CatalogueService,
   ItemQueryObject
 } from '../../services/';


let defaultState = Map({
  collection_type: 0,
  catalogue_data: List([List([]),List([])]),
  items: List([]),
  current_node: null,
  current_item: null,
  item_query_object: null,
  fetching_catalogue: true,
  fetching_items: true,
  crumbs: null
})

export default (catalogue = defaultState, action) => {
  catalogue = Map(catalogue);
  switch(action.type){
    case CATALOGUE_ROOT_NODES_FETCH+START:{
      return catalogue.set('fetching_catalogue',true);
      break;
    }
    case CATALOGUE_ROOT_NODES_FETCH+SUCCESS:{
      const root_nodes = List(action.payload);
      let cat_data = catalogue.get('catalogue_data');
      cat_data = cat_data.set(catalogue.get('collection_type'), root_nodes);
      return catalogue.set('fetching_catalogue',false).set('catalogue_data',cat_data);
      break;
    }
    case CATALOGUE_DATA_FETCH+START:{
      return catalogue.set('fetching_catalogue',true);
      break;
    }
    case CATALOGUE_DATA_FETCH+SUCCESS:{
      let fetched_data = List(action.payload);
      let cat_data = catalogue.get('catalogue_data');
      let fetchCatalogueData = cat_data.get(catalogue.get('collection_type'));
      fetched_data.forEach((node)=>{
        if(!fetchCatalogueData.find((existing)=>node.id===existing.id)){
          fetchCatalogueData = fetchCatalogueData.push(node);
        }
      });
      cat_data = cat_data.set(catalogue.get('collection_type'), fetchCatalogueData);
      return catalogue.set('fetching_catalogue',false).set('catalogue_data',cat_data);
      break;
    }
    case NODE_CHOICE:{
      return catalogue.set('current_node',action.payload);
      break;
    }
    case ITEM_CHOICE:{
      return catalogue.set('current_item',action.payload);
      break;
    }
    case ITEMS_FETCH+START:{
      return catalogue.set('fetching_items',true);
      break;
    }
    case ITEMS_FETCH+SUCCESS:{
      let newItems = List(action.payload);
      let prefetchedItems = List(catalogue.get('items'));
      let chosenItem = prefetchedItems.find((item)=>item.id===catalogue.get('current_item'));
      if(chosenItem&&!newItems.find(item=>item.id===chosenItem.id))newItems = newItems.push(chosenItem);
      return catalogue.set('items',newItems).set('fetching_items',false);
      break;
    }
    case ITEM_INFO_FETCH+SUCCESS:{
      let itemData = action.payload;
      let prefetchedItems = List(catalogue.get('items'));
      if(!prefetchedItems.find(item=>item.id===itemData.id))prefetchedItems = prefetchedItems.push(itemData);
      return catalogue.set('items',prefetchedItems);
      break;
    }
    case CRUMBS_UPDATE:{
      let crumbs = action.payload;
      return catalogue.set('crumbs', crumbs);
      break;
    }
    case CHOOSE_COLLECTION:{
      return catalogue.set('collection_type', action.payload);
      break;
    }
  }
  return catalogue
}
