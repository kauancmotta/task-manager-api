import { Test } from '@nestjs/testing';

import { CategoriesController } from '@modules/categories/controllers/categories.controller';
import { CategoriesService } from '@modules/categories/services/categories.service';
import { createMockCategory } from '@common/testing/mock-entities';
import { createMockCategoriesService } from '@common/testing/mock-services';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: createMockCategoriesService(),
        },
      ],
    }).compile();

    controller = moduleRef.get(CategoriesController);
    service = moduleRef.get(CategoriesService);
  });

  describe('findAll', () => {
    it('should call service.findAll and return result', async () => {
      const mockCategories = [createMockCategory()];
      vi.mocked(service.findAll).mockResolvedValue(mockCategories);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCategories)
    });
  });

  describe('findOne', () => {
    it('should call service.findOne and return result', async () => {
      const mockCategories = createMockCategory()
      vi.mocked(service.findOne).mockResolvedValue(mockCategories);

      const result = await controller.findOne(mockCategories.id);

      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCategories)
    });
  });
});
