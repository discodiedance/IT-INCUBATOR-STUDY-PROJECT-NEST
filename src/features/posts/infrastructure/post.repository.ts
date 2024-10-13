import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PostModelType, PostDocument } from '../api/models/post.entities';
import { Post } from '../application/post.entity';

@Injectable()
export class PostRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}
  async save(model: PostDocument) {
    return await model.save();
  }

  async delete(id: string): Promise<boolean> {
    const deleteResult = await this.PostModel.deleteOne({ id: id });
    return deleteResult.deletedCount === 1;
  }

  async getById(id: string): Promise<PostDocument | null> {
    const post = await this.PostModel.findOne({ id: id });
    if (!post) {
      return null;
    }
    return post;
  }
}
