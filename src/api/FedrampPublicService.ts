import { z } from 'zod';
import type { APIRequestContext } from '@playwright/test';
import { ApiClient } from './ApiClient';

const RobotsSchema = z.string().min(1);

export class FedrampPublicService {
  private readonly client: ApiClient;

  constructor(request: APIRequestContext) {
    // FedRAMP.gov is public; no auth required.
    this.client = new ApiClient(request, { auth: { kind: 'none' } });
  }

  async getHomeStatus(): Promise<number> {
    const res = await this.client.get('/');
    return res.status();
  }

  async getRobotsTxt(): Promise<string> {
    const res = await this.client.get('/robots.txt');
    const text = await res.text();
    return RobotsSchema.parse(text);
  }
}

