import {
  LINK_CHOICE,
  LINK_ADD,
  LINK_SUBMIT,
  LINK_FETCH,
  LINK_DELETE,
  SUCCESS,
  FAIL
 } from '../../constants'

let mockData = {
  links_done: [
    {
      id:1,
      external_url:"123/123/123/123",
      max_requests:1,
      done_requests:0
    },
    {
      id:2,
      external_url:"123/123/123/124",
      max_requests:1,
      done_requests:0
    }
  ],
  link_editing: false,
}

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
