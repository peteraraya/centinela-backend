import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health Check de la API' })
  @ApiResponse({
    status: 200,
    description: 'Retorna el estado de salud y métricas básicas de la API.',
  })
  getStatus() {
    return this.appService.getStatus();
  }
}
