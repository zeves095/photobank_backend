import {createSelector, createStructuredSelector} from 'reselect';
import {Map,List,Set,Record} from 'immutable';

export const unfinishedUploads = (store)=>store.upload.get('uploads_unfinished');
export const currentItemId = (store)=>store.catalogue.get('current_item');
export const currentNodeId = (store)=>store.catalogue.get('current_node');
export const items = (store)=>store.catalogue.get('items');
export const resumableContainer = (store)=>store.upload.get('resumable_container');

export const getResumableInstance = createSelector(resumableContainer, currentItemId, (container, id)=>{
  let resumable = container.find(resumable=>resumable.id===id);
  return resumable.instance.toObject();
});

export const getUploads = createSelector(getResumableInstance, (resumable)=>{
  return resumable.files;
});

export const getReadyUploads = createSelector(getResumableInstance, (resumable)=>{
  return resumable.files.length>0?resumable.files.filter(file=>file.ready):[];
});

export const resolveResumedUploads = createSelector(unfinishedUploads, getUploads, currentItemId, (unfinished, pending, item)=>{
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
