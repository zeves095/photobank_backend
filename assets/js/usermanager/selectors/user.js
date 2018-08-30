import {createSelector, createStructuredSelector} from 'reselect';
import {Map,List,Set,Record} from 'immutable';

export const fetchedUsers = (store,props)=>store.user.get('users');
export const currentUserId = (store,props)=>store.user.get('current_user').id;

export const getUsers = createSelector(fetchedUsers, (users)=>{
  return users.toArray();
});

export const getActiveUsers = createSelector(fetchedUsers, (users)=>{
  return users.filter(user=>user.active).toArray();
});

export const getInactiveUsers = createSelector(fetchedUsers, (users)=>{
  return users.filter(user=>!user.active).toArray();
});

export const getCurrentUser = createSelector(fetchedUsers, currentUserId, (users, id)=>{
  return users.find(user=>user.id===id);
});
