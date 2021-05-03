import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class AppController {
    @Get()
    @Render('../public/index.html')
    root() {
        return {};
    }
}
