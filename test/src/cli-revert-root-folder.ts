import { temporaryDir } from './helpers';

const tmp = temporaryDir();

tmp.copy('./README-tmp.md', './README.md');
tmp.copy('./CHANGELOG-tmp.md', './CHANGELOG.md');
tmp.copy('./CONTRIBUTING-tmp.md', './CONTRIBUTING.md');

tmp.remove('./README-tmp.md');
tmp.remove('./CHANGELOG-tmp.md');
tmp.remove('./CONTRIBUTING-tmp.md');
