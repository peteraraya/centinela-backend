import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Incident } from '../incidents/interfaces/incident.interface';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SecService {
  private readonly logger = new Logger(SecService.name);
  private incidents: Incident[] = [];

  constructor(private readonly httpService: HttpService) {}

  async fetchCortesLuz() {
    this.logger.log('Fetching cortes de luz de la SEC...');
    try {
      const response = await firstValueFrom(
        this.httpService.get('URL_FEATURE_SERVER_SEC'),
      );
      if (response.data) {
        // simular parseo real
        this.incidents = [];
      }
    } catch (error) {
      this.logger.warn('Could not fetch real SEC data, using mock data.');
      this.incidents = [
        {
          id: 'sec-mock-1',
          title: 'Corte de Suministro Eléctrico - Ñuñoa',
          description: 'Corte afecta a 500 clientes.',
          type: 'utility',
          severity: 'medium',
          coordinates: [-70.5985, -33.4542], // Ñuñoa
          radius: 1000,
          timestamp: new Date().toISOString(),
          details: {
            status: 'En curso',
            reportedBy: 'SEC',
            unitsDispatched: 0,
            affectedArea: 'Ñuñoa - Sector Plaza Egaña',
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
