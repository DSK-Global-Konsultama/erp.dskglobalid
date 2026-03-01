-- Migration: Add form_channel_links table for tracking multiple links per form (for WEBINAR campaigns)
-- Created: 2026-02-13

CREATE TABLE IF NOT EXISTS `form_channel_links` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `form_id` bigint UNSIGNED NOT NULL,
  `channel` enum('INSTAGRAM','LINKEDIN','WEBSITE','SEMINAR','WEBINAR','BREVET') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `public_link` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `public_slug` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `public_qr_url` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_form_channel` (`form_id`, `channel`),
  KEY `idx_form_channel_links_form` (`form_id`),
  KEY `idx_form_channel_links_channel` (`channel`),
  CONSTRAINT `fk_form_channel_links_form` FOREIGN KEY (`form_id`) REFERENCES `forms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
