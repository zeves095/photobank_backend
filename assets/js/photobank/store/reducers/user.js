import {Map, Set, List, Record} from 'immutable';

import {
  USER_INFO_FETCH,
  SUCCESS
 } from '../../constants'

let defaultState = Map({
  isAuthorized: Map({}),
})

export default (user = defaultState, action) => {
  user = Map(user);
  switch(action.type){
    case USER_INFO_FETCH+SUCCESS:{
      const user_info = Map(action.payload);
      const roles = user_info.get('user_roles');
      const authorized = roles.includes("ROLE_ADMIN")||roles.includes("ROLE_SUPER_ADMIN")||roles.includes("ROLE_WRITER");
      return user.set('isAithorized',authorized);
      break;
    }
  }
  return user
}
