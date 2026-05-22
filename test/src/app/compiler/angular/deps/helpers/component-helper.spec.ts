import { expect } from 'chai';
import { Project, SyntaxKind, ts } from 'ts-morph';
import * as sinon from 'sinon';
import {
    ComponentHelper,
    ComponentCache
} from '../../../../../../../src/app/compiler/angular/deps/helpers/component-helper';
import { ClassHelper } from '../../../../../../../src/app/compiler/angular/deps/helpers/class-helper';
import { SymbolHelper } from '../../../../../../../src/app/compiler/angular/deps/helpers/symbol-helper';
import Configuration from '../../../../../../../src/app/configuration';

describe('ComponentHelper', () => {
    let componentHelper: ComponentHelper;
    let classHelperStub: sinon.SinonStubbedInstance<ClassHelper>;
    let symbolHelperStub: sinon.SinonStubbedInstance<SymbolHelper>;
    let project: Project;
    let sourceFile: ts.SourceFile;

    beforeEach(() => {
        classHelperStub = sinon.createStubInstance(ClassHelper);
        symbolHelperStub = sinon.createStubInstance(SymbolHelper);
        componentHelper = new ComponentHelper(classHelperStub, symbolHelperStub);
        project = new Project();
        sourceFile = project.createSourceFile('test.ts', '').compilerNode;
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('constructor', () => {
        it('should create ComponentHelper with provided dependencies', () => {
            const helper = new ComponentHelper(classHelperStub, symbolHelperStub);
            expect(helper).to.be.instanceOf(ComponentHelper);
        });

        it('should create ComponentHelper with default SymbolHelper when not provided', () => {
            const helper = new ComponentHelper(classHelperStub);
            expect(helper).to.be.instanceOf(ComponentHelper);
        });
    });

    // Helper functions for creating test data
    function createMockProp(name: string, value: any): ts.ObjectLiteralElementLike {
        return {
            name: { text: name },
            initializer: { text: value }
        } as any;
    }

    function createMockProps(props: {
        [key: string]: any;
    }): ReadonlyArray<ts.ObjectLiteralElementLike> {
        return Object.entries(props).map(([name, value]) => createMockProp(name, value));
    }

    describe('getComponentName', () => {
        it('should extract component name from props', () => {
            const props = createMockProps({ name: 'TestComponent' });
            symbolHelperStub.getSymbolDeps.returns(['TestComponent']);

            const result = componentHelper.getComponentName(props, sourceFile);

            sinon.assert.calledWith(symbolHelperStub.getSymbolDeps, props, 'name', sourceFile);
            expect(result).to.equal('TestComponent');
        });

        it('should return undefined when no name found', () => {
            const props = createMockProps({});
            symbolHelperStub.getSymbolDeps.returns([]);

            const result = componentHelper.getComponentName(props, sourceFile);

            expect(result).to.be.undefined;
        });
    });

    describe('getComponentSelector', () => {
        it('should extract component selector from props', () => {
            const props = createMockProps({ selector: 'app-test' });
            symbolHelperStub.getSymbolDeps.returns(['app-test']);

            const result = componentHelper.getComponentSelector(props, sourceFile);

            sinon.assert.calledWith(symbolHelperStub.getSymbolDeps, props, 'selector', sourceFile);
            expect(result).to.equal('app-test');
        });
    });

    describe('getComponentTemplate', () => {
        it('should extract component template from props', () => {
            const props = createMockProps({ template: '<div>Hello</div>' });
            symbolHelperStub.getSymbolDeps.returns(['<div>Hello</div>']);

            const result = componentHelper.getComponentTemplate(props, sourceFile);

            sinon.assert.calledWith(
                symbolHelperStub.getSymbolDeps,
                props,
                'template',
                sourceFile,
                true
            );
            expect(result).to.equal('<div>Hello</div>');
        });

        it('should not crash when template is a variable reference (non-string)', () => {
            const props = createMockProps({ template: 'myTemplate' });
            // When template is a const variable reference, getSymbolDeps returns
            // the identifier name (not a string literal), so the value is not a string.
            symbolHelperStub.getSymbolDeps.returns([undefined]);

            let result: any;
            expect(() => {
                result = componentHelper.getComponentTemplate(props, sourceFile);
            }).to.not.throw();
            expect(result).to.be.undefined;
        });
    });

    describe('getComponentStandalone', () => {
        it('should return true when standalone is true', () => {
            const props = createMockProps({ standalone: 'true' });
            symbolHelperStub.getSymbolDeps.returns(['true']);

            const result = componentHelper.getComponentStandalone(props, sourceFile);

            expect(result).to.be.true;
        });

        it('should return false when standalone is false', () => {
            const props = createMockProps({ standalone: 'false' });
            symbolHelperStub.getSymbolDeps.returns(['false']);

            const result = componentHelper.getComponentStandalone(props, sourceFile);

            expect(result).to.be.false;
        });

        it('should return null when no standalone property found and no Angular version set', () => {
            const props = createMockProps({});
            symbolHelperStub.getSymbolDeps.returns([]);

            const result = componentHelper.getComponentStandalone(props, sourceFile);

            expect(result).to.be.null;
        });

        it('should return true when no standalone property found and Angular version is >= 19', () => {
            const props = createMockProps({});
            symbolHelperStub.getSymbolDeps.returns([]);

            Configuration.mainData.angularVersion = '19.0.0';
            const result = componentHelper.getComponentStandalone(props, sourceFile);
            Configuration.mainData.angularVersion = '';

            expect(result).to.be.true;
        });

        it('should return null when no standalone property found and Angular version is < 19', () => {
            const props = createMockProps({});
            symbolHelperStub.getSymbolDeps.returns([]);

            Configuration.mainData.angularVersion = '18.2.0';
            const result = componentHelper.getComponentStandalone(props, sourceFile);
            Configuration.mainData.angularVersion = '';

            expect(result).to.be.null;
        });
    });

    describe('getComponentStyleUrls', () => {
        it('should extract styleUrls from props', () => {
            const props = createMockProps({ styleUrls: ['style1.css', 'style2.css'] });
            symbolHelperStub.getSymbolDeps.returns(['style1.css', 'style2.css']);

            const result = componentHelper.getComponentStyleUrls(props, sourceFile);

            sinon.assert.calledWith(symbolHelperStub.getSymbolDeps, props, 'styleUrls', sourceFile);
            expect(result).to.deep.equal(['style1.css', 'style2.css']);
        });
    });

    describe('getComponentStyles', () => {
        it('should extract styles from props', () => {
            const props = createMockProps({ styles: ['.class { color: red; }'] });
            symbolHelperStub.getSymbolDeps.returns(['.class { color: red; }']);

            const result = componentHelper.getComponentStyles(props, sourceFile);

            sinon.assert.calledWith(symbolHelperStub.getSymbolDeps, props, 'styles', sourceFile);
            expect(result).to.deep.equal(['.class { color: red; }']);
        });
    });

    describe('getComponentInputsMetadata', () => {
        it('should extract inputs metadata from props', () => {
            const props = createMockProps({ inputs: ['input1', 'input2'] });
            symbolHelperStub.getSymbolDeps.returns(['input1', 'input2']);

            const result = componentHelper.getComponentInputsMetadata(props, sourceFile);

            sinon.assert.calledWith(symbolHelperStub.getSymbolDeps, props, 'inputs', sourceFile);
            expect(result).to.deep.equal(['input1', 'input2']);
        });
    });

    describe('getComponentOutputs', () => {
        it('should extract outputs from props', () => {
            const props = createMockProps({ outputs: ['output1', 'output2'] });
            symbolHelperStub.getSymbolDeps.returns(['output1', 'output2']);

            const result = componentHelper.getComponentOutputs(props, sourceFile);

            sinon.assert.calledWith(symbolHelperStub.getSymbolDeps, props, 'outputs', sourceFile);
            expect(result).to.deep.equal(['output1', 'output2']);
        });
    });

    describe('getComponentTemplateUrl', () => {
        it('should extract templateUrl from props', () => {
            const props = createMockProps({ templateUrl: 'template.html' });
            symbolHelperStub.getSymbolDeps.returns(['template.html']);

            const result = componentHelper.getComponentTemplateUrl(props, sourceFile);

            sinon.assert.calledWith(
                symbolHelperStub.getSymbolDeps,
                props,
                'templateUrl',
                sourceFile
            );
            expect(result).to.deep.equal(['template.html']);
        });
    });

    describe('parseSignalType', () => {
        it('should return type as-is when no type provided', () => {
            const result = componentHelper.parseSignalType('');
            expect(result).to.equal('');
        });

        it('should parse simple union types', () => {
            const result = componentHelper.parseSignalType("'foo' | 'bar'");
            expect(result).to.equal('"foo" | "bar"');
        });

        it('should handle single quote types', () => {
            const result = componentHelper.parseSignalType("'single'");
            expect(result).to.equal("'single'"); // parseSignalType only converts union types
        });

        it('should handle complex union types', () => {
            const result = componentHelper.parseSignalType("'foo' | 'bar' | 'baz'");
            expect(result).to.equal('"foo" | "bar" | "baz"');
        });
    });

    describe('getSignalConfig', () => {
        it('should parse input signal configuration', () => {
            const defaultValue = 'input<string>()';
            const result = componentHelper['getSignalConfig']('input', defaultValue);

            expect(result).to.deep.equal({
                required: false,
                type: 'string',
                defaultValue: undefined
            });
        });

        it('should parse required input signal', () => {
            const defaultValue = 'input.required<string>()';
            const result = componentHelper['getSignalConfig']('input', defaultValue);

            expect(result).to.deep.equal({
                required: true,
                type: 'string',
                defaultValue: undefined
            });
        });

        it('should parse input signal with default value', () => {
            const defaultValue = "input<string>('default')";
            const result = componentHelper['getSignalConfig']('input', defaultValue);

            expect(result).to.deep.equal({
                required: false,
                type: 'string',
                defaultValue: "'default'"
            });
        });

        it('should parse output signal configuration', () => {
            const defaultValue = 'output<string>()';
            const result = componentHelper['getSignalConfig']('output', defaultValue);

            expect(result).to.deep.equal({
                required: false,
                type: 'string',
                defaultValue: undefined
            });
        });

        it('should return undefined for non-matching signal', () => {
            const defaultValue = 'someOtherFunction()';
            const result = componentHelper['getSignalConfig']('input', defaultValue);

            expect(result).to.be.undefined;
        });

        it('should parse InputOptionsWithTransform with union types without hanging (issue #1654)', () => {
            // This case caused catastrophic backtracking in the old regex.
            // The options object { transform: ... } is the sole argument and must not
            // leak into defaultValue — it should be treated as the options object.
            const defaultValue = `input.required<string[], string | string[]>({ transform: v => (Array.isArray(v) ? v : [v]) })`;
            const result = componentHelper['getSignalConfig']('input', defaultValue);

            expect(result).to.deep.equal({
                required: true,
                type: 'string[], string | string[]',
                defaultValue: undefined
            });
        });

        it('should parse input signal with arrow function types containing => without hanging (issue #1654)', () => {
            const defaultValue = `input<() => string[], () => string[]>(() => [])`;
            const result = componentHelper['getSignalConfig']('input', defaultValue);

            expect(result).to.deep.equal({
                required: false,
                type: '() => string[], () => string[]',
                defaultValue: '() => []'
            });
        });

        it('should extract only the first argument as defaultValue, ignoring the options object', () => {
            // The options object (second argument) must not leak into defaultValue
            const defaultValue = `input(null, { alias: 'aliasedInSignal' })`;
            const result = componentHelper['getSignalConfig']('input', defaultValue);

            expect(result).to.deep.equal({
                required: false,
                type: undefined,
                defaultValue: 'null',
                name: 'aliasedInSignal'
            });
        });

        it('should extract only the first argument when transform option is present (booleanAttribute)', () => {
            const defaultValue = `input(false, { transform: booleanAttribute })`;
            const result = componentHelper['getSignalConfig']('input', defaultValue);

            expect(result).to.deep.equal({
                required: false,
                type: undefined,
                defaultValue: 'false'
            });
        });

        // Alias regression tests (issue: signal aliases not detected)
        it('should extract alphanumeric alias from input signal options', () => {
            const defaultValue = `input<string>('Lorem ipsum', { alias: 'myUnhyphenatedInput' })`;
            const result = componentHelper['getSignalConfig']('input', defaultValue);

            expect(result).to.deep.equal({
                required: false,
                type: 'string',
                defaultValue: "'Lorem ipsum'",
                name: 'myUnhyphenatedInput'
            });
        });

        it('should extract hyphenated alias from input signal options', () => {
            const defaultValue = `input<string>('sit amet', { alias: 'my-hyphenated-input' })`;
            const result = componentHelper['getSignalConfig']('input', defaultValue);

            expect(result).to.deep.equal({
                required: false,
                type: 'string',
                defaultValue: "'sit amet'",
                name: 'my-hyphenated-input'
            });
        });

        it('should extract alias from required input signal options', () => {
            const defaultValue = `input.required<string>({ alias: 'requiredAlias' })`;
            const result = componentHelper['getSignalConfig']('input', defaultValue);

            expect(result).to.deep.equal({
                required: true,
                type: 'string',
                defaultValue: undefined,
                name: 'requiredAlias'
            });
        });

        it('should extract alphanumeric alias from output signal options', () => {
            const defaultValue = `output<string>({ alias: 'myUnhyphenatedOutput' })`;
            const result = componentHelper['getSignalConfig']('output', defaultValue);

            expect(result).to.deep.equal({
                required: false,
                type: 'string',
                defaultValue: undefined,
                name: 'myUnhyphenatedOutput'
            });
        });

        it('should extract hyphenated alias from output signal options', () => {
            const defaultValue = `output<string>({ alias: 'my-hyphenated-output' })`;
            const result = componentHelper['getSignalConfig']('output', defaultValue);

            expect(result).to.deep.equal({
                required: false,
                type: 'string',
                defaultValue: undefined,
                name: 'my-hyphenated-output'
            });
        });

        it('should extract alias from model signal options', () => {
            const defaultValue = `model<string>('Lorem ipsum', { alias: 'myUnhyphenatedModel' })`;
            const result = componentHelper['getSignalConfig']('model', defaultValue);

            expect(result).to.deep.equal({
                required: false,
                type: 'string',
                defaultValue: "'Lorem ipsum'",
                name: 'myUnhyphenatedModel'
            });
        });

        it('should extract hyphenated alias from model signal options', () => {
            const defaultValue = `model<string>('sit amet', { alias: 'my-hyphenated-Model' })`;
            const result = componentHelper['getSignalConfig']('model', defaultValue);

            expect(result).to.deep.equal({
                required: false,
                type: 'string',
                defaultValue: "'sit amet'",
                name: 'my-hyphenated-Model'
            });
        });

        it('should not set name when options object has no alias', () => {
            const defaultValue = `input<boolean>(false, { transform: booleanAttribute })`;
            const result = componentHelper['getSignalConfig']('input', defaultValue);

            expect(result).to.not.have.property('name');
        });
    });

    describe('getInputSignal', () => {
        it('should extract input signal from property', () => {
            const prop = { defaultValue: 'input<string>()' };
            const result = componentHelper.getInputSignal(prop);

            expect(result).to.deep.equal({
                ...prop,
                required: false,
                type: 'string',
                defaultValue: undefined
            });
        });

        it('should override prop name with alias from signal options', () => {
            const prop = { name: 'myInput', defaultValue: `input<string>('hello', { alias: 'my-aliased-input' })` };
            const result = componentHelper.getInputSignal(prop);

            expect(result).to.deep.equal({
                name: 'my-aliased-input',
                defaultValue: "'hello'",
                required: false,
                type: 'string'
            });
        });

        it('should return undefined when no input signal found', () => {
            const prop = { defaultValue: 'someOtherValue' };
            const result = componentHelper.getInputSignal(prop);

            expect(result).to.be.undefined;
        });
    });

    describe('getOutputSignal', () => {
        it('should extract output signal from property', () => {
            const prop = { defaultValue: 'output<string>()' };
            const result = componentHelper.getOutputSignal(prop);

            expect(result).to.deep.equal({
                ...prop,
                required: false,
                type: 'string',
                defaultValue: undefined
            });
        });

        it('should override prop name with alias from output signal options', () => {
            const prop = { name: 'myOutput', defaultValue: `output<string>({ alias: 'my-aliased-output' })` };
            const result = componentHelper.getOutputSignal(prop);

            expect(result).to.deep.equal({
                name: 'my-aliased-output',
                defaultValue: undefined,
                required: false,
                type: 'string'
            });
        });

        it('should return undefined when no output signal found', () => {
            const prop = { defaultValue: 'someOtherValue' };
            const result = componentHelper.getOutputSignal(prop);

            expect(result).to.be.undefined;
        });
    });

    describe('getInputOutputSignals', () => {
        it('should separate signals from regular properties', () => {
            const props = [
                { defaultValue: 'input<string>()', name: 'inputProp' },
                { defaultValue: 'output<number>()', name: 'outputProp' },
                { defaultValue: 'regularValue', name: 'regularProp' }
            ];

            const result = componentHelper.getInputOutputSignals(props);

            expect(result.inputSignals).to.have.lengthOf(1);
            expect(result.outputSignals).to.have.lengthOf(1);
            expect(result.properties).to.have.lengthOf(1);
            expect(result.inputSignals[0].name).to.equal('inputProp');
            expect(result.outputSignals[0].name).to.equal('outputProp');
            expect(result.properties[0].name).to.equal('regularProp');
        });
    });

    describe('getComponentProviders', () => {
        it('should extract and parse providers from props', () => {
            const props = createMockProps({ providers: ['Service1', 'Service2'] });
            symbolHelperStub.getSymbolDeps.returns(['Service1', 'Service2']);
            symbolHelperStub.parseDeepIndentifier.callsFake(name => ({ name, type: 'injectable' }));

            const result = componentHelper.getComponentProviders(props, sourceFile);

            sinon.assert.calledWith(symbolHelperStub.getSymbolDeps, props, 'providers', sourceFile);
            sinon.assert.calledTwice(symbolHelperStub.parseDeepIndentifier);
            expect(result).to.have.lengthOf(2);
            expect(result[0]).to.deep.equal({ name: 'Service1', type: 'injectable' });
        });
    });

    describe('getComponentImports', () => {
        it('should extract and parse imports from props', () => {
            const props = createMockProps({ imports: ['Module1', 'Module2'] });
            symbolHelperStub.getSymbolDeps.returns(['Module1', 'Module2']);
            symbolHelperStub.parseDeepIndentifier.callsFake(name => ({ name, type: 'module' }));

            const result = componentHelper.getComponentImports(props, sourceFile);

            sinon.assert.calledWith(symbolHelperStub.getSymbolDeps, props, 'imports', sourceFile);
            sinon.assert.calledTwice(symbolHelperStub.parseDeepIndentifier);
            expect(result).to.have.lengthOf(2);
            expect(result[0]).to.deep.equal({ name: 'Module1', type: 'module' });
        });
    });

    describe('getComponentEntryComponents', () => {
        it('should extract and parse entryComponents from props', () => {
            const props = createMockProps({ entryComponents: ['Component1', 'Component2'] });
            symbolHelperStub.getSymbolDeps.returns(['Component1', 'Component2']);
            symbolHelperStub.parseDeepIndentifier.callsFake(name => ({ name, type: 'component' }));

            const result = componentHelper.getComponentEntryComponents(props, sourceFile);

            sinon.assert.calledWith(
                symbolHelperStub.getSymbolDeps,
                props,
                'entryComponents',
                sourceFile
            );
            sinon.assert.calledTwice(symbolHelperStub.parseDeepIndentifier);
            expect(result).to.have.lengthOf(2);
            expect(result[0]).to.deep.equal({ name: 'Component1', type: 'component' });
        });
    });

    describe('getComponentViewProviders', () => {
        it('should extract and parse viewProviders from props', () => {
            const props = createMockProps({ viewProviders: ['Service1', 'Service2'] });
            symbolHelperStub.getSymbolDeps.returns(['Service1', 'Service2']);
            symbolHelperStub.parseDeepIndentifier.callsFake(name => ({ name, type: 'injectable' }));

            const result = componentHelper.getComponentViewProviders(props, sourceFile);

            sinon.assert.calledWith(
                symbolHelperStub.getSymbolDeps,
                props,
                'viewProviders',
                sourceFile
            );
            sinon.assert.calledTwice(symbolHelperStub.parseDeepIndentifier);
            expect(result).to.have.lengthOf(2);
            expect(result[0]).to.deep.equal({ name: 'Service1', type: 'injectable' });
        });
    });

    describe('getComponentExampleUrls', () => {
        it('should extract example URLs from text', () => {
            const text =
                'Some text <example-url>url1</example-url> more text <example-url>url2</example-url>';
            const result = componentHelper.getComponentExampleUrls(text);

            expect(result).to.deep.equal(['url1', 'url2']);
        });

        it('should return undefined when no example URLs found', () => {
            const text = 'Some text without example URLs';
            const result = componentHelper.getComponentExampleUrls(text);

            expect(result).to.be.undefined;
        });
    });

    describe('sanitizeUrls', () => {
        it('should remove ./ prefix from URLs', () => {
            const urls = ['./style1.css', './style2.css', 'style3.css'];
            const result = (componentHelper as any).sanitizeUrls(urls);

            expect(result).to.deep.equal(['style1.css', 'style2.css', 'style3.css']);
        });

        it('should handle empty array', () => {
            const urls: string[] = [];
            const result = (componentHelper as any).sanitizeUrls(urls);

            expect(result).to.deep.equal([]);
        });
    });

    describe('getComponentHost', () => {
        it('should extract host configuration as Map', () => {
            const props = createMockProps({ host: { '(click)': 'onClick()' } });
            const expectedMap = new Map([['(click)', 'onClick()']]);

            // Mock the getSymbolDepsObject method
            const getSymbolDepsObjectStub = sinon.stub(componentHelper, 'getSymbolDepsObject');
            getSymbolDepsObjectStub.returns(expectedMap);

            const result = componentHelper.getComponentHost(props);

            sinon.assert.calledWith(getSymbolDepsObjectStub, props, 'host');
            expect(result).to.equal(expectedMap);

            getSymbolDepsObjectStub.restore();
        });
    });

    describe('getComponentHostDirectives', () => {
        it('should return empty array when no hostDirectives found', () => {
            symbolHelperStub.getSymbolDepsRaw.returns([]);

            const result = componentHelper.getComponentHostDirectives([]);

            expect(result).to.deep.equal([]);
        });

        it('should parse identifier host directives', () => {
            const mockElement = {
                kind: SyntaxKind.Identifier,
                escapedText: 'MyDirective'
            };

            const mockInitializer = {
                elements: [mockElement]
            };

            symbolHelperStub.getSymbolDepsRaw.returns([
                {
                    initializer: mockInitializer
                }
            ]);

            const result = componentHelper.getComponentHostDirectives([]);

            expect(result).to.deep.equal([
                {
                    name: 'MyDirective'
                }
            ]);
        });

        it('should parse object literal host directives', () => {
            const mockProperty1 = {
                name: { escapedText: 'directive' },
                initializer: { escapedText: 'MyDirective' }
            };

            const mockProperty2 = {
                name: { escapedText: 'inputs' },
                initializer: {
                    elements: [{ text: 'input1' }, { text: 'input2' }]
                }
            };

            const mockProperty3 = {
                name: { escapedText: 'outputs' },
                initializer: {
                    elements: [{ text: 'output1' }, { text: 'output2' }]
                }
            };

            const mockElement = {
                kind: SyntaxKind.ObjectLiteralExpression,
                properties: [mockProperty1, mockProperty2, mockProperty3]
            };

            const mockInitializer = {
                elements: [mockElement]
            };

            symbolHelperStub.getSymbolDepsRaw.returns([
                {
                    initializer: mockInitializer
                }
            ]);

            const result = componentHelper.getComponentHostDirectives([]);

            expect(result).to.deep.equal([
                {
                    name: 'MyDirective',
                    inputs: ['input1', 'input2'],
                    outputs: ['output1', 'output2']
                }
            ]);
        });

        it('should handle multiple host directives', () => {
            const mockElement1 = {
                kind: SyntaxKind.Identifier,
                escapedText: 'Directive1'
            };

            const mockElement2 = {
                kind: SyntaxKind.Identifier,
                escapedText: 'Directive2'
            };

            const mockInitializer = {
                elements: [mockElement1, mockElement2]
            };

            symbolHelperStub.getSymbolDepsRaw.returns([
                {
                    initializer: mockInitializer
                }
            ]);

            const result = componentHelper.getComponentHostDirectives([]);

            expect(result).to.deep.equal([{ name: 'Directive1' }, { name: 'Directive2' }]);
        });
    });

    describe('ComponentCache', () => {
        let cache: ComponentCache;

        beforeEach(() => {
            cache = new ComponentCache();
        });

        describe('get', () => {
            it('should return cached value for existing key', () => {
                const testValue = { name: 'TestComponent' };
                cache.set('testKey', testValue);

                const result = cache.get('testKey');

                expect(result).to.equal(testValue);
            });

            it('should return undefined for non-existing key', () => {
                const result = cache.get('nonExistingKey');

                expect(result).to.be.undefined;
            });
        });

        describe('set', () => {
            it('should store value in cache', () => {
                const testValue = { selector: 'app-test' };

                cache.set('testKey', testValue);
                const result = cache.get('testKey');

                expect(result).to.equal(testValue);
            });

            it('should overwrite existing value', () => {
                const originalValue = { name: 'Original' };
                const newValue = { name: 'New' };

                cache.set('testKey', originalValue);
                cache.set('testKey', newValue);

                const result = cache.get('testKey');

                expect(result).to.equal(newValue);
                expect(result).to.not.equal(originalValue);
            });
        });
    });
});
