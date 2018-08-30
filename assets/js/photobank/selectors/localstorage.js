import {createSelector, createStructuredSelector} from 'reselect';
import {Map,List,Set,Record} from 'immutable';

export const localStorage = (store,props)=>store.localstorage.get('localstorage');
export const catalogueData = (store,props)=>store.catalogue.get('catalogue_data');
export const itemData = (store,props)=>store.catalogue.get('items');

export const getStoredNode = createSelector(localStorage, catalogueData, (storage, catalogue)=>{
  let nodeId = storage.get('current_node');
  return nodeId?nodeId:null;
});

export const getStoredItem = createSelector(localStorage, itemData, (storage, items)=>{
  let itemId = storage.get('current_item');
  let curItem = items.find(item=>item.id===itemId);
  return curItem?curItem:null;
});

export const getStoredItemId = createSelector(localStorage, (storage)=>{
  let itemId = storage.get('current_item');
  return itemId?itemId:null;
});

export const getStoredCatalogueViewtype = createSelector(localStorage, (storage)=>{
  let view = parseInt(storage.get('catalogue_view'),10);
  return view?view:null;
});

export const getStoredListViewtype = createSelector(localStorage, (storage)=>{
  let view = parseInt(storage.get('list_view_type'),10);
  return view;
});

export const getPendingDownloads = createSelector(localStorage, (storage)=>{
  let downloads = storage.get('pending_downloads');
  return downloads?downloads:[];
});

// export const getStoredDownloads = createSelector(localStorage, catalogueData, (storage, catalogue)=>{
//   let nodeId = storage.current_node;
//   let curNode = catalogue.find(node=>node.id===nodeId);
//   return curNode?curNode.id:null;
// });
