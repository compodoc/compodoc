describe('Compodoc page', () => {
    it('should have a search bar, and handle results', async () => {
        await browser.url('http://localhost:4000/?q=exampleInput');
        await browser.pause(3000);
        const searchResults = await $$('.search-results-item');
        await expect(searchResults.length).toEqual(1);
    });

    it('should have a search bar, and handle results empty', async () => {
        await browser.url('http://localhost:4000/?q=waza');
        await browser.pause(3000);
        const searchResults = await $$('.search-results-item');
        await expect(searchResults.length).toEqual(0);
    });
});
