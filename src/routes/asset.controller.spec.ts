import { UserRequest } from '../interfaces/user-request.interface';
import { Response, Request } from 'express';
import { Asset } from '../entity/Asset';
import { validate } from 'class-validator';
import { Organization } from '../entity/Organization';
import { status } from '../enums/status-enum';
import * as assetController from './asset.controller';
import { createConnection, getConnection, Entity, getRepository } from 'typeorm';
import { File } from '../entity/File';
import { Vulnerability } from '../entity/Vulnerability';
import { Assessment } from '../entity/Assessment';
import { User } from '../entity/User';
import { ProblemLocation } from '../entity/ProblemLocation';
import { Resource } from '../entity/Resource';

describe('Asset Controller', () => {
  beforeEach(async () => {
    await createConnection({
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
      entities: [Asset, Organization, File, Vulnerability, Assessment, User, ProblemLocation, Resource],
      synchronize: true,
      logging: false,
      name: 'default'
    });
  });
  afterEach(() => {
    const conn = getConnection('default');
    return conn.close();
  });
  test('Get Archived Assets', async () => {
    const mockRequest = {
      params: {}
    } as UserRequest;
    const mockResponse: any = {
      json: jest.fn(),
      status: jest.fn()
    };
    await assetController.getArchivedOrgAssets(mockRequest, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
  });
});
