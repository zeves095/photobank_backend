import { combineReducers } from 'redux';
import upload from './upload';
import catalogue from './catalogue';

export default combineReducers({
  upload,
  catalogue
})
