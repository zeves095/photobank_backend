import {
  EXISTING_RESOURCES_FETCH,
  EXISTING_PRESETS_FETCH,
  SUCCESS,
  FAIL
 } from '../../constants'

 import {
   CatalogueService,
   ItemQueryObject
 } from '../../services/';


let defaultState = {
  resources_existing: [],
  finished_presets: []
}

export default (catalogue = defaultState, action) => {
  switch(action.type){
    case EXISTING_RESOURCES_FETCH+SUCCESS:
      return {...catalogue, resources_existing:action.payload}
      break;
    case EXISTING_PRESETS_FETCH+SUCCESS:
      return {...catalogue, finished_presets:action.payload}
      break;
  }
  return catalogue
}
