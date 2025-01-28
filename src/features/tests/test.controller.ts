import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/application/user.entity';
import { UserModelType } from '../users/api/models/user.enitities';
import { BlogModelType } from '../blogs/api/models/blogs.entities';
import { Blog } from '../blogs/application/blog.entity';
import { CommentModelType } from '../comments/api/models/comment.entities';
import { CommentLikesModelType } from '../likes/comments/api/models/comment-likes.entities';
import { CommentLikes } from '../likes/comments/application/comment-likes.entity';
import { PostLikesModelType } from '../likes/posts/api/models/post-likes.entities';
import { PostLikes } from '../likes/posts/application/post-likes.entity';
import { PostModelType } from '../posts/api/models/post.entities';
import { Post } from './../posts/application/post.entity';
import { Comment } from '../comments/application/comment.entity';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectModel(CommentLikes.name)
    private CommentLikesModel: CommentLikesModelType,
    @InjectModel(PostLikes.name) private PostLikesModel: PostLikesModelType,
  ) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllData() {
    await this.UserModel.deleteMany({});
    await this.BlogModel.deleteMany({});
    await this.PostModel.deleteMany({});
    await this.CommentModel.deleteMany({});
    await this.CommentLikesModel.deleteMany({});
    await this.PostLikesModel.deleteMany({});
  }
}
