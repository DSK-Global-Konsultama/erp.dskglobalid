-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Waktu pembuatan: 10 Nov 2025 pada 17.25
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
-- Struktur dari tabel `companies`
--

CREATE TABLE `companies` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(200) NOT NULL,
  `legal_name` varchar(255) DEFAULT NULL,
  `domain` varchar(190) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `contacts`
--

CREATE TABLE `contacts` (
  `id` bigint UNSIGNED NOT NULL,
  `company_id` bigint UNSIGNED NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(190) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `job_title` varchar(120) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `deals`
--

CREATE TABLE `deals` (
  `id` bigint UNSIGNED NOT NULL,
  `lead_id` bigint UNSIGNED DEFAULT NULL,
  `company_id` bigint UNSIGNED NOT NULL,
  `contact_id` bigint UNSIGNED NOT NULL,
  `title` varchar(200) NOT NULL,
  `proposal_status_id` tinyint UNSIGNED NOT NULL DEFAULT '1',
  `approved_at` datetime DEFAULT NULL,
  `approved_by_user_id` int UNSIGNED DEFAULT NULL,
  `el_strategy` enum('SINGLE_EL','PER_SERVICE') NOT NULL DEFAULT 'SINGLE_EL',
  `notes` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Trigger `deals`
--
DELIMITER $$
CREATE TRIGGER `trg_deals_before_insert` BEFORE INSERT ON `deals` FOR EACH ROW BEGIN
  DECLARE approved_id TINYINT UNSIGNED;
  SELECT id INTO approved_id FROM proposal_statuses WHERE code='APPROVED' LIMIT 1;
  IF NEW.proposal_status_id = approved_id AND NEW.approved_at IS NULL THEN
    SET NEW.approved_at = NOW();
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_deals_before_update` BEFORE UPDATE ON `deals` FOR EACH ROW BEGIN
  DECLARE approved_id TINYINT UNSIGNED;
  SELECT id INTO approved_id FROM proposal_statuses WHERE code='APPROVED' LIMIT 1;
  IF NEW.proposal_status_id = approved_id AND (OLD.proposal_status_id <> approved_id) THEN
    SET NEW.approved_at = NOW();
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Struktur dari tabel `deal_service_items`
--

CREATE TABLE `deal_service_items` (
  `id` bigint UNSIGNED NOT NULL,
  `deal_id` bigint UNSIGNED NOT NULL,
  `service_id` bigint UNSIGNED NOT NULL,
  `description` text,
  `quantity` decimal(12,2) NOT NULL DEFAULT '1.00',
  `estimated_price` decimal(18,2) NOT NULL DEFAULT '0.00',
  `currency` varchar(10) NOT NULL DEFAULT 'IDR',
  `payment_terms_txt` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `engagement_letters`
--

CREATE TABLE `engagement_letters` (
  `id` bigint UNSIGNED NOT NULL,
  `deal_id` bigint UNSIGNED NOT NULL,
  `code` varchar(60) DEFAULT NULL,
  `strategy` enum('SINGLE_EL','PER_SERVICE') NOT NULL,
  `status` enum('DRAFT','ISSUED','SIGNED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
  `issued_at` datetime DEFAULT NULL,
  `signed_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `engagement_letter_items`
--

CREATE TABLE `engagement_letter_items` (
  `id` bigint UNSIGNED NOT NULL,
  `engagement_letter_id` bigint UNSIGNED NOT NULL,
  `deal_service_item_id` bigint UNSIGNED DEFAULT NULL,
  `service_id` bigint UNSIGNED NOT NULL,
  `description` text,
  `amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `currency` varchar(10) NOT NULL DEFAULT 'IDR'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `invoices`
--

CREATE TABLE `invoices` (
  `id` bigint UNSIGNED NOT NULL,
  `company_id` bigint UNSIGNED NOT NULL,
  `el_id` bigint UNSIGNED DEFAULT NULL,
  `el_item_id` bigint UNSIGNED DEFAULT NULL,
  `issue_date` date NOT NULL DEFAULT (curdate()),
  `total_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `currency` varchar(10) NOT NULL DEFAULT 'IDR',
  `status_id` tinyint UNSIGNED NOT NULL DEFAULT '1',
  `notes` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `invoice_installments`
--

CREATE TABLE `invoice_installments` (
  `id` bigint UNSIGNED NOT NULL,
  `invoice_id` bigint UNSIGNED NOT NULL,
  `seq_no` int NOT NULL,
  `due_date` date NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `paid_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `status` enum('UNPAID','PARTIAL','PAID') NOT NULL DEFAULT 'UNPAID',
  `paid_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `invoice_statuses`
--

CREATE TABLE `invoice_statuses` (
  `id` tinyint UNSIGNED NOT NULL,
  `code` varchar(40) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `invoice_statuses`
--

INSERT INTO `invoice_statuses` (`id`, `code`, `name`) VALUES
(1, 'UNPAID', 'Unpaid'),
(2, 'PARTIAL', 'Partial'),
(3, 'PAID', 'Paid');

-- --------------------------------------------------------

--
-- Struktur dari tabel `leads`
--

CREATE TABLE `leads` (
  `id` bigint UNSIGNED NOT NULL,
  `company_id` bigint UNSIGNED NOT NULL,
  `contact_id` bigint UNSIGNED NOT NULL,
  `source_id` tinyint UNSIGNED NOT NULL,
  `status_id` tinyint UNSIGNED NOT NULL DEFAULT '1',
  `email` varchar(190) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `notes` text,
  `claimed_by_user_id` int UNSIGNED DEFAULT NULL,
  `claimed_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Trigger `leads`
--
DELIMITER $$
CREATE TRIGGER `trg_leads_before_update` BEFORE UPDATE ON `leads` FOR EACH ROW BEGIN
  -- Lock claim: begitu terisi, tidak boleh diubah/di-null-kan
  IF (OLD.claimed_by_user_id IS NOT NULL) AND 
     ((NEW.claimed_by_user_id <> OLD.claimed_by_user_id) OR (NEW.claimed_by_user_id IS NULL)) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lead sudah di-claim; tidak bisa diubah atau dihapus claim-nya.';
  END IF;

  -- Auto-set claimed_at saat pertama kali claim
  IF (OLD.claimed_by_user_id IS NULL) AND (NEW.claimed_by_user_id IS NOT NULL) AND (NEW.claimed_at IS NULL) THEN
    SET NEW.claimed_at = NOW();
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Struktur dari tabel `lead_sources`
--

CREATE TABLE `lead_sources` (
  `id` tinyint UNSIGNED NOT NULL,
  `code` varchar(40) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `lead_sources`
--

INSERT INTO `lead_sources` (`id`, `code`, `name`) VALUES
(1, 'WEBSITE', 'Website'),
(2, 'EVENT', 'Event'),
(3, 'INSTAGRAM', 'Instagram'),
(4, 'LINKEDIN', 'LinkedIn');

-- --------------------------------------------------------

--
-- Struktur dari tabel `lead_statuses`
--

CREATE TABLE `lead_statuses` (
  `id` tinyint UNSIGNED NOT NULL,
  `code` varchar(40) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `lead_statuses`
--

INSERT INTO `lead_statuses` (`id`, `code`, `name`) VALUES
(1, 'NOT_CLAIMED', 'Not Claimed'),
(2, 'CLAIMED', 'Claimed'),
(3, 'CONTACTED', 'Contacted'),
(4, 'SENT_PROPOSAL', 'Send Proposal'),
(5, 'MEETING', 'Meeting'),
(6, 'DEAL', 'Deal');

-- --------------------------------------------------------

--
-- Struktur dari tabel `payments`
--

CREATE TABLE `payments` (
  `id` bigint UNSIGNED NOT NULL,
  `invoice_id` bigint UNSIGNED NOT NULL,
  `installment_id` bigint UNSIGNED DEFAULT NULL,
  `amount` decimal(18,2) NOT NULL,
  `paid_date` date NOT NULL,
  `method` varchar(60) DEFAULT NULL,
  `reference` varchar(120) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Trigger `payments`
--
DELIMITER $$
CREATE TRIGGER `trg_payment_after_insert` AFTER INSERT ON `payments` FOR EACH ROW BEGIN
  IF NEW.installment_id IS NOT NULL THEN
    UPDATE invoice_installments
    SET paid_amount = LEAST(amount, paid_amount + NEW.amount),
        status = CASE
                   WHEN paid_amount + NEW.amount >= amount THEN 'PAID'
                   WHEN paid_amount + NEW.amount > 0 THEN 'PARTIAL'
                   ELSE 'UNPAID'
                 END,
        paid_at = CASE
                    WHEN paid_amount + NEW.amount >= amount THEN NOW()
                    ELSE paid_at
                  END
    WHERE id = NEW.installment_id;
  END IF;

  -- Sync invoice status berdasarkan semua termin
  UPDATE invoices i
  JOIN (
    SELECT invoice_id,
           SUM(CASE WHEN status='PAID' THEN 1 ELSE 0 END) AS paid_cnt,
           COUNT(*) AS total_cnt,
           SUM(amount) AS total_amt,
           SUM(paid_amount) AS total_paid
    FROM invoice_installments
    WHERE invoice_id = NEW.invoice_id
    GROUP BY invoice_id
  ) s ON s.invoice_id = i.id
  SET i.status_id = (
    SELECT CASE
             WHEN s.total_cnt > 0 AND s.paid_cnt = s.total_cnt THEN (SELECT id FROM invoice_statuses WHERE code='PAID')
             WHEN s.total_paid > 0 THEN (SELECT id FROM invoice_statuses WHERE code='PARTIAL')
             ELSE (SELECT id FROM invoice_statuses WHERE code='UNPAID')
           END
  )
  WHERE i.id = NEW.invoice_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Struktur dari tabel `projects`
--

CREATE TABLE `projects` (
  `id` bigint UNSIGNED NOT NULL,
  `el_item_id` bigint UNSIGNED NOT NULL,
  `name` varchar(200) NOT NULL,
  `pm_user_id` int UNSIGNED NOT NULL,
  `status` enum('PLANNING','IN_PROGRESS','ON_HOLD','DONE','CANCELLED') NOT NULL DEFAULT 'PLANNING',
  `start_date` date DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `project_assignments`
--

CREATE TABLE `project_assignments` (
  `id` bigint UNSIGNED NOT NULL,
  `project_id` bigint UNSIGNED NOT NULL,
  `user_id` int UNSIGNED NOT NULL,
  `role` enum('CONSULTANT','QA','DESIGN') NOT NULL DEFAULT 'CONSULTANT'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `project_tasks`
--

CREATE TABLE `project_tasks` (
  `id` bigint UNSIGNED NOT NULL,
  `project_id` bigint UNSIGNED NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text,
  `status` enum('TODO','IN_PROGRESS','REVIEW','DONE','BLOCKED') NOT NULL DEFAULT 'TODO',
  `assignee_user_id` int UNSIGNED DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `proposal_statuses`
--

CREATE TABLE `proposal_statuses` (
  `id` tinyint UNSIGNED NOT NULL,
  `code` varchar(40) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `proposal_statuses`
--

INSERT INTO `proposal_statuses` (`id`, `code`, `name`) VALUES
(1, 'NOT_SUBMITTED', 'Not Submitted'),
(2, 'SUBMITTED', 'Submitted'),
(3, 'APPROVED', 'Approved'),
(4, 'REJECTED', 'Rejected');

-- --------------------------------------------------------

--
-- Struktur dari tabel `roles`
--

CREATE TABLE `roles` (
  `id` int UNSIGNED NOT NULL,
  `code` varchar(60) NOT NULL,
  `name` varchar(120) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `roles`
--

INSERT INTO `roles` (`id`, `code`, `name`, `created_at`, `updated_at`) VALUES
(1, 'BoardofDirectors', 'Board of Directors', '2025-10-28 14:50:20', '2025-10-28 14:50:20'),
(2, 'BDExecutive', 'BD Executive', '2025-10-28 14:50:20', '2025-10-28 14:50:20'),
(3, 'BDContentCreator', 'BD Content Creator', '2025-10-28 14:50:20', '2025-10-28 14:50:20'),
(4, 'ProjectManager', 'Project Manager', '2025-10-28 14:50:20', '2025-10-28 14:50:20'),
(5, 'Consultant', 'Consultant', '2025-10-28 14:50:20', '2025-10-28 14:50:20'),
(6, 'Admin', 'Administrator', '2025-10-28 14:50:20', '2025-10-28 14:50:20'),
(7, 'ITSpecialist', 'IT Specialist', '2025-10-28 14:50:20', '2025-10-28 14:50:20'),
(8, 'Staff', 'Staff', '2025-10-28 14:50:20', '2025-10-28 14:50:20');

-- --------------------------------------------------------

--
-- Struktur dari tabel `services`
--

CREATE TABLE `services` (
  `id` bigint UNSIGNED NOT NULL,
  `code` varchar(60) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `aad_oid` char(36) DEFAULT NULL,
  `aad_tid` char(36) DEFAULT NULL,
  `upn` varchar(150) DEFAULT NULL,
  `last_login` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `created_at`, `updated_at`, `aad_oid`, `aad_tid`, `upn`, `last_login`) VALUES
(2, 'Muhamad Faried', 'muhamad.faried@dsk-global.id', '2025-10-28 14:06:46', '2025-10-30 14:51:14', 'd178f61a-e8fe-4cae-bf9a-e051364775bb', 'c13fabfe-81fc-4a95-a918-be90760a22ae', 'muhamad.faried@dsk-global.id', '2025-10-30 14:51:14');

-- --------------------------------------------------------

--
-- Struktur dari tabel `user_roles`
--

CREATE TABLE `user_roles` (
  `user_id` int UNSIGNED NOT NULL,
  `role_id` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `user_roles`
--

INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES
(2, 7);

-- --------------------------------------------------------

--
-- Stand-in struktur untuk tampilan `v_invoice_progress`
-- (Lihat di bawah untuk tampilan aktual)
--
CREATE TABLE `v_invoice_progress` (
`company_name` varchar(200)
,`invoice_id` bigint unsigned
,`issue_date` date
,`paid_percent` decimal(46,2)
,`total_amount` decimal(18,2)
,`total_inst_amount` decimal(40,2)
,`total_paid` decimal(40,2)
);

-- --------------------------------------------------------

--
-- Stand-in struktur untuk tampilan `v_leads_id_date`
-- (Lihat di bawah untuk tampilan aktual)
--
CREATE TABLE `v_leads_id_date` (
`claimed_at` datetime
,`claimed_by_user_id` int unsigned
,`company_id` bigint unsigned
,`contact_id` bigint unsigned
,`created_at` timestamp
,`email` varchar(190)
,`id` bigint unsigned
,`notes` text
,`phone` varchar(50)
,`source_id` tinyint unsigned
,`status_id` tinyint unsigned
,`tanggal_id` varchar(21)
,`updated_at` timestamp
);

-- --------------------------------------------------------

--
-- Stand-in struktur untuk tampilan `v_pipeline`
-- (Lihat di bawah untuk tampilan aktual)
--
CREATE TABLE `v_pipeline` (
`approved_at` datetime
,`company_name` varchar(200)
,`contact_name` varchar(150)
,`deal_id` bigint unsigned
,`lead_created_at` timestamp
,`lead_id` bigint unsigned
,`lead_status` varchar(40)
,`proposal_status` varchar(40)
);

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_companies_name` (`name`);

--
-- Indeks untuk tabel `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_contacts_company` (`company_id`),
  ADD KEY `idx_contacts_email` (`email`),
  ADD KEY `idx_contacts_phone` (`phone`);

--
-- Indeks untuk tabel `deals`
--
ALTER TABLE `deals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_deals_company` (`company_id`),
  ADD KEY `idx_deals_contact` (`contact_id`),
  ADD KEY `idx_deals_prop_status` (`proposal_status_id`),
  ADD KEY `fk_deals_lead` (`lead_id`),
  ADD KEY `fk_deals_approved_by` (`approved_by_user_id`);

--
-- Indeks untuk tabel `deal_service_items`
--
ALTER TABLE `deal_service_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_dsi_deal` (`deal_id`),
  ADD KEY `idx_dsi_service` (`service_id`);

--
-- Indeks untuk tabel `engagement_letters`
--
ALTER TABLE `engagement_letters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_el_deal` (`deal_id`);

--
-- Indeks untuk tabel `engagement_letter_items`
--
ALTER TABLE `engagement_letter_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_eli_el` (`engagement_letter_id`),
  ADD KEY `fk_eli_dsi` (`deal_service_item_id`),
  ADD KEY `fk_eli_srv` (`service_id`);

--
-- Indeks untuk tabel `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_inv_company` (`company_id`),
  ADD KEY `fk_inv_el` (`el_id`),
  ADD KEY `fk_inv_el_item` (`el_item_id`),
  ADD KEY `fk_inv_status` (`status_id`);

--
-- Indeks untuk tabel `invoice_installments`
--
ALTER TABLE `invoice_installments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_inst` (`invoice_id`,`seq_no`),
  ADD KEY `idx_inst_due` (`due_date`);

--
-- Indeks untuk tabel `invoice_statuses`
--
ALTER TABLE `invoice_statuses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_invoice_statuses_code` (`code`);

--
-- Indeks untuk tabel `leads`
--
ALTER TABLE `leads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_leads_company` (`company_id`),
  ADD KEY `idx_leads_contact` (`contact_id`),
  ADD KEY `idx_leads_source` (`source_id`),
  ADD KEY `idx_leads_status` (`status_id`),
  ADD KEY `idx_leads_email` (`email`),
  ADD KEY `idx_leads_phone` (`phone`),
  ADD KEY `idx_leads_claimed_by` (`claimed_by_user_id`);

--
-- Indeks untuk tabel `lead_sources`
--
ALTER TABLE `lead_sources`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_lead_sources_code` (`code`);

--
-- Indeks untuk tabel `lead_statuses`
--
ALTER TABLE `lead_statuses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_lead_statuses_code` (`code`);

--
-- Indeks untuk tabel `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pay_inv` (`invoice_id`),
  ADD KEY `idx_pay_inst` (`installment_id`);

--
-- Indeks untuk tabel `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_projects_pm` (`pm_user_id`),
  ADD KEY `fk_projects_el_item` (`el_item_id`);

--
-- Indeks untuk tabel `project_assignments`
--
ALTER TABLE `project_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_pa` (`project_id`,`user_id`,`role`),
  ADD KEY `fk_pa_user` (`user_id`);

--
-- Indeks untuk tabel `project_tasks`
--
ALTER TABLE `project_tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tasks_project` (`project_id`),
  ADD KEY `idx_tasks_assignee` (`assignee_user_id`);

--
-- Indeks untuk tabel `proposal_statuses`
--
ALTER TABLE `proposal_statuses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_proposal_statuses_code` (`code`);

--
-- Indeks untuk tabel `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indeks untuk tabel `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_services_code` (`code`);

--
-- Indeks untuk tabel `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`),
  ADD KEY `idx_sessions_expires` (`expires`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `aad_oid` (`aad_oid`);

--
-- Indeks untuk tabel `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`user_id`,`role_id`),
  ADD KEY `role_id` (`role_id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `companies`
--
ALTER TABLE `companies`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `deals`
--
ALTER TABLE `deals`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `deal_service_items`
--
ALTER TABLE `deal_service_items`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `engagement_letters`
--
ALTER TABLE `engagement_letters`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `engagement_letter_items`
--
ALTER TABLE `engagement_letter_items`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `invoice_installments`
--
ALTER TABLE `invoice_installments`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `invoice_statuses`
--
ALTER TABLE `invoice_statuses`
  MODIFY `id` tinyint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `leads`
--
ALTER TABLE `leads`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `lead_sources`
--
ALTER TABLE `lead_sources`
  MODIFY `id` tinyint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `lead_statuses`
--
ALTER TABLE `lead_statuses`
  MODIFY `id` tinyint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `projects`
--
ALTER TABLE `projects`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `project_assignments`
--
ALTER TABLE `project_assignments`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `project_tasks`
--
ALTER TABLE `project_tasks`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `proposal_statuses`
--
ALTER TABLE `proposal_statuses`
  MODIFY `id` tinyint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT untuk tabel `services`
--
ALTER TABLE `services`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

-- --------------------------------------------------------

--
-- Struktur untuk view `v_invoice_progress`
--
DROP TABLE IF EXISTS `v_invoice_progress`;

CREATE ALGORITHM=UNDEFINED DEFINER=`cpses_dstkdkpzc4`@`localhost` SQL SECURITY DEFINER VIEW `v_invoice_progress`  AS SELECT `i`.`id` AS `invoice_id`, `c`.`name` AS `company_name`, `i`.`issue_date` AS `issue_date`, `i`.`total_amount` AS `total_amount`, coalesce(sum(`inst`.`amount`),0) AS `total_inst_amount`, coalesce(sum(`inst`.`paid_amount`),0) AS `total_paid`, (case when (coalesce(sum(`inst`.`amount`),0) = 0) then 0 else round(((coalesce(sum(`inst`.`paid_amount`),0) * 100) / sum(`inst`.`amount`)),2) end) AS `paid_percent` FROM ((`invoices` `i` left join `companies` `c` on((`c`.`id` = `i`.`company_id`))) left join `invoice_installments` `inst` on((`inst`.`invoice_id` = `i`.`id`))) GROUP BY `i`.`id`, `c`.`name`, `i`.`issue_date`, `i`.`total_amount` ;

-- --------------------------------------------------------

--
-- Struktur untuk view `v_leads_id_date`
--
DROP TABLE IF EXISTS `v_leads_id_date`;

CREATE ALGORITHM=UNDEFINED DEFINER=`cpses_dstkdkpzc4`@`localhost` SQL SECURITY DEFINER VIEW `v_leads_id_date`  AS SELECT `l`.`id` AS `id`, `l`.`company_id` AS `company_id`, `l`.`contact_id` AS `contact_id`, `l`.`source_id` AS `source_id`, `l`.`status_id` AS `status_id`, `l`.`email` AS `email`, `l`.`phone` AS `phone`, `l`.`notes` AS `notes`, `l`.`claimed_by_user_id` AS `claimed_by_user_id`, `l`.`claimed_at` AS `claimed_at`, `l`.`created_at` AS `created_at`, `l`.`updated_at` AS `updated_at`, date_format(convert_tz(`l`.`created_at`,'+00:00','+07:00'),'%d/%m/%Y %H:%i') AS `tanggal_id` FROM `leads` AS `l` ;

-- --------------------------------------------------------

--
-- Struktur untuk view `v_pipeline`
--
DROP TABLE IF EXISTS `v_pipeline`;

CREATE ALGORITHM=UNDEFINED DEFINER=`cpses_dstkdkpzc4`@`localhost` SQL SECURITY DEFINER VIEW `v_pipeline`  AS SELECT `l`.`id` AS `lead_id`, `ls`.`code` AS `lead_status`, `c`.`name` AS `company_name`, `ct`.`full_name` AS `contact_name`, `l`.`created_at` AS `lead_created_at`, `d`.`id` AS `deal_id`, `ps`.`code` AS `proposal_status`, `d`.`approved_at` AS `approved_at` FROM (((((`leads` `l` join `companies` `c` on((`c`.`id` = `l`.`company_id`))) join `contacts` `ct` on((`ct`.`id` = `l`.`contact_id`))) join `lead_statuses` `ls` on((`ls`.`id` = `l`.`status_id`))) left join `deals` `d` on((`d`.`lead_id` = `l`.`id`))) left join `proposal_statuses` `ps` on((`ps`.`id` = `d`.`proposal_status_id`))) ;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `contacts`
--
ALTER TABLE `contacts`
  ADD CONSTRAINT `fk_contacts_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`);

--
-- Ketidakleluasaan untuk tabel `deals`
--
ALTER TABLE `deals`
  ADD CONSTRAINT `fk_deals_approved_by` FOREIGN KEY (`approved_by_user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_deals_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  ADD CONSTRAINT `fk_deals_contact` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`),
  ADD CONSTRAINT `fk_deals_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`),
  ADD CONSTRAINT `fk_deals_prop_status` FOREIGN KEY (`proposal_status_id`) REFERENCES `proposal_statuses` (`id`);

--
-- Ketidakleluasaan untuk tabel `deal_service_items`
--
ALTER TABLE `deal_service_items`
  ADD CONSTRAINT `fk_dsi_deal` FOREIGN KEY (`deal_id`) REFERENCES `deals` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_dsi_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`);

--
-- Ketidakleluasaan untuk tabel `engagement_letters`
--
ALTER TABLE `engagement_letters`
  ADD CONSTRAINT `fk_el_deal` FOREIGN KEY (`deal_id`) REFERENCES `deals` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `engagement_letter_items`
--
ALTER TABLE `engagement_letter_items`
  ADD CONSTRAINT `fk_eli_dsi` FOREIGN KEY (`deal_service_item_id`) REFERENCES `deal_service_items` (`id`),
  ADD CONSTRAINT `fk_eli_el` FOREIGN KEY (`engagement_letter_id`) REFERENCES `engagement_letters` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_eli_srv` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`);

--
-- Ketidakleluasaan untuk tabel `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `fk_inv_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  ADD CONSTRAINT `fk_inv_el` FOREIGN KEY (`el_id`) REFERENCES `engagement_letters` (`id`),
  ADD CONSTRAINT `fk_inv_el_item` FOREIGN KEY (`el_item_id`) REFERENCES `engagement_letter_items` (`id`),
  ADD CONSTRAINT `fk_inv_status` FOREIGN KEY (`status_id`) REFERENCES `invoice_statuses` (`id`);

--
-- Ketidakleluasaan untuk tabel `invoice_installments`
--
ALTER TABLE `invoice_installments`
  ADD CONSTRAINT `fk_inst_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `leads`
--
ALTER TABLE `leads`
  ADD CONSTRAINT `fk_leads_claimed_by` FOREIGN KEY (`claimed_by_user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_leads_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  ADD CONSTRAINT `fk_leads_contact` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`),
  ADD CONSTRAINT `fk_leads_source` FOREIGN KEY (`source_id`) REFERENCES `lead_sources` (`id`),
  ADD CONSTRAINT `fk_leads_status` FOREIGN KEY (`status_id`) REFERENCES `lead_statuses` (`id`);

--
-- Ketidakleluasaan untuk tabel `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_pay_installment` FOREIGN KEY (`installment_id`) REFERENCES `invoice_installments` (`id`),
  ADD CONSTRAINT `fk_pay_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `fk_projects_el_item` FOREIGN KEY (`el_item_id`) REFERENCES `engagement_letter_items` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_projects_pm` FOREIGN KEY (`pm_user_id`) REFERENCES `users` (`id`);

--
-- Ketidakleluasaan untuk tabel `project_assignments`
--
ALTER TABLE `project_assignments`
  ADD CONSTRAINT `fk_pa_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_pa_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Ketidakleluasaan untuk tabel `project_tasks`
--
ALTER TABLE `project_tasks`
  ADD CONSTRAINT `fk_tasks_assignee` FOREIGN KEY (`assignee_user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_tasks_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;


