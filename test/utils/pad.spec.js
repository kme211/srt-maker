import pad from '../../app/utils/pad';

describe('pad', () => {
    it('should return a string with leading zeroes', () => {
        expect(pad(1, 1)).toBe('1');
        expect(pad(1, 2)).toBe('01');
        expect(pad(1, 3)).toBe('001');
        expect(pad('1', 4)).toBe('0001');
    });
});