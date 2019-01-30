import { combineReducers } from 'redux';
import upload from './upload';
import catalogue from './catalogue';
import resource from './resource';
import localstorage from './localstorage';
import user from './user';

export default combineReducers({
  upload,
  catalogue,
  resource,
  localstorage,
  user
})
