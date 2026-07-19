import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return health status object', () => {
      const status = appController.getStatus();
      expect(status).toHaveProperty('status', 'ok');
      expect(status).toHaveProperty('uptime');
      expect(status).toHaveProperty('timestamp');
      expect(status).toHaveProperty('version');
    });
  });
});
