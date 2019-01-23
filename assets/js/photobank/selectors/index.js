import {createSelector} from 'reselect';

export const unfinishedUploads = (store)=>store.upload.uploads_unfinished;
export const pendingUploads = (store)=>store.upload.uploads_pending;
export const currentItemId = (store)=>store.catalogue.current_item.id;
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

export const filterItems = createSelector(items,(items)=>{
  return items;
});
