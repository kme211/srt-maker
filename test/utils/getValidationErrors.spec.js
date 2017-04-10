import getValidationErrors from '../../app/utils/getValidationErrors';

describe('getValidationErrors', () => {
    describe('startTime', () => {
        const timing = [{
            text: 'some text',
            id: 'someid',
            startTime: '00:00:00,309',
            endTime: '00:00:02,240',
            startTimeSeconds: 0.309333,
            endTimeSeconds: 2.24
        }, {
            text: 'some other text',
            id: 'someotherid',
            startTime: 'not set',
            endTimeSeconds: 5.4,
            endTime: '00:00:05,400'
        }];

        const currentTimingIndex = 1;
        const timeType = 'startTime';

        it('should return an empty array if the position passed is greater than the previous endTimeSeconds', () => {
            expect(getValidationErrors(timing, currentTimingIndex, 2.5, timeType)).toEqual([]);
        })

        it('should return an empty array if the position passed is equal to the previous endTimeSeconds', () => {
            expect(getValidationErrors(timing, currentTimingIndex, 2.24, timeType)).toEqual([]);
        })

        it('should return the appropriate error for when the position passed is less than the previous endTimeSeconds', () => {
            const expectedError  = { id: 2, button: timeType, msg: 'Start time cannot be less than previous block\'s end time' };
            expect(getValidationErrors(timing, currentTimingIndex, 2.2, timeType)).toEqual([expectedError]);
        });

        it('should return the appropriate error for when the position passed is equal to the current endTimeSeconds', () => {
            const expectedError = { id: 0, button: timeType, msg: 'Start time and end time cannot be equal.' };
            expect(getValidationErrors(timing, currentTimingIndex, 5.4, timeType)).toEqual([expectedError]);
        });
    });

    describe('endTime', () => {
        const timing = [{
            text: 'some text',
            id: 'someid',
            startTime: '00:00:00,309',
            endTime: '00:00:02,240',
            startTimeSeconds: 0.309333,
            endTimeSeconds: 2.24
        }, {
            text: 'some other text',
            id: 'someotherid',
            startTime: '00:00:02,240',
            startTimeSeconds: 2.24,
            endTime: 'not set'
        }, {
            text: 'some more text',
            id: 'someotherid2',
            startTime: '00:00:10,240',
            startTimeSeconds: 10.24,
            endTime: '00:00:20,240',
            endTimeSeconds: 20.24
        }];

        const currentTimingIndex = 1;
        const timeType = 'endTime';

        it('should return an empty array if passed position is equal to next startTimeSeconds', () => {
            expect(getValidationErrors(timing, currentTimingIndex, 10.24, timeType)).toEqual([]);
        });

        it('should return an empty array if passed position is less than next startTimeSeconds', () => {
            expect(getValidationErrors(timing, currentTimingIndex, 9.00, timeType)).toEqual([]);
        });

        it('should return the appropriate error for when the position passed is greater than the next startTimeSeconds', () => {
            const expectedError = { id: 4, button: timeType, msg: 'End time cannot be more than next block\'s start time' };
            expect(getValidationErrors(timing, currentTimingIndex, 10.25, timeType)).toEqual([expectedError]);
        });

        it('should return the appropriate error for when the position passed is equal to the current startTimeSeconds', () => {
            const expectedError = { id: 0, button: timeType, msg: 'Start time and end time cannot be equal.' };
            expect(getValidationErrors(timing, currentTimingIndex, 2.24, timeType)).toEqual([expectedError]);
        });
    });
});