import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentDocument,
  CommentModelType,
} from '../api/models/comment.entities';
import { Comment } from '../application/comment.entity';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async save(model: CommentDocument) {
    return await model.save();
  }

  async delete(id: string): Promise<boolean> {
    const deleteResult = await this.CommentModel.deleteOne({ id: id });
    return deleteResult.deletedCount === 1;
  }

  async getById(id: string): Promise<CommentDocument | null> {
    const comment = await this.CommentModel.findOne({ id: id });

    if (!comment) {
      return null;
    }

    return comment;
  }
}
