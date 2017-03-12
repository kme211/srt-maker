// @flow
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { hashHistory } from 'react-router';
import { routerMiddleware } from 'react-router-redux';
import rootReducer from '../reducers';
import type { fileType } from '../reducers/files';

const router = routerMiddleware(hashHistory);

const enhancer = applyMiddleware(thunk, router);

export default function configureStore(initialState?: fileType[]) {
  return createStore(rootReducer, initialState, enhancer); // eslint-disable-line
}
