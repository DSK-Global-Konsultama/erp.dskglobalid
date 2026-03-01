-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Waktu pembuatan: 13 Feb 2026 pada 16.32
-- Versi server: 8.0.44-cll-lve
-- Versi PHP: 8.4.17

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
(15, 5, 3, 'PT ABC', 'John', 'john@dsk-global.id', '085924526244', 'WEBINAR', 'Form: Sustainbility', NULL, 'RAW_NEW', '{}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-29 15:03:52', '2026-01-29 08:03:55', '2026-01-29 08:03:55'),
(16, 5, 3, 'ABCD', 'JOHND', 'johnd@gmail.com', '089636792648', 'WEBINAR', 'Form: Sustainbility', NULL, 'RAW_NEW', '{\"bukti-follow-instagram\": [\"/uploads/file_forms/3-1769682033383-170372970.png\"]}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-29 17:21:02', '2026-01-29 10:21:01', '2026-01-29 10:21:01'),
(17, 6, 4, 'a', 'a', 'aaa@gmail.com', '088296706857', 'INSTAGRAM', 'WEBINAR TAX', NULL, 'RAW_NEW', '{\"bukti-follow\": [\"/uploads/file_forms/4-1769683692748-661063803.png\"], \"jadwal-konsultansi\": \"2026-01-29\"}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-29 17:48:19', '2026-01-29 10:48:17', '2026-01-29 10:48:17'),
(18, 5, 3, 'Shorttext', 'Shorttext', 'shorttext@gmail.com', '0896234653838', 'WEBINAR', 'Form: Sustainbility', NULL, 'RAW_NEW', '{\"shorttext\": \"Shorttext\"}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-02 14:45:28', '2026-02-02 07:45:27', '2026-02-02 07:45:27'),
(19, 5, 3, 'longtext', 'longtext', 'longtext@gmail.com', '08767848232384', 'WEBINAR', 'Form: Sustainbility', NULL, 'RAW_NEW', '{\"longtext\": \"longtext\"}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-02 14:46:42', '2026-02-02 07:46:41', '2026-02-02 07:46:41'),
(20, 5, 3, 'radio', 'radio', 'radio@gmail.com', '087548940434', 'WEBINAR', 'Form: Sustainbility', NULL, 'RAW_NEW', '{\"radio\": \"radio2\"}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-02 14:59:56', '2026-02-02 07:59:55', '2026-02-02 07:59:55'),
(21, 5, 3, 'dropp', 'dropp', 'dropp', '0878478388334', 'WEBINAR', 'Form: Sustainbility', NULL, 'RAW_NEW', '{\"dropdown\": \"Option 1\"}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-02 15:00:58', '2026-02-02 08:00:57', '2026-02-02 08:00:57'),
(22, 5, 3, 'checkbox', 'checkbox', 'checkbox', '0887488494955', 'WEBINAR', 'Form: Sustainbility', NULL, 'RAW_NEW', '{\"checkbox\": [\"checkbox1\", \"checkbox2\"]}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-02 15:02:18', '2026-02-02 08:02:17', '2026-02-02 08:02:17'),
(23, 5, 3, 'date', 'date', 'date', '0877484554', 'WEBINAR', 'Form: Sustainbility', NULL, 'RAW_NEW', '{\"new-field\": \"2026-02-02\"}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-02 15:03:07', '2026-02-02 08:03:06', '2026-02-02 08:03:06'),
(24, 5, 3, 'datee', 'datee', 'datee@gmail.com', '08877484585484', 'WEBINAR', 'Form: Sustainbility', NULL, 'RAW_NEW', '{\"new-field\": null}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-02 15:07:30', '2026-02-02 08:07:30', '2026-02-02 08:07:30'),
(25, 7, 5, 'akbar', 'akbar', 'akbar@gmail.com', '087863100000', 'INSTAGRAM', 'Form: TAX WEBINAR', NULL, 'RAW_NEW', '{\"tes\": \"tes 1\", \"new-field\": [\"/uploads/file_forms/5-1770026726565-466077904.sql\"]}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-02 17:05:29', '2026-02-02 10:05:28', '2026-02-02 10:05:28'),
(26, 7, 5, 'akbar ', 'akbar', 'asdj@gmail.com', '09890', 'INSTAGRAM', 'Form: TAX WEBINAR', NULL, 'RAW_NEW', '{\"tes\": \"tes 2\", \"new-field\": [\"/uploads/file_forms/5-1770026833942-405830875.csv\"]}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-02 17:07:15', '2026-02-02 10:07:14', '2026-02-02 10:07:14'),
(27, 6, 4, 'PT Xyz', 'John Tor', 'john@example.com', '089636792648', 'INSTAGRAM', 'WEBINAR TAX', NULL, 'RAW_NEW', '{}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-13 16:25:18', '2026-02-13 09:26:02', '2026-02-13 09:26:02');

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
(5, 'Sustainbility', 'EVENT', 'WEBINAR', 'blabal', '2026-01-12', NULL, 'target CFO', 'ACTIVE', 'BD - MEO', '2026-01-12 07:52:43', '2026-01-12 07:52:43'),
(6, 'WEBINAR TAX', 'SOCIAL_MEDIA', 'INSTAGRAM', 'TAX ', '2026-01-29', '2026-01-31', '26 AUDIEBS', 'ACTIVE', 'BD - MEO', '2026-01-29 10:33:27', '2026-01-29 10:33:27'),
(7, 'TAX WEBINAR', 'SOCIAL_MEDIA', 'INSTAGRAM', 'JAYA JAYA', '2026-02-02', '2026-02-05', 'TARGET AUDIENS 1', 'ACTIVE', 'BD - MEO', '2026-02-02 09:57:26', '2026-02-02 09:57:26');

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
(5, 3),
(6, 4),
(7, 5);

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
  `public_slug` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `public_qr_url` text COLLATE utf8mb4_unicode_ci,
  `published_at` datetime DEFAULT NULL,
  `created_by` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `primary_campaign_id` bigint UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `forms`
--

INSERT INTO `forms` (`id`, `title`, `description`, `header_image_path`, `success_message`, `status`, `public_link`, `public_slug`, `public_qr_url`, `published_at`, `created_by`, `created_at`, `updated_at`, `primary_campaign_id`) VALUES
(1, 'Form: Webinar Lorem Ipsum', 'Webinar Lorem Ipsum', '/uploads/header_forms/1-1767889766184-505649938.jpeg', 'Terimakasih! http://localhost:5173/', 'PAUSED', 'http://localhost:5173/form-webinar-lorem-ipsum', NULL, NULL, '2026-01-26 02:46:41', 'bd_meo', '2026-01-08 16:29:25', '2026-01-26 02:50:27', 3),
(2, 'Form: Konsultasi Gratis', 'deskripsi', '/uploads/header_forms/2-1768203894940-965297121.jpeg', 'www.dsk-global.id', 'ENDED', 'http://localhost:5173/form-konsultasi-gratis', NULL, NULL, '2026-01-12 07:44:54', 'bd_meo', '2026-01-12 07:44:54', '2026-01-12 07:48:37', 4),
(3, 'Form: Sustainbility', 'Di era bisnis modern, Environmental, Social, and Governance (ESG) bukan lagi sekadar tren atau beban administratif. Perusahaan yang mengintegrasikan prinsip ESG dengan tepat terbukti lebih resilien, lebih menarik bagi investor, dan memiliki efisiensi operasional yang lebih tinggi.\nNamun, pertanyaannya adalah: **Bagaimana cara mengubah deretan angka di laporan keberlanjutan menjadi pertumbuhan nilai bisnis yang **__***nyata***__**​?**​\n📅 Sabtu, 7 Februari 2026\n🕘 09.00–11.00 WIB \n📍 Via Zoom Meeting\n🎯**FREE CONSULTATION: Diagnosis Laporan Keuangan Berbasis Isu Keberlanjutan** **+ Sertifikat**\n👨‍🏫 Narasumber:\nDr. Amrie Firmansyah, SE, MM, M.AK, ME, MA, MH, CSRS, CSRA, CSP\n🎙 Moderator: Dr. Ferry Irawan, S.E., Ak., S.S.T., S.H., M.M., M.E., M.P.P., BKP., CPA, CSRA\n\n📚 Topik Bahasan:\n1. Memahami ESG Score **​**​\n2. Hubungan ESG Score dengan Bisnis  \n3. Peran Laporan Keberlanjutan\n4. Quick Wins untuk Meningkatkan ESG Score\n5. Solusi DSK Global\n\nUbah Laporan Menjadi __*Peluang*__​!​ Jangan biarkan strategi ESG Anda berhenti di atas kertas. Pelajari cara mengubah skor keberlanjutan menjadi keunggulan kompetitif sekarang juga.  💼⚖\nCP : +62 821-2315-6139 (DSK Global)\n***__https://dsk-global.id__*** \n', '/uploads/header_forms/3-1769746252845-302482722.jpeg', 'Terima Kasih\nwww.youtube.com', 'PUBLISHED', 'http://localhost:5173/form-sustainbility', 'form-sustainbility', 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=http%3A%2F%2Flocalhost%3A5173%2Fform-sustainbility', '2026-02-11 10:26:38', 'bd_meo', '2026-01-12 08:00:03', '2026-02-11 10:26:37', 5),
(4, 'WEBINAR TAX', 'Di era bisnis modern, Environmental, Social, and Governance (ESG) bukan lagi sekadar tren atau beban administratif. Perusahaan yang mengintegrasikan prinsip ESG dengan tepat terbukti lebih resilien, lebih menarik bagi investor, dan memiliki efisiensi operasional yang lebih tinggi.\nNamun, pertanyaannya adalah: Bagaimana cara mengubah deretan angka di laporan keberlanjutan menjadi pertumbuhan nilai bisnis yang __*nyata*__​?​\n📅 Sabtu, 7 Februari 2026\n🕘 09.00–11.00 WIB \n📍 Via Zoom Meeting\n🎯FREE CONSULTATION: Diagnosis Laporan Keuangan Berbasis Isu Keberlanjutan + Sertifikat\n👨‍🏫 Narasumber:\nDr. Amrie Firmansyah, SE, MM, M.AK, ME, MA, MH, CSRS, CSRA, CSP\n🎙 Moderator: Dr. Ferry Irawan, S.E., Ak., S.S.T., S.H., M.M., M.E., M.P.P., BKP., CPA, CSRA\n\n📚 Topik Bahasan:\n1. Memahami ESG Score ​​\n2. Hubungan ESG Score dengan Bisnis  \n3. Peran Laporan Keberlanjutan\n4. Quick Wins untuk Meningkatkan ESG Score\n5. Solusi DSK Global\n\nUbah Laporan Menjadi __*Peluang*__​!​ Jangan biarkan strategi ESG Anda berhenti di atas kertas. Pelajari cara mengubah skor keberlanjutan menjadi keunggulan kompetitif sekarang juga.  💼⚖\nCP : +62 821-2315-6139 (DSK Global)', '/uploads/header_forms/4-1769683901842-750328117.jpeg', 'https://chat.whatsapp.com/C1JE7FPOq011yHQKllgxdV?mode=gi_c', 'PUBLISHED', 'http://localhost:5173/webinar-tax', NULL, 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=http%3A%2F%2Flocalhost%3A5173%2Fwebinar-tax', '2026-02-13 09:13:28', 'bd_meo', '2026-01-29 10:37:28', '2026-02-13 09:13:27', 6),
(5, 'Form: TAX WEBINAR', '**https://dsk-global.id*__TAX DSK GLOBAL__***\nTANGGAL :', '/uploads/header_forms/5-1770026591134-55836800.jpeg', 'www.wa.me/6287863107200', 'PUBLISHED', 'http://localhost:5173/form-tax-webinar', NULL, 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=http%3A%2F%2Flocalhost%3A5173%2Fform-tax-webinar', '2026-02-02 10:12:55', 'bd_meo', '2026-02-02 10:03:08', '2026-02-02 10:12:55', 7);

-- --------------------------------------------------------

--
-- Struktur dari tabel `form_fields`
--

CREATE TABLE `form_fields` (
  `id` bigint UNSIGNED NOT NULL,
  `form_id` bigint UNSIGNED NOT NULL,
  `field_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('SHORT_TEXT','LONG_TEXT','DROPDOWN','RADIO','CHECKBOX','DATE','FILE_UPLOAD') COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
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

INSERT INTO `form_fields` (`id`, `form_id`, `field_key`, `type`, `label`, `note`, `required`, `is_core`, `placeholder`, `file_settings`, `sort_order`, `created_at`, `updated_at`) VALUES
(226, 2, 'field_1', 'SHORT_TEXT', 'Nama Perusahaan / Client', NULL, 1, 1, 'PT ABC Indonesia', NULL, 1, '2026-01-12 07:44:54', '2026-01-12 07:44:54'),
(227, 2, 'field_2', 'SHORT_TEXT', 'Nama PIC', NULL, 1, 1, 'John Doe', NULL, 2, '2026-01-12 07:44:54', '2026-01-12 07:44:54'),
(228, 2, 'field_3', 'SHORT_TEXT', 'Email', NULL, 1, 1, 'john@company.com', NULL, 3, '2026-01-12 07:44:54', '2026-01-12 07:44:54'),
(229, 2, 'field_4', 'SHORT_TEXT', 'Nomor Telepon / WhatsApp', NULL, 1, 1, '+62 812-3456-7890', NULL, 4, '2026-01-12 07:44:54', '2026-01-12 07:44:54'),
(234, 1, 'field_1', 'SHORT_TEXT', 'Nama Perusahaan / Client', NULL, 1, 1, 'PT ABC Indonesia', NULL, 1, '2026-01-26 02:46:40', '2026-01-26 02:46:40'),
(235, 1, 'field_2', 'SHORT_TEXT', 'Nama PIC', NULL, 1, 1, 'John Doe', NULL, 2, '2026-01-26 02:46:40', '2026-01-26 02:46:40'),
(236, 1, 'field_3', 'SHORT_TEXT', 'Email', NULL, 1, 1, 'john@company.com', NULL, 3, '2026-01-26 02:46:41', '2026-01-26 02:46:41'),
(237, 1, 'field_4', 'SHORT_TEXT', 'Nomor Telepon / WhatsApp', NULL, 1, 1, '+62 812-3456-7890', NULL, 4, '2026-01-26 02:46:41', '2026-01-26 02:46:41'),
(497, 5, 'field_1', 'SHORT_TEXT', 'Nama Perusahaan / Client', 'TULIS NAMA PERUSAHAAN DENGAN BENAR', 1, 1, 'PT ABC Indonesia', NULL, 1, '2026-02-02 10:12:56', '2026-02-02 10:12:56'),
(498, 5, 'field_2', 'SHORT_TEXT', 'Nama PIC', NULL, 1, 1, 'John Doe', NULL, 2, '2026-02-02 10:12:56', '2026-02-02 10:12:56'),
(499, 5, 'field_3', 'SHORT_TEXT', 'Email', NULL, 1, 1, 'john@company.com', NULL, 3, '2026-02-02 10:12:56', '2026-02-02 10:12:56'),
(500, 5, 'field_4', 'SHORT_TEXT', 'Nomor Telepon / WhatsApp', NULL, 1, 1, '+62 812-3456-7890', NULL, 4, '2026-02-02 10:12:56', '2026-02-02 10:12:56'),
(501, 5, 'field_5', 'SHORT_TEXT', 'New Field', 'wasdads', 0, 0, NULL, NULL, 5, '2026-02-02 10:12:56', '2026-02-02 10:12:56'),
(502, 5, 'field_6', 'CHECKBOX', 'New Field', NULL, 0, 0, NULL, NULL, 6, '2026-02-02 10:12:56', '2026-02-02 10:12:56'),
(503, 5, 'field_7', 'DROPDOWN', 'tes', NULL, 0, 0, NULL, NULL, 7, '2026-02-02 10:12:57', '2026-02-02 10:12:57'),
(504, 5, 'field_8', 'FILE_UPLOAD', 'New Field', NULL, 0, 0, NULL, NULL, 8, '2026-02-02 10:12:57', '2026-02-02 10:12:57'),
(690, 3, 'field_1', 'SHORT_TEXT', 'Nama Lengkap', NULL, 1, 1, 'John Doe', NULL, 1, '2026-02-11 10:26:38', '2026-02-11 10:26:38'),
(691, 3, 'field_2', 'SHORT_TEXT', 'Email Kantor', NULL, 1, 1, 'john@company.com', NULL, 2, '2026-02-11 10:26:38', '2026-02-11 10:26:38'),
(692, 3, 'field_3', 'SHORT_TEXT', 'Nomor WhatsApp', NULL, 1, 1, '+62 812-3456-7890', NULL, 3, '2026-02-11 10:26:38', '2026-02-11 10:26:38'),
(693, 3, 'field_4', 'SHORT_TEXT', 'Jabatan/Title', NULL, 1, 1, 'Finance Manager', NULL, 4, '2026-02-11 10:26:39', '2026-02-11 10:26:39'),
(694, 3, 'field_5', 'SHORT_TEXT', 'LinkedIn Profile (opsional)', NULL, 0, 0, 'https://linkedin.com/in/username', NULL, 5, '2026-02-11 10:26:39', '2026-02-11 10:26:39'),
(695, 3, 'field_6', 'SHORT_TEXT', 'Nama Perusahaan', NULL, 1, 1, 'PT ABC Indonesia', NULL, 6, '2026-02-11 10:26:39', '2026-02-11 10:26:39'),
(696, 3, 'field_7', 'DROPDOWN', 'Industri', NULL, 1, 0, NULL, NULL, 7, '2026-02-11 10:26:39', '2026-02-11 10:26:39'),
(697, 3, 'field_8', 'RADIO', 'Ukuran Perusahaan (range omzet / karyawan)', NULL, 1, 0, NULL, NULL, 8, '2026-02-11 10:26:39', '2026-02-11 10:26:39'),
(698, 3, 'field_9', 'SHORT_TEXT', 'Lokasi (Kota)', NULL, 1, 0, 'Jakarta', NULL, 9, '2026-02-11 10:26:40', '2026-02-11 10:26:40'),
(699, 3, 'field_10', 'RADIO', 'Kebutuhan utama Anda terkait kontrak & cashflow', NULL, 1, 0, NULL, NULL, 10, '2026-02-11 10:26:40', '2026-02-11 10:26:40'),
(700, 3, 'field_11', 'CHECKBOX', 'Masalah paling sering terjadi (boleh pilih lebih dari satu)', NULL, 0, 0, NULL, NULL, 11, '2026-02-11 10:26:40', '2026-02-11 10:26:40'),
(701, 3, 'field_12', 'LONG_TEXT', 'Pertanyaan yang ingin Anda titipkan untuk sesi Q&A', NULL, 0, 0, 'Tulis pertanyaan Anda di sini...', NULL, 12, '2026-02-11 10:26:40', '2026-02-11 10:26:40'),
(702, 3, 'field_13', 'RADIO', 'Anda mengetahui webinar ini dari mana?', NULL, 1, 0, NULL, NULL, 13, '2026-02-11 10:26:40', '2026-02-11 10:26:40'),
(703, 4, 'field_1', 'SHORT_TEXT', 'Nama Perusahaan / Client', NULL, 1, 1, 'PT ABC Indonesia', NULL, 1, '2026-02-13 09:13:27', '2026-02-13 09:13:27'),
(704, 4, 'field_2', 'SHORT_TEXT', 'Nama PIC', NULL, 1, 1, 'John Doe', NULL, 2, '2026-02-13 09:13:28', '2026-02-13 09:13:28'),
(705, 4, 'field_3', 'SHORT_TEXT', 'Email', NULL, 1, 1, 'john@company.com', NULL, 3, '2026-02-13 09:13:28', '2026-02-13 09:13:28'),
(706, 4, 'field_4', 'SHORT_TEXT', 'Nomor Telepon / WhatsApp', NULL, 1, 1, '+62 812-3456-7890', NULL, 4, '2026-02-13 09:13:28', '2026-02-13 09:13:28');

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

--
-- Dumping data untuk tabel `form_field_options`
--

INSERT INTO `form_field_options` (`id`, `form_field_id`, `opt_order`, `opt_value`) VALUES
(37, 502, 0, 'Instagram'),
(38, 502, 1, 'Linkedin'),
(39, 503, 0, 'tes 1'),
(40, 503, 1, 'tes 2'),
(41, 503, 2, 'tes 3'),
(202, 696, 0, 'Jasa Profesional / Agency'),
(203, 696, 1, 'Distribusi / Trading'),
(204, 696, 2, 'Manufaktur'),
(205, 696, 3, 'Konstruksi / Proyek'),
(206, 696, 4, 'Teknologi / SaaS'),
(207, 696, 5, 'Keuangan (jika relevan)'),
(208, 696, 6, 'Lainnya (isi)'),
(209, 697, 0, '1–50'),
(210, 697, 1, '51–200'),
(211, 697, 2, '201–1.000'),
(212, 697, 3, '1.000+'),
(213, 699, 0, 'Invoice sering tertahan karena dispute (scope/acceptance)'),
(214, 699, 1, 'Payment terms lemah (late payment, set-off, retention)'),
(215, 699, 2, 'Perlu memperkuat mekanisme penagihan & remedies'),
(216, 699, 3, 'Sedang negosiasi kontrak bernilai besar'),
(217, 699, 4, 'Ingin standarisasi template kontrak & clause bank'),
(218, 699, 5, 'Lainnya (isi)'),
(219, 700, 0, 'Scope tidak jelas'),
(220, 700, 1, 'Acceptance criteria tidak jelas'),
(221, 700, 2, 'Dokumen pendukung invoice tidak konsisten'),
(222, 700, 3, 'Change request/variation tidak tertata'),
(223, 700, 4, 'Hold payment / retention / set-off sepihak'),
(224, 700, 5, 'Termination/dispute clause tidak efektif'),
(225, 700, 6, 'Lainnya (isi)'),
(226, 702, 0, 'LinkedIn Company Page'),
(227, 702, 1, 'LinkedIn repost (personal)'),
(228, 702, 2, 'Instagram'),
(229, 702, 3, 'WhatsApp broadcast'),
(230, 702, 4, 'Email newsletter'),
(231, 702, 5, 'LinkedIn DM dari tim BD'),
(232, 702, 6, 'Referensi teman/kolega'),
(233, 702, 7, 'Partner/komunitas/asosiasi');

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
(3, 'Ferry Irawan', 'ferry.irawan@dsk-global.id', 'ferryirawan', NULL, '$2a$10$aQz/Qx9DrvkzcbBUqAZG/uCIsc9K3vvwN4TwCvtlyWV8BaMayKFoa', 2, 1, '2026-02-13 15:48:01', '2025-12-11 06:32:07', '2026-02-13 08:48:01'),
(4, 'CEO', 'ceo@dsk-global.id', 'ceo', NULL, '$2a$10$zP1bwb3SFf.VeRVrcIW7H.STedVP0DejBR8H21yZICM4QahpudrtG', 1, 1, '2026-02-13 16:30:06', '2025-12-11 08:46:57', '2026-02-13 09:30:06'),
(5, 'COO', 'coo@dsk-global.id', 'coo', NULL, '$2a$10$N/v5dQRNotTeOkJ92WuSxOZJ/wVpAjvrq8iEFIjRTt93Ykyd2WSHq', 2, 1, '2026-01-08 13:19:05', '2025-12-11 08:47:53', '2026-01-08 06:19:05'),
(6, 'PM', 'pm@dsk-global.id', 'pm', NULL, '$2a$10$LA24HkyZ.UG2/nxsvdFdZeFQSTpjl3VCPI0ykbUIWM1F7UMkArMuu', 3, 1, '2026-02-10 11:09:38', '2025-12-11 08:52:35', '2026-02-10 04:09:38'),
(7, 'Consultant', 'consultant@dsk-global.id', 'consultant', NULL, '$2a$10$sxIlIoZLAoRxGJi.5HZcg.9wW41MdDq8U.J8Iw3O5ajkQmN7u55wq', 4, 1, NULL, '2025-12-11 08:54:22', '2025-12-11 08:54:22'),
(8, 'BD - Exe', 'bd_exe@dsk-global.id', 'bd_exe', NULL, '$2a$10$Ncvm0pjSB3AsLgvLy0NxOOVRaVBz587fCCSK4jGsPizLSLqeVZfOe', 5, 1, '2026-02-13 16:30:24', '2025-12-11 08:56:16', '2026-02-13 09:30:24'),
(9, 'BD - MEO', 'bd_meo@dsk-global.id', 'bd_meo', NULL, '$2a$10$Tt5B3A5OQ1Xdq8n4QZ5WeOMS1R5imrtdfY/EOMLmlHswmnj5Ki2Fe', 6, 1, '2026-02-13 16:12:21', '2025-12-11 08:56:41', '2026-02-13 09:12:21'),
(10, 'Admin', 'admin@dsk-global.id', 'admin', NULL, '$2a$10$lU55JrqoqCactwzgL.tz6uEDKImY04aa/teVO8yhAeXh6IDp9Amca', 7, 1, NULL, '2025-12-11 08:57:09', '2025-12-11 08:57:09'),
(11, 'Superadmin', 'superadmin@dsk-global.id', 'superadmin', NULL, '$2a$10$sNHxGacijfkABcP5XtBCgemR0cUGaPNhW50CPcbQ1F8qPI/HcznsK', 8, 1, '2026-02-10 11:12:23', '2025-12-11 08:57:43', '2026-02-10 04:12:23');

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
  ADD UNIQUE KEY `forms_public_slug_uq` (`public_slug`),
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
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT untuk tabel `campaigns`
--
ALTER TABLE `campaigns`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

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
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=707;

--
-- AUTO_INCREMENT untuk tabel `form_field_options`
--
ALTER TABLE `form_field_options`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=234;

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
