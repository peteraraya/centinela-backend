import {
  Controller,
  Get,
  UseInterceptors,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiProperty,
  ApiSecurity,
} from '@nestjs/swagger';
import { IncidentsService } from './incidents.service';
import { Incident } from './interfaces/incident.interface';
import { GetIncidentsQueryDto } from './dto/get-incidents.dto';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

class IncidentDetailsDto {
  @ApiProperty({
    description: 'Estado actual de la emergencia',
    enum: ['En curso', 'Controlado', 'Pendiente'],
    example: 'En curso',
  })
  status!: 'En curso' | 'Controlado' | 'Pendiente';

  @ApiProperty({ description: 'Entidad que reporta', example: 'SENAPRED' })
  reportedBy!: string;

  @ApiProperty({ description: 'Unidades despachadas', example: 5 })
  unitsDispatched!: number;

  @ApiProperty({
    description: 'Área afectada estimada',
    example: 'Región Metropolitana',
  })
  affectedArea!: string;

  @ApiProperty({
    description: 'Última actualización (ISO)',
    example: '2023-10-25T12:00:00Z',
  })
  lastUpdate!: string;
}

class IncidentResponseDto implements Incident {
  @ApiProperty({
    description: 'ID único del incidente',
    example: 'senapred-12345',
  })
  id!: string;

  @ApiProperty({
    description: 'Título del incidente',
    example: 'Alerta Temprana Preventiva',
  })
  title!: string;

  @ApiProperty({
    description: 'Descripción detallada',
    example: 'Alerta por altas temperaturas en la región...',
  })
  description!: string;

  @ApiProperty({ description: 'Tipo de incidente', example: 'alert' })
  type!: string;

  @ApiProperty({
    description: 'Nivel de severidad',
    enum: ['low', 'medium', 'high', 'critical'],
    example: 'medium',
  })
  severity!: 'low' | 'medium' | 'high' | 'critical';

  @ApiProperty({
    description: 'Coordenadas [longitud, latitud]',
    example: [-70.6693, -33.4489],
    type: [Number],
  })
  coordinates!: [number, number];

  @ApiProperty({
    description: 'Radio de afectación en metros (opcional)',
    required: false,
    example: 5000,
  })
  radius?: number;

  @ApiProperty({
    description: 'Fecha y hora del reporte (ISO)',
    example: '2023-10-25T10:00:00Z',
  })
  timestamp!: string;

  @ApiProperty({
    description: 'Detalles adicionales',
    type: IncidentDetailsDto,
    required: false,
  })
  details?: IncidentDetailsDto;
}

@ApiTags('incidents')
@Controller('api/v1/incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30000)
  @ApiOperation({
    summary: 'Obtener todas las emergencias e incidentes activos',
  })
  @ApiResponse({
    status: 200,
    description:
      'Lista de incidentes activos agregada desde múltiples fuentes.',
    type: [IncidentResponseDto],
  })
  async getAllActiveIncidents(
    @Query() query: GetIncidentsQueryDto,
  ): Promise<Incident[]> {
    let incidents = await this.incidentsService.getAggregatedIncidents();

    if (query.type) {
      incidents = incidents.filter((i) => i.type === query.type);
    }
    if (query.severity) {
      incidents = incidents.filter((i) => i.severity === query.severity);
    }

    return incidents;
  }

  @Get('sync')
  @ApiSecurity('api-key')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({
    summary:
      'Sincronizar emergencias con las APIs oficiales (Uso de Vercel Cron)',
  })
  @ApiResponse({
    status: 200,
    description: 'Sincronización exitosa',
  })
  async syncIncidents() {
    await this.incidentsService.syncData();
    return { success: true, message: 'Data synced successfully to Redis' };
  }
}
