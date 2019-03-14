import {createSelector, createStructuredSelector} from 'reselect';
import {Map,List,Set,Record} from 'immutable';

export const isAuthorized = (store,props)=>store.user.get('isAuthorized');
export const isAuthorizedGarbage = (store,props)=>store.user.get('isAuthorizedGarbage');

export const getAuthorized = createSelector(isAuthorized, (auth)=>{
  return auth;
});

export const getAuthorizedGarbage = createSelector(isAuthorizedGarbage, (auth)=>{
  return auth;
});
