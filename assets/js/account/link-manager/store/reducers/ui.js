import {
  RESOURCE_SEARCH,
  RESOURCE_THUMBNAIL,
  LINK_FETCH,
  LINK_SUBMIT,
  LINK_DELETE,
  FORM_VALIDATE,
  START,
  SUCCESS,
  FAIL
 } from '../../constants'

let defaultState = {
  loading:{
    link_list:false,
    resource_search_results: false
  },
  form:{
    resource_search:{
      error: null
    },
    link_add:{
      error: null
    }
  }
}

export default (ui = defaultState, action) => {
  let loading = ui.loading;
  let form = ui.form;
  switch(action.type){
    case FORM_VALIDATE+SUCCESS:
      form.link_add.error = action.payload;
      form = Object.assign({}, form);
      return {...ui, form};
      break;
    case RESOURCE_SEARCH+START:
      loading.resource_search_results = true;
      loading = Object.assign({}, loading);
      return {...ui, loading}
      break;
    case LINK_FETCH+START:
      loading.link_list = true;
      loading = Object.assign({}, loading);
      return {...ui, loading}
      break;
    case LINK_SUBMIT+START:
      loading.link_list = true;
      loading = Object.assign({}, loading);
      return {...ui, loading}
      break;
    case LINK_DELETE+START:
      loading.link_list = true;
      loading = Object.assign({}, loading);
      return {...ui, loading}
      break;
    case RESOURCE_SEARCH+SUCCESS:
      loading.resource_search_results = false;
      loading = Object.assign({}, loading);
      return {...ui, loading}
      break;
    case LINK_FETCH+SUCCESS:
      loading.link_list = false;
      loading = Object.assign({}, loading);
      return {...ui, loading}
      break;
    case LINK_SUBMIT+SUCCESS:
      loading.link_list = false;
      loading = Object.assign({}, loading);
      return {...ui, loading}
      break;
    case LINK_DELETE+SUCCESS:
      loading.link_list = false;
      loading = Object.assign({}, loading);
      return {...ui, loading}
    case RESOURCE_SEARCH+FAIL:
      loading.resource_search_results = false;
      loading = Object.assign({}, loading);
      return {...ui, loading}
      break;
    case LINK_FETCH+FAIL:
      loading.link_list = false;
      loading = Object.assign({}, loading);
      return {...ui, loading}
      break;
    case LINK_SUBMIT+FAIL:
      loading.link_list = false;
      loading = Object.assign({}, loading);
      return {...ui, loading}
      break;
    case LINK_DELETE+FAIL:
      loading.link_list = false;
      loading = Object.assign({}, loading);
      return {...ui, loading}
      break;
  }
  return ui
}
