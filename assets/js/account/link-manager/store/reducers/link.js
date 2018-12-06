import {
  LINK_CHOICE,
  LINK_ADD,
  LINK_SUBMIT,
  LINK_FETCH,
  LINK_DELETE,
  SUCCESS,
  FAIL
 } from '../../constants'

let defaultState = {
  links_done: [],
  link_editing: false,
}

export default (link = defaultState, action) => {
  switch(action.type){
    case LINK_CHOICE:
      break;
    case LINK_ADD:
      return {...link, link_editing:true}
      break;
    case LINK_FETCH+SUCCESS:
      return {...link, links_done:action.payload}
      break;
  }
  return link
}
