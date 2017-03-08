// @flow
import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import files from './files';

const rootReducer = combineReducers({
  files,
  routing
});

export default rootReducer;
