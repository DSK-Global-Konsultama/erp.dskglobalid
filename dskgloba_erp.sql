-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Waktu pembuatan: 29 Des 2025 pada 17.07
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
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `campaign_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `form_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
  `promoted_to_lead_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `promoted_by` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `promoted_at` datetime DEFAULT NULL,
  `submitted_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `campaigns`
--

CREATE TABLE `campaigns` (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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

-- --------------------------------------------------------

--
-- Struktur dari tabel `campaign_forms`
--

CREATE TABLE `campaign_forms` (
  `campaign_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `form_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('DRAFT','PUBLISHED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `public_link` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `published_at` datetime DEFAULT NULL,
  `created_by` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `primary_campaign_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `form_fields`
--

CREATE TABLE `form_fields` (
  `id` bigint UNSIGNED NOT NULL,
  `form_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `field_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('SHORT_TEXT','LONG_TEXT','DROPDOWN','RADIO','CHECKBOX','DATE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `required` tinyint(1) NOT NULL DEFAULT '0',
  `is_core` tinyint(1) NOT NULL DEFAULT '0',
  `placeholder` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `sort_order` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(2, 'Suparna Wijaya', 'suparnawijaya@dsk-global.id', 'suparnawijaya', NULL, '$2a$10$2I2TS/Lz/VC91RBDC5.bb.UcQ9u3s9YUsIHx9N.KfjX7CB1eV89Wy', 2, 1, NULL, '2025-12-11 06:30:56', '2025-12-11 06:30:56'),
(3, 'Ferry Irawan', 'ferry.irawan@dsk-global.id', 'ferryirawan', NULL, '$2a$10$fSLuex70XPUCbEYo2Y1cEuIu0qYIxtZqqWW0SOvgqp/iIUfOsqd5u', 2, 1, NULL, '2025-12-11 06:32:07', '2025-12-11 06:32:07'),
(4, 'CEO', 'ceo@dsk-global.id', 'ceo', NULL, '$2a$10$zP1bwb3SFf.VeRVrcIW7H.STedVP0DejBR8H21yZICM4QahpudrtG', 1, 1, '2025-12-29 10:16:40', '2025-12-11 08:46:57', '2025-12-29 03:16:40'),
(5, 'COO', 'coo@dsk-global.id', 'coo', NULL, '$2a$10$N/v5dQRNotTeOkJ92WuSxOZJ/wVpAjvrq8iEFIjRTt93Ykyd2WSHq', 2, 1, NULL, '2025-12-11 08:47:53', '2025-12-11 08:47:53'),
(6, 'PM', 'pm@dsk-global.id', 'pm', NULL, '$2a$10$LA24HkyZ.UG2/nxsvdFdZeFQSTpjl3VCPI0ykbUIWM1F7UMkArMuu', 3, 1, NULL, '2025-12-11 08:52:35', '2025-12-11 08:52:35'),
(7, 'Consultant', 'consultant@dsk-global.id', 'consultant', NULL, '$2a$10$sxIlIoZLAoRxGJi.5HZcg.9wW41MdDq8U.J8Iw3O5ajkQmN7u55wq', 4, 1, NULL, '2025-12-11 08:54:22', '2025-12-11 08:54:22'),
(8, 'BD - Exe', 'bd_exe@dsk-global.id', 'bd_exe', NULL, '$2a$10$Ncvm0pjSB3AsLgvLy0NxOOVRaVBz587fCCSK4jGsPizLSLqeVZfOe', 5, 1, '2025-12-29 10:19:22', '2025-12-11 08:56:16', '2025-12-29 03:19:22'),
(9, 'BD - MEO', 'bd_meo@dsk-global.id', 'bd_meo', NULL, '$2a$10$Tt5B3A5OQ1Xdq8n4QZ5WeOMS1R5imrtdfY/EOMLmlHswmnj5Ki2Fe', 6, 1, '2025-12-29 14:55:50', '2025-12-11 08:56:41', '2025-12-29 07:55:50'),
(10, 'Admin', 'admin@dsk-global.id', 'admin', NULL, '$2a$10$lU55JrqoqCactwzgL.tz6uEDKImY04aa/teVO8yhAeXh6IDp9Amca', 7, 1, NULL, '2025-12-11 08:57:09', '2025-12-11 08:57:09'),
(11, 'Superadmin', 'superadmin@dsk-global.id', 'superadmin', NULL, '$2a$10$sNHxGacijfkABcP5XtBCgemR0cUGaPNhW50CPcbQ1F8qPI/HcznsK', 8, 1, '2025-12-29 14:52:30', '2025-12-11 08:57:43', '2025-12-29 07:52:30');

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
-- AUTO_INCREMENT untuk tabel `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `form_fields`
--
ALTER TABLE `form_fields`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

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
