import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { initSettings } from './helpers/init-settings';
import { PostTestManager } from './helpers/managers/post-test.manager';
import { BlogTestManager } from './helpers/managers/blog-test-manager';
import {
  InputCreatePostDataType,
  InputCreatePostToBlogDataType,
  InputUpdatePostDataType,
} from '../src/features/bloggers-platform/posts/api/models/dto/input';
import { deleteAllData } from './helpers/delete-all-data';
import { InputCreatePostLikeDataType } from '../src/features/bloggers-platform/likes/posts/api/models/dto/post-likes.dto';
import { AuthTestManager } from './helpers/managers/auth-test-manager';
import { InputCreateUserAccountDataType } from '../src/features/user-accounts/users/api/models/dto/input';
import { UsersTestManager } from './helpers/managers/user-test-manager';
import { InputCreateBlogDataType } from '../src/features/bloggers-platform/blogs/api/models/dto/input';
import { InputCreateCommentDataType } from '../src/features/bloggers-platform/comments/api/models/dto/input';
import { PostSortDataType } from '../src/features/bloggers-platform/posts/api/models/dto/post.dto';
import { CommentSortDataType } from '../src/features/bloggers-platform/comments/api/models/dto/comment.dto';
import { UserAccountsConfig } from '../src/features/user-accounts/config/user-accounts.config';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '../src/features/user-accounts/users/constants/auth-tokens.inject-constants';

describe('Posts', () => {
  let app: INestApplication;
  let postTestManager: PostTestManager;
  let blogTestManager: BlogTestManager;
  let authTestManager: AuthTestManager;
  let userTestManager: UsersTestManager;

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
    postTestManager = result.postTestManager;
    blogTestManager = result.blogTestManager;
    authTestManager = result.authTestManager;
    userTestManager = result.userTestManger;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Create post', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    let blogId: string;
    let blogName: string;
    it('Create blog', async () => {
      const blog = await blogTestManager.createBlog({
        name: 'goodName',
        description: 'goodDescription',
        websiteUrl: 'https://www.goodUrl.com',
      });

      expect(blog.status).toEqual(201);
      const allBlogs = await blogTestManager.getAllBlogs();
      expect(allBlogs.status).toEqual(200);
      blogId = allBlogs.body.items[0].id;
      blogName = allBlogs.body.items[0].name;
    });
    it('It should create post', async () => {
      const body: InputCreatePostDataType = {
        title: 'goodTitle',
        shortDescription: 'goodShortDescription',
        content: 'goodContent',
        blogId: blogId,
      };
      const response = await postTestManager.createPost(body);

      expect(response.status).toEqual(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        title: body.title,
        shortDescription: body.shortDescription,
        content: body.content,
        blogId: blogId,
        blogName: blogName,
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      });
    });

    it("It shouldn't create post with incorrect auth", async () => {
      const body: InputCreatePostDataType = {
        title: 'goodTitle1',
        shortDescription: 'goodShortDescription1',
        content: 'goodContent1',
        blogId: blogId,
      };
      const response = await postTestManager.createPostWithIncorrectAuth(body);
      expect(response.status).toEqual(401);
    });

    it("It shouldn't create post with long title", async () => {
      const body: InputCreatePostDataType = {
        title: 'longTitle'.repeat(100),
        shortDescription: 'goodShortDescription1',
        content: 'goodContent1',
        blogId: blogId,
      };
      const response = await postTestManager.createPostWithBodyErrors(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'title',
          },
        ],
      });
    });
    it("It shouldn't create post with long shortDescription", async () => {
      const body: InputCreatePostDataType = {
        title: 'goodTitle1',
        shortDescription: 'longShortDescription'.repeat(100),
        content: 'goodContent1',
        blogId: blogId,
      };

      const response = await postTestManager.createPostWithBodyErrors(body);
      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'shortDescription',
          },
        ],
      });
    });
    it("It shouldn't create post with long content", async () => {
      const body: InputCreatePostDataType = {
        title: 'goodTitle1',
        shortDescription: 'goodShortDescription1',
        content: 'longContent'.repeat(100),
        blogId: blogId,
      };
      const response = await postTestManager.createPostWithBodyErrors(body);

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

    it("It shouldn't create post with invalid blogId", async () => {
      const body = {
        title: 'goodTitle1',
        shortDescription: 'goodShortDescription1',
        content: 'goodContent1',
        blogId: null,
      };
      const response = await postTestManager.createPostWithBodyErrors(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'blogId',
          },
        ],
      });
    });

    it("It shouldn't create post with invalid title", async () => {
      const body = {
        title: null,
        shortDescription: 'goodShortDescription1',
        content: 'goodContent1',
        blogId: blogId,
      };
      const response = await postTestManager.createPostWithBodyErrors(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'title',
          },
        ],
      });
    });

    it("It shouldn't create post with invalid short description", async () => {
      const body = {
        title: 'goodTitle1',
        shortDescription: null,
        content: 'goodContent1',
        blogId: blogId,
      };
      const response = await postTestManager.createPostWithBodyErrors(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'shortDescription',
          },
        ],
      });
    });

    it("It shouldn't create post with invalid content", async () => {
      const body = {
        title: 'goodTitle1',
        shortDescription: 'goodShortDescription1',
        content: null,
        blogId: blogId,
      };
      const response = await postTestManager.createPostWithBodyErrors(body);

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
  });

  describe('Put reaction to post', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    let blogId: string;
    let accessToken: string;
    let accessToken2: string;
    let accessToken3: string;
    let userId: string;
    let postId: string;

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

    const goodUser3: InputCreateUserAccountDataType = {
      login: 'goodLogin3',
      password: 'goodPassword3',
      email: 'goodEmail3@gmail.com',
    };

    it('Register and login users 1, 2, 3', async () => {
      const response = await authTestManager.registrationUser(goodUser);
      expect(response.status).toEqual(204);
      const user = await userTestManager.getUserByLogin(goodUser.login);
      userId = user!.id;

      const response2 = await authTestManager.registrationUser(goodUser2);
      expect(response2.status).toEqual(204);

      const response3 = await authTestManager.registrationUser(goodUser3);
      expect(response3.status).toEqual(204);

      const loginResponse1 = await authTestManager.login({
        loginOrEmail: goodUser.login,
        password: goodUser.password,
      });
      expect(loginResponse1.status).toEqual(200);
      accessToken = loginResponse1.body.accessToken;

      const loginResponse2 = await authTestManager.login({
        loginOrEmail: goodUser2.login,
        password: goodUser2.password,
      });
      expect(loginResponse2.status).toEqual(200);
      accessToken2 = loginResponse2.body.accessToken;

      const loginResponse3 = await authTestManager.login({
        loginOrEmail: goodUser3.login,
        password: goodUser3.password,
      });
      expect(loginResponse3.status).toEqual(200);
      accessToken3 = loginResponse3.body.accessToken;
    });

    it('Create blog', async () => {
      const body = {
        name: 'goodName1',
        description: 'goodDescription1',
        websiteUrl: 'https://www.goodUrl1.com',
      };
      const response = await blogTestManager.createBlog(body);
      expect(response.status).toEqual(201);
      blogId = response.body.id;
    });

    it('Create post to blog', async () => {
      const inputCreatePostToBlogData: InputCreatePostToBlogDataType = {
        content: 'goodTitle1',
        shortDescription: 'goodShortDescription1',
        title: 'goodContent1',
      };
      const response = await blogTestManager.createPostToBlog(
        blogId,
        inputCreatePostToBlogData,
      );
      expect(response.status).toEqual(201);
      postId = response.body.id;
    });

    it("It shouldn't put reaction to post with incorrect likestatus", async () => {
      const body = {
        likeStatus: 'badLikeStatus',
      };

      const response = await postTestManager.putReactionToPostWithBodyErrors(
        postId,
        body,
        accessToken,
      );

      expect(response.status).toEqual(400);
    });

    it("It shouldn't put like reaction to post with incorrect auth", async () => {
      const body: InputCreatePostLikeDataType = {
        likeStatus: 'Like',
      };
      const response = await postTestManager.putReactionToPostWithIncorrectAuth(
        postId,
        body,
        userId,
        'Bad token',
      );

      expect(response.status).toEqual(401);
    });

    it("It shouldn't put reaction to post with invalid likestatus", async () => {
      const body = {
        likeStatus: null,
      };

      const response = await postTestManager.putReactionToPostWithBodyErrors(
        postId,
        body,
        accessToken,
      );

      expect(response.status).toEqual(400);
    });

    it("It shouldn't put reaction to post with not found post id", async () => {
      const body: InputCreatePostLikeDataType = {
        likeStatus: 'Like',
      };

      const response =
        await postTestManager.putReactionToPostWithNotExistingPostId(
          '0000',
          body,
          accessToken,
        );

      expect(response.status).toEqual(404);
    });

    it('It should put like reaction to post by user1', async () => {
      const body: InputCreatePostLikeDataType = {
        likeStatus: 'Like',
      };

      const response = await postTestManager.putReactionToPost(
        postId,
        body,
        accessToken,
      );

      const foundPost = await postTestManager.getPostById(postId, accessToken);

      expect(response.status).toEqual(204);
      expect(foundPost.body.extendedLikesInfo).toEqual({
        likesCount: 1,
        dislikesCount: 0,
        myStatus: 'Like',
        newestLikes: [
          {
            addedAt: expect.any(String),
            login: goodUser.login,
            userId: userId,
          },
        ],
      });
    });

    it('It should put dislike reaction to post by user2', async () => {
      const body: InputCreatePostLikeDataType = {
        likeStatus: 'Dislike',
      };

      const response = await postTestManager.putReactionToPost(
        postId,
        body,
        accessToken2,
      );

      const foundPost = await postTestManager.getPostById(postId, accessToken2);

      expect(response.status).toEqual(204);
      expect(foundPost.body.extendedLikesInfo).toEqual({
        likesCount: 1,
        dislikesCount: 1,
        myStatus: 'Dislike',
        newestLikes: [
          {
            addedAt: expect.any(String),
            login: goodUser.login,
            userId: userId,
          },
        ],
      });
    });

    it('It should put dislike reaction to post by user3', async () => {
      const body: InputCreatePostLikeDataType = {
        likeStatus: 'Dislike',
      };

      const response = await postTestManager.putReactionToPost(
        postId,
        body,
        accessToken3,
      );

      const foundPost = await postTestManager.getPostById(postId, accessToken3);

      expect(response.status).toEqual(204);
      expect(foundPost.body.extendedLikesInfo).toEqual({
        likesCount: 1,
        dislikesCount: 2,
        myStatus: 'Dislike',
        newestLikes: [
          {
            addedAt: expect.any(String),
            login: goodUser.login,
            userId: userId,
          },
        ],
      });
    });

    it('It should change like reaction to dislike to post by user1', async () => {
      const body: InputCreatePostLikeDataType = {
        likeStatus: 'Dislike',
      };

      const response = await postTestManager.putReactionToPost(
        postId,
        body,
        accessToken,
      );

      const foundPost = await postTestManager.getPostById(postId, accessToken);

      expect(response.status).toEqual(204);
      expect(foundPost.body.extendedLikesInfo).toEqual({
        likesCount: 0,
        dislikesCount: 3,
        myStatus: 'Dislike',
        newestLikes: [],
      });
    });

    it('It should change like reaction to none to post by user2', async () => {
      const body: InputCreatePostLikeDataType = {
        likeStatus: 'None',
      };

      const response = await postTestManager.putReactionToPost(
        postId,
        body,
        accessToken2,
      );

      const foundPost = await postTestManager.getPostById(postId, accessToken2);

      expect(response.status).toEqual(204);
      expect(foundPost.body.extendedLikesInfo).toEqual({
        likesCount: 0,
        dislikesCount: 2,
        myStatus: 'None',
        newestLikes: [],
      });
    });
    it('It should change dislike reaction to like to post by user3', async () => {
      const body: InputCreatePostLikeDataType = {
        likeStatus: 'Like',
      };

      const response = await postTestManager.putReactionToPost(
        postId,
        body,
        accessToken3,
      );

      const foundPost = await postTestManager.getPostById(postId, accessToken3);

      expect(response.status).toEqual(204);
      expect(foundPost.body.extendedLikesInfo).toEqual({
        likesCount: 1,
        dislikesCount: 1,
        myStatus: 'Like',
        newestLikes: [],
      });
    });
  });

  describe('Get all posts', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    let blogId: string;

    it('Create blog', async () => {
      const body: InputCreateBlogDataType = {
        name: 'name',
        description: 'description',
        websiteUrl: 'https://www.youtube.com/',
      };
      const response = await blogTestManager.createBlog(body);
      expect(response.status).toEqual(201);
      blogId = response.body.id;
    });

    it('Create post', async () => {
      const body: InputCreatePostDataType = {
        title: 'title',
        shortDescription: 'shortDescription',
        content: 'content',
        blogId: blogId,
      };

      const response = await postTestManager.createPost(body);
      expect(response.status).toEqual(201);
    });

    it('It should get all posts', async () => {
      const query: PostSortDataType = {
        sortBy: 'createdAt',
        sortDirection: 'desc',
        pageNumber: 1,
        pageSize: 10,
      };

      const response = await postTestManager.getAllPosts(query);

      expect(response.status).toEqual(200);
      expect(response.body.items[0]).toEqual({
        id: expect.any(String),
        title: 'title',
        shortDescription: 'shortDescription',
        content: 'content',
        blogId: blogId,
        blogName: 'name',
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      });
    });
  });

  describe('Get post', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    let blogId: string;
    let postId: string;
    it('Create blog', async () => {
      const body: InputCreateBlogDataType = {
        name: 'name',
        description: 'description',
        websiteUrl: 'https://www.youtube.com/',
      };
      const response = await blogTestManager.createBlog(body);
      expect(response.status).toEqual(201);
      blogId = response.body.id;
    });

    it('Create post', async () => {
      const body: InputCreatePostDataType = {
        title: 'title',
        shortDescription: 'shortDescription',
        content: 'content',
        blogId: blogId,
      };

      const response = await postTestManager.createPost(body);
      expect(response.status).toEqual(201);
      postId = response.body.id;
    });

    it('It should get post by id', async () => {
      const response = await postTestManager.getPostById(postId, '');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        id: postId,
        title: 'title',
        shortDescription: 'shortDescription',
        content: 'content',
        blogId: blogId,
        blogName: 'name',
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      });
    });

    it('It should not get post with not existing id', async () => {
      const response = await postTestManager.getPostWithNotExistingId('123');
      expect(response.status).toEqual(404);
    });
  });

  describe('Update post', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    let blogId: string;
    let blogName: string;
    let postId: string;

    const updatePostBody = {
      title: 'newtitle',
      shortDescription: 'newshortDescription',
      content: 'newcontent',
    };

    it('Create blog', async () => {
      const body: InputCreateBlogDataType = {
        name: 'name',
        description: 'description',
        websiteUrl: 'https://www.hellokitty.com/',
      };

      const response = await blogTestManager.createBlog(body);
      expect(response.status).toEqual(201);
      blogId = response.body.id;
      blogName = response.body.name;
    });

    it('Create post', async () => {
      const body: InputCreatePostDataType = {
        title: 'title',
        shortDescription: 'shortDescription',
        content: 'content',
        blogId: blogId,
      };

      const response = await postTestManager.createPost(body);
      expect(response.status).toEqual(201);
      postId = response.body.id;
    });

    it('It should update post', async () => {
      const body: InputUpdatePostDataType = {
        title: updatePostBody.title,
        shortDescription: updatePostBody.shortDescription,
        content: updatePostBody.content,
        blogId: blogId,
      };

      const response = await postTestManager.updatePost(postId, body);
      const updatedPost = await postTestManager.getPostById(postId, '');
      expect(response.status).toEqual(204);
      expect(updatedPost.body).toEqual({
        id: postId,
        title: updatePostBody.title,
        shortDescription: updatePostBody.shortDescription,
        content: updatePostBody.content,
        blogId: blogId,
        blogName: blogName,
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      });
    });

    it('It should not update post with not existing id', async () => {
      const body: InputUpdatePostDataType = {
        title: updatePostBody.title,
        shortDescription: updatePostBody.shortDescription,
        content: updatePostBody.content,
        blogId: blogId,
      };
      const response = await postTestManager.updatePostWithNotExistingPostId(
        '123',
        body,
      );
      expect(response.status).toEqual(404);
    });

    it('It should not update post with incorrect auth', async () => {
      const body: InputUpdatePostDataType = {
        title: updatePostBody.title,
        shortDescription: updatePostBody.shortDescription,
        content: updatePostBody.content,
        blogId: blogId,
      };
      const response = await postTestManager.updatePostWithIncorrectAuth(
        postId,
        body,
      );
      expect(response.status).toEqual(401);
    });

    it("It shouldn't update post with long title", async () => {
      const body: InputUpdatePostDataType = {
        title: 'longTitle'.repeat(100),
        shortDescription: updatePostBody.shortDescription,
        content: updatePostBody.content,
        blogId: blogId,
      };
      const response = await postTestManager.updatePostWithBodyErrors(
        postId,
        body,
      );
      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'title',
          },
        ],
      });
    });

    it("It shouldn't update post with long shortDescription", async () => {
      const body: InputUpdatePostDataType = {
        title: updatePostBody.title,
        shortDescription: 'longShortDescription'.repeat(100),
        content: updatePostBody.content,
        blogId: blogId,
      };
      const response = await postTestManager.updatePostWithBodyErrors(
        postId,
        body,
      );
      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'shortDescription',
          },
        ],
      });
    });
    it("It shouldn't update post with long content", async () => {
      const body: InputUpdatePostDataType = {
        title: updatePostBody.title,
        shortDescription: updatePostBody.shortDescription,
        content: 'longContent'.repeat(100),
        blogId: blogId,
      };
      const response = await postTestManager.updatePostWithBodyErrors(
        postId,
        body,
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
    it("Shouldn't update post with invalid title", async () => {
      const body = {
        title: null,
        shortDescription: updatePostBody.shortDescription,
        content: updatePostBody.content,
        blogId: blogId,
      };

      const response = await postTestManager.updatePostWithBodyErrors(
        postId,
        body,
      );
      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'title',
          },
        ],
      });
    });

    it("Shouldn't update post with invalid shortDescription", async () => {
      const body = {
        title: updatePostBody.title,
        shortDescription: null,
        content: updatePostBody.content,
        blogId: blogId,
      };

      const response = await postTestManager.updatePostWithBodyErrors(
        postId,
        body,
      );
      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'shortDescription',
          },
        ],
      });
    });

    it("Shouldn't update post with invalid content", async () => {
      const body = {
        title: updatePostBody.title,
        shortDescription: updatePostBody.shortDescription,
        content: null,
        blogId: blogId,
      };

      const response = await postTestManager.updatePostWithBodyErrors(
        postId,
        body,
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

    it("Shouldn't update post with invalid blogId", async () => {
      const body = {
        title: updatePostBody.title,
        shortDescription: updatePostBody.shortDescription,
        content: updatePostBody.content,
        blogId: null,
      };

      const response = await postTestManager.updatePostWithBodyErrors(
        postId,
        body,
      );
      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'blogId',
          },
        ],
      });
    });
  });

  describe('Delete post', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    let blogId: string;
    let postId: string;
    it('Create blog', async () => {
      const body: InputCreateBlogDataType = {
        name: 'name',
        description: 'description',
        websiteUrl: 'https://www.youtube.com/',
      };
      const response = await blogTestManager.createBlog(body);
      expect(response.status).toEqual(201);
      blogId = response.body.id;
    });

    it('Create post', async () => {
      const body: InputCreatePostDataType = {
        title: 'title',
        shortDescription: 'shortDescription',
        content: 'content',
        blogId: blogId,
      };

      const response = await postTestManager.createPost(body);
      expect(response.status).toEqual(201);
      postId = response.body.id;
    });

    it("It shouldn't delete post with not existing id", async () => {
      const response = await postTestManager.deletePostWithNotExistingId('123');
      expect(response.status).toEqual(404);
    });

    it("It shouldn't delete post with incorrect auth", async () => {
      const response =
        await postTestManager.deletePostWithIncorrectAuth(postId);
      expect(response.status).toEqual(401);
    });

    it('It should delete post', async () => {
      const response = await postTestManager.deletePost(postId);
      expect(response.status).toEqual(204);
      const post = await postTestManager.getPostWithNotExistingId(postId);
      expect(post.status).toEqual(404);
    });
  });

  describe('Create comment to post', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    let blogId: string;
    let accessToken: string;
    let accessToken2: string;
    let userId: string;
    let userId2: string;
    let postId: string;

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

    it('Register user 1, 2', async () => {
      const response = await authTestManager.registrationUser(goodUser);
      expect(response.status).toEqual(204);
      const user = await userTestManager.getUserByLogin(goodUser.login);
      userId = user!.id;

      const response2 = await authTestManager.registrationUser(goodUser2);
      expect(response2.status).toEqual(204);
      const user2 = await userTestManager.getUserByLogin(goodUser2.login);
      userId2 = user2!.id;
    });

    it('Login user 1, 2', async () => {
      const response = await authTestManager.login({
        loginOrEmail: goodUser.login,
        password: goodUser.password,
      });
      expect(response.status).toEqual(200);
      accessToken = response.body.accessToken;

      const response2 = await authTestManager.login({
        loginOrEmail: goodUser2.login,
        password: goodUser2.password,
      });
      expect(response2.status).toEqual(200);
      accessToken2 = response2.body.accessToken;
    });

    it('Create blog', async () => {
      const body = {
        name: 'goodName1',
        description: 'goodDescription1',
        websiteUrl: 'https://www.goodUrl1.com',
      };
      const response = await blogTestManager.createBlog(body);
      expect(response.status).toEqual(201);
      blogId = response.body.id;
    });

    it('Create post to blog', async () => {
      const inputCreatePostToBlogData: InputCreatePostToBlogDataType = {
        content: 'goodTitle1',
        shortDescription: 'goodShortDescription1',
        title: 'goodContent1',
      };
      const response = await blogTestManager.createPostToBlog(
        blogId,
        inputCreatePostToBlogData,
      );
      expect(response.status).toEqual(201);
      postId = response.body.id;
    });

    it('It should create comment to post by user1', async () => {
      const body: InputCreateCommentDataType = {
        content: 'veryGoodContent'.repeat(2),
      };

      const response = await postTestManager.createCommentToPost(
        postId,
        body,
        accessToken,
      );

      expect(response.status).toEqual(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        content: body.content,
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

    it('It should create comment to post by user2', async () => {
      const body = {
        content: 'goodContent2'.repeat(2),
      };

      const response = await postTestManager.createCommentToPost(
        postId,
        body,
        accessToken2,
      );

      expect(response.status).toEqual(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        content: body.content,
        commentatorInfo: {
          userId: userId2,
          userLogin: goodUser2.login,
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
        },
      });
    });

    it("It shouldn't create comment to post  with  incorrect auth", async () => {
      const body: InputCreateCommentDataType = {
        content: 'goodContent1'.repeat(2),
      };

      const response =
        await postTestManager.createCommentToPostWithIncorrectAuth(
          postId,
          body,
        );

      expect(response.status).toEqual(401);
    });

    it("It shouldn't create comment to post by user1 with long content", async () => {
      const body: InputCreateCommentDataType = {
        content: 'longContent'.repeat(100),
      };

      const response = await postTestManager.createCommentToPostWithBodyErrors(
        postId,
        body,
        accessToken,
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

    it("It shouldn't create comment to post by user1 with short content", async () => {
      const body: InputCreateCommentDataType = {
        content: '123',
      };

      const response = await postTestManager.createCommentToPostWithBodyErrors(
        postId,
        body,
        accessToken,
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

    it("It shouldn't create comment to post by user1 with invalid content", async () => {
      const body = {
        content: null,
      };

      const response = await postTestManager.createCommentToPostWithBodyErrors(
        postId,
        body,
        accessToken,
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

    it("It shouldn't create comment to post by user1 with not existing postId", async () => {
      const body = {
        content: 'goodContent12'.repeat(2),
      };

      const response =
        await postTestManager.createCommentToPostWithNotExistingPostId(
          '123',
          body,
          accessToken,
        );

      expect(response.status).toEqual(404);
    });
  });

  describe('Get all comments from post', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    let blogId: string;
    let accessToken: string;
    let accessToken2: string;
    let userId: string;
    let userId2: string;
    let postId: string;
    let postId2: string;
    let contentU1ToP1: string;
    let contentU1ToP2: string;
    let contentU2ToP1: string;
    let contentU2ToP2: string;

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

    it('Register and loign users 1, 2', async () => {
      const response = await authTestManager.registrationUser(goodUser);
      expect(response.status).toEqual(204);
      const user = await userTestManager.getUserByLogin(goodUser.login);
      userId = user!.id;

      const response2 = await authTestManager.registrationUser(goodUser2);
      expect(response2.status).toEqual(204);
      const user2 = await userTestManager.getUserByLogin(goodUser2.login);
      userId2 = user2!.id;

      const loginResponse1 = await authTestManager.login({
        loginOrEmail: goodUser.login,
        password: goodUser.password,
      });
      expect(loginResponse1.status).toEqual(200);
      accessToken = loginResponse1.body.accessToken;

      const loginResponse2 = await authTestManager.login({
        loginOrEmail: goodUser2.login,
        password: goodUser2.password,
      });
      expect(loginResponse2.status).toEqual(200);
      accessToken2 = loginResponse2.body.accessToken;
    });

    it('Create blog and create post 1,2 to this blog', async () => {
      const body = {
        name: 'goodName1',
        description: 'goodDescription1',
        websiteUrl: 'https://www.goodUrl1.com',
      };
      const response = await blogTestManager.createBlog(body);
      expect(response.status).toEqual(201);
      blogId = response.body.id;

      const inputCreatePostToBlogData: InputCreatePostToBlogDataType = {
        content: 'goodTitle1',
        shortDescription: 'goodShortDescription1',
        title: 'goodContent1',
      };
      const postResponse1 = await blogTestManager.createPostToBlog(
        blogId,
        inputCreatePostToBlogData,
      );
      expect(postResponse1.status).toEqual(201);
      postId = postResponse1.body.id;

      const inputCreatePostToBlogData2: InputCreatePostToBlogDataType = {
        content: 'goodTitle2',
        shortDescription: 'goodShortDescription2',
        title: 'goodContent2',
      };
      const createReponse2 = await blogTestManager.createPostToBlog(
        blogId,
        inputCreatePostToBlogData2,
      );
      expect(createReponse2.status).toEqual(201);
      postId2 = createReponse2.body.id;
    });

    it('Create comment to post1 by user1', async () => {
      const body = {
        content: 'contentFromUser1ToPost1',
      };

      const response = await postTestManager.createCommentToPost(
        postId,
        body,
        accessToken,
      );

      expect(response.status).toEqual(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        content: body.content,
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
      contentU1ToP1 = response.body.content;
    });

    it('Create comment to post1 by user2', async () => {
      const body = {
        content: 'contentFromUser2ToPost1',
      };

      const response = await postTestManager.createCommentToPost(
        postId,
        body,
        accessToken2,
      );

      expect(response.status).toEqual(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        content: body.content,
        commentatorInfo: {
          userId: userId2,
          userLogin: goodUser2.login,
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
        },
      });
      contentU2ToP1 = response.body.content;
    });

    it('Create comment to post2 by user1', async () => {
      const body = {
        content: 'contentFromUser1ToPost2',
      };

      const response = await postTestManager.createCommentToPost(
        postId2,
        body,
        accessToken,
      );

      expect(response.status).toEqual(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        content: body.content,
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
      contentU1ToP2 = response.body.content;
    });

    it('Create comment to post2 by user2', async () => {
      const body = {
        content: 'contentFromUser2ToPost2',
      };

      const response = await postTestManager.createCommentToPost(
        postId2,
        body,
        accessToken2,
      );

      expect(response.status).toEqual(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        content: body.content,
        commentatorInfo: {
          userId: userId2,
          userLogin: goodUser2.login,
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
        },
      });
      contentU2ToP2 = response.body.content;
    });

    it('It should get all comments from post1', async () => {
      const query: CommentSortDataType = {
        sortBy: 'createdAt',
        sortDirection: 'asc',
        pageNumber: 1,
        pageSize: 10,
        postId: postId,
      };

      const response = await postTestManager.getAllCommentsFromPost(query);

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [
          {
            id: expect.any(String),
            content: contentU2ToP1,
            commentatorInfo: {
              userId: userId2,
              userLogin: goodUser2.login,
            },
            createdAt: expect.any(String),
            likesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: 'None',
            },
          },
          {
            id: expect.any(String),
            content: contentU1ToP1,
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
          },
        ],
      });
    });

    it('It should get all comments from post2', async () => {
      const query: CommentSortDataType = {
        sortBy: 'createdAt',
        sortDirection: 'asc',
        pageNumber: 1,
        pageSize: 10,
        postId: postId2,
      };
      const response = await postTestManager.getAllCommentsFromPost(query);

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [
          {
            id: expect.any(String),
            content: contentU2ToP2,
            commentatorInfo: {
              userId: userId2,
              userLogin: goodUser2.login,
            },
            createdAt: expect.any(String),
            likesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: 'None',
            },
          },
          {
            id: expect.any(String),
            content: contentU1ToP2,
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
          },
        ],
      });
    });

    it("It shouldn't get all comments from post with not found postId", async () => {
      const query: CommentSortDataType = {
        sortBy: 'createdAt',
        sortDirection: 'asc',
        pageNumber: 1,
        pageSize: 10,
        postId: '01122',
      };
      const response =
        await postTestManager.getAllCommentsFromPostWithNotExistingPostId(
          query,
        );
      expect(response.status).toEqual(404);
    });
  });
});
