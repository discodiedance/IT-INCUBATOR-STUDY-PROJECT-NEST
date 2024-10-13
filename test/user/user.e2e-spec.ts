import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

const userRouter = '/users';
let getHttpServer: any;
let user1: any;

describe('UserController (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await moduleFixture.createNestApplication().init();
    getHttpServer = request(app.getHttpServer());
  });

  describe(userRouter, () => {
    beforeAll(async () => {
      await getHttpServer.delete('/testing/all-data');
    });

    it('POST: CREATE USER1, STATUS: 201', async () => {
      const response = await getHttpServer
        .post(userRouter)
        .send({
          login: 'user1',
          password: 'password1',
          email: 'user1@gmail.com',
        })
        .expect(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        login: 'user1',
        email: 'user1@gmail.com',
        createdAt: expect.any(String),
      });
      user1 = response.body;
    });

    it('POST: CREATE USER2, STATUS: 201', async () => {
      const response = await getHttpServer
        .post(userRouter)
        .send({
          login: 'user2',
          password: 'password2',
          email: 'user2@gmail.com',
        })
        .expect(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        login: 'user2',
        email: 'user2@gmail.com',
        createdAt: expect.any(String),
      });
    });

    it('GET: GET ALL USERS, STATUS: 200', async () => {
      const response = await getHttpServer.get(userRouter).expect(200);
      expect(response.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [
          {
            id: expect.any(String),
            login: 'user1',
            email: 'user1@gmail.com',
            createdAt: expect.any(String),
          },
          {
            id: expect.any(String),
            login: 'user2',
            email: 'user2@gmail.com',
            createdAt: expect.any(String),
          },
        ],
      });
    });

    it('DELETE: DELETE USER1, STATUS: 204', async () => {
      await getHttpServer.delete(userRouter + '/' + user1.id).expect(204);
      const response = await getHttpServer.get(userRouter).expect(200);
      expect(response.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: expect.any(String),
            login: 'user2',
            email: 'user2@gmail.com',
            createdAt: expect.any(String),
          },
        ],
      });
    });
  });
});
