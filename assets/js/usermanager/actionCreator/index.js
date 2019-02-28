import {UserService} from '../services/UserService';

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
    return UserService.fetchUsers()
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
      console.error(e);
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
    return UserService.submitUser(user)
.then(result=>{
      dispatch({
        type:SUBMIT_USER+SUCCESS,
        payload: user
      });
      dispatch(fetchUsers());
    }).catch(e=>{
      console.log(e);
      dispatch({
        type:SUBMIT_USER+FAIL,
        payload:""
      })
      console.error(e);
    });
  }
}
