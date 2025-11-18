import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get(':id')
  getId(@Param('id', ParseIntPipe) id: number): string {
    return this.appService.getId(id);
  }

  @Post()
  getUserInfo(@Body() data: object){
    return this.appService.getUserInfo(data)
  }

  @Patch(':id')
  getUserInfoAndId(@Param('id', ParseIntPipe) id: number, @Body() data: object){
    return this.appService.getUserInfoAndId(id, data)
  }
}
