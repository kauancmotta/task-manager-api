import { Test } from '@nestjs/testing';

import { CategoriesController } from '@modules/categories/controllers/categories.controller';
import { CategoriesService } from '@modules/categories/services/categories.service';
import {
  createMockCategory,
  createMockJwtPayload,
} from '@common/testing/mock-entities';
import { createMockCategoriesService } from '@common/testing/mock-services';
import {
  CategoryFilterDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@modules/categories/dto';
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
      const dto = new CategoryFilterDto();
      dto.search = undefined;

      const jwtPayload = createMockJwtPayload();

      const mockCategories = [
        createMockCategory({ name: 'mock category 1' }),
        createMockCategory({ name: 'mock category 2' }),
      ];
      vi.mocked(service.findAll).mockResolvedValue(mockCategories);

      const result = await controller.findAll(jwtPayload, dto);

      expect(service.findAll).toHaveBeenCalledWith({
        userId: jwtPayload.sub,
        filters: dto,
      });
      expect(result).toEqual(mockCategories);
    });

    it('should call service.findAll when filters and return result', async () => {
      const dto = new CategoryFilterDto();
      dto.search = 'mock category 1';

      const jwtPayload = createMockJwtPayload();

      const mockCategories = [createMockCategory({ name: 'mock category 1' })];

      vi.mocked(service.findAll).mockResolvedValue(mockCategories);

      const result = await controller.findAll(jwtPayload, dto);

      expect(service.findAll).toHaveBeenCalledWith({
        userId: jwtPayload.sub,
        filters: dto,
      });
      expect(result).toEqual(mockCategories);
      expect(result[0].name).toBe('mock category 1');
    });
  });

  describe('findOne', () => {
    it('should call service.findOne and return result', async () => {
      const jwtPayload = createMockJwtPayload();

      const mockCategory = createMockCategory();
      vi.mocked(service.findOne).mockResolvedValue(mockCategory);

      const result = await controller.findOne(jwtPayload, mockCategory.id);

      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCategory);
    });
  });

  describe('create', () => {
    it('should call service.create with userId, dto and return created category', async () => {
      const dto = new CreateCategoryDto();
      dto.name = 'Mock Category';
      dto.description = 'Mock Description';
      dto.color = '#ffffff';

      const jwtPayload = createMockJwtPayload();

      const mockCategory = createMockCategory({
        name: 'Mock Category',
        description: 'Mock Description',
        color: '#ffffff',
      });

      vi.mocked(service.create).mockResolvedValue(mockCategory);

      const result = await controller.create(jwtPayload, dto);

      expect(service.create).toHaveBeenCalledWith({
        userId: jwtPayload.sub,
        createCategoryDto: dto,
      });
      expect(service.create).toHaveBeenCalledTimes(1);

      expect(result).toEqual(mockCategory);
    });
  });

  describe('update', () => {
    it('should call service.update with userId, id, dto and return updated category', async () => {
      const dto = new UpdateCategoryDto();
      dto.name = 'Mock Name Updated';

      const id = uuidv7();
      const jwtPayload = createMockJwtPayload();

      const mockCategory = createMockCategory({
        id,
        name: 'Mock Name Updated',
      });

      vi.mocked(service.update).mockResolvedValue(mockCategory);

      const result = await controller.update(jwtPayload, mockCategory.id, dto);

      expect(service.update).toHaveBeenCalledWith({
        userId: jwtPayload.sub,
        categoryId: mockCategory.id,
        updateCategoryDto: dto,
      });
      expect(service.update).toHaveBeenCalledTimes(1);

      expect(result).toEqual(mockCategory);
    });
  });

  describe('remove', () => {
    it('should call service.remove with id return void', async () => {
      const jwtPayload = createMockJwtPayload();

      const id = uuidv7();
      const mockCategory = createMockCategory({ id });

      vi.mocked(service.remove).mockResolvedValue(undefined);

      const result = await controller.remove(jwtPayload, mockCategory.id);

      expect(service.remove).toHaveBeenCalledWith({
        userId: jwtPayload.sub,
        categoryId: mockCategory.id,
      });
      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });
  });
});
