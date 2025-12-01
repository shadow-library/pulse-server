/**
 * Importing npm packages
 */
import { bigserial, index, jsonb, pgEnum, pgTable, smallint, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { notificationChannel } from './configurations';
import { priority, templateGroups } from './templates';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export const notificationStatus = pgEnum('notification_status', ['PENDING', 'PROCESSING', 'FAILED', 'SENT', 'PERMANENTLY_FAILED']);

export const notificationJobs = pgTable(
  'notification_jobs',
  {
    id: uuid('id').primaryKey(),
    template_group_id: bigserial('template_group_id', { mode: 'bigint' })
      .notNull()
      .references(() => templateGroups.id, { onDelete: 'restrict' }),
    channel: notificationChannel('channel').notNull(),
    locale: varchar('locale', { length: 10 }).notNull(),
    priority: priority('priority').notNull().default('MEDIUM'),

    recipient: varchar('recipient', { length: 500 }).notNull(),
    payload: jsonb('payload'),

    status: notificationStatus('status').notNull(),

    attempt: smallint('attempt').notNull().default(0),
    last_attempted_at: timestamp('last_attempted_at'),
    next_attempt_at: timestamp('next_attempt_at'),
    last_error: varchar('last_error', { length: 2000 }),

    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  t => [index('notification_jobs_status_priority_next_attempt_at_idx').on(t.status, t.priority, t.next_attempt_at)],
);

export const notificationMessages = pgTable(
  'notification_messages',
  {
    id: bigserial('id', { mode: 'bigint' }).primaryKey(),
    notification_job_id: uuid('notification_job_id')
      .notNull()
      .references(() => notificationJobs.id, { onDelete: 'cascade' }),

    channel: notificationChannel('channel').notNull(),
    rendered_subject: varchar('rendered_subject', { length: 255 }),
    rendered_body: varchar('rendered_body', { length: 5000 }).notNull(),
    payload: jsonb('payload'),

    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  t => [index('notification_messages_created_at_channel_idx').on(t.createdAt, t.channel)],
);
