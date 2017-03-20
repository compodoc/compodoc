var expect = require('chai').expect;

describe('Compodoc page', function() {
    it('should get the title', function(done) {
        const title = browser.url('http://127.0.0.1:8383').getTitle();
        expect(title).to.equal('compodoc documentation');
    });
});
