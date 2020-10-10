describe('Compodoc page', () => {
    it('should have a search bar, and handle results', async () => {
        await browser.url('http://localhost:4000/components/FooComponent.html');
        const searchBoxes = await $$("//*[@id='book-search-input']/input");
        const searchBox = searchBoxes[1];
        await searchBox.click();
        await searchBox.setValue('exampleInput');
        await browser.pause(2000);
        const searchValue = await searchBox.getValue();
        await expect(searchValue).toMatch('exampleInput');
        const searchResults = await $$('.search-results-item');
        await expect(searchResults.length).toEqual(1);
    });

    it('should have a search bar, and handle results empty', async () => {
        await browser.url('http://localhost:4000/components/FooComponent.html');
        const searchBoxes = await $$("//*[@id='book-search-input']/input");
        const searchBox = searchBoxes[1];
        await searchBox.click();
        await searchBox.setValue('waza');
        await browser.pause(2000);
        const searchValue = await searchBox.getValue();
        await expect(searchValue).toMatch('waza');
        const searchResults = await $$('.search-results-item');
        await expect(searchResults.length).toEqual(0);
    });
});
