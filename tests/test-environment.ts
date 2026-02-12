/**
 * Importing npm packages
 */
import { afterAll, afterEach, beforeAll, beforeEach } from 'bun:test';

import { Router, ShadowApplication } from '@shadow-library/app';
import { Config, Logger } from '@shadow-library/common';
import { FastifyRouter } from '@shadow-library/fastify';
import { DatabaseService } from '@shadow-library/modules';

/**
 * Importing user defined packages
 */
import { PrimaryDatabase } from '@modules/database';
import { NotificationService } from '@modules/notification';
import { createDatabaseFromTemplate, dropDatabase } from '@scripts/create-template-db';
import { AppModule } from '@server/app.module';
import { APP_NAME } from '@server/constants';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
Logger.attachTransport('file:json');
const host = process.env.POSTGRES_DATABASE_HOST ?? 'localhost';
const user = process.env.POSTGRES_DATABASE_USER ?? 'admin';
const password = process.env.POSTGRES_DATABASE_PASSWORD ?? 'password';
const baseUrl = `postgresql://${user}:${password}@${host}`;

export const TEST_REGEX = {
  id: /^\d+$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
  dateISO: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
} satisfies Record<string, RegExp>;

export class TestEnvironment {
  private static readonly logger = Logger.getLogger(APP_NAME, TestEnvironment.name);

  private readonly app = new ShadowApplication(AppModule);

  constructor(private readonly databaseName: string) {}

  init(): void {
    TestEnvironment.logger.info(`Setting up test environment with database: '${this.databaseName}'`);
    Config['cache'].set('database.postgres.url', `${baseUrl}/${this.databaseName}`);

    NotificationService.prototype['executeNotificationJob'] = () => Bun.sleep(10);

    beforeEach(() => createDatabaseFromTemplate(this.databaseName));
    afterEach(() => dropDatabase(this.databaseName));

    beforeAll(() => this.app.init());
    afterAll(() => this.app.stop());
  }

  getRouter(): FastifyRouter {
    return this.app.get(Router);
  }

  getPostgresClient(): PrimaryDatabase {
    const databaseService = this.app.get(DatabaseService);
    return databaseService.getPostgresClient();
  }
}
