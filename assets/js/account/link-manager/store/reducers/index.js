import { combineReducers } from 'redux';
import resourceReducer from './resource';
import userReducer from './user';
import linkReducer from './link';
import uiReducer from './ui';

export default combineReducers({
  resource: resourceReducer,
  link: linkReducer,
  user: userReducer,
  ui: uiReducer
})
