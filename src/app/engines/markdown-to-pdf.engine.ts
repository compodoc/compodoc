import * as _ from 'lodash';

export class MarkdownToPDFEngine {
    private static instance: MarkdownToPDFEngine;
    private markedInstance = require('marked');
    private renderer;
    private constructor() {
        // console.log('MarkdownToPDFEngine');

        this.renderer = new this.markedInstance.Renderer();

        this.renderer.strong = text => {
            console.log('MarkdownToPDFEngine strong: ', text);
            return { text: text, bold: true };
        };

        this.renderer.paragraph = function(text) {
            console.log('MarkdownToPDFEngine paragraph: ', text);
            return text;
        };

        // TODO Add custom parser... -> https://github.com/markedjs/marked/issues/504

        this.markedInstance.setOptions({
            gfm: false,
            breaks: false
        });
    }
    public static getInstance() {
        if (!MarkdownToPDFEngine.instance) {
            MarkdownToPDFEngine.instance = new MarkdownToPDFEngine();
        }
        return MarkdownToPDFEngine.instance;
    }

    public convert(data) {
        // console.log('MarkdownToPDFEngine convert');
        /*const tokens = this.markedInstance.lexer('**This is bold text**');
        console.log(tokens);
        const html = this.markedInstance.parser(tokens);
        console.log(html);*/
        return this.markedInstance(data); // '**This is bold text**', { renderer: this.renderer });
    }
}

export default MarkdownToPDFEngine.getInstance();
