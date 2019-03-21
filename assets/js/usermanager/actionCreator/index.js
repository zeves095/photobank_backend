import {UserService} from '../services/UserService';
import {NotificationService} from '../../services/NotificationService';
import utility from '../../photobank/services/UtilityService';

import {
  ADD_USER,
  FETCH_USERS,
  CHOOSE_USER,
  SUBMIT_USER,
  START,
  SUCCESS,
  FAIL
} from '../constants';

export function fetchUsers(){
  return dispatch=>{
    dispatch({
      type:FETCH_USERS+START,
      payload:""
    })
    return fetch(utility.config.user_get_url, {method:"GET"})
    .then(response=>{
      if(!response.ok){
        NotificationService.throw('users-fetch-fail');
      }else{
        return response.json()}
      })
    .then((users)=>{
      dispatch({
        type:FETCH_USERS+SUCCESS,
        payload:users
      })
    }).catch(e=>{
      dispatch({
        type:FETCH_USERS+FAIL,
        payload:""
      })
    });
  }
}

export function chooseUser(user){
  return dispatch=>{
    return dispatch({
      type:CHOOSE_USER,
      payload:user
    });
  }
}

export function addUser(users){
  return dispatch=>{
    let user = UserService.getBlankUser(users);
    return dispatch({
      type:ADD_USER,
      payload:user
    });
  }
}

export function submitUser(user){
  return dispatch=>{
    dispatch({
      type: SUBMIT_USER+START,
      payload: user.id
    });
    user.active = user.active?1:0;
    return fetch(utility.config.user_set_url, {method:"POST", body:JSON.stringify(user)})
    .then(result=>{
      if(result.ok){
        dispatch({
          type:SUBMIT_USER+SUCCESS,
          payload: user
        });
        NotificationService.toast('user-submit');
        dispatch(fetchUsers());
      }else{
        dispatch({
          type:SUBMIT_USER+FAIL,
          payload:""
        });
        NotificationService.throw('user-submit-fail');
      }
    }).catch(e=>{
      dispatch({
        type:SUBMIT_USER+FAIL,
        payload:""
      });
      NotificationService.throw('user-submit-fail');
    });
  }
}
