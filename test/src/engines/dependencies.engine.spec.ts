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
