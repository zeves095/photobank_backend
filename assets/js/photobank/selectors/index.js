import {createSelector} from 'reselect';

export const unfinishedUploads = (store)=>store.upload.uploads_unfinished;
export const pendingUploads = (store)=>store.upload.uploads_pending;
export const currentItemId = (store)=>store.catalogue.current_item;
export const currentNodeId = (store)=>store.catalogue.current_node;
export const items = (store)=>store.catalogue.items;

export const resolveResumedUploads = createSelector(unfinishedUploads, pendingUploads, currentItemId, (unfinished, pending, item)=>{
  let resolved = unfinished.filter((upload)=>{
    if(upload.id!==item)return false;
    for(let i = 0; i<pending.length; i++){
      if((upload.file_name == pending[i].fileName && upload.file_hash == pending[i].uniqueIdentifier)){
        return false;
      }
    }
    return true;
  });
  return resolved;
});

export const getNodeItems = createSelector(items, currentNodeId, (items, id)=>{
  let newItems = items.filter(item=>{console.log(item.node,id);return item.node===id}).slice();
  console.log("newItems",newItems);
  return newItems;
});

export const filterItems = createSelector(getNodeItems, items, currentNodeId, (nodeItems, items, id)=>{
  console.log("nodeItems",nodeItems);
  return nodeItems;
});

export const getItemObject = createSelector(items, currentItemId, (items, id)=>{
  if(!Array.isArray(items)){return {}}
  let item = items.find(item=>item.id===id);
  return item;
});
