import { Injectable, Logger } from '@nestjs/common';
import { SenapredService } from '../senapred/senapred.service';
import { BomberosService } from '../bomberos/bomberos.service';
import { SecService } from '../sec/sec.service';
import { ConafService } from '../conaf/conaf.service';
import { MeteoService } from '../meteo/meteo.service';
import { Incident } from './interfaces/incident.interface';
import { Redis } from '@upstash/redis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IncidentsService {
  private readonly logger = new Logger(IncidentsService.name);
  private redis?: Redis;

  constructor(
    private senapredService: SenapredService,
    private bomberosService: BomberosService,
    private secService: SecService,
    private conafService: ConafService,
    private meteoService: MeteoService,
    private configService: ConfigService,
  ) {
    const url = this.configService.get<string>('UPSTASH_REDIS_REST_URL');
    const token = this.configService.get<string>('UPSTASH_REDIS_REST_TOKEN');
    if (url && token) {
      this.redis = new Redis({ url, token });
    } else {
      this.logger.warn(
        'Redis is not configured. Falling back to in-memory data if available.',
      );
    }
  }

  async syncData(): Promise<void> {
    this.logger.log('Starting data synchronization from external APIs...');
    try {
      await Promise.all([
        this.senapredService.fetchAlertas(),
        this.bomberosService.fetchDespachos(),
        this.secService.fetchCortesLuz(),
        this.conafService.fetchIncendiosForestales(),
        this.meteoService.fetchAlertasMeteorologicas(),
      ]);

      const aggregated = [
        ...this.senapredService.getIncidents(),
        ...this.bomberosService.getIncidents(),
        ...this.secService.getIncidents(),
        ...this.conafService.getIncidents(),
        ...this.meteoService.getIncidents(),
      ];

      if (this.redis) {
        await this.redis.set('incidents', JSON.stringify(aggregated));
        this.logger.log(`Synced ${aggregated.length} incidents to Redis.`);
      } else {
        this.logger.warn(
          'Data fetched but not synced to Redis (Missing credentials).',
        );
      }
    } catch (error) {
      this.logger.error('Error synchronizing data', error);
    }
  }

  async getAggregatedIncidents(): Promise<Incident[]> {
    if (this.redis) {
      try {
        const data = await this.redis.get<Incident[] | string>('incidents');
        if (data) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const parsed = typeof data === 'string' ? JSON.parse(data) : data;
          return parsed as Incident[];
        }
      } catch (error) {
        this.logger.error('Error reading from Redis', error);
      }
    }

    // Fallback
    return [
      ...this.senapredService.getIncidents(),
      ...this.bomberosService.getIncidents(),
      ...this.secService.getIncidents(),
      ...this.conafService.getIncidents(),
      ...this.meteoService.getIncidents(),
    ];
  }
}
