// @flow
import { ADD_FILES, UPDATE_FILE } from '../actions/files';

export type timingType = {text: string, startTime: string, endTime: string};
export type fileType = {filePath: string, timing: timingType[], id: string};

type actionType = {
  type: string
};

export default function files(state: fileType[] = [], action: actionType) {
  switch (action.type) {
    case ADD_FILES:
      return state.concat(action.files);
    case UPDATE_FILE: 
      const index = state.findIndex(file => file.id === action.updates.id);
      const file = state[index];
      
      return [
          ...state.slice(0, index),
          Object.assign({}, file, action.updates),
          ...state.slice(index + 1)
        ]
    default:
      return state;
  }
}
