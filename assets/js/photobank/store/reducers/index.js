import { combineReducers } from 'redux';
import upload from './upload';
import catalogue from './catalogue';
import resource from './resource';

export default combineReducers({
  upload,
  catalogue,
  resource,
  resumable_container
})
