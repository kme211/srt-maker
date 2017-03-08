// @flow
import type { editorStateType } from '../reducers/files';

export const ADD_FILES = 'ADD_FILES';

export function addFiles(files) {
  console.log('addFiles action', files)
  return {
    type: ADD_FILES,
    files
  };
}

