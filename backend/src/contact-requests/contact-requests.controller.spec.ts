import { Test, TestingModule } from '@nestjs/testing';
import { ContactRequestsController } from './contact-requests.controller';
import { ContactRequestsService } from './contact-requests.service';

describe('ContactRequestsController', () => {
  let controller: ContactRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactRequestsController],
      providers: [ContactRequestsService],
    }).compile();

    controller = module.get<ContactRequestsController>(
      ContactRequestsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
