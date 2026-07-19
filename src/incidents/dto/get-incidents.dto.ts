import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetIncidentsQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrar por tipo de incidente (ej: alert, fire)',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por nivel de severidad',
    enum: ['low', 'medium', 'high', 'critical'],
  })
  @IsOptional()
  @IsIn(['low', 'medium', 'high', 'critical'], {
    message: 'Severity must be one of: low, medium, high, critical',
  })
  severity?: string;
}
