import { combineReducers } from 'redux'
import resourceReducer from './resource'
import linkReducer from './link'

export default combineReducers({
  resource: resourceReducer,
  link: linkReducer
})
