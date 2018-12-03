import {
  LINK_CHOICE,
  LINK_ADD,
  RESOURCE_SEARCH,
  RESOURCE_CHOICE,
  LINK_FETCH,
  LINK_SUBMIT
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

export function searchResources(searchObject={}){
  return{
    type: RESOURCE_SEARCH,
    payload: searchObject,
    meta:{
      api: {
        url: "/catalogue/search/resources",
        method: "GET"
      }
    }
  }
}

export function chooseResource(id){
  return{
    type: RESOURCE_CHOICE,
    payload: id
  }
}

export function fetchLinks(){
  return{
    type: LINK_FETCH,
    payload: "",
    meta:{
      api: {
        url:"/api/links/fetchall",
        method: "GET"
      }
    }
  }
}

export function submitLink(form){
  return{
    type: LINK_SUBMIT,
    payload: form,
    meta:{
      api: {
        url:"/api/links/submit",
        method: "POST"
      }
    }
  }
}
