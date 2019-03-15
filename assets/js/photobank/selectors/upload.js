import {createSelector, createStructuredSelector} from 'reselect';
import {Map,List,Set,Record} from 'immutable';

export const unfinishedUploads = (store,props)=>store.upload.get('uploads_unfinished');
export const currentItemId = (store,props)=>props.item_id||(store.catalogue.get('collection_type')===0?(store.catalogue.get('current_item')):store.catalogue.get('current_garbage_node'));
export const currentNodeId = (store,props)=>store.catalogue.get('current_node');
export const items = (store,props)=>store.catalogue.get('items');
export const resumableContainer = (store,props)=>store.upload.get('resumable_container');

export const getResumableInstance = createSelector(resumableContainer, currentItemId, (container, id)=>{
  let resumable = container.find(resumable=>resumable.get('id')===id);
  return resumable?resumable.get('instance').toObject():null;
})

export const getResumableContainer = createSelector(resumableContainer, (container)=>{
  let newContainer = List(container).toJS();
  return newContainer;
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
