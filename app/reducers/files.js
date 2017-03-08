// @flow
import { ADD_FILES } from '../actions/files';

export type fileType = {filePath: string, timing: []};

type actionType = {
  type: string
};

export default function files(state: fileType[] = [], action: actionType) {
  console.log('files reducer', action)
  switch (action.type) {
    case ADD_FILES:
      return state.concat(action.files.map((filePath) => {
          return {
              filePath,
              timing: []
          }
      }));
    default:
      return state;
  }
}
