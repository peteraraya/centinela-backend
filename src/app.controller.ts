import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('root')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Verificar estado de la API' })
  @ApiResponse({
    status: 200,
    description: 'Retorna un saludo confirmando que la API funciona.',
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
