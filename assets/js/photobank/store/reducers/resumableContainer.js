import {
  SUCCESS,
  FAIL
 } from '../../constants'

 import {
   CatalogueService,
   ItemQueryObject
 } from '../../services/';


let defaultState = {
  active_instances: [],
}

export default (resumable_container = defaultState, action) => {
  switch(action.type){
    case EXISTING_RESOURCES_FETCH+SUCCESS:
      return {...resumable_container, resources_existing:action.payload}
      break;
  }
  return resumable_container
}
