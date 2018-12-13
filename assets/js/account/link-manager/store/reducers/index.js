import { combineReducers } from 'redux'
import resourceReducer from './resource'
import userReducer from './user'
import linkReducer from './link'

export default combineReducers({
  resource: resourceReducer,
  link: linkReducer,
  user: userReducer
})
