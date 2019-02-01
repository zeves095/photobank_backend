import {createSelector, createStructuredSelector} from 'reselect';
import {Map,List,Set,Record} from 'immutable';

export const unfinishedUploads = (store, props)=>store.upload.get('uploads_unfinished');
export const currentItemId = (store, props)=>props.item_id||store.catalogue.get('current_item');
export const currentNodeId = (store, props)=>store.catalogue.get('current_node');
export const catalogueData = (store, props)=>store.catalogue.get('catalogue_data');
export const items = (store, props)=>store.catalogue.get('items');
export const resumableContainer = (store, props)=>store.upload.get('resumable_container');
export const fetchingCatalogue = (store, props)=>store.catalogue.get('fetching_catalogue');
export const fetchingItems = (store, props)=>store.catalogue.get('fetching_items');
export const breadcrumbs = (store, props)=>store.catalogue.get('crumbs');

export const getCatalogueData = createSelector(catalogueData,(catalogue)=>{
  return catalogue.toArray();
});

export const getCurrentNode = createSelector(currentNodeId,(node)=>{
  return node;
});

export const getNodeItems = createSelector(items, currentNodeId, (items, id)=>{
  let newItems = id!==null?items.filter(item=>item.node===id):items;
  return newItems.toArray();
});

export const filterItems = createSelector(getNodeItems, items, currentNodeId, (nodeItems, items, id)=>{
  return nodeItems;
});

export const getItemObject = createSelector(items, currentItemId, (items, id)=>{
  let item = items.find(item=>item.id===id);
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
