-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Waktu pembuatan: 29 Jan 2026 pada 15.06
-- Versi server: 8.0.44-cll-lve
-- Versi PHP: 8.4.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dskgloba_erp`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `bank_data_entries`
--

CREATE TABLE `bank_data_entries` (
  `id` bigint UNSIGNED NOT NULL,
  `campaign_id` bigint UNSIGNED NOT NULL,
  `form_id` bigint UNSIGNED NOT NULL,
  `client_name` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `pic_name` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_channel` enum('INSTAGRAM','LINKEDIN','WEBSITE','SEMINAR','WEBINAR','BREVET') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `campaign_name` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `topic_tag` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `triage_status` enum('RAW_NEW','REJECTED','PROMOTED_TO_LEAD') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `extra_answers` json NOT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `cleaned_by` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cleaned_at` datetime DEFAULT NULL,
  `rejected_by` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rejected_at` datetime DEFAULT NULL,
  `rejected_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `promoted_to_lead_id` bigint UNSIGNED DEFAULT NULL,
  `promoted_by` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `promoted_at` datetime DEFAULT NULL,
  `submitted_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `bank_data_entries`
--

INSERT INTO `bank_data_entries` (`id`, `campaign_id`, `form_id`, `client_name`, `pic_name`, `email`, `phone`, `source_channel`, `campaign_name`, `topic_tag`, `triage_status`, `extra_answers`, `notes`, `cleaned_by`, `cleaned_at`, `rejected_by`, `rejected_at`, `rejected_reason`, `promoted_to_lead_id`, `promoted_by`, `promoted_at`, `submitted_at`, `created_at`, `updated_at`) VALUES
(1, 3, 1, 'asd', 'asd', 'asd@dsk-global.id', '0864737334', 'WEBINAR', 'Webinar Lorem Ipsum', NULL, 'RAW_NEW', '{}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-08 16:36:51', '2026-01-08 16:36:51', '2026-01-12 06:41:06'),
(2, 3, 1, 'asd', 'asd', 'asd@gmail.com', '0887654678459', 'WEBINAR', 'Webinar Lorem Ipsum', NULL, 'RAW_NEW', '{}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-08 17:19:15', '2026-01-08 17:19:15', '2026-01-12 06:41:06'),
(3, 3, 1, 'abc', 'abc', 'abc@gmail.com', '0854689456', 'WEBINAR', 'Webinar Lorem Ipsum', NULL, 'RAW_NEW', '{}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-08 18:05:42', '2026-01-08 18:05:42', '2026-01-12 06:41:06'),
(4, 3, 1, 'aaa', 'aaa', 'aaa@gmail.com', '08764546372', 'WEBINAR', 'Webinar Lorem Ipsum', NULL, 'RAW_NEW', '{}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-08 18:19:51', '2026-01-08 18:19:50', '2026-01-12 06:41:06'),
(5, 3, 1, 'as', 'as', 'as@gmail.com', '0896326347438', 'WEBINAR', 'Webinar Lorem Ipsum', NULL, 'RAW_NEW', '{}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-08 18:30:21', '2026-01-08 18:30:20', '2026-01-12 06:41:06'),
(6, 3, 1, 'ad', 'ad', 'ad@gmail.com', '087674845854', 'WEBINAR', 'Webinar Lorem Ipsum', NULL, 'RAW_NEW', '{}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-08 19:14:09', '2026-01-08 19:14:08', '2026-01-12 06:41:06'),
(7, 3, 1, 'abc', 'abc', 'abc@gmail.com', '087645272923', 'WEBINAR', 'Webinar Lorem Ipsum', NULL, 'RAW_NEW', '{}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-08 19:19:10', '2026-01-08 19:19:09', '2026-01-12 06:41:06'),
(8, 4, 2, 'asd', 'asd', 'asd@gmail.com', '123344354456', 'LINKEDIN', 'Konsultasi Gratis', NULL, 'RAW_NEW', '{}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-12 14:46:10', '2026-01-12 07:46:10', '2026-01-12 07:46:10'),
(9, 5, 3, 'dfg', 'rty', 'rtyuj', 'ghnm,', 'WEBINAR', 'Sustainbility', NULL, 'RAW_NEW', '{}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-12 15:05:59', '2026-01-12 08:05:58', '2026-01-12 08:05:58'),
(10, 5, 3, 'asoihdasjo', 'jasd', 'alsdnas', '087863107200', 'WEBINAR', 'Sustainbility', NULL, 'RAW_NEW', '{}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-12 15:07:18', '2026-01-12 08:07:17', '2026-01-12 08:07:17'),
(11, 3, 1, 'asd', 'asdada', 'asdasda@gmail.com', '08567384385353', 'WEBINAR', 'Form: Webinar Lorem Ipsum', NULL, 'RAW_NEW', '{}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-26 09:46:31', '2026-01-26 02:46:30', '2026-01-26 02:46:30'),
(12, 3, 1, 'asdasdasd', 'adsasdasd', 'asdasda@gmail.com', '0875627382423', 'WEBINAR', 'Form: Webinar Lorem Ipsum', NULL, 'RAW_NEW', '{}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-26 09:46:55', '2026-01-26 02:46:54', '2026-01-26 02:46:54'),
(13, 5, 3, 'PT ZXY Indonesia', 'John Doe', 'john@gmail.com', '085924526244', 'WEBINAR', 'Form: Sustainbility', NULL, 'RAW_NEW', '{}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-29 14:55:25', '2026-01-29 07:55:28', '2026-01-29 07:55:28'),
(14, 5, 3, 'PT Test Indonesia', 'John Sina', 'sina@gmail.com', '08976654633', 'WEBINAR', 'Form: Sustainbility', NULL, 'RAW_NEW', '{}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-29 14:56:31', '2026-01-29 07:56:34', '2026-01-29 07:56:34'),
(15, 5, 3, 'PT ABC', 'John', 'john@dsk-global.id', '085924526244', 'WEBINAR', 'Form: Sustainbility', NULL, 'RAW_NEW', '{}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-29 15:03:52', '2026-01-29 08:03:55', '2026-01-29 08:03:55');

-- --------------------------------------------------------

--
-- Struktur dari tabel `campaigns`
--

CREATE TABLE `campaigns` (
  `id` bigint UNSIGNED NOT NULL,
  `name` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('SOCIAL_MEDIA','FREEBIE','EVENT') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `channel` enum('INSTAGRAM','LINKEDIN','WEBSITE','SEMINAR','WEBINAR','BREVET') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `topic_tag` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_start` date DEFAULT NULL,
  `date_end` date DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('ACTIVE','PAUSED','ENDED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_by` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `campaigns`
--

INSERT INTO `campaigns` (`id`, `name`, `type`, `channel`, `topic_tag`, `date_start`, `date_end`, `notes`, `status`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'Test Campaign 2025', 'SOCIAL_MEDIA', 'INSTAGRAM', 'TAX', '2024-12-30', NULL, 'Updated notes', 'ACTIVE', 'system', '2026-01-05 16:48:12', '2026-01-06 10:08:19'),
(2, 'Test Campaign 2026', 'SOCIAL_MEDIA', 'LINKEDIN', 'LEGAL', '2026-01-08', NULL, 'Test Campaign 2026', 'ACTIVE', 'BD - MEO', '2026-01-08 04:23:12', '2026-01-08 04:23:12'),
(3, 'Webinar Lorem Ipsum', 'EVENT', 'WEBINAR', 'TP', '2026-01-05', NULL, 'Lorem Ipsum Dolor', 'ACTIVE', 'BD - MEO', '2026-01-08 07:33:30', '2026-01-08 07:39:52'),
(4, 'Konsultasi Gratis', 'SOCIAL_MEDIA', 'LINKEDIN', 'AUDIT', '2026-01-12', NULL, 'Buat Linkedin\n', 'ACTIVE', 'BD - MEO', '2026-01-12 07:43:37', '2026-01-12 07:43:37'),
(5, 'Sustainbility', 'EVENT', 'WEBINAR', 'blabal', '2026-01-12', NULL, 'target CFO', 'ACTIVE', 'BD - MEO', '2026-01-12 07:52:43', '2026-01-12 07:52:43');

-- --------------------------------------------------------

--
-- Struktur dari tabel `campaign_forms`
--

CREATE TABLE `campaign_forms` (
  `campaign_id` bigint UNSIGNED NOT NULL,
  `form_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `campaign_forms`
--

INSERT INTO `campaign_forms` (`campaign_id`, `form_id`) VALUES
(3, 1),
(4, 2),
(5, 3);

-- --------------------------------------------------------

--
-- Struktur dari tabel `departments`
--

CREATE TABLE `departments` (
  `id` int UNSIGNED NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `departments`
--

INSERT INTO `departments` (`id`, `code`, `name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'TAX', 'Tax', 'Layanan perpajakan', '2025-12-07 17:55:21', '2025-12-07 17:55:21'),
(2, 'AUDIT', 'Audit', 'Layanan audit', '2025-12-07 17:55:21', '2025-12-07 17:55:21'),
(3, 'TPDOC', 'TPDoc', 'Transfer Pricing Documentation', '2025-12-07 17:55:21', '2025-12-07 17:55:21'),
(4, 'SUSREP', 'Sustainability Report', 'Laporan keberlanjutan', '2025-12-07 17:55:21', '2025-12-07 17:55:21'),
(5, 'LEGAL', 'Legal', 'Layanan hukum / legal', '2025-12-07 17:55:21', '2025-12-07 17:55:21'),
(6, 'WEBDEV', 'Web Development', 'Layanan pembuatan website', '2025-12-08 08:29:21', '2025-12-08 08:29:21');

-- --------------------------------------------------------

--
-- Struktur dari tabel `forms`
--

CREATE TABLE `forms` (
  `id` bigint UNSIGNED NOT NULL,
  `title` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `header_image_path` text COLLATE utf8mb4_unicode_ci,
  `success_message` text COLLATE utf8mb4_unicode_ci,
  `status` enum('DRAFT','PUBLISHED','PAUSED','ENDED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `public_link` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `published_at` datetime DEFAULT NULL,
  `created_by` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `primary_campaign_id` bigint UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `forms`
--

INSERT INTO `forms` (`id`, `title`, `description`, `header_image_path`, `success_message`, `status`, `public_link`, `published_at`, `created_by`, `created_at`, `updated_at`, `primary_campaign_id`) VALUES
(1, 'Form: Webinar Lorem Ipsum', 'Webinar Lorem Ipsum', '/uploads/header_forms/1-1767889766184-505649938.jpeg', 'Terimakasih! http://localhost:5173/', 'PAUSED', 'http://localhost:5173/form-webinar-lorem-ipsum', '2026-01-26 02:46:41', 'bd_meo', '2026-01-08 16:29:25', '2026-01-26 02:50:27', 3),
(2, 'Form: Konsultasi Gratis', 'deskripsi', '/uploads/header_forms/2-1768203894940-965297121.jpeg', 'www.dsk-global.id', 'ENDED', 'http://localhost:5173/form-konsultasi-gratis', '2026-01-12 07:44:54', 'bd_meo', '2026-01-12 07:44:54', '2026-01-12 07:48:37', 4),
(3, 'Form: Sustainbility', 'asda', NULL, 'Terima Kasih\nwww.youtube.com', 'PUBLISHED', 'http://localhost:5173/form-sustainbility', '2026-01-29 07:57:46', 'bd_meo', '2026-01-12 08:00:03', '2026-01-29 07:57:49', 5);

-- --------------------------------------------------------

--
-- Struktur dari tabel `form_fields`
--

CREATE TABLE `form_fields` (
  `id` bigint UNSIGNED NOT NULL,
  `form_id` bigint UNSIGNED NOT NULL,
  `field_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('SHORT_TEXT','LONG_TEXT','DROPDOWN','RADIO','CHECKBOX','DATE','FILE_UPLOAD') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `required` tinyint(1) NOT NULL DEFAULT '0',
  `is_core` tinyint(1) NOT NULL DEFAULT '0',
  `placeholder` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `file_settings` json DEFAULT NULL,
  `sort_order` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `form_fields`
--

INSERT INTO `form_fields` (`id`, `form_id`, `field_key`, `type`, `label`, `required`, `is_core`, `placeholder`, `sort_order`, `created_at`, `updated_at`) VALUES
(226, 2, 'field_1', 'SHORT_TEXT', 'Nama Perusahaan / Client', 1, 1, 'PT ABC Indonesia', 1, '2026-01-12 07:44:54', '2026-01-12 07:44:54'),
(227, 2, 'field_2', 'SHORT_TEXT', 'Nama PIC', 1, 1, 'John Doe', 2, '2026-01-12 07:44:54', '2026-01-12 07:44:54'),
(228, 2, 'field_3', 'SHORT_TEXT', 'Email', 1, 1, 'john@company.com', 3, '2026-01-12 07:44:54', '2026-01-12 07:44:54'),
(229, 2, 'field_4', 'SHORT_TEXT', 'Nomor Telepon / WhatsApp', 1, 1, '+62 812-3456-7890', 4, '2026-01-12 07:44:54', '2026-01-12 07:44:54'),
(234, 1, 'field_1', 'SHORT_TEXT', 'Nama Perusahaan / Client', 1, 1, 'PT ABC Indonesia', 1, '2026-01-26 02:46:40', '2026-01-26 02:46:40'),
(235, 1, 'field_2', 'SHORT_TEXT', 'Nama PIC', 1, 1, 'John Doe', 2, '2026-01-26 02:46:40', '2026-01-26 02:46:40'),
(236, 1, 'field_3', 'SHORT_TEXT', 'Email', 1, 1, 'john@company.com', 3, '2026-01-26 02:46:41', '2026-01-26 02:46:41'),
(237, 1, 'field_4', 'SHORT_TEXT', 'Nomor Telepon / WhatsApp', 1, 1, '+62 812-3456-7890', 4, '2026-01-26 02:46:41', '2026-01-26 02:46:41'),
(246, 3, 'field_1', 'SHORT_TEXT', 'Nama Perusahaan / Client', 1, 1, 'PT ABC Indonesia', 1, '2026-01-29 07:57:50', '2026-01-29 07:57:50'),
(247, 3, 'field_2', 'SHORT_TEXT', 'Nama PIC', 1, 1, 'John Doe', 2, '2026-01-29 07:57:50', '2026-01-29 07:57:50'),
(248, 3, 'field_3', 'SHORT_TEXT', 'Email', 1, 1, 'john@company.com', 3, '2026-01-29 07:57:50', '2026-01-29 07:57:50'),
(249, 3, 'field_4', 'SHORT_TEXT', 'Nomor Telepon / WhatsApp', 1, 1, '+62 812-3456-7890', 4, '2026-01-29 07:57:50', '2026-01-29 07:57:50');

-- --------------------------------------------------------

--
-- Struktur dari tabel `form_field_options`
--

CREATE TABLE `form_field_options` (
  `id` bigint UNSIGNED NOT NULL,
  `form_field_id` bigint UNSIGNED NOT NULL,
  `opt_order` int NOT NULL,
  `opt_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `roles`
--

CREATE TABLE `roles` (
  `id` int UNSIGNED NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `roles`
--

INSERT INTO `roles` (`id`, `code`, `name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'CEO', 'Chief Executive Officer', 'Approve semua hal yang butuh persetujuan tingkat tertinggi', '2025-12-07 17:55:21', '2025-12-07 17:55:21'),
(2, 'COO', 'Chief Operations Officer', 'Assign Project Manager sesuai line layanan', '2025-12-07 17:55:21', '2025-12-07 17:55:21'),
(3, 'PM', 'Project Manager', 'Assign Consultant dan mengelola project', '2025-12-07 17:55:21', '2025-12-07 17:55:21'),
(4, 'CONSULTANT', 'Consultant', 'Mengerjakan progress berdasarkan project', '2025-12-07 17:55:21', '2025-12-07 17:55:21'),
(5, 'BD_EXECUTIVE', 'Business Development - Executive', 'Pitching client sampai menjadi client', '2025-12-07 17:55:21', '2025-12-11 09:04:41'),
(6, 'BD_MEO', 'Business Development - Marketing Event Organizer', 'Mencari dan mengelola leads', '2025-12-07 17:55:21', '2025-12-08 10:11:04'),
(7, 'ADMIN', 'Administration', 'Mengelola invoice dan administrasi', '2025-12-07 17:55:21', '2025-12-07 17:55:21'),
(8, 'SUPERADMIN', 'Superadmin', 'Kelola sistem, user, dan konfigurasi', '2025-12-07 17:55:21', '2025-12-08 10:11:35');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `full_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `profile_image_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` int UNSIGNED NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `last_login_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `username`, `profile_image_path`, `password_hash`, `role_id`, `is_active`, `last_login_at`, `created_at`, `updated_at`) VALUES
(1, 'Galih Gumilang', 'GalihGumilang@dsk-global.id', 'galihgumilang', 'profile_images/1-1765200312255-53709749.jpg', '$2a$10$Y4kxCN303RCJHmGJ4y7Cse2aHykkOiZEahlCqYTYhpfCHi5NTN.5e', 1, 1, '2025-12-23 10:47:16', '2025-12-08 08:31:32', '2025-12-23 03:47:16'),
(2, 'Suparna Wijaya', 'suparnawijaya@dsk-global.id', 'suparnawijaya', NULL, '$2a$10$dj8i9Nw0/IWTRyiXfTU8fOQjeV1310t5n77RnV..dY2rZqJf4NAba', 2, 1, '2026-01-08 11:09:12', '2025-12-11 06:30:56', '2026-01-08 04:09:12'),
(3, 'Ferry Irawan', 'ferry.irawan@dsk-global.id', 'ferryirawan', NULL, '$2a$10$aQz/Qx9DrvkzcbBUqAZG/uCIsc9K3vvwN4TwCvtlyWV8BaMayKFoa', 2, 1, '2026-01-27 10:22:41', '2025-12-11 06:32:07', '2026-01-27 03:22:41'),
(4, 'CEO', 'ceo@dsk-global.id', 'ceo', NULL, '$2a$10$zP1bwb3SFf.VeRVrcIW7H.STedVP0DejBR8H21yZICM4QahpudrtG', 1, 1, '2026-01-15 17:56:18', '2025-12-11 08:46:57', '2026-01-15 10:56:18'),
(5, 'COO', 'coo@dsk-global.id', 'coo', NULL, '$2a$10$N/v5dQRNotTeOkJ92WuSxOZJ/wVpAjvrq8iEFIjRTt93Ykyd2WSHq', 2, 1, '2026-01-08 13:19:05', '2025-12-11 08:47:53', '2026-01-08 06:19:05'),
(6, 'PM', 'pm@dsk-global.id', 'pm', NULL, '$2a$10$LA24HkyZ.UG2/nxsvdFdZeFQSTpjl3VCPI0ykbUIWM1F7UMkArMuu', 3, 1, '2026-01-12 13:22:30', '2025-12-11 08:52:35', '2026-01-12 06:22:30'),
(7, 'Consultant', 'consultant@dsk-global.id', 'consultant', NULL, '$2a$10$sxIlIoZLAoRxGJi.5HZcg.9wW41MdDq8U.J8Iw3O5ajkQmN7u55wq', 4, 1, NULL, '2025-12-11 08:54:22', '2025-12-11 08:54:22'),
(8, 'BD - Exe', 'bd_exe@dsk-global.id', 'bd_exe', NULL, '$2a$10$Ncvm0pjSB3AsLgvLy0NxOOVRaVBz587fCCSK4jGsPizLSLqeVZfOe', 5, 1, '2026-01-15 17:37:20', '2025-12-11 08:56:16', '2026-01-15 10:37:20'),
(9, 'BD - MEO', 'bd_meo@dsk-global.id', 'bd_meo', NULL, '$2a$10$Tt5B3A5OQ1Xdq8n4QZ5WeOMS1R5imrtdfY/EOMLmlHswmnj5Ki2Fe', 6, 1, '2026-01-29 14:54:28', '2025-12-11 08:56:41', '2026-01-29 07:54:28'),
(10, 'Admin', 'admin@dsk-global.id', 'admin', NULL, '$2a$10$lU55JrqoqCactwzgL.tz6uEDKImY04aa/teVO8yhAeXh6IDp9Amca', 7, 1, NULL, '2025-12-11 08:57:09', '2025-12-11 08:57:09'),
(11, 'Superadmin', 'superadmin@dsk-global.id', 'superadmin', NULL, '$2a$10$sNHxGacijfkABcP5XtBCgemR0cUGaPNhW50CPcbQ1F8qPI/HcznsK', 8, 1, '2026-01-12 13:22:11', '2025-12-11 08:57:43', '2026-01-12 06:22:11');

-- --------------------------------------------------------

--
-- Struktur dari tabel `user_departments`
--

CREATE TABLE `user_departments` (
  `user_id` bigint UNSIGNED NOT NULL,
  `department_id` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `user_departments`
--

INSERT INTO `user_departments` (`user_id`, `department_id`) VALUES
(2, 1),
(2, 2),
(3, 3),
(3, 4),
(3, 5),
(1, 6);

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `bank_data_entries`
--
ALTER TABLE `bank_data_entries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_bank_campaign` (`campaign_id`),
  ADD KEY `idx_bank_form` (`form_id`),
  ADD KEY `idx_bank_triage` (`triage_status`),
  ADD KEY `idx_bank_submitted` (`submitted_at`),
  ADD KEY `fk_bank_campaign_form_pair` (`campaign_id`,`form_id`);

--
-- Indeks untuk tabel `campaigns`
--
ALTER TABLE `campaigns`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_campaigns_status` (`status`),
  ADD KEY `idx_campaigns_channel` (`channel`);

--
-- Indeks untuk tabel `campaign_forms`
--
ALTER TABLE `campaign_forms`
  ADD PRIMARY KEY (`campaign_id`,`form_id`),
  ADD KEY `idx_campaign_forms_form` (`form_id`);

--
-- Indeks untuk tabel `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indeks untuk tabel `forms`
--
ALTER TABLE `forms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_forms_status` (`status`),
  ADD KEY `idx_forms_primary_campaign` (`primary_campaign_id`);

--
-- Indeks untuk tabel `form_fields`
--
ALTER TABLE `form_fields`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_form_fields_form_fieldkey` (`form_id`,`field_key`),
  ADD UNIQUE KEY `uq_form_fields_form_sort` (`form_id`,`sort_order`),
  ADD KEY `idx_form_fields_form` (`form_id`);

--
-- Indeks untuk tabel `form_field_options`
--
ALTER TABLE `form_field_options`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_fieldopt_field_order` (`form_field_id`,`opt_order`),
  ADD KEY `idx_fieldopt_field` (`form_field_id`);

--
-- Indeks untuk tabel `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `idx_users_role_id` (`role_id`);

--
-- Indeks untuk tabel `user_departments`
--
ALTER TABLE `user_departments`
  ADD PRIMARY KEY (`user_id`,`department_id`),
  ADD KEY `idx_user_departments_department_id` (`department_id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `bank_data_entries`
--
ALTER TABLE `bank_data_entries`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT untuk tabel `campaigns`
--
ALTER TABLE `campaigns`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `forms`
--
ALTER TABLE `forms`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT untuk tabel `form_fields`
--
ALTER TABLE `form_fields`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=250;

--
-- AUTO_INCREMENT untuk tabel `form_field_options`
--
ALTER TABLE `form_field_options`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `bank_data_entries`
--
ALTER TABLE `bank_data_entries`
  ADD CONSTRAINT `fk_bank_campaign_form_pair` FOREIGN KEY (`campaign_id`,`form_id`) REFERENCES `campaign_forms` (`campaign_id`, `form_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `campaign_forms`
--
ALTER TABLE `campaign_forms`
  ADD CONSTRAINT `fk_campaign_forms_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_campaign_forms_form` FOREIGN KEY (`form_id`) REFERENCES `forms` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `forms`
--
ALTER TABLE `forms`
  ADD CONSTRAINT `fk_forms_primary_campaign` FOREIGN KEY (`primary_campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `form_fields`
--
ALTER TABLE `form_fields`
  ADD CONSTRAINT `fk_form_fields_form` FOREIGN KEY (`form_id`) REFERENCES `forms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `form_field_options`
--
ALTER TABLE `form_field_options`
  ADD CONSTRAINT `fk_form_field_options_field` FOREIGN KEY (`form_field_id`) REFERENCES `form_fields` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `user_departments`
--
ALTER TABLE `user_departments`
  ADD CONSTRAINT `fk_user_departments_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_user_departments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
