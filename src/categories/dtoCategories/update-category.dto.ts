import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from '../../categories/dtoCategories/create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
