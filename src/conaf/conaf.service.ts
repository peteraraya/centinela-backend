import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Incident } from '../incidents/interfaces/incident.interface';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ConafService {
  private readonly logger = new Logger(ConafService.name);
  private incidents: Incident[] = [];

  constructor(private readonly httpService: HttpService) {}

  async fetchIncendiosForestales() {
    this.logger.log('Fetching Incendios Forestales de CONAF...');
    try {
      const response = await firstValueFrom(
        this.httpService.get('https://services.arcgis.com/dummy/FeatureServer'),
      );
      if (response.data) {
        // Simular
        this.incidents = [];
      }
    } catch (error) {
      this.logger.warn('Could not fetch real CONAF data, using mock data.');
      this.incidents = [
        {
          id: 'conaf-mock-1',
          title: 'Incendio Forestal "El Peumo" en Combate',
          description: 'Incendio forestal de rápida propagación',
          type: 'fire',
          severity: 'critical',
          coordinates: [-71.5518, -33.0456], // Valparaiso area
          radius: 5000,
          timestamp: new Date().toISOString(),
          details: {
            status: 'En curso',
            reportedBy: 'CONAF',
            unitsDispatched: 5,
            affectedArea: 'Valparaíso - Sector Alto',
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
