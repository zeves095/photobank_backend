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
  let view = storage.get('catalogue_view');
  return view?view:null;
});

export const getStoredListViewtype = createSelector(localStorage, (storage)=>{
  let view = storage.get('list_view_type');
  return view?view:null;
});

// export const getStoredDownloads = createSelector(localStorage, catalogueData, (storage, catalogue)=>{
//   let nodeId = storage.current_node;
//   let curNode = catalogue.find(node=>node.id===nodeId);
//   return curNode?curNode.id:null;
// });
