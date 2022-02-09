import { Get } from '@nestjs/common';
export class ControllerBase {
    protected controllerBaseString = 'How are you?';
    @Get('how-are-you')
    getHowAreYou(): string {
        return this.controllerBaseString;
    }
}
