import {
  CATALOGUE_DATA_FETCH,
  CATALOGUE_ROOT_NODES_FETCH,
  NODE_CHOICE,
  SUCCESS,
  FAIL
 } from '../../constants'

 import {
   CatalogueService
 } from '../../services/';

let defaultState = {
  catalogue_data: [],
  current_node: null,
  item_query_object: {}
}

export default (catalogue = defaultState, action) => {
  switch(action.type){
    case CATALOGUE_ROOT_NODES_FETCH+SUCCESS:
      const root_nodes = action.payload;
      return {...catalogue, catalogue_data:root_nodes}
      break;
    case CATALOGUE_DATA_FETCH+SUCCESS:
      let fetched_data = action.payload;
      let newData = fetched_data.concat(catalogue.catalogue_data);
      return {...catalogue, catalogue_data:newData}
      break;
    case NODE_CHOICE:
      return {...catalogue, current_node:action.payload}
      break;
  }
  return catalogue
}
