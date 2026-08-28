import { Test } from '@nestjs/testing';

import { CategoriesController } from '@modules/categories/controllers/categories.controller';
import { CategoriesService } from '@modules/categories/services/categories.service';
import { createMockCategory } from '@common/testing/mock-entities';
import { createMockCategoriesService } from '@common/testing/mock-services';
import { CreateCategoryDto, UpdateCategoryDto } from '@modules/categories/dto';
import { Logger } from 'nestjs-pino';
import { createMockLogger } from '@common/testing/mock-logger';
import { uuidv7 } from 'uuidv7';

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
        {
          provide: Logger,
          useValue: createMockLogger(),
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
      expect(result).toEqual(mockCategories);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne and return result', async () => {
      const mockCategories = createMockCategory();
      vi.mocked(service.findOne).mockResolvedValue(mockCategories);

      const result = await controller.findOne(mockCategories.id);

      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCategories);
    });
  });

  describe('create', () => {
    it('should call service.create with dto and return created category', async () => {
      const dto = new CreateCategoryDto();
      dto.name = 'Mock Category';
      dto.description = 'Mock Description';
      dto.color = '#ffffff';

      const mockCategory = createMockCategory({
        name: 'Mock Category',
        description: 'Mock Description',
        color: '#ffffff',
      });

      vi.mocked(service.create).mockResolvedValue(mockCategory);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(service.create).toHaveBeenCalledTimes(1);

      expect(result).toEqual(mockCategory);
    });
  });

  describe('update', () => {
    it('should call service.update with id, dto and return updated category', async () => {
      const id = uuidv7();
      const dto = new UpdateCategoryDto();
      dto.name = 'Mock Name Updated';

      const mockCategory = createMockCategory({
        id,
        name: 'Mock Name Updated',
      });

      vi.mocked(service.update).mockResolvedValue(mockCategory);

      const result = await controller.update(id, dto);

      expect(service.update).toHaveBeenCalledWith(id, dto);
      expect(service.update).toHaveBeenCalledTimes(1);

      expect(result).toEqual(mockCategory);
    });
  });

  describe('remove', () => {
    it('should call service.remove with id return void', async () => {
      const id = uuidv7();

      vi.mocked(service.remove).mockResolvedValue(undefined);

      await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(id);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });
  });
});
