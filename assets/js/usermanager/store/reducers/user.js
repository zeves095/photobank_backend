import {Map,List,Set,Record} from 'immutable';

import {
  ADD_USER,
  FETCH_USERS,
  CHOOSE_USER,
  SUBMIT_USER,
  START,
  SUCCESS,
  FAIL
} from '../../constants';

let defaultState = Map({
  users: List(),
  current_user: Map()
})

export default (user=defaultState, action)=>{
  user = Map(user);
  switch(action.type){
    case FETCH_USERS+SUCCESS:{
      return user.set('users',List(action.payload));
      break;
    }
    case CHOOSE_USER:{
      let chosen_user = user.get('users').find(user=>user.id===action.payload)
      return user.set('current_user', chosen_user);
      break;
    }
    case ADD_USER:{
      let added_user = action.payload;
      let users = user.get('users').push(added_user);
      return user.set('current_user', added_user).set('users',users);
      break;
    }
  }
  return user;
}
