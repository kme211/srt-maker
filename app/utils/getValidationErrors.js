import { timingType } from '../reducers/files.js';

const VALIDATION_ERROR_MESSAGES = [
    'Start time and end time cannot be equal.',                  // id 0
    'Start time cannot be greater than the end time.',           // id 1
    'Start time cannot be less than previous block\'s end time', // id 2
    'End time cannot be less than start time.',                  // id 3
    'End time cannot be more than next block\'s start time'      // id 4
];

function createValidationError(button: string, id: number) {
    return { id, button, msg: VALIDATION_ERROR_MESSAGES[id] };
}

function getValidationErrors(timing: timingType[], currentTimingIndex: number, currentPos: number, timeType: string) {
    const validationErrors = [];
    const currentBlock = timing[currentTimingIndex];
    const lastTimingIndex = timing.length - 1;
    let prevBlock;
    let nextBlock;
    if(currentTimingIndex > 0) prevBlock = timing[currentTimingIndex - 1];
    if(currentTimingIndex < lastTimingIndex) nextBlock = timing[currentTimingIndex + 1];
    const currentEndTime = +currentBlock.endTimeSeconds;
    const currentStartTime = +currentBlock.startTimeSeconds;
    const createError = createValidationError.bind(null, timeType);
    if(timeType === 'startTime') {
        if(currentEndTime >= 0) {
            if(currentPos === currentEndTime) validationErrors.push(createError(0));
            if(currentPos > currentEndTime) validationErrors.push(createError(1));
        }
        if(prevBlock && prevBlock.endTimeSeconds && currentPos < prevBlock.endTimeSeconds) validationErrors.push(createError(2));
    } else if(timeType ===  'endTime') {
        if(currentStartTime >= 0) {
            if(currentPos === currentStartTime) validationErrors.push(createError(0));
            if(currentPos < currentStartTime) validationErrors.push(createError(3));
        }
        if(nextBlock && nextBlock.startTimeSeconds && currentPos > nextBlock.startTimeSeconds) validationErrors.push(createError(4));
    }
    return validationErrors;
}

export default getValidationErrors;