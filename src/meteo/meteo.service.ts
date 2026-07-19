import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Incident } from '../incidents/interfaces/incident.interface';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MeteoService {
  private readonly logger = new Logger(MeteoService.name);
  private incidents: Incident[] = [];

  constructor(private readonly httpService: HttpService) {}

  async fetchAlertasMeteorologicas() {
    this.logger.log('Fetching Alertas Meteorológicas de DMC...');
    try {
      // Intentar obtener avisos meteorológicos de la API de MeteoChile
      const response = await firstValueFrom(
        this.httpService.get<{ avisos: any[] }>(
          'https://api.meteochile.gob.cl/v1/avisos',
          {
            timeout: 3000,
          },
        ),
      );
      const data = response.data;
      if (data && Array.isArray(data.avisos)) {
        this.incidents = data.avisos.map((aviso: any) => ({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          id: `meteo-${aviso.id ? String(aviso.id) : String(Math.random())}`,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          title: aviso.titulo ? String(aviso.titulo) : 'Alerta Meteorológica',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          description: aviso.descripcion ? String(aviso.descripcion) : '',
          type: 'weather',
          severity: 'high',
          coordinates: [-70.6693, -33.4489],
          timestamp: new Date().toISOString(),
          details: {
            status: 'En curso',
            reportedBy: 'DMC',
            unitsDispatched: 0,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            affectedArea: aviso.zonas ? String(aviso.zonas) : 'Varias regiones',
            lastUpdate: new Date().toISOString(),
          },
        }));
      }
    } catch {
      this.logger.warn(
        'Could not fetch real MeteoChile data, using mock data.',
      );
      this.incidents = [
        {
          id: 'meteo-mock-1',
          title: 'Aviso Meteorológico: Altas Temperaturas Extremas',
          description:
            'Se esperan temperaturas máximas de hasta 38°C en valles y precordillera, aumentando significativamente el riesgo de incendios forestales.',
          type: 'weather',
          severity: 'high',
          coordinates: [-70.6483, -33.4569], // Santiago Centro
          timestamp: new Date().toISOString(),
          details: {
            status: 'En curso',
            reportedBy: 'Dirección Meteorológica de Chile (DMC)',
            unitsDispatched: 0,
            affectedArea: "Regiones de Valparaíso, Metropolitana y O'Higgins",
            lastUpdate: new Date().toISOString(),
          },
        },
      ];
    }
  }

  getIncidents(): Incident[] {
    return this.incidents;
  }
}
