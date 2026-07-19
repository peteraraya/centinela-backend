import { Injectable, Logger } from '@nestjs/common';
import { TwitterApi } from 'twitter-api-v2';
import { Incident } from '../incidents/interfaces/incident.interface';

@Injectable()
export class BomberosService {
  private readonly logger = new Logger(BomberosService.name);
  private twitterClient: TwitterApi;
  private incidents: Incident[] = [];

  constructor() {
    const token = process.env.TWITTER_BEARER_TOKEN || 'DUMMY_TOKEN';
    this.twitterClient = new TwitterApi(token);
  }

  async fetchDespachos() {
    this.logger.log('Fetching Bomberos despachos...');
    try {
      if (process.env.TWITTER_BEARER_TOKEN) {
        const tweets = await this.twitterClient.v2.userTimeline(
          'ID_CUENTA_CBA',
          { exclude: ['replies', 'retweets'] },
        );
        this.incidents = tweets.data.data.map((t) => ({
          id: `bomb-${t.id}`,
          title: 'Despacho Bomberos',
          description: t.text,
          type: 'fire',
          severity: 'high',
          coordinates: [-70.6, -33.4],
          timestamp: new Date().toISOString(),
          details: {
            status: 'En curso',
            reportedBy: 'Bomberos de Chile',
            unitsDispatched: 2,
            affectedArea: 'Local',
            lastUpdate: new Date().toISOString(),
          },
        }));
      } else {
        throw new Error('No Twitter Token provided');
      }
    } catch (error) {
      this.logger.warn(
        'Could not fetch real Twitter data, using mock data for Bomberos.',
      );
      this.incidents = [
        {
          id: 'bomb-mock-1',
          title: '10-4 (Rescate) en Av Providencia / Tobalaba',
          description: 'Despacho de unidades B-1, R-2 a rescate vehicular.',
          type: 'accident',
          severity: 'high',
          coordinates: [-70.601, -33.4187], // Providencia
          timestamp: new Date().toISOString(),
          details: {
            status: 'En curso',
            reportedBy: 'Cuerpo de Bomberos de Santiago',
            unitsDispatched: 2,
            affectedArea: 'Providencia',
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
