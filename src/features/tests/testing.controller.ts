import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BlogModelType } from '../bloggers-platform/blogs/api/models/blogs.entities';
import { Blog } from '../bloggers-platform/blogs/application/blog.entity';
import { CommentModelType } from '../bloggers-platform/comments/api/models/comment.entities';
import { CommentLikesModelType } from '../bloggers-platform/likes/comments/api/models/comment-likes.entities';
import { CommentLikes } from '../bloggers-platform/likes/comments/application/comment-likes.entity';
import { PostLikesModelType } from '../bloggers-platform/likes/posts/api/models/post-likes.entities';
import { PostLikes } from '../bloggers-platform/likes/posts/application/post-likes.entity';
import { PostModelType } from '../bloggers-platform/posts/api/models/post.entities';
import { UserModelType } from '../user-accounts/users/api/models/user.enitities';
import { User } from '../user-accounts/users/application/user.entity';
import { Comment } from '../bloggers-platform/comments/application/comment.entity';
import { Post } from '../bloggers-platform/posts/application/post.entity';

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
