import { Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"

import { CategoriesService } from "@modules/categories/services/categories.service"
import { Category } from "@modules/categories/entities/categories.entity"
import { createMockRepository, MockRepository } from "@common/testing/mock-repository"
import { createMockCategory } from "@common/testing/mock-entities"

describe('CategoriesService', () => {
  let service: CategoriesService
  let categoryRepository: MockRepository<Category>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: createMockRepository<Category>()
        }
      ]
    }).compile()

    service = moduleRef.get(CategoriesService);
    categoryRepository = moduleRef.get(getRepositoryToken(Category));
  })

  describe('FindAll', () => {
    it('should call repository.find and return result', async () => {
      const mockCategories = [createMockCategory()]
      categoryRepository.find?.mockResolvedValue(mockCategories);

      const result = await service.findAll();

      expect(categoryRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockCategories);
    })
  })
})