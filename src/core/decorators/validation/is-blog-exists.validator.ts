import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { BlogRepository } from '../../../features/bloggers-platform/blogs/infrastrucutre/blog.repository';

@ValidatorConstraint({ async: true })
@Injectable()
export class BlogExistsValidator implements ValidatorConstraintInterface {
  constructor(private readonly blogRepository: BlogRepository) {}

  async validate(blogId: string, args: ValidationArguments) {
    const blog = await this.blogRepository.getById(blogId);

    if (!blog) {
      return false;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Blog with this ID does not exist';
  }
}
