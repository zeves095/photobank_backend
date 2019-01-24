import {UploadService, NotificationService, CatalogueService, ResourceService, ItemQueryObject, ItemService} from '../services/';

import {
  UPLOADS_UNFINISHED_FETCH,
  CATALOGUE_DATA_FETCH,
  CATALOGUE_ROOT_NODES_FETCH,
  EXISTING_RESOURCES_FETCH,
  EXISTING_PRESETS_FETCH,
  NODE_CHOICE,
  ITEM_CHOICE,
  ITEMS_FETCH,
  START,
  SUCCESS,
  FAIL
} from '../constants/';

export function fetchUnfinished(){
  return (dispatch)=>{
    dispatch({
      type: UPLOADS_UNFINISHED_FETCH+START,
      payload: ''
    });
    return UploadService.fetchUnfinished()
    .then((response)=>response.json())
    .then((items)=>{
      dispatch({
        type: UPLOADS_UNFINISHED_FETCH+SUCCESS,
        payload: items
      });
    }).catch((error)=>{
      dispatch({
        type: UPLOADS_UNFINISHED_FETCH+FAIL,
        payload: ''
      });
      NotificationService.throw('custom',error);
    });
  }
}

export function fetchRootNodes(id){
  return (dispatch)=>{
    dispatch({
      type: CATALOGUE_ROOT_NODES_FETCH+START,
      payload: id
    });
    return CatalogueService.fetchRootNodes(id).then((data)=>{
      dispatch({
        type: CATALOGUE_ROOT_NODES_FETCH+SUCCESS,
        payload: data
      });
    }).catch((error)=>{
      dispatch({
        type: CATALOGUE_ROOT_NODES_FETCH+FAIL,
        payload: id
      });
      NotificationService.throw('custom',error);
    });
  }
}

export function fetchNodes(id){
  return (dispatch)=>{
    dispatch({
      type: CATALOGUE_DATA_FETCH+START,
      payload: ''
    });
    return CatalogueService.fetchNodes(id)
    .then((response)=>response.json())
    .then((data)=>{
      dispatch({
        type: CATALOGUE_DATA_FETCH+SUCCESS,
        payload: data
      });
    }).catch((error)=>{
      dispatch({
        type: CATALOGUE_DATA_FETCH+FAIL,
        payload: ''
      });
      NotificationService.throw('custom',error);
    });
  }
}

export function chooseNode(id){
  return (dispatch)=> {
    let qo = new ItemQueryObject();
    qo.nodeId = id;
    dispatch(fetchItems(qo));
    dispatch({
      type: NODE_CHOICE,
      payload: id
    })
  }
}

export function fetchExisting(id){
  return (dispatch)=>{
    dispatch({
      type: EXISTING_RESOURCES_FETCH+START,
      payload: ''
    });
    return ResourceService.fetchExisting(id).then((data)=>{
      dispatch({
        type: EXISTING_RESOURCES_FETCH+SUCCESS,
        payload: data
      });
    }).catch((error)=>{
      dispatch({
        type: EXISTING_RESOURCES_FETCH+FAIL,
        payload: ''
      });
      NotificationService.throw('custom',error);
    });
  }
}

export function fetchPresets(pagination, existing){
  return (dispatch)=>{
    dispatch({
      type: EXISTING_PRESETS_FETCH+START,
      payload: ''
    });
    return ResourceService.fetchExistingPresets(pagination, existing).then((data)=>{
      dispatch({
        type: EXISTING_PRESETS_FETCH+SUCCESS,
        payload: data
      });
    }).catch((error)=>{
      dispatch({
        type: EXISTING_PRESETS_FETCH+FAIL,
        payload: ''
      });
      NotificationService.throw('custom',error);
    });
  }
}

export function chooseItem(id){
  return {
    type: ITEM_CHOICE,
    payload: id
  }
}

export function fetchItems(query){
  return (dispatch)=>{
    dispatch({
      type: ITEMS_FETCH+START,
      payload: ''
    });
    return ItemService.fetchItems(query).then((data)=>{
      dispatch({
        type: ITEMS_FETCH+SUCCESS,
        payload: data
      });
    }).catch((error)=>{
      dispatch({
        type: ITEMS_FETCH+FAIL,
        payload: ''
      });
      NotificationService.throw('custom',error);
    });
  }
}
