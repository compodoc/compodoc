const AngularAPIs = require('../src/data/api-list.json'),
      _ = require('lodash');

export function finderInAngularAPIs(type: string) {
    let _result = {
        source: 'external',
        data: null
    };

    _.forEach(AngularAPIs, function(angularModuleAPIs, angularModule) {
        let i = 0,
            len = angularModuleAPIs.length;
        for (i; i<len; i++) {
            if (angularModuleAPIs[i].title === type) {
                _result.data = angularModuleAPIs[i]
            }
        }
    });

    return _result;
}
