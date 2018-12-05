import {NotificationService} from '../../../services/NotificationService';
import {
  LINK_CHOICE,
  LINK_ADD,
  RESOURCE_SEARCH,
  RESOURCE_CHOICE,
  RESOURCE_THUMBNAIL,
  RESOURCE_ADD,
  RESOURCE_REMOVE,
  LINK_FETCH,
  LINK_SUBMIT,
  SUCCESS,
  FAIL
} from '../constants';

export function chooseLink(id){
  return {
    type: LINK_CHOICE,
    payload: id
  }
}

export function addLink(){
  return {
    type: LINK_ADD,
    payload: ''
  }
}

// export function getResourceThumbnails(resources){
//   return (dispatch)=>{
//     let params = {
//       method: "GET",
//     }
//     resources.forEach((resource)=>{
//       fetch("/catalogue/node/item/resource/thumbnail/"+resource.gid,params)
//       .then((response)=>response.json())
//       .then((response)=>{
//           dispatch({
//             type: RESOURCE_THUMBNAIL+SUCCESS,
//             payload: {
//                 'id':resource.id,
//                 'thumbnail_id':response.id
//             },
//           });
//       }).catch((error)=>{
//         console.error(error);
//         }
//       );
//     });
//   }
// }

export function getResourceThumbnails(resources){
  return (dispatch)=>{
    let request = {resources:[]};
    resources.forEach((resource)=>{
      request.resources.push({
        id: resource.id,
        gid: resource.gid
      });
    });
    let params = {
      method: "POST",
      body: JSON.stringify(request)
    }
    fetch("/catalogue/node/item/resource/thumbnails/",params)
    .then((response)=>response.json())
    .then((payload)=>{
      console.warn(payload);
        dispatch({
          type: RESOURCE_THUMBNAIL+SUCCESS,
          payload
        });
    }).catch((error)=>{
      dispatch({
        type: RESOURCE_THUMBNAIL+FAIL,
        payload
      });
      NotificationService.throw("thumbnail-error");
    });
  }
}

export function searchResources(searchObject={}){
  return (dispatch)=>{
    let params = {
      method: "GET",
    }
    Object.keys(searchObject).forEach((key)=>{
      searchObject[key] = searchObject[key].toLowerCase();
    });
    fetch("/catalogue/search/resources"+"?"+Object.keys(searchObject).map(key=>key + '=' + searchObject[key]).join('&'), params)
    .then((response)=>response.json())
    .then((response)=>{
      dispatch({
        type: RESOURCE_SEARCH+SUCCESS,
        payload: response,
      });
      dispatch(getResourceThumbnails(response));
    }).catch(()=>{
      dispatch({
        type: RESOURCE_SEARCH+FAIL,
        payload: response,
      });
      NotificationService.throw("search-error");
    });
  }
}

export function chooseResource(id){
  return{
    type: RESOURCE_CHOICE,
    payload: id
  }
}

export function addResourceToPool(id){
  return{
    type: RESOURCE_ADD,
    payload: id
  }
}

export function removeResourceFromPool(id){
  return{
    type: RESOURCE_REMOVE,
    payload: id
  }
}

export function fetchLinks(){
  return (dispatch)=>{
    let params = {
      method: "GET",
    }
    fetch("/api/links/fetchall", params)
    .then((response)=>response.json())
    .then((response)=>{
      dispatch({
        type: LINK_FETCH+SUCCESS,
        payload: response,
      });
    }).catch(()=>{
      dispatch({
        type: LINK_FETCH+FAIL,
        payload: response,
      });
      NotificationService.throw("link-fetch-error");
    });
  }
}

export function submitLink(form){
  return (dispatch)=>{
    let params = {
      method: "POST",
      body: JSON.stringify(form)
    }
    fetch("/api/links/submit", params).then((response)=>{
      if(response.status === 200){
        dispatch({
          type: LINK_SUBMIT+SUCCESS,
          payload: form,
        });
        NotificationService.toast("link-added");
        dispatch(fetchLinks());
      } else{
        dispatch({
          type: LINK_SUBMIT+FAIL,
          payload: form,
        });
        NotificationService.throw("link-add-error");
      }
    }).catch(()=>{
      dispatch({
        type: LINK_SUBMIT+FAIL,
        payload: form,
      });
      NotificationService.throw("link-add-error");
    });
  }
}
