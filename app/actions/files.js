// @flow
import type { editorStateType } from '../reducers/files';

export const ADD_FILES = 'ADD_FILES';
export const UPDATE_FILE = 'UPDATE_FILE';

export function addFiles(files) {
  return {
    type: ADD_FILES,
    files
  };
}

export function updateFile(updates) {
  return {
    type: UPDATE_FILE,
    updates
  };
}

