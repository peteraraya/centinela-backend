import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { SenapredService } from '../senapred/senapred.service';
import { BomberosService } from '../bomberos/bomberos.service';
import { SecService } from '../sec/sec.service';
import { ConafService } from '../conaf/conaf.service';
import { MeteoService } from '../meteo/meteo.service';

@Module({
  imports: [HttpModule],
  controllers: [IncidentsController],
  providers: [
    IncidentsService,
    SenapredService,
    BomberosService,
    SecService,
    ConafService,
    MeteoService,
  ],
})
export class IncidentsModule {}
