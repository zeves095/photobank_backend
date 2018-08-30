import {Map, Set, List, Record} from 'immutable';

import {
  EXISTING_RESOURCES_FETCH,
  EXISTING_PRESETS_FETCH,
  DOWNLOAD_DATA_FETCH,
  START,
  SUCCESS,
  FAIL
 } from '../../constants'

 import {
   CatalogueService,
   ItemQueryObject
 } from '../../services/';


let defaultState = Map({
  resources_existing: List([]),
  finished_presets: List([]),
  downloads: List([]),
  fetching_presets: false,
  fetching_resources: true
})

export default (resource = defaultState, action) => {
  resource = Map(resource);
  switch(action.type){
    case EXISTING_RESOURCES_FETCH+START:
      return resource.set('fetching_resources',true)
      break;
    case EXISTING_RESOURCES_FETCH+SUCCESS:
      return resource.set('resources_existing',List(action.payload)).set('fetching_resources',false)
      break;
    case EXISTING_PRESETS_FETCH+START:
      return resource.set('fetching_presets',true)
      break;
    case EXISTING_PRESETS_FETCH+SUCCESS:
      return resource.set('finished_presets',List(action.payload)).set('fetching_presets',false)
      break;
    case DOWNLOAD_DATA_FETCH+SUCCESS:
      return resource.set('downloads',List(action.payload))
      break;
  }
  return resource
}
