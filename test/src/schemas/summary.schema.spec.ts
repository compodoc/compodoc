import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';

describe('Additional documentation summary.json schema', () => {
    const schemaPath = path.resolve(__dirname, '../../../schemas/summary.schema.json');
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    const entrySchema = schema.definitions.entry;

    function validateEntry(node: any, errors: string[]): void {
        entrySchema.required.forEach((key: string) => {
            if (typeof node[key] !== 'string') {
                errors.push(`missing or non-string "${key}"`);
            }
        });
        if ('children' in node) {
            if (!Array.isArray(node.children)) {
                errors.push('"children" must be an array');
            } else {
                node.children.forEach((child: any) => validateEntry(child, errors));
            }
        }
    }

    it('should describe an array of entries requiring title and file', () => {
        expect(schema.type).to.equal('array');
        expect(entrySchema.required).to.include.members(['title', 'file']);
    });

    it('should validate the bundled --includes fixture', () => {
        const fixturePath = path.resolve(
            __dirname,
            '../../fixtures/todomvc-ng2/additional-doc/summary.json'
        );
        const data = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
        const errors: string[] = [];
        data.forEach((entry: any) => validateEntry(entry, errors));

        expect(errors).to.deep.equal([]);
    });

    it('should flag an entry missing the required "file" property', () => {
        const errors: string[] = [];
        validateEntry({ title: 'Untitled' }, errors);

        expect(errors).to.not.be.empty;
    });
});
