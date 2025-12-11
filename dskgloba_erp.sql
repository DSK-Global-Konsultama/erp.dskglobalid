-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Waktu pembuatan: 11 Des 2025 pada 13.54
-- Versi server: 8.0.43-cll-lve
-- Versi PHP: 8.4.14

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
(5, 'BD_EXE', 'Business Development - Executive', 'Pitching client sampai menjadi client', '2025-12-07 17:55:21', '2025-12-08 07:49:57'),
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
(1, 'Galih Gumilang', 'GalihGumilang@dsk-global.id', 'galihgumilang', 'profile_images/1-1765200312255-53709749.jpg', '$2a$10$Y4kxCN303RCJHmGJ4y7Cse2aHykkOiZEahlCqYTYhpfCHi5NTN.5e', 1, 1, NULL, '2025-12-08 08:31:32', '2025-12-11 06:32:18'),
(2, 'Suparna Wijaya', 'suparnawijaya@dsk-global.id', 'suparnawijaya', NULL, '$2a$10$2I2TS/Lz/VC91RBDC5.bb.UcQ9u3s9YUsIHx9N.KfjX7CB1eV89Wy', 2, 1, NULL, '2025-12-11 06:30:56', '2025-12-11 06:30:56'),
(3, 'Ferry Irawan', 'ferry.irawan@dsk-global.id', 'ferryirawan', NULL, '$2a$10$fSLuex70XPUCbEYo2Y1cEuIu0qYIxtZqqWW0SOvgqp/iIUfOsqd5u', 2, 1, NULL, '2025-12-11 06:32:07', '2025-12-11 06:32:07');

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
-- Indeks untuk tabel `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

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
-- AUTO_INCREMENT untuk tabel `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

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
