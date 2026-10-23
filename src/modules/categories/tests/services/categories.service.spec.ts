import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Logger } from 'nestjs-pino';
import { HttpStatus } from '@nestjs/common';
import { Not } from 'typeorm';
import { uuidv7 } from 'uuidv7';

import {
  createMockRepository,
  MockRepository,
} from '@common/testing/mock-repository';
import {
  createMockCategory,
  createMockUser,
} from '@common/testing/mock-entities';
import { CategoriesService } from '@modules/categories/services/categories.service';
import { Category } from '@modules/categories/entities/categories.entity';
import { createMockLogger } from '@common/testing/mock-logger';
import {
  CategoryFilterDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@modules/categories/dto';
import {
  createMockDeleteResult,
  createMockQueryBuilder,
  createMockUpdateResult,
} from '@common/testing/mock-typeorm';
import { ErrorCodes } from '@common/enums/error-codes.enum';
import { AppException } from '@common/exceptions/app.exception';

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
    it('should return all categories for user', async () => {
      const dto = new CategoryFilterDto();
      dto.search = undefined;

      const mockUser = createMockUser();
      const mockCategories = [
        createMockCategory({ createdByUserId: mockUser.id }),
      ];

      const mockQueryBuilder = createMockQueryBuilder();
      vi.mocked(categoryRepository.createQueryBuilder!).mockReturnValue(
        mockQueryBuilder,
      );
      vi.mocked(mockQueryBuilder.getMany).mockResolvedValue(mockCategories);

      const result = await service.findAll({
        userId: mockUser.id,
        filters: dto,
      });

      expect(mockQueryBuilder.getMany).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockCategories);
    });

    it('should return filtered categories when search filter is provided', async () => {
      const dto = new CategoryFilterDto();
      dto.search = 'mock category 3';

      const mockUser = createMockUser();
      const mockCategories = [
        createMockCategory({
          name: 'mock category 1',
          createdByUserId: mockUser.id,
        }),
        createMockCategory({
          name: 'mock category 2',
          createdByUserId: mockUser.id,
        }),
        createMockCategory({
          name: 'mock category 3',
          createdByUserId: mockUser.id,
        }),
      ];

      const mockCategoriesFilter = mockCategories.filter(
        (category) => category.name === 'mock category 3',
      );

      const mockQueryBuilder = createMockQueryBuilder();
      vi.mocked(categoryRepository.createQueryBuilder!).mockReturnValue(
        mockQueryBuilder,
      );
      vi.mocked(mockQueryBuilder.getMany).mockResolvedValue(
        mockCategoriesFilter,
      );

      const result = await service.findAll({
        userId: mockUser.id,
        filters: dto,
      });

      expect(mockQueryBuilder.getMany).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockCategoriesFilter);
    });
  });

  describe('FindOne', () => {
    it('should throw NotFoundException when category not found', async () => {
      const mockUser = createMockUser();
      const mockCategory = createMockCategory({ createdByUserId: mockUser.id });

      vi.mocked(categoryRepository.findOne!).mockResolvedValue(null);

      await expect(
        service.findOne({ userId: mockUser.id, categoryId: mockCategory.id }),
      ).rejects.toThrow(
        new AppException(
          ErrorCodes.CATEGORY_NOT_FOUND,
          'Category not found',
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('should call repository.findOne and return result', async () => {
      const mockUser = createMockUser();
      const mockCategory = createMockCategory({ createdByUserId: mockUser.id });

      vi.mocked(categoryRepository.findOne!).mockResolvedValue(mockCategory);

      const result = await service.findOne({
        userId: mockUser.id,
        categoryId: mockCategory.id,
      });

      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockCategory.id, createdByUserId: mockUser.id },
      });
      expect(categoryRepository.findOne).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockCategory);
    });
  });

  describe('Create', () => {
    it('should throw ConflictException when category already exists', async () => {
      const dto = new CreateCategoryDto();
      dto.name = 'Mock Name';
      dto.description = 'Mock Description';
      dto.color = '#ffffff';

      const mockUser = createMockUser();

      vi.mocked(categoryRepository.existsBy!).mockResolvedValue(true);

      await expect(
        service.create({ userId: mockUser.id, createCategoryDto: dto }),
      ).rejects.toThrow(
        new AppException(
          ErrorCodes.CATEGORY_NAME_ALREADY_EXISTS,
          'Category already exists',
          HttpStatus.CONFLICT,
        ),
      );
      expect(categoryRepository.existsBy).toHaveBeenCalledWith({
        name: dto.name,
        createdByUserId: mockUser.id,
        excludeCategoryId: undefined,
      });
      expect(categoryRepository.create).not.toHaveBeenCalled();
      expect(categoryRepository.save).not.toHaveBeenCalled();
    });

    it('should call repository.create and return category', async () => {
      const dto = new CreateCategoryDto();
      dto.name = 'Mock Name';
      dto.description = 'Mock Description';
      dto.color = '#ffffff';

      const mockUser = createMockUser();
      const mockCategory = createMockCategory({
        name: dto.name,
        description: dto.description,
        color: dto.color,
        createdByUserId: mockUser.id,
      });

      vi.mocked(categoryRepository.existsBy!).mockResolvedValue(false);
      vi.mocked(categoryRepository.create!).mockReturnValue(mockCategory);
      vi.mocked(categoryRepository.save!).mockResolvedValue(mockCategory);

      const result = await service.create({
        userId: mockUser.id,
        createCategoryDto: dto,
      });

      expect(categoryRepository.existsBy).toHaveBeenCalledWith({
        name: dto.name,
        createdByUserId: mockUser.id,
        excludeCategoryId: undefined,
      });
      expect(categoryRepository.create).toHaveBeenCalledWith({
        ...dto,
        createdByUserId: mockUser.id,
      });
      expect(categoryRepository.save).toHaveBeenCalledWith(mockCategory);
      expect(result).toEqual(mockCategory);
    });
  });

  describe('Update', () => {
    it('should throw ConflictExcepton when category already exists', async () => {
      const dto = new UpdateCategoryDto();
      dto.name = 'Mock Name';

      const anotherCategoryId = uuidv7();

      const mockUser = createMockUser();

      vi.mocked(categoryRepository.existsBy!).mockResolvedValue(true);

      await expect(
        service.update({
          userId: mockUser.id,
          categoryId: anotherCategoryId,
          updateCategoryDto: dto,
        }),
      ).rejects.toThrow(
        new AppException(
          ErrorCodes.CATEGORY_NAME_ALREADY_EXISTS,
          'Category already exists',
          HttpStatus.CONFLICT,
        ),
      );
      expect(categoryRepository.existsBy).toHaveBeenCalledWith({
        name: dto.name,
        createdByUserId: mockUser.id,
        id: Not(anotherCategoryId),
      });
    });

    it('should throw NotFoundException when category not found', async () => {
      const dto = new UpdateCategoryDto();
      dto.name = 'Mock Name';

      const mockUser = createMockUser();
      const mockCategory = createMockCategory({ createdByUserId: mockUser.id });
      const mockUpdateResult = createMockUpdateResult(0);

      vi.mocked(categoryRepository.existsBy!).mockResolvedValue(false);
      vi.mocked(categoryRepository.update!).mockResolvedValue(mockUpdateResult);

      await expect(
        service.update({
          userId: mockUser.id,
          categoryId: mockCategory.id,
          updateCategoryDto: dto,
        }),
      ).rejects.toThrow(
        new AppException(
          ErrorCodes.CATEGORY_NOT_FOUND,
          'Category not found',
          HttpStatus.NOT_FOUND,
        ),
      );
      expect(categoryRepository.findOne).not.toHaveBeenCalled();
    });

    it('should call repository.update and return category', async () => {
      const dto = new UpdateCategoryDto();
      dto.name = 'Mock Update Name';

      const id = uuidv7();
      const mockUser = createMockUser();
      const mockCategory = createMockCategory({
        id,
        name: 'Mock Update Name',
        createdByUserId: mockUser.id,
      });
      const mockUpdateResult = createMockUpdateResult(1);

      vi.mocked(categoryRepository.existsBy!).mockResolvedValue(false);
      vi.mocked(categoryRepository.update!).mockResolvedValue(mockUpdateResult);
      vi.mocked(categoryRepository.findOne!).mockResolvedValue(mockCategory);

      const result = await service.update({
        userId: mockUser.id,
        categoryId: mockCategory.id,
        updateCategoryDto: dto,
      });

      expect(categoryRepository.existsBy).toHaveBeenCalledWith({
        name: dto.name,
        createdByUserId: mockUser.id,
        id: Not(mockCategory.id),
      });
      expect(categoryRepository.update).toHaveBeenCalledWith(
        { id: mockCategory.id, createdByUserId: mockUser.id },
        dto,
      );
      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockCategory.id, createdByUserId: mockUser.id },
      });
      expect(result).toEqual(mockCategory);
    });
  });

  describe('Remove', () => {
    it('should throw NotFoundException when category not found', async () => {
      const id = uuidv7();
      const mockUser = createMockUser();
      const mockCategory = createMockCategory({
        id,
        createdByUserId: mockUser.id,
      });
      const mockDeleteResult = createMockDeleteResult(0);

      vi.mocked(categoryRepository.delete!).mockResolvedValue(mockDeleteResult);

      await expect(
        service.remove({ userId: mockUser.id, categoryId: mockCategory.id }),
      ).rejects.toThrow(
        new AppException(
          ErrorCodes.CATEGORY_NOT_FOUND,
          'Category not found',
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('should call repository.remove', async () => {
      const id = uuidv7();
      const mockUser = createMockUser();
      const mockCategory = createMockCategory({
        id,
        createdByUserId: mockUser.id,
      });
      const mockDeleteResult = createMockDeleteResult(1);

      vi.mocked(categoryRepository.delete!).mockResolvedValue(mockDeleteResult);

      await service.remove({
        userId: mockUser.id,
        categoryId: mockCategory.id,
      });

      expect(categoryRepository.delete).toHaveBeenCalledWith({
        createdByUserId: mockUser.id,
        id: mockCategory.id,
      });
    });
  });
});
