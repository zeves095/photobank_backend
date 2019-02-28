/**
  * @TODO Вызовы NotificationService заменить на диспатч событий с FAIL и отрабатывать вызов NotificationService в middleware
  */

import {NotificationService} from '../../../services/NotificationService';
import {
  USER_INFO_FETCH,
  RESOURCE_PRESETS_FETCH,
  RESOURCE_TYPES_FETCH,
  LINK_CHOICE,
  LINK_ADD,
  LINK_STOP_EDITING,
  RESOURCE_SEARCH,
  RESOURCE_CHOICE,
  RESOURCE_THUMBNAIL,
  RESOURCE_ADD,
  RESOURCE_REMOVE,
  RESOURCE_REMOVE_ALL,
  LINK_FETCH,
  LINK_SUBMIT,
  LINK_DELETE,
  LINK_UPDATE,
  LINKS_TXT_DOWNLOAD,
  FORM_VALIDATE,
  START,
  SUCCESS,
  FAIL
} from '../constants';

/**
 * Действия при инициализации приложения. Получает типы ресурсов, типы пресетов и информацию о пользователе
 *
 */
export function init(){
  return (dispatch)=>{
    let params = {
      method: "GET",
    }
    let getPresets = fetch("/catalogue/resource/presets/", params)
    .then((response)=>response.json())
    .then((response)=>{
      dispatch({
        type: RESOURCE_PRESETS_FETCH+SUCCESS,
        payload: response,
      });
    }).catch((error)=>{
      dispatch({
        type: RESOURCE_PRESETS_FETCH+FAIL,
        payload: response,
      });
    });
    let getTypes = fetch("/catalogue/resource/types/", params)
    .then((response)=>response.json())
    .then((response)=>{
      dispatch({
        type: RESOURCE_TYPES_FETCH+SUCCESS,
        payload: response,
      });
    }).catch((error)=>{
      dispatch({
        type: RESOURCE_TYPES_FETCH+FAIL,
        payload: "",
      });
    });
    let getUserInfo = fetch("/account/getinfo/", params)
    .then((response)=>response.json())
    .then((response)=>{
      dispatch({
        type: USER_INFO_FETCH+SUCCESS,
        payload: response,
      });
    }).catch((error)=>{
      dispatch({
        type: USER_INFO_FETCH+FAIL,
        payload: "",
      });
    });
    return Promise.all([getPresets,getTypes,getUserInfo])
.then(()=>{
      dispatch(fetchLinks());
    });
  }
}

/**
 * Выбор ссылки для редактирования (не используется)
 * @param {Number} id Идентификатор ссылки
 */
export function chooseLink(id){
  return {
    type: LINK_CHOICE,
    payload: id
  }
}

/**
 * Начало создания новой ссылки
 */
export function addLink(){
  return {
    type: LINK_ADD,
    payload: ''
  }
}

/**
 * Прекражение процесса создания/редактирования ссылки
 */
export function stopEditing(){
  return {
    type: LINK_STOP_EDITING,
    payload: ''
  }
}

/**
 * Валидация формы для создания ссылки через сервер (не используется, см. js/common/utils/validation.js)
 * @see js/common/utils/validation.js
 * @param  {Object} formData Данные из формы
 */
export function validateLinkAddForm(formData){
  return (dispatch)=>{
    dispatch({
      type: FORM_VALIDATE+START,
      formData
    });
    let params = {
      method: "POST",
      body: JSON.stringify(formData)
    }
    fetch("/api/links/validateform/",params)
    .then((response)=>response.json())
    .then((response)=>{
        let message = response.error;
        if(message === ""){
          dispatch({
            type: FORM_VALIDATE+SUCCESS,
            payload: null
          });
        }else{
          dispatch({
            type: FORM_VALIDATE+SUCCESS,
            payload: message
          });
        }
    });
  }
}

/**
 * Получение пресетов типа thumbnail для списка ресурсов
 * @param  {int[]} resources Список ресурсов, для которых нужны превью
 */
export function getResourceThumbnails(resources){
  return (dispatch)=>{
    let request = {resources:[]};
    resources.forEach((resource)=>{
      request.resources.push(resource.id);
    });
    if(request.resources.length === 0){
      return false;
    }
    let params = {
      method: "POST",
      body: JSON.stringify(request)
    }
    return fetch("/catalogue/node/item/resource/thumbnails/",params)
    .then((response)=>response.json())
    .then((payload)=>{
        dispatch({
          type: RESOURCE_THUMBNAIL+SUCCESS,
          payload
        });
    }).catch((error)=>{
      dispatch({
        type: RESOURCE_THUMBNAIL+FAIL,
        payload
      });
      if(typeof error.error !== 'undefined'){
        NotificationService.throw("custom", error.error);
      }else{
        NotificationService.throw("thumbnail-error");
      }
    });
  }
}

/**
 * Отправляет на сервер запрос на поиск ресурсов
 * @param  {Object} searchObject={} Объект поискка
 */
export function searchResources(searchObject={}){
  return (dispatch)=>{
    dispatch({
      type: RESOURCE_SEARCH+START,
      payload: "",
    });
    let params = {
      method: "GET",
    }
    return fetch("/catalogue/search/resources"+"?"+Object.keys(searchObject).map(
      key=>{if(typeof searchObject[key] === 'undefined'){return "";}return key + '=' + searchObject[key]}).join('&'),
      params)
    .then((response)=>response.json())
    .then((response)=>{
      dispatch({
        type: RESOURCE_SEARCH+SUCCESS,
        payload: response,
      });
      dispatch(getResourceThumbnails(response));
    }).catch((error)=>{
      console.log(error);
      dispatch({
        type: RESOURCE_SEARCH+FAIL,
        payload: error,
      });
      if(typeof error.error !== 'undefined'){
        NotificationService.throw("custom", error.error);
      }else{
        NotificationService.throw("search-error");
      }
    });
  }
}

/**
 * Выбор ресурса для создания ссылки
 * @param  {Number} id Идентификатор ресурса для ссылки
 */
export function chooseResource(id){
  return{
    type: RESOURCE_CHOICE,
    payload: id
  }
}

/**
 * Добавить ресурс в список ресурсов для создания группы ссылок
 * @param {Number} id Идентификатор ресурса для ссылки
 */
export function addResourceToPool(id){
  return{
    type: RESOURCE_ADD,
    payload: id
  }
}

/**
 * Исключить ресурс из списка для создания группы ссылок
 * @param  {Number} id Идентификатор ресурса для удаления
 */
export function removeResourceFromPool(id){
  return{
    type: RESOURCE_REMOVE,
    payload: id
  }
}

/**
 * Очистить список ресурсов для добавления группы ссылок
 * @param  {Number} id Тут null что ли обычно?
 */
export function removeAllFromPool(id){
  return{
    type: RESOURCE_REMOVE_ALL,
    payload: id
  }
}

/**
 * Удалить ссылку
 * @param  {Number} id Идентификатор ссылки для удаления
 */
export function deleteLink(id){
  return (dispatch)=>{
    dispatch({
      type: LINK_DELETE+START,
      payload: "",
    });
    let params = {
      method: "GET",
    }
    return fetch("/api/links/delete/"+id, params)
    .then((response)=>response.json())
    .then((response)=>{
      dispatch({
        type: LINK_DELETE+SUCCESS,
        payload: response,
      });
    })
.then(()=>{
      return new Promise((resolve, reject)=>{
        setTimeout(()=>{dispatch(fetchLinks());resolve()},400);
      });
    }).catch((error)=>{
      dispatch({
        type: LINK_DELETE+FAIL,
        payload: response,
      });
      if(typeof error.error !== 'undefined'){
        NotificationService.throw("custom", error.error);
      }else{
        NotificationService.throw("link-delete-error");
      }
    });
  }
}

/**
 * Получить список ссылок для текущего пользователя
 */
export function fetchLinks(){
  return (dispatch)=>{
    dispatch({
      type: LINK_FETCH+START,
      payload: "",
    });
    let params = {
      method: "GET",
    }
    return fetch("/api/links/fetchall", params)
    .then((response)=>response.json())
    .then((response)=>{
      dispatch({
        type: LINK_FETCH+SUCCESS,
        payload: response,
      });
      let resources = response.map((link)=>{
        return {
          id:link.resource_id
        }
      })
      dispatch(getResourceThumbnails(resources));
    }).catch((error)=>{
      dispatch({
        type: LINK_FETCH+FAIL,
        payload: error,
      });
      if(typeof error.error !== 'undefined'){
        NotificationService.throw("custom", error.error);
      }else{
        NotificationService.throw("link-fetch-error");
      }
    });
  }
}

/**
 * Отправить форму для создания ссылки
 * @param  {Object} form Данные из формы
 */
export function submitLink(form){
  return (dispatch)=>{
    dispatch({
      type: LINK_SUBMIT+START,
      payload: "",
    });
    let params = {
      method: "POST",
      body: JSON.stringify(form)
    }
    return fetch("/api/links/submit", params)
    .then((response)=>{
      if(response.status === 200){
        dispatch({
          type: LINK_SUBMIT+SUCCESS,
          payload: form,
        });
        NotificationService.toast("link-added");
        return new Promise((resolve, reject)=>{
          setTimeout(()=>{dispatch(fetchLinks());resolve()},400);
        });
      }else{
          dispatch({
            type: LINK_SUBMIT+FAIL,
            payload: form,
          });
            NotificationService.throw("link-add-error");
      }
    }).catch((error)=>{
      dispatch({
        type: LINK_SUBMIT+FAIL,
        payload: error,
      });
        NotificationService.throw("link-add-error");
    });
  }
}

/**
 * Обновить запись о ссылке (не используется)
 * @param  {Object} form Данные формы
 * @param  {Number} link Идентификатор ссылки для обновления
 */
export function updateLink(form, link){
  return (dispatch)=>{
    form['id'] = link;
    let params = {
      method: "POST",
      body: JSON.stringify(form)
    }
    return fetch("/api/links/update/"+link, params)
.then((response)=>{
      if(response.status === 200){
        dispatch({
          type: LINK_UPDATE+SUCCESS,
          payload: form,
        });
        NotificationService.toast("link-updated");
        dispatch(fetchLinks());
      } else{
        dispatch({
          type: LINK_UPDATE+FAIL,
          payload: form,
        });
        if(typeof error.error !== 'undefined'){
          NotificationService.throw("custom", error.error);
        }else{
          NotificationService.throw("link-update-error");
        }
      }
    }).catch((error)=>{
      dispatch({
        type: LINK_UPDATE+FAIL,
        payload: form,
      });
      if(typeof error.error !== 'undefined'){
        NotificationService.throw("custom", error.error);
      }else{
        NotificationService.throw("link-update-error");
      }
    });
  }
}
