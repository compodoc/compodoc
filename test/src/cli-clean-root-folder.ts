import { temporaryDir } from './helpers';

const tmp = temporaryDir();

tmp.copy('./README.md', './README-tmp.md');
tmp.copy('./CHANGELOG.md', './CHANGELOG-tmp.md');
tmp.copy('./CONTRIBUTING.md', './CONTRIBUTING-tmp.md');

tmp.remove('./README.md');
tmp.remove('./CHANGELOG.md');
tmp.remove('./CONTRIBUTING.md');
