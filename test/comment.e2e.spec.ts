import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { initSettings } from './helpers/init-settings';
import { CommentTestManager } from './helpers/managers/comment-test.manager';
import { deleteAllData } from './helpers/delete-all-data';
import { InputCreateUserAccountDataType } from '../src/features/user-accounts/users/api/models/dto/input';
import { AuthTestManager } from './helpers/managers/auth-test-manager';
import { UsersTestManager } from './helpers/managers/user-test-manager';
import { BlogTestManager } from './helpers/managers/blog-test-manager';
import { PostTestManager } from './helpers/managers/post-test.manager';
import { InputCreateBlogDataType } from '../src/features/bloggers-platform/blogs/api/models/dto/input';
import { InputCreatePostToBlogDataType } from '../src/features/bloggers-platform/posts/api/models/dto/input';
import {
  InputCreateCommentDataType,
  InputUpdateCommentDataType,
} from '../src/features/bloggers-platform/comments/api/models/dto/input';
import { InputCreateCommentLikeDataType } from '../src/features/bloggers-platform/likes/comments/api/models/dto/comment-likes.dto';
import { UserAccountsConfig } from '../src/features/user-accounts/config/user-accounts.config';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '../src/features/user-accounts/users/constants/auth-tokens.inject-constants';

describe('Comments', () => {
  let app: INestApplication;
  let commentTestManager: CommentTestManager;
  let userTestManager: UsersTestManager;
  let authTestManager: AuthTestManager;
  let blogTestManager: BlogTestManager;
  let postTestManager: PostTestManager;

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) =>
      moduleBuilder
        .overrideProvider(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
        .useFactory({
          factory: (userAccountsConfig: UserAccountsConfig) => {
            return new JwtService({
              secret: userAccountsConfig.accessTokenSecret,
              signOptions: { expiresIn: '5m' },
            });
          },
          inject: [UserAccountsConfig],
        }),
    );
    app = result.app;
    commentTestManager = result.commentTestManager;
    userTestManager = result.userTestManger;
    authTestManager = result.authTestManager;
    blogTestManager = result.blogTestManager;
    postTestManager = result.postTestManager;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Get comment', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    let userId: string;
    let JWT: string;
    let blogId: string;
    let postId: string;
    let commentId: string;

    const goodUser: InputCreateUserAccountDataType = {
      login: 'goodLogin1',
      password: 'goodPassword1',
      email: 'goodEmail1@gmail.com',
    };

    const goodBlog: InputCreateBlogDataType = {
      name: 'goodName',
      description: 'goodDescription',
      websiteUrl: 'https://goodUrl.com',
    };

    const goodPost: InputCreatePostToBlogDataType = {
      title: 'goodTitle',
      shortDescription: 'goodShortDescription',
      content: 'goodContent',
    };

    const goodComment: InputCreateCommentDataType = {
      content: 'goodContentToCommentForCreate',
    };

    it('Register and login user 1', async () => {
      const responseRegister = await authTestManager.registrationUser(goodUser);
      expect(responseRegister.status).toEqual(204);
      const user = await userTestManager.getUserByLogin(goodUser.login);
      userId = user!.id;

      const responseLogin = await authTestManager.login({
        loginOrEmail: goodUser.login,
        password: goodUser.password,
      });
      expect(responseLogin.status).toEqual(200);
      JWT = responseLogin.body.accessToken;
    });

    it('Create blog, post, comment by user', async () => {
      const responseBlog = await blogTestManager.createBlog(goodBlog);
      expect(responseBlog.status).toEqual(201);
      blogId = responseBlog.body.id;

      const responsePost = await blogTestManager.createPostToBlog(
        blogId,
        goodPost,
      );
      expect(responsePost.status).toEqual(201);
      postId = responsePost.body.id;

      const responseComment = await postTestManager.createCommentToPost(
        postId,
        goodComment,
        JWT,
      );

      expect(responseComment.status).toEqual(201);
      commentId = responseComment.body.id;
    });

    it('It should get comment by id', async () => {
      const response = await commentTestManager.getComment(commentId, JWT);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        id: commentId,
        content: goodComment.content,
        commentatorInfo: {
          userId: userId,
          userLogin: goodUser.login,
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
        },
      });
    });

    it("It shouldn't get comment by id with not existing commentId", async () => {
      const response =
        await commentTestManager.getCommentWithNotExistingId('notExistingId');
      expect(response.status).toEqual(404);
    });
  });

  describe('Update comment', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    let userId1: string;
    let user1JWT: string;
    let user2JWT: string;
    let blogId: string;
    let postId: string;
    let commentId: string;

    const goodUser: InputCreateUserAccountDataType = {
      login: 'goodLogin1',
      password: 'goodPassword1',
      email: 'goodEmail1@gmail.com',
    };

    const goodUser2: InputCreateUserAccountDataType = {
      login: 'goodLogin2',
      password: 'goodPassword2',
      email: 'goodEmail2@gmail.com',
    };

    const goodBlog: InputCreateBlogDataType = {
      name: 'goodName',
      description: 'goodDescription',
      websiteUrl: 'https://goodUrl.com',
    };

    const goodPost: InputCreatePostToBlogDataType = {
      title: 'goodTitle',
      shortDescription: 'goodShortDescription',
      content: 'goodContent',
    };

    const goodComment: InputCreateCommentDataType = {
      content: 'goodContentToCommentForCreate',
    };

    it('Register and login users 1, 2', async () => {
      const responseRegister1 =
        await authTestManager.registrationUser(goodUser);
      expect(responseRegister1.status).toEqual(204);
      const user = await userTestManager.getUserByLogin(goodUser.login);
      userId1 = user!.id;

      const responseRegister2 =
        await authTestManager.registrationUser(goodUser2);
      expect(responseRegister2.status).toEqual(204);

      const responseLogin1 = await authTestManager.login({
        loginOrEmail: goodUser.login,
        password: goodUser.password,
      });
      expect(responseLogin1.status).toEqual(200);
      user1JWT = responseLogin1.body.accessToken;

      const responseLogin2 = await authTestManager.login({
        loginOrEmail: goodUser2.login,
        password: goodUser2.password,
      });
      expect(responseLogin2.status).toEqual(200);
      user2JWT = responseLogin2.body.accessToken;
    });

    it('Create blog, post, comment by user1', async () => {
      const responseBlog = await blogTestManager.createBlog(goodBlog);
      expect(responseBlog.status).toEqual(201);
      blogId = responseBlog.body.id;

      const responsePost = await blogTestManager.createPostToBlog(
        blogId,
        goodPost,
      );
      expect(responsePost.status).toEqual(201);
      postId = responsePost.body.id;

      const responseComment = await postTestManager.createCommentToPost(
        postId,
        goodComment,
        user1JWT,
      );

      expect(responseComment.status).toEqual(201);
      commentId = responseComment.body.id;
    });

    it("It shouldn't update comment of user1 by user2", async () => {
      const body: InputUpdateCommentDataType = {
        content: 'newContentForUpdateByUser2',
      };

      const response = await commentTestManager.updateCommentByOtherUser(
        commentId,
        body,
        user2JWT,
      );
      expect(response.status).toEqual(403);
    });

    it("It shouldn't update comment of user1 with incorrect auth", async () => {
      const body: InputUpdateCommentDataType = {
        content: 'newContentForUpdateData',
      };

      const response = await commentTestManager.updateCommentWithIncorrectAuth(
        commentId,
        body,
        '123',
      );

      expect(response.status).toEqual(401);
    });

    it("It shouldn't update comment of user1 with not existing commentId", async () => {
      const body: InputUpdateCommentDataType = {
        content: 'newContentForUpdateData',
      };

      const response = await commentTestManager.updateCommentWithNotExistingId(
        '123',
        body,
        user1JWT,
      );

      expect(response.status).toEqual(404);
    });

    it("It shouldn't update comment of user1 with long content", async () => {
      const body: InputUpdateCommentDataType = {
        content: 'newContentForUpdateData'.repeat(100),
      };

      const response = await commentTestManager.updateCommentWithBodyErrors(
        commentId,
        body,
        user1JWT,
      );

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'content',
          },
        ],
      });
    });

    it("It shouldn't update comment of user1 with short content", async () => {
      const body: InputUpdateCommentDataType = {
        content: '123',
      };

      const response = await commentTestManager.updateCommentWithBodyErrors(
        commentId,
        body,
        user1JWT,
      );

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'content',
          },
        ],
      });
    });

    it("It shouldn't update comment of user1 with invalid content", async () => {
      const body = {
        content: null,
      };

      const response = await commentTestManager.updateCommentWithBodyErrors(
        commentId,
        body,
        user1JWT,
      );

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'content',
          },
        ],
      });
    });

    it('It should update comment of user1 by user1', async () => {
      const body: InputUpdateCommentDataType = {
        content: 'newGoodContentForUpdateData',
      };

      const response = await commentTestManager.updateComment(
        commentId,
        body,
        user1JWT,
      );

      const updatedComment = await commentTestManager.getComment(
        commentId,
        user1JWT,
      );

      expect(response.status).toEqual(204);
      expect(updatedComment.body).toEqual({
        id: expect.any(String),
        content: body.content,
        commentatorInfo: {
          userId: userId1,
          userLogin: goodUser.login,
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
        },
      });
    });
  });

  describe('Delete comment', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    let user1JWT: string;
    let user2JWT: string;
    let blogId: string;
    let postId: string;
    let commentId: string;

    const goodUser: InputCreateUserAccountDataType = {
      login: 'goodLogin1',
      password: 'goodPassword1',
      email: 'goodEmail1@gmail.com',
    };

    const goodUser2: InputCreateUserAccountDataType = {
      login: 'goodLogin2',
      password: 'goodPassword2',
      email: 'goodEmail2@gmail.com',
    };

    const goodBlog: InputCreateBlogDataType = {
      name: 'goodName',
      description: 'goodDescription',
      websiteUrl: 'https://goodUrl.com',
    };

    const goodPost: InputCreatePostToBlogDataType = {
      title: 'goodTitle',
      shortDescription: 'goodShortDescription',
      content: 'goodContent',
    };

    const goodComment: InputCreateCommentDataType = {
      content: 'goodContentToCommentForCreate',
    };

    it('Register & login users 1, 2', async () => {
      const responseRegister1 =
        await authTestManager.registrationUser(goodUser);
      expect(responseRegister1.status).toEqual(204);

      const responseRegister2 =
        await authTestManager.registrationUser(goodUser2);
      expect(responseRegister2.status).toEqual(204);

      const responseLogin1 = await authTestManager.login({
        loginOrEmail: goodUser.login,
        password: goodUser.password,
      });
      expect(responseLogin1.status).toEqual(200);
      user1JWT = responseLogin1.body.accessToken;

      const responseLogin2 = await authTestManager.login({
        loginOrEmail: goodUser2.login,
        password: goodUser2.password,
      });
      expect(responseLogin2.status).toEqual(200);
      user2JWT = responseLogin2.body.accessToken;
    });

    it('Create blog, post, comment by user1', async () => {
      const responseBlog = await blogTestManager.createBlog(goodBlog);
      expect(responseBlog.status).toEqual(201);
      blogId = responseBlog.body.id;

      const responsePost = await blogTestManager.createPostToBlog(
        blogId,
        goodPost,
      );
      expect(responsePost.status).toEqual(201);
      postId = responsePost.body.id;

      const responseComment = await postTestManager.createCommentToPost(
        postId,
        goodComment,
        user1JWT,
      );

      expect(responseComment.status).toEqual(201);
      commentId = responseComment.body.id;
    });

    it("It shouldn't delete comment of user1 by user2", async () => {
      const response = await commentTestManager.deleteCommentByOtherUser(
        commentId,
        user2JWT,
      );

      expect(response.status).toEqual(403);
    });

    it("It shouldn't delete comment of user1 with incorrect auth", async () => {
      const response = await commentTestManager.deleteCommentWithIncorrectAuth(
        commentId,
        'incorrectJWT',
      );

      expect(response.status).toEqual(401);
    });

    it("It shouldn't delete comment of user1 with not existing commentId", async () => {
      const response = await commentTestManager.deleteCommentWithNotExistingId(
        'incorrectId',
        user1JWT,
      );

      expect(response.status).toEqual(404);
    });

    it('It should delete comment of user1 by user1', async () => {
      const response = await commentTestManager.deleteComment(
        commentId,
        user1JWT,
      );

      const commentAfterDelete =
        await commentTestManager.getCommentWithNotExistingId(commentId);

      expect(response.status).toEqual(204);
      expect(commentAfterDelete.status).toEqual(404);
    });
  });

  describe('Put reaction to post', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    let userJWT1: string;
    let userJWT2: string;
    let blogId: string;
    let postId: string;
    let commentId: string;

    const goodUser1: InputCreateUserAccountDataType = {
      login: 'goodLogin1',
      password: 'goodPassword1',
      email: 'goodEmail1@gmail.com',
    };

    const goodUser2: InputCreateUserAccountDataType = {
      login: 'goodLogin2',
      password: 'goodPassword2',
      email: 'goodEmail2@gmail.com',
    };

    const goodBlog: InputCreateBlogDataType = {
      name: 'goodName',
      description: 'goodDescription',
      websiteUrl: 'https://goodUrl.com',
    };

    const goodPost: InputCreatePostToBlogDataType = {
      title: 'goodTitle',
      shortDescription: 'goodShortDescription',
      content: 'goodContent',
    };

    const goodComment: InputCreateCommentDataType = {
      content: 'goodContentToCommentForCreate',
    };

    it('Register & login user 1, 2', async () => {
      const responseRegister1 =
        await authTestManager.registrationUser(goodUser1);
      expect(responseRegister1.status).toEqual(204);

      const responseLogin1 = await authTestManager.login({
        loginOrEmail: goodUser1.login,
        password: goodUser1.password,
      });
      expect(responseLogin1.status).toEqual(200);
      userJWT1 = responseLogin1.body.accessToken;

      const responseRegister2 =
        await authTestManager.registrationUser(goodUser2);
      expect(responseRegister2.status).toEqual(204);

      const responseLogin2 = await authTestManager.login({
        loginOrEmail: goodUser2.login,
        password: goodUser2.password,
      });
      expect(responseLogin2.status).toEqual(200);
      userJWT2 = responseLogin2.body.accessToken;
    });

    it('Create blog, post, comment by user', async () => {
      const responseBlog = await blogTestManager.createBlog(goodBlog);
      expect(responseBlog.status).toEqual(201);
      blogId = responseBlog.body.id;

      const responsePost = await blogTestManager.createPostToBlog(
        blogId,
        goodPost,
      );
      expect(responsePost.status).toEqual(201);
      postId = responsePost.body.id;

      const responseComment = await postTestManager.createCommentToPost(
        postId,
        goodComment,
        userJWT1,
      );

      expect(responseComment.status).toEqual(201);
      commentId = responseComment.body.id;
    });

    it("It shouldn't like comment with incorrect auth", async () => {
      const body: InputCreateCommentLikeDataType = {
        likeStatus: 'Like',
      };
      const response =
        await commentTestManager.putReactionToCommentWithIncorrectAuth(
          commentId,
          body,
          'incorrectJWT',
        );

      expect(response.status).toEqual(401);
    });

    it("It shouldn't like comment with not existing commentId", async () => {
      const body: InputCreateCommentLikeDataType = {
        likeStatus: 'Like',
      };
      const response =
        await commentTestManager.putReactionToCommentWithNotExistingId(
          'incorrectId',
          body,
          userJWT1,
        );

      expect(response.status).toEqual(404);
    });

    it("It shouldn't like comment with incorrect likeStatus", async () => {
      const body = {
        likeStatus: 'IncorrectLikeStatus',
      };
      const response =
        await commentTestManager.putReactionToCommentWithBodyErros(
          commentId,
          body,
          userJWT1,
        );

      expect(response.status).toEqual(400);
    });

    it("It shouldn't like comment with invalid likeStatus", async () => {
      const body = {
        likeStatus: null,
      };
      const response =
        await commentTestManager.putReactionToCommentWithBodyErros(
          commentId,
          body,
          userJWT1,
        );

      expect(response.status).toEqual(400);
    });

    it('It should like comment by user1', async () => {
      const body: InputCreateCommentLikeDataType = {
        likeStatus: 'Like',
      };

      const response = await commentTestManager.putReactionToComment(
        commentId,
        body,
        userJWT1,
      );

      const comment = await commentTestManager.getComment(commentId, userJWT1);

      expect(response.status).toEqual(204);
      expect(comment.body.likesInfo).toEqual({
        likesCount: 1,
        dislikesCount: 0,
        myStatus: 'Like',
      });
    });

    it('It should dislike comment by user2', async () => {
      const body: InputCreateCommentLikeDataType = {
        likeStatus: 'Dislike',
      };

      const response = await commentTestManager.putReactionToComment(
        commentId,
        body,
        userJWT2,
      );

      const comment = await commentTestManager.getComment(commentId, userJWT2);

      expect(response.status).toEqual(204);
      expect(comment.body.likesInfo).toEqual({
        likesCount: 1,
        dislikesCount: 1,
        myStatus: 'Dislike',
      });
    });

    it('It should change like to dislike by user1', async () => {
      const body: InputCreateCommentLikeDataType = {
        likeStatus: 'Dislike',
      };

      const response = await commentTestManager.putReactionToComment(
        commentId,
        body,
        userJWT1,
      );

      const comment = await commentTestManager.getComment(commentId, userJWT1);
      expect(response.status).toEqual(204);
      expect(comment.body.likesInfo).toEqual({
        likesCount: 0,
        dislikesCount: 2,
        myStatus: 'Dislike',
      });
    });

    it('It shouldn change dislike to like by user2', async () => {
      const body: InputCreateCommentLikeDataType = {
        likeStatus: 'Like',
      };
      const response = await commentTestManager.putReactionToComment(
        commentId,
        body,
        userJWT2,
      );

      const comment = await commentTestManager.getComment(commentId, userJWT2);

      expect(response.status).toEqual(204);
      expect(comment.body.likesInfo).toEqual({
        likesCount: 1,
        dislikesCount: 1,
        myStatus: 'Like',
      });
    });

    it('It should change like to none by user2', async () => {
      const body: InputCreateCommentLikeDataType = {
        likeStatus: 'None',
      };
      const response = await commentTestManager.putReactionToComment(
        commentId,
        body,
        userJWT2,
      );

      const comment = await commentTestManager.getComment(commentId, userJWT2);

      expect(response.status).toEqual(204);
      expect(comment.body.likesInfo).toEqual({
        likesCount: 0,
        dislikesCount: 1,
        myStatus: 'None',
      });
    });
  });
});
