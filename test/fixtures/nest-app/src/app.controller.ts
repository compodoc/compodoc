import { Get, Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { ControllerBase } from './controller.base';

/**
 * The main app controller
 */
@Controller()
export class AppController extends ControllerBase {
    constructor(private readonly appService: AppService) {}

    @Get()
    root(): string {
        return this.appService.root();
    }

    @Auth(Roles.User)
    @Post()
    async create(@Body() body: CreateTodoDto, @AuthUser() authUser: User) {}

    @UsePipes(new ValidationPipe())
    @ApiResponse({ description: 'Return all articles.' })
    @Post('multiple')
    async createMultipleTodo(@Body() body: CreateMultipleTodoDto, @AuthUser() authUser: User) {}
}
