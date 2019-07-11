import * as _ from 'lodash';

const decache = require('decache');

export class MarkdownToPDFEngine {
    private static instance: MarkdownToPDFEngine;

    private markedInstance;

    private convertedTokens = [];

    private constructor() {
        decache('marked');
        this.markedInstance = require('marked');

        const renderer = new this.markedInstance.Renderer();

        renderer.strong = text => {
            // console.log('MarkdownToPDFEngine strong: ', text);
            return { text: text, bold: true };
        };

        renderer.em = text => {
            // console.log('MarkdownToPDFEngine em: ', text);
            this.convertedTokens.push({ text: text, italics: true });
            return text;
        };

        renderer.paragraph = text => {
            // console.log('MarkdownToPDFEngine paragraph: ', text);
            return text;
        };

        // TODO Add custom parser... -> https://github.com/markedjs/marked/issues/504

        this.markedInstance.setOptions({
            renderer: renderer,
            gfm: true,
            breaks: false
        });
    }
    public static getInstance() {
        if (!MarkdownToPDFEngine.instance) {
            MarkdownToPDFEngine.instance = new MarkdownToPDFEngine();
        }
        return MarkdownToPDFEngine.instance;
    }

    public convert(stringToConvert: string) {
        this.convertedTokens = [];
        // console.log('MarkdownToPDFEngine convert: ', stringToConvert);
        const tokens = this.markedInstance.lexer(stringToConvert);
        // console.log(tokens);
        const pdfmakeData = this.markedInstance.Parser.parse(tokens);
        // console.log(this.convertedTokens);
        const result = {
            text: this.convertedTokens
        };
        return result;
    }
}

export default MarkdownToPDFEngine.getInstance();
