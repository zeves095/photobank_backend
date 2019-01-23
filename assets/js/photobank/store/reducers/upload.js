import {
  UPLOADS_UNFINISHED_FETCH,
  SUCCESS,
  FAIL
 } from '../../constants'

 import {
   UploadService
 } from '../../services/';

let defaultState = {
  resumable_container: [],
  uploads_unfinished: [],
  uploads_pending: [],
}

export default (upload = defaultState, action) => {
  switch(action.type){
    case UPLOADS_UNFINISHED_FETCH+SUCCESS:
      const uploads = action.payload;
      const newResContainer = UploadService.populateResumableContainer(resumableContainer, uploads);
      return {...upload, resumbale_container:newResContainer, uploads_unfinished:action.payload}
      break;
  }
  return upload
}
