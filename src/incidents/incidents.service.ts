import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { SenapredService } from '../senapred/senapred.service';
import { BomberosService } from '../bomberos/bomberos.service';
import { SecService } from '../sec/sec.service';
import { ConafService } from '../conaf/conaf.service';
import { MeteoService } from '../meteo/meteo.service';
import { Incident } from './interfaces/incident.interface';

@Injectable()
export class IncidentsService implements OnModuleInit {
  private readonly logger = new Logger(IncidentsService.name);

  constructor(
    private senapredService: SenapredService,
    private bomberosService: BomberosService,
    private secService: SecService,
    private conafService: ConafService,
    private meteoService: MeteoService,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing data fetch...');
    await Promise.all([
      this.senapredService.fetchAlertas(),
      this.bomberosService.fetchDespachos(),
      this.secService.fetchCortesLuz(),
      this.conafService.fetchIncendiosForestales(),
      this.meteoService.fetchAlertasMeteorologicas(),
    ]);
  }

  getAggregatedIncidents(): Incident[] {
    return [
      ...this.senapredService.getIncidents(),
      ...this.bomberosService.getIncidents(),
      ...this.secService.getIncidents(),
      ...this.conafService.getIncidents(),
      ...this.meteoService.getIncidents(),
    ];
  }
}
