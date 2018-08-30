import {createSelector, createStructuredSelector} from 'reselect';
import {Map,List,Set,Record} from 'immutable';
import * as constants from '../constants';

export const unfinishedUploads = (store, props)=>store.upload.get('uploads_unfinished');

export const ownPropsCollectionType = (store, props)=>props.collection_type;
export const collectionType = (store, props)=>store.catalogue.get('collection_type');

export const currentItemId = (store, props)=>store.catalogue.get('current_item');
export const ownPropsItemId = (store, props)=>props.item_id;

export const currentNodeId = (store, props)=>store.catalogue.get('current_node');
export const currentGarbageNodeId = (store, props)=>store.catalogue.get('current_garbage_node');

export const catalogueData = (store, props)=>store.catalogue.get('catalogue_data');
export const items = (store, props)=>props.items||store.catalogue.get('items');
export const resumableContainer = (store, props)=>store.upload.get('resumable_container');
export const fetchingCatalogue = (store, props)=>store.catalogue.get('fetching_catalogue');
export const fetchingItems = (store, props)=>store.catalogue.get('fetching_items');
export const breadcrumbs = (store, props)=>store.catalogue.get('crumbs');
export const localStorage = (store, props)=>store.localstorage.get('localstorage');
export const nodeMoving = (store,props)=>store.catalogue.get('moving_node');
export const foundGarbageNodes = (store,props)=>store.catalogue.get('found_garbage_nodes');
export const showDeleted = (store,props)=>store.catalogue.get('show_deleted');

export const getCollectionType = createSelector(collectionType, ownPropsCollectionType, localStorage, (type, ptype, storage)=>{
  let collectionType;
  if(typeof ptype !== 'undefined'){
    collectionType = ptype;
  }else{
    let stored = storage.get('collection_type');
    if(typeof stored !== 'undefined' && stored !== null){
      collectionType = stored;
    }else{
      collectionType = type;
    }
  }
  return parseInt(collectionType,10);
});

export const getCatalogueData = createSelector(catalogueData, getCollectionType, showDeleted, (catalogue, type, deleted)=>{
  let cat_data = catalogue.get(type);
  if(!deleted){
    cat_data = cat_data.filter(item=>!item.deleted);
  }
  return cat_data.toArray();
});

export const getCurrentNode = createSelector(currentNodeId, currentGarbageNodeId, getCollectionType, localStorage, (node, garbage_node, type, storage)=>{
  let result = constants.CATALOGUE_COLLECTION===type?node:garbage_node;
  if(!result){
    result = constants.CATALOGUE_COLLECTION===type?storage.get('current_node'):storage.get('current_garbage_node');
  }
  return result;
});

export const getCurrentNodeParent = createSelector(getCurrentNode, getCatalogueData, (cur_node, data)=>{
  let parent = data.find(node=>cur_node===node.id);
  return parent?parent.parent:null;
});

export const getCurrentNodeIsDeleted = createSelector(getCurrentNode, getCatalogueData, (cur_node, data)=>{
  let deleted = data.find(node=>cur_node===node.id);
  return deleted?deleted.deleted:null;
});

export const getNodeItems = createSelector(items, currentNodeId, getCollectionType, (items, id, type)=>{
  let newItems = id!==null&&constants.GARBAGE_COLLECTION!==type?items.filter(item=>item.node===id):List(items);
  return newItems.toArray();
});

export const filterItems = createSelector(getNodeItems, items, currentNodeId, (nodeItems, items, id)=>{
  return nodeItems;
});

export const getStoredItem = createSelector(getCollectionType, localStorage, (collection, storage)=>{
  return constants.CATALOGUE_COLLECTION===collection?storage.get('current_item'):storage.get('current_garbage_node');
});

export const getItemObject = createSelector(
  items,
  catalogueData,
  currentItemId,
  currentGarbageNodeId,
  ownPropsItemId,
  getCollectionType,
  (items, cat, iid, gid, pid, type)=>{
    let id, item;
    if(typeof pid !== 'undefined'){
      item = items.find(item=>item.id===pid);
      if(typeof item === 'undefined')item = cat.get(constants.GARBAGE_COLLECTION).find(node=>node.id===id);
    }else if(constants.CATALOGUE_COLLECTION===type){
        item = items.find(item=>item.id===iid);
    }else{
      id = gid;
      item = cat.get(constants.GARBAGE_COLLECTION).find(node=>node.id===id);
    }
    if(!item)item=null;
    return item;
});

export const getLoadingCatalogue = createSelector(fetchingCatalogue, (fetching)=>{
  return fetching;
});

export const getLoadingItems = createSelector(fetchingItems, (fetching)=>{
  return fetching;
});

export const getCrumbs = createSelector(breadcrumbs, (crumbs)=>{
  return crumbs;
});

export const getCrumbString = createSelector(breadcrumbs, (crumbs)=>{
  if(!crumbs){return "/"}
  let crumbArr = List(crumbs.map(crumb=>crumb.name));
  if(crumbArr.size>3){
    crumbArr = crumbArr.slice(0,1).push('...').concat(crumbArr.slice(-2));
  }
  return crumbArr.join("/")
});

export const getNodeMoving = createSelector(nodeMoving, (mov)=>{
  return mov;
});

export const getPaginationLimit = createSelector(localStorage, (storage=>{
  let limit = storage.get('pagination_limit');
  if(!limit){limit=20;}
  return limit;
}));

export const getFoundGarbageNodes = createSelector(foundGarbageNodes, (nodes)=>{
  return nodes;
})
