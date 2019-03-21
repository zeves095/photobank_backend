import {
  USER_INFO_FETCH,
  SUCCESS
 } from '../../constants'

let defaultState = {
  isAdmin: false
}

export default (user = defaultState, action) => {
  switch(action.type){
    case USER_INFO_FETCH+SUCCESS:
      let roles = action.payload.user_roles;
      let isAdmin = roles.includes("ROLE_ADMIN")||roles.includes("ROLE_SUPER_ADMIN");
      return {...user, isAdmin}
      break;
  }
  return user
}
