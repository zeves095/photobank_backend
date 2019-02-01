import {createSelector, createStructuredSelector} from 'reselect';
import {Map,List,Set,Record} from 'immutable';

export const isAuthorized = (store,props)=>store.user.get('isAuthorized');

export const getAuthorized = createSelector(isAuthorized, (auth)=>{
  return auth;
})
