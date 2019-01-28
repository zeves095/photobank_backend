import {Map, Set, List, Record} from 'immutable';

import {
  UPLOADS_UNFINISHED_FETCH,
  FILE_PROCESSED,
  RESUMABLE_PUSH,
  RESUMABLE_POP,
  UPLOAD_DELETE,
  DELETE_ALL_PENDING,
  DELETE_ALL_UNFINISHED,
  SUCCESS,
  FAIL
} from '../../constants'

import {
  UploadService
} from '../../services/';

let defaultState = Map({
  resumable_container: List([]),
  uploads_unfinished: List([]),
});

export default (upload = defaultState, action) => {
  upload = Map(upload);
  switch(action.type){
    case UPLOADS_UNFINISHED_FETCH+SUCCESS:{
      let uploads = List(action.payload);
      let container = List(upload.get('resumable_container'));
      let itemIds = Set(uploads.map(upload=>upload.id));
      itemIds.forEach((id)=>{
        container = container.push({
          id,
          instance:Map(new Resumable({target: window.config.upload_target_url}))
        });
      });
      return upload.set('resumable_container',container).set('uploads_unfinished',uploads);
      break;
    }
    case FILE_PROCESSED:{
      let fileParams = action.payload;
      let newFile = fileParams.file;
      Object.keys(fileParams).forEach((key)=>{
        if(key!=="file"){newFile[key] = fileParams[key]};
      });
      newFile.ready = true;
      let container = List(upload.get('resumable_container'));
      let resumable = container.find(resumable=>{return resumable.id===fileParams.itemId});
      let instance = resumable.instance;
      let files = instance.get('files');
      files.splice(files.indexOf(fileParams.file),1,newFile);
      instance.set('files',files);
      resumable.instance = instance;
      container = container.splice(container.indexOf(resumable),1);
      container = container.push(resumable);
      let resolved = upload.get('uploads_unfinished');
      resolved = resolved.filter((upload)=>upload.file_hash!==fileParams.file_hash);
      return upload.set('resumable_container',container).set('uploads_unfinished', resolved);
      break;
    }
    case RESUMABLE_PUSH:{
      let itemId = action.payload;
      let container = List(upload.get('resumable_container'));
      if(!container.find(resumable=>resumable.id===itemId)){
        container = container.push({
          id:itemId,
          instance: Map(new Resumable({target: window.config.upload_target_url}))
        });
      }
      return upload.set('resumable_container',container)
      break;
    }
    case RESUMABLE_POP:{
      let itemId = action.payload;
      let container = List(upload.get('resumable_container'));
      let resumable = container.find(resumable=>resumable.id===itemId);
      if(resumable){
        container = container.splice(container.indexOf(resumable),1);
      }
      return upload.set('resumable_container',container);
      break;
    }
    case UPLOAD_DELETE:{
      let filehash = action.payload.hash;
      let item = action.payload.item;
      let container = List(upload.get('resumable_container'));
      let resumable = container.find(resumable=>resumable.id===item);
      container = container.splice(container.indexOf(resumable),1);
      resumable.instance.get('files')
      .filter(file=>file.uniqueIdentifier===filehash)
      .forEach(file=>{
        let files = resumable.instance.get('files');
        files.splice(files.indexOf(file),1);
        resumable.instance.set('files', files);
      });
      let unfinished = upload.get('uploads_unfinished');
      let unfinishedIndex = unfinished.indexOf(unfinished.find((upload)=>upload.file_hash===filehash&&upload.id===item));
      if(unfinishedIndex>=0)unfinished = unfinished.splice(unfinishedIndex, 1);
      container = container.push(resumable);
      return upload.set('resumable_container',container).set('uploads_unfinished', unfinished);
    }
    case DELETE_ALL_PENDING:{
      let itemId = action.payload;
      let container = upload.resumable_container;
      let resumable = container.find(resumable=>resumable.id===itemId);
      container = container.splice(indexOf(resumable),1);
      resumable.files = [];
      container = container.push(resumable);
      return upload.set('resumable_container', container)
    }
    case DELETE_ALL_UNFINISHED:{
      let itemId = action.payload;
      let unfinished = upload.uploads_unfinished;
      unfinished = unfinished.filter(uploadUnfinished=>uploadUnfinished.id!==itemId);
      return upload.set('uploads_unfnished', unfinished)
    }
  }
  return upload
}
