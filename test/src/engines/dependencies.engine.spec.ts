import { expect } from 'chai';
import * as sinon from 'sinon';
import DependenciesEngine from '../../../src/app/engines/dependencies.engine';
import AngularApiUtil from '../../../src/utils/angular-api.util';

describe('Engines - DependenciesEngine', () => {
    let findApiStub: sinon.SinonStub;

    beforeEach(() => {
        findApiStub = sinon.stub(AngularApiUtil, 'findApi');

        DependenciesEngine.modules = [];
        DependenciesEngine.injectables = [];
        DependenciesEngine.interceptors = [];
        DependenciesEngine.guards = [];
        DependenciesEngine.interfaces = [];
        DependenciesEngine.classes = [];
        DependenciesEngine.components = [];
        DependenciesEngine.controllers = [];
        DependenciesEngine.entities = [];
        DependenciesEngine.directives = [];
        (DependenciesEngine as any).relationshipsCache = {};
        DependenciesEngine.miscellaneous = {
            variables: [],
            functions: [],
            typealiases: [],
            enumerations: [],
            groupedVariables: [],
            groupedFunctions: [],
            groupedEnumerations: [],
            groupedTypeAliases: []
        };
    });

    afterEach(() => {
        findApiStub.restore();
    });

    describe('getRelationships()', () => {
        const component = (name: string, id: string) => ({
            id,
            name,
            type: 'component',
            file: `src/${name}.ts`
        });

        it('should resolve references by id and by name', () => {
            DependenciesEngine.components = [component('FooComponent', 'component-FooComponent-1')];
            DependenciesEngine.modules = [
                {
                    id: 'module-FooModule-1',
                    name: 'FooModule',
                    type: 'module',
                    file: 'src/foo.module.ts',
                    declarations: [{ id: 'component-FooComponent-1', name: 'FooComponent' }],
                    imports: [{ name: 'BarModule' }]
                },
                {
                    id: 'module-BarModule-1',
                    name: 'BarModule',
                    type: 'module',
                    file: 'src/bar.module.ts'
                }
            ];

            const byId = DependenciesEngine.getRelationships({
                id: 'component-FooComponent-1',
                name: 'FooComponent'
            });
            expect(byId.incoming.map(item => item.name)).to.deep.equal(['FooModule']);

            const byName = DependenciesEngine.getRelationships('FooModule');
            expect(byName.outgoing.map(item => `${item.type}::${item.name}`)).to.deep.equal([
                'module::BarModule',
                'component::FooComponent'
            ]);
        });

        it('should see entities added after the first lookup', () => {
            DependenciesEngine.components = [component('FooComponent', 'component-FooComponent-1')];
            expect(DependenciesEngine.getRelationships('FooComponent').incoming).to.deep.equal([]);

            DependenciesEngine.modules.push({
                id: 'module-LateModule-1',
                name: 'LateModule',
                type: 'module',
                file: 'src/late.module.ts',
                declarations: [{ id: 'component-FooComponent-1', name: 'FooComponent' }]
            });

            const relationships = DependenciesEngine.getRelationships('LateModule');
            expect(relationships.outgoing.map(item => `${item.type}::${item.name}`)).to.deep.equal([
                'component::FooComponent'
            ]);
        });
    });

    describe('find()', () => {
        it('should resolve NgFor alias to NgForOf when external API lookup needs fallback', () => {
            findApiStub.withArgs('NgFor').returns({
                source: 'external',
                data: undefined,
                score: 0
            });
            findApiStub.withArgs('NgForOf').returns({
                source: 'external',
                data: { title: 'NgForOf', path: 'api/common/NgForOf' },
                score: 1
            });

            const result = DependenciesEngine.find('NgFor');

            expect(findApiStub.calledWith('NgFor')).to.equal(true);
            expect(findApiStub.calledWith('NgForOf')).to.equal(true);
            expect(result).to.be.an('object');
            expect(result!.source).to.equal('external');
            expect(result!.data).to.deep.equal({ title: 'NgForOf', path: 'api/common/NgForOf' });
            expect(result!.score).to.equal(1);
        });
    });
});
