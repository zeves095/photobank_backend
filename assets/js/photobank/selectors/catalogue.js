import {createSelector, createStructuredSelector} from 'reselect';
import {Map,List,Set,Record} from 'immutable';

export const unfinishedUploads = (store)=>store.upload.get('uploads_unfinished');
export const currentItemId = (store)=>store.catalogue.get('current_item');
export const currentNodeId = (store)=>store.catalogue.get('current_node');
export const catalogueData = (store)=>store.catalogue.get('catalogue_data');
export const items = (store)=>store.catalogue.get('items');
export const resumableContainer = (store)=>store.upload.get('resumable_container');

export const getCatalogueData = createSelector(catalogueData,(catalogue)=>{
  return catalogue.toArray();
});

export const getCurrentNode = createSelector(currentNodeId,(node)=>{
  return node;
});

export const getNodeItems = createSelector(items, currentNodeId, (items, id)=>{
  let newItems = items.filter(item=>item.node===id);
  return newItems.toArray();
});

export const filterItems = createSelector(getNodeItems, items, currentNodeId, (nodeItems, items, id)=>{
  return nodeItems;
});

export const getItemObject = createSelector(items, currentItemId, (items, id)=>{
  let item = items.find(item=>item.id===id);
  return item;
});
