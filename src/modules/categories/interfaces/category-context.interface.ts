import { CreateCategoryDto, UpdateCategoryDto } from '@modules/categories/dto';

export interface CategoryContext {
  userId: string;
  categoryId: string;
}

export type CategoryContextWithCreateCategoryDto = Omit<
  CategoryContext,
  'categoryId'
> & {
  createCategoryDto: CreateCategoryDto;
};

export type CategoryContextWithUpdateCategoryDto = CategoryContext & {
  updateCategoryDto: UpdateCategoryDto;
};

export type CategoryContextWithValidationName = Omit<
  CategoryContext,
  'categoryId'
> & {
  name: string;
  excludeCategoryId?: string;
};
