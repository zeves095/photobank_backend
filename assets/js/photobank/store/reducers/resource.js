import {Map, Set, List, Record} from 'immutable';

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


let defaultState = Map({
  resources_existing: List([]),
  finished_presets: List([])
})

export default (resource = defaultState, action) => {
  resource = Map(resource);
  switch(action.type){
    case EXISTING_RESOURCES_FETCH+SUCCESS:
      return resource.set('resources_existing',List(action.payload))
      break;
    case EXISTING_PRESETS_FETCH+SUCCESS:
      return resource.set('finished_presets',List(action.payload))
      break;
  }
  return resource
}
