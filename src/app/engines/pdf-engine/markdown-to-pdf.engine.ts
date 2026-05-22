const decache = require('decache');

export class MarkdownToPDFEngine {
    private static instance: MarkdownToPDFEngine;

    private markedInstance;

    private convertedTokens = [];

    private constructor() {
        decache('marked');
        const { marked } = require('marked');
        this.markedInstance = marked;

        const self = this;
        this.markedInstance.use({
            gfm: true,
            breaks: false,
            renderer: {
                strong(token) {
                    return { text: token.text, bold: true };
                },
                em(token) {
                    self.convertedTokens.push({ text: token.text, italics: true });
                    return token.text;
                },
                paragraph(token) {
                    return token.text;
                }
            }
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
        // const pdfmakeData = this.markedInstance.Parser.parse(tokens);
        // console.log(this.convertedTokens);
        const result = {
            text: this.convertedTokens
        };
        return result;
    }
}

export default MarkdownToPDFEngine.getInstance();
