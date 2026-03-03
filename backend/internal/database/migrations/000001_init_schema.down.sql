-- 000001_init_schema.down.sql
-- Rollback initial schema

DROP TABLE IF EXISTS user_subscriptions;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS subscription_plans;
DROP TABLE IF EXISTS email_events;
DROP TABLE IF EXISTS campaign_tags;
DROP TABLE IF EXISTS campaigns;
DROP TABLE IF EXISTS subscriber_tags;
DROP TABLE IF EXISTS subscribers;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS newsletter_content;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS users;

DROP TYPE IF EXISTS payment_provider;
DROP TYPE IF EXISTS payment_status;
DROP TYPE IF EXISTS campaign_status;
DROP TYPE IF EXISTS subscriber_status;
DROP TYPE IF EXISTS content_status;
DROP TYPE IF EXISTS user_role;
