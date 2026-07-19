import { Injectable, Logger } from '@nestjs/common';
import Parser from 'rss-parser';
import { Incident } from '../incidents/interfaces/incident.interface';

@Injectable()
export class SenapredService {
  private readonly logger = new Logger(SenapredService.name);
  private parser = new Parser();
  private incidents: Incident[] = [];

  async fetchAlertas() {
    this.logger.log('Fetching SENAPRED alerts...');
    try {
      const feed = await this.parser.parseURL('https://senapred.cl/feed');
      this.incidents = feed.items.map((item) => ({
        id: `senapred-${item.guid || item.id || Math.random()}`,
        title: item.title || 'Alerta SENAPRED',
        description: item.contentSnippet || item.content || '',
        type: 'alert',
        severity: 'high',
        coordinates: [-70.6693, -33.4489], // Default to Santiago for now
        timestamp: item.pubDate
          ? new Date(item.pubDate).toISOString()
          : new Date().toISOString(),
        details: {
          status: 'En curso',
          reportedBy: 'SENAPRED',
          unitsDispatched: 0,
          affectedArea: 'Por confirmar',
          lastUpdate: new Date().toISOString(),
        },
      }));
      this.logger.log(`Fetched ${this.incidents.length} alerts from SENAPRED`);
    } catch (error) {
      this.logger.error(
        `Error fetching SENAPRED alerts: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      if (this.incidents.length === 0) {
        this.incidents = [
          {
            id: 'senapred-mock-1',
            title: 'Alerta Temprana Preventiva - Mock',
            description:
              'Esta es una alerta de prueba generada automáticamente porque el feed oficial falló.',
            type: 'alert',
            severity: 'medium',
            coordinates: [-70.6693, -33.4489],
            timestamp: new Date().toISOString(),
            details: {
              status: 'En curso',
              reportedBy: 'SENAPRED (Mock)',
              unitsDispatched: 0,
              affectedArea: 'Región Metropolitana',
              lastUpdate: new Date().toISOString(),
            },
          },
        ];
      }
    }
  }

  getIncidents(): Incident[] {
    return this.incidents;
  }
}
