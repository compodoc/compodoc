import { expect } from 'chai';
import * as sinon from 'sinon';
import MarkdownEngine from '../../../src/app/engines/markdown.engine';
import FileEngine from '../../../src/app/engines/file.engine';

describe('Engines - MarkdownEngine', () => {
    let getSyncStub: sinon.SinonStub;

    beforeEach(() => {
        getSyncStub = sinon.stub(FileEngine, 'getSync');
    });

    afterEach(() => {
        getSyncStub.restore();
    });

    describe('heading anchors', () => {
        it('should add an id attribute derived from the heading text', () => {
            getSyncStub.returns('# Getting Started\n\nSome content.');

            const html = MarkdownEngine.getTraditionalMarkdownSync('doc');

            expect(html).to.contain('<h1 id="getting-started">Getting Started</h1>');
        });

        it('should disambiguate duplicate headings within the same document', () => {
            getSyncStub.returns('## Setup\n\nFirst.\n\n## Setup\n\nSecond.');

            const html = MarkdownEngine.getTraditionalMarkdownSync('doc');

            expect(html).to.contain('<h2 id="setup">Setup</h2>');
            expect(html).to.contain('<h2 id="setup-1">Setup</h2>');
        });

        it('should not carry over slugs between separately rendered documents', () => {
            getSyncStub.returns('# Intro\n');
            const first = MarkdownEngine.getTraditionalMarkdownSync('doc-a');

            getSyncStub.returns('# Intro\n');
            const second = MarkdownEngine.getTraditionalMarkdownSync('doc-b');

            expect(first).to.contain('<h1 id="intro">Intro</h1>');
            expect(second).to.contain('<h1 id="intro">Intro</h1>');
        });
    });
});
