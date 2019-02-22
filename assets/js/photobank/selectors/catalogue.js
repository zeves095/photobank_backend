import {createSelector, createStructuredSelector} from 'reselect';
import {Map,List,Set,Record} from 'immutable';

export const unfinishedUploads = (store, props)=>store.upload.get('uploads_unfinished');
export const currentItemId = (store, props)=>props.item_id||store.catalogue.get('current_item');
export const currentNodeId = (store, props)=>store.catalogue.get('current_node');
export const currentgarbageNodeId = (store, props)=>store.catalogue.get('current_garbage_node');
export const catalogueData = (store, props)=>store.catalogue.get('catalogue_data');
export const items = (store, props)=>store.catalogue.get('items');
export const resumableContainer = (store, props)=>store.upload.get('resumable_container');
export const fetchingCatalogue = (store, props)=>store.catalogue.get('fetching_catalogue');
export const fetchingItems = (store, props)=>store.catalogue.get('fetching_items');
export const breadcrumbs = (store, props)=>store.catalogue.get('crumbs');
// export const collectionType = (store, props)=>store.catalogue.get('collection_type');
export const localStorage = (store, props)=>store.localstorage.get('localstorage');
export const collectionType = (store, props)=>localStorage(store,props).get('collection_type')||store.catalogue.get('collection_type');
export const nodeMoving = (store,props)=>store.catalogue.get('moving_node');

export const getCatalogueData = createSelector(catalogueData, collectionType,(catalogue, type)=>{
  const cat_data = catalogue.get(type);
  return cat_data.toArray();
});

export const getCurrentNode = createSelector(currentNodeId, currentgarbageNodeId, collectionType, localStorage, (node, garbage_node, type, storage)=>{
  let result = type==0?node:garbage_node;
  if(!result){
    result = type==0?storage.get('current_node'):storage.get('current_garbage_node');
  }
  return result;
});

export const getCurrentNodeParent = createSelector(getCurrentNode, getCatalogueData, (cur_node, data)=>{
  let parent = data.find(node=>cur_node===node.id);
  return parent?parent.parent:null;
});

export const getNodeItems = createSelector(items, currentNodeId, (items, id)=>{
  let newItems = id!==null?items.filter(item=>item.node===id):items;
  return newItems.toArray();
});

export const filterItems = createSelector(getNodeItems, items, currentNodeId, (nodeItems, items, id)=>{
  return nodeItems;
});

export const getItemObject = createSelector(items, catalogueData, currentItemId, currentgarbageNodeId, collectionType, (items, cat, id, garbageId, type)=>{
  let item = type==0
  ?items.find(item=>item.id===id)
  :cat.get(type).find(node=>node.id===garbageId);
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

export const getCollectionType = createSelector(collectionType, (type)=>{
  return type;
});

export const getNodeMoving = createSelector(nodeMoving, (mov)=>{
  return mov;
});
