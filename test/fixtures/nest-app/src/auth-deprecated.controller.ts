import { Controller, Headers, Post, Res, HttpStatus, Delete } from '@nestjs/common';

/**
 * @deprecated This controller is deprecated
 */
@Controller('auth')
export class AuthDeprecatedController {
    constructor() {}

    @Post()
    async login(@Headers() headers, @Res() res) {}

    @Delete()
    async logout(@Res() res) {}
}
