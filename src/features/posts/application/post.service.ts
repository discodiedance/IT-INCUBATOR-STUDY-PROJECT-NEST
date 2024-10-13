import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OutputPostTypeWithStatus } from '../api/models/output';
import { CreatePostDataType, UpdatePostDataType } from '../api/models/post.dto';
import { PostDocument, PostModelType } from '../api/models/post.entities';
import { createPostMapper } from './post.mapper';
import { PostRepository } from '../infrastructure/post.repository';
import { Post } from './post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    private readonly PostRepository: PostRepository,
  ) {}

  async createPost(
    inputCreatePostData: CreatePostDataType,
  ): Promise<OutputPostTypeWithStatus> {
    const createdPost = this.PostModel.createPost(inputCreatePostData);
    await this.PostRepository.save(createdPost);
    return createPostMapper(createdPost);
  }

  async updatePost(
    post: PostDocument,
    updateData: UpdatePostDataType,
  ): Promise<boolean> {
    post.updatePost(updateData);
    const updatedPost = await this.PostRepository.save(post);
    if (!updatedPost) {
      return false;
    }
    return true;
  }
}
