import { IfStringHelper } from './if-string.helper';
import { expect } from 'chai';

describe(IfStringHelper.name, () => {
    let helper: IfStringHelper;
    let options = {
        fn: () => 'fnCalled',
        inverse: () => 'inverseCalled'
    };

    beforeEach(() => {
        helper = new IfStringHelper();
    });

    describe('when input is string', () => {
        it('should call and return value of options.fn', () => {
            const result = helper.helperFunc(undefined, 'someString', options);
            expect(result).to.equal('fnCalled');
        });
    });

    describe('when input is not a string', () => {
        it('should call and return value of options.reverse', () => {
            const result = helper.helperFunc(undefined, 123, options);
            expect(result).to.equal('inverseCalled');
        });
    });
});
