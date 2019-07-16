import { Controller, Headers, Post, Res, HttpStatus, Delete } from '@nestjs/common';

@Controller('auth')
export class AuthController {
    constructor() {}

    @Post()
    async login(@Headers() headers, @Res() res) {}

    @Delete()
    async logout(@Res() res) {}
}
