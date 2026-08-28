import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Logger } from 'nestjs-pino';

import {
  createMockRepository,
  MockRepository,
} from '@common/testing/mock-repository';
import { createMockCategory } from '@common/testing/mock-entities';
import { CategoriesService } from '@modules/categories/services/categories.service';
import { Category } from '@modules/categories/entities/categories.entity';
import { createMockLogger } from '@common/testing/mock-logger';
import { uuidv7 } from 'uuidv7';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto, UpdateCategoryDto } from '@modules/categories/dto';
import { Not, UpdateResult } from 'typeorm';
import {
  createMockDeleteResult,
  createMockUpdateResult,
} from '@common/testing/mock-typeorm';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoryRepository: MockRepository<Category>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: Logger,
          useValue: createMockLogger(),
        },
        {
          provide: getRepositoryToken(Category),
          useValue: createMockRepository<Category>(),
        },
      ],
    }).compile();

    service = moduleRef.get(CategoriesService);
    categoryRepository = moduleRef.get(getRepositoryToken(Category));
  });

  describe('FindAll', () => {
    it('should call repository.find and return result', async () => {
      const mockCategories = [createMockCategory()];
      categoryRepository.find?.mockResolvedValue(mockCategories);

      const result = await service.findAll();

      expect(categoryRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockCategories);
    });
  });

  describe('FindOne', () => {
    it('should call repository.findOne and return result', async () => {
      const id = uuidv7();

      const mockCategory = createMockCategory({ id });

      categoryRepository.findOne?.mockResolvedValue(mockCategory);

      const result = await service.findOne(mockCategory.id);

      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
      expect(categoryRepository.findOne).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockCategory);
    });

    it('should throw NotFoundException when category not found', async () => {
      const id = uuidv7();

      categoryRepository.findOne?.mockResolvedValue(null);
      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('Create', () => {
    it('should call repository.create and return category', async () => {
      const dto = new CreateCategoryDto();
      dto.name = 'Mock Name';
      dto.description = 'Mock Description';
      dto.color = '#ffffff';

      const mockCategory = createMockCategory({
        name: dto.name,
        description: dto.description,
        color: dto.color,
      });

      categoryRepository.existsBy?.mockResolvedValue(false);
      categoryRepository.create?.mockReturnValue(mockCategory);
      categoryRepository.save?.mockResolvedValue(mockCategory);

      const result = await service.create(dto);

      expect(categoryRepository.existsBy).toHaveBeenCalledWith({
        name: dto.name,
      });
      expect(categoryRepository.create).toHaveBeenCalledWith(dto);
      expect(categoryRepository.save).toHaveBeenCalledWith(mockCategory);
      expect(result).toEqual(mockCategory);
    });

    it('should throw ConflictException when category not found', async () => {
      const dto = new CreateCategoryDto();
      dto.name = 'Mock Name';
      dto.description = 'Mock Description';
      dto.color = '#ffffff';

      categoryRepository.existsBy?.mockResolvedValue(true);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(categoryRepository.existsBy).toHaveBeenCalledWith({
        name: dto.name,
      });
    });
  });

  describe('Update', () => {
    it('should call repository.update and return category', async () => {
      const id = uuidv7();
      const dto = new UpdateCategoryDto();
      dto.name = 'Mock Name';

      const mockCategory = createMockCategory({
        id,
        name: 'Mock Name',
      });

      const mockUpdateResult = createMockUpdateResult(1);

      categoryRepository.existsBy?.mockResolvedValue(false);
      categoryRepository.update?.mockResolvedValue(mockUpdateResult);
      categoryRepository.findOne?.mockResolvedValue(mockCategory);

      const result = await service.update(id, dto);

      expect(categoryRepository.existsBy).toHaveBeenCalledWith({
        name: dto.name,
        id: Not(id),
      });
      expect(categoryRepository.update).toHaveBeenCalledWith(id, dto);
      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(mockCategory);
    });

    it('should throw ConflictExcepton when category alread exists', async () => {
      const anotherCategoryId = uuidv7();
      const dto = new UpdateCategoryDto();
      dto.name = 'Mock Name';

      const categoryNameAlreadyExists = true;

      categoryRepository.existsBy?.mockResolvedValue(categoryNameAlreadyExists);

      await expect(service.update(anotherCategoryId, dto)).rejects.toThrow(
        ConflictException,
      );
      expect(categoryRepository.existsBy).toHaveBeenCalledWith({
        name: dto.name,
        id: Not(anotherCategoryId),
      });
    });

    it('should throw NotFoundException when category not found', async () => {
      const id = uuidv7();
      const dto = new UpdateCategoryDto();
      dto.name = 'Mock Name';

      const mockUpdateResult = createMockUpdateResult(0);

      categoryRepository.existsBy?.mockResolvedValue(false);
      categoryRepository.update?.mockResolvedValue(mockUpdateResult);

      await expect(service.update(id, dto)).rejects.toThrow(NotFoundException);
      expect(categoryRepository.findOne).not.toHaveBeenCalled();
    });
  });

  describe('Remove', () => {
    it('should call repository.remove', async () => {
      const id = uuidv7();

      const mockDeleteResult = createMockDeleteResult(1);

      categoryRepository.delete?.mockResolvedValue(mockDeleteResult);

      await service.remove(id);

      expect(categoryRepository.delete).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException when category not found', async () => {
      const id = uuidv7();

      const mockDeleteResult = createMockDeleteResult(0);

      categoryRepository.delete?.mockResolvedValue(mockDeleteResult);

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
    });
  });
});
