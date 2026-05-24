import { Controller, Get } from '@nestjs/common';

/**
 * A controller defined as an anonymous default export.
 * Reproduces issue #1547 where node.name is undefined for nameless classes.
 */
@Controller('anonymous')
export default class {
    @Get()
    index(): string {
        return 'anonymous';
    }
}
