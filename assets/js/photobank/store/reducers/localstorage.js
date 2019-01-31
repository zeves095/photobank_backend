import {Map, Set, List, Record} from 'immutable';

import {
  LOCAL_STORAGE_VALUE_SET,
  NODE_CHOICE,
  ALL
 } from '../../constants'

let defaultState = Map({
  localstorage: Map({}),
})

export default (localstorage = defaultState, action) => {
  localstorage = Map(localstorage);
  switch(action.type){
    case LOCAL_STORAGE_VALUE_SET:{
      let storage = localstorage.get('localstorage');
      storage = storage.set(action.payload.key,action.payload.value);
      return localstorage.set('localstorage',storage);
      break;
    }
    case LOCAL_STORAGE_VALUE_SET+ALL:{
      console.log(action.payload);
      return localstorage.set('localstorage',Map(action.payload))
      break;
    }
  }
  return localstorage
}
