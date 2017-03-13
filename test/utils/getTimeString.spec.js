import getTimeString from '../../app/utils/getTimeString';

describe('getTimeString', () => {
    it('should take time in seconds and return an SRT compatible time string', () => {
        expect(getTimeString(1)).toBe('00:00:01,000');
        expect(getTimeString(60)).toBe('00:01:00,000');
        expect(getTimeString(65)).toBe('00:01:05,000');
        expect(getTimeString(65.5)).toBe('00:01:05,500');
        expect(getTimeString(65.25)).toBe('00:01:05,250');
        expect(getTimeString(3600)).toBe('01:00:00,000');
        expect(getTimeString(3665.25)).toBe('01:01:05,250');
    });
});