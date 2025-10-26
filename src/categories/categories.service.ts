import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dtoCategories/create-category.dto';
import { UpdateCategoryDto } from './dtoCategories/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private repo: Repository<Category>,
  ) {}

  async create(data: CreateCategoryDto) {
    const existing = await this.repo.findOne({ where: { name: data.name } });
    if (existing) {
      throw new ConflictException('Category name already exists');
    }
    const category = this.repo.create(data);
    return await this.repo.save(category);
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const category = await this.repo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: number, data: UpdateCategoryDto) {
    await this.findOne(id);
    if (data.name) {
      const existing = await this.repo.findOne({ where: { name: data.name } });
      if (existing && existing.id !== id) {
        throw new ConflictException('Category name already exists');
      }
    }
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    // Verificar se há produtos usando essa categoria
    const category = await this.repo.findOne({ 
      where: { id },
      relations: ['products'],
    });
    if (category && 'products' in category && Array.isArray(category.products) && category.products.length > 0) {
      throw new ConflictException('Cannot delete category with associated products');
    }
    return this.repo.delete(id);
  }
}
