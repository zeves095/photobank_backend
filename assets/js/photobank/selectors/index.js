import {createSelector} from 'reselect';

export const unfinishedUploads = (store)=>store.upload.uploads_unfinished;
export const pendingUploads = (store)=>store.upload.uploads_pending;

export const resolveResumedUploads = createSelector(unfinishedUploads, pendingUploads, (unfinished, pending)=>{
  console.log(unfinished);
  let resolved = unfinished.filter((upload)=>{
    for(let i = 0; i<pending.length; i++){
      if(upload.file_name == pending[i].fileName && upload.file_hash == pending[i].uniqueIdentifier){
        return false;
      }
    }
    return true;
  });
  return resolved;
});
