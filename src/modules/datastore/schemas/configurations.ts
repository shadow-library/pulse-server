/**
 * Importing npm packages
 */
import { bigserial, boolean, pgEnum, pgTable, timestamp, unique, varchar } from 'drizzle-orm/pg-core';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export const notificationChannel = pgEnum('notification_channel', ['EMAIL', 'SMS']);

export const senderProfiles = pgTable(
  'sender_profiles',
  {
    id: bigserial('id', { mode: 'bigint' }).primaryKey(),
    key: varchar('key', { length: 255 }).notNull(),
    channel: notificationChannel('channel').notNull(),
    identifier: varchar('identifier', { length: 500 }).notNull(),
    is_default: boolean('is_default').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  t => [unique('sender_profiles_key_channel_unique').on(t.key, t.channel)],
);

export const serviceConfigurations = pgTable('service_configurations', {
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  service_name: varchar('service_name', { length: 255 }).notNull().unique(),

  default_sms_sender_profile_id: bigserial('default_sms_sender_profile_id', { mode: 'bigint' }).references(() => senderProfiles.id),
  default_email_sender_profile_id: bigserial('default_email_sender_profile_id', { mode: 'bigint' }).references(() => senderProfiles.id),
  default_push_sender_profile_id: bigserial('default_push_sender_profile_id', { mode: 'bigint' }).references(() => senderProfiles.id),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const appConfigurations = pgTable('app_configurations', {
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  value: varchar('value', { length: 2000 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
