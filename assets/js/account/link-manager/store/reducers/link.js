import {
  LINK_CHOICE,
  LINK_ADD,
  LINK_SUBMIT,
  LINK_FETCH,
  LINK_DELETE,
  LINK_UPDATE,
  LINK_STOP_EDITING,
  SUCCESS,
  FAIL
 } from '../../constants'

let defaultState = {
  links_done: [],
  link_adding:null,
  link_editing: false,
  link_editing_id:null
}

export default (link = defaultState, action) => {
  switch(action.type){
    case LINK_CHOICE:
      return {...link, link_editing:true, link_editing_id:action.payload, link_adding:false}
      break;
    case LINK_ADD:
      return {...link, link_adding:true, link_editing:false, link_editing_id:null}
      break;
    case LINK_STOP_EDITING:
      return {...link, link_adding:false, link_editing:false, link_editing_id:null}
      break;
    case LINK_FETCH+SUCCESS:
      return {...link, links_done:action.payload}
      break;
  }
  return link
}
