import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

const commentRouter = '/comments';
let getHttpServer: any;

describe('CommentController (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await moduleFixture.createNestApplication().init();
    getHttpServer = request(app.getHttpServer());
  });

  describe(commentRouter, () => {
    beforeAll(async () => {
      await getHttpServer.delete('/testing/all-data');
    });

    it('GET: GET COMMENT, STATUS: 404', async () => {
      await getHttpServer.get(commentRouter + '/' + '0').expect(404);
    });
  });
});
