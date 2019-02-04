import {UploadService, NotificationService, CatalogueService, ResourceService, ItemQueryObject, ItemService, LocalStorageService} from '../services/';
import utility from '../services/UtilityService';

import {
  UPLOADS_UNFINISHED_FETCH,
  CATALOGUE_DATA_FETCH,
  CATALOGUE_ROOT_NODES_FETCH,
  EXISTING_RESOURCES_FETCH,
  EXISTING_PRESETS_FETCH,
  NODE_CHOICE,
  ITEM_CHOICE,
  ITEMS_FETCH,
  FILE_PROCESSED,
  RESUMABLE_PUSH,
  UPLOAD_DELETE,
  DELETE_ALL_PENDING,
  DELETE_ALL_UNFINISHED,
  LOCAL_STORAGE_VALUE_SET,
  PURGE_EMPTY_ITEMS,
  USER_INFO_FETCH,
  ITEM_INFO_FETCH,
  CRUMBS_UPDATE,
  CONFIG_GET,
  START,
  SUCCESS,
  FAIL,
  ALL
} from '../constants/';

export function init(){
  return dispatch=>{
    return Promise.all([
      utility.fetchConfig(),
      utility.initLocalstorage(),
    ]).then(()=>{
      Promise.all([
        getLocalStorage()(dispatch),
        fetchUnfinished()(dispatch),
        getUserInfo()(dispatch),
      ]);
    }).catch((e)=>{
      console.log(e);
    });
  }
}

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
      items.forEach((item)=>{
        dispatch({
          type: RESUMABLE_PUSH,
          payload: item.id
        });
      });
    }).catch((error)=>{
      console.log(error);
      dispatch({
        type: UPLOADS_UNFINISHED_FETCH+FAIL,
        payload: ''
      });
      NotificationService.throw('custom',error);
    });
  }
}

export function pushResumable(itemId){
  return {
    type: RESUMABLE_PUSH,
    payload: itemId
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
      console.log(error);
      dispatch({
        type: CATALOGUE_ROOT_NODES_FETCH+FAIL,
        payload: id
      });
      NotificationService.throw('custom',error);
    });
  }
}

export function fetchNodes(id, data){
  return (dispatch)=>{
    if(data.length === 0){
      return dispatch(fetchRootNodes(id));
    }
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
      console.log(error);
      dispatch({
        type: CATALOGUE_DATA_FETCH+FAIL,
        payload: ''
      });
      NotificationService.throw('custom',error);
    });
  }
}

export function chooseNode(id, data){
  return (dispatch)=> {
    let qo = new ItemQueryObject();
    qo.nodeId = id;
    dispatch(fetchItems(qo));
    dispatch(setLocalValue('current_node', id));
    dispatch(fetchNodes(id, data));
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
  return dispatch=>{
    dispatch(pushResumable(id));
    dispatch(purgeEmptyItems());
    dispatch(setLocalValue('current_item',id));
    return dispatch({
      type: ITEM_CHOICE,
      payload: id
    });
  }
}

export function fetchItems(query){
  return (dispatch)=>{
    dispatch({
      type: ITEMS_FETCH+START,
      payload: ''
    });
    return ItemService.fetchItems(query)
    .then((data)=>{
      dispatch({
        type: ITEMS_FETCH+SUCCESS,
        payload: data
      });
    }).catch((error)=>{
      console.log(error);
      dispatch({
        type: ITEMS_FETCH+FAIL,
        payload: ''
      });
      NotificationService.throw('custom',error);
    });
  }
}

export function prepareFileForUpload(file, existing, item){
  return (dispatch)=>{
    const itemId = item.id;
    const itemCode = item.itemCode;
    return UploadService.processFile(file, existing, item).then((uniqueIdentifier)=>{
      let fileParams = {uniqueIdentifier,itemId,itemCode,file};
      dispatch({
        type: FILE_PROCESSED,
        payload: fileParams
      });
      UploadService.commitUpload(fileParams,existing);
    });
  }
}

export function deleteUpload(filehash, item){
  return (dispatch)=>{
    return UploadService.deleteUpload(filehash,item).then((response)=>{
      dispatch({
        type: UPLOAD_DELETE,
        payload: {hash:filehash,item}
      });
    }).catch((e)=>{
      console.log(e);
      NotificationService.throw('custom', e)
    });
  }
}

export function completeUpload(id, files){
  return dispatch=>{
    dispatch(deletePendingUploads(id,files)).then(()=>{
      dispatch(fetchExisting(id));
      dispatch(fetchUnfinished());
    });
  }
}

export function deletePendingUploads(id, files){
  return dispatch=>{
    let deleteStack = [];
    files.forEach(file=>{deleteStack.push(dispatch(deleteUpload(file.uniqueIdentifier, id)))});
    return Promise.all(deleteStack,(result)=>{
      dispatch({
        type:DELETE_ALL_PENDING,
        payload:id
      })
    });
  }
}

export function deleteUnfinishedUploads(uploads, id){
  return dispatch=>{
    let deleteStack = [];
    uploads.forEach((upload)=>{deleteStack.push(dispatch(deleteUpload(upload.file_hash, id)))});
    return Promise.all(deleteStack,(result)=>{
      dispatch({
        type:DELETE_ALL_UNFINISHED,
        payload:id
      })
    });
  }
}

export function setLocalValue(key,value){
  return dispatch=>{
    if(typeof value !== "undefined" && value !== null){
      LocalStorageService.set(key,value);
      dispatch({
        type:LOCAL_STORAGE_VALUE_SET,
        payload:{key,value}
      });
    }
  }
}

export function addToLocalValue(key,add){
  return dispatch=>{
    LocalStorageService.addTo(key,add);
    let value = LocalStorageService.getList(key);
    dispatch({
      type:LOCAL_STORAGE_VALUE_SET,
      payload:{key,value}
    });
  }
}

export function spliceFromLocalValue(key,remove){
  return dispatch=>{
    LocalStorageService.removeFrom(key,remove);
    let value = LocalStorageService.getList(key);
    dispatch({
      type:LOCAL_STORAGE_VALUE_SET,
      payload:{key,value}
    });
  }
}

export function clearDownloads(){
  return dispatch=>{
    LocalStorageService.set("pending_downloads", "");
    let value = LocalStorageService.getList("pending_downloads");
    dispatch({
      type:LOCAL_STORAGE_VALUE_SET,
      payload:{key:"pending_downloads",value}
    });
  }
}

export function getLocalStorage(key = null){
  return dispatch=>{
    const data = LocalStorageService.get(key);
    return dispatch({
      type:LOCAL_STORAGE_VALUE_SET+(!key&&ALL),
      payload:data
    });
  }
}

export function chooseListViewType(id=1){
  return dispatch=>{
    return dispatch(setLocalValue('list_view_type', id));
  }
}

export function chooseCatalogueViewType(id=1){
  return dispatch=>{
    return dispatch(setLocalValue('catalogue_view', id));
  }
}

export function purgeEmptyItems(){
  return {
      type:PURGE_EMPTY_ITEMS,
      payload: ""
    };
}

export function getUserInfo(){
  return dispatch=>{
    return fetch("/account/getinfo/", {method:"GET"})
    .then((response)=>response.json())
    .then((response)=>{
      dispatch({
        type: USER_INFO_FETCH+SUCCESS,
        payload: response,
      });
    }).catch((error)=>{
      dispatch({
        type: USER_INFO_FETCH+FAIL,
        payload: "",
      });
    });
  }
}

export function fetchItemData(id){
  return dispatch=>{
    fetch("/catalogue/node/item/"+id, {method:"GET"})
    .then((response)=>response.json())
    .then((response)=>{
      dispatch({
        type: ITEM_INFO_FETCH+SUCCESS,
        payload: response,
      });
    }).catch((error)=>{
      dispatch({
        type: ITEM_INFO_FETCH+FAIL,
        payload: "",
      });
    });
  }
}

export function addResourceToDownloads(id){
  return dispatch=>{
    dispatch(addToLocalValue('pending_downloads',id));
  }
}

export function updateResourceField(params){
  return dispatch=>{
    let fetchBody = {
      id:params.file.id,
      type:params.file.type
    };
    fetchBody[params.key] = params.value;
    fetch(window.config.resource_url+params.file.id, {method:"PATCH", body:JSON.stringify(fetchBody)}).then(response=>{
      dispatch(fetchExisting(params.item));
    });
  }
}

export function searchItems(query){
  return dispatch=>{
    let qo = new ItemQueryObject();
    Object.keys(query).forEach(key=>{
      qo[key]=query[key];
    });
    dispatch(fetchItems(qo));
  }
}

export function pushCrumbs(data, node){
    let crumbs = CatalogueService.getCrumbs(data,node);
    return {
      type: CRUMBS_UPDATE,
      payload: crumbs
    };
}

export function removeDownload(id){
  return dispatch=>{
    dispatch(spliceFromLocalValue("pending_downloads", id))
  }
}
