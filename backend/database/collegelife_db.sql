-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: collegelife_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `academic_calendar_events`
--

DROP TABLE IF EXISTS `academic_calendar_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `academic_calendar_events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_title` varchar(255) NOT NULL,
  `event_type` enum('holiday','exam','academic_event','vacation','semester_milestone') NOT NULL DEFAULT 'holiday',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `description` text DEFAULT NULL,
  `is_holiday` tinyint(1) NOT NULL DEFAULT 1,
  `color_code` varchar(20) DEFAULT '#DC2626',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `academic_calendar_events`
--

LOCK TABLES `academic_calendar_events` WRITE;
/*!40000 ALTER TABLE `academic_calendar_events` DISABLE KEYS */;
INSERT INTO `academic_calendar_events` VALUES (1,'Gandhi Jayanti & Shastri Jayanti','holiday','2026-10-02','2026-10-02','National Gazetted Holiday commemorating Mahatma Gandhi.',1,'#DC2626','2026-10-09 11:33:53'),(2,'Durga Puja & Dussehra Vacation','vacation','2026-10-19','2026-10-24','State statutory puja vacation across all engineering colleges.',1,'#DC2626','2026-10-09 11:33:53'),(3,'Kumar Purnima / Lakshmi Puja','holiday','2026-10-26','2026-10-26','Regional cultural and statutory holiday in Odisha.',1,'#DC2626','2026-10-09 11:33:53'),(4,'Diwali & Kali Puja','holiday','2026-11-08','2026-11-09','Festival of Lights. College closed for teaching and administrative work.',1,'#DC2626','2026-10-09 11:33:53'),(5,'Birsa Munda Jayanti','holiday','2026-11-15','2026-11-15','State commemoration holiday.',1,'#DC2626','2026-10-09 11:33:53'),(6,'Mid-Semester Examinations','exam','2026-11-16','2026-11-21','BPUT Autumn 2026 Mid-Semester Theory and Practical Assessments.',0,'#D97706','2026-10-09 11:33:53'),(7,'Guru Nanak Jayanti / Rahas Purnima','holiday','2026-11-24','2026-11-24','Gazetted statutory holiday.',1,'#DC2626','2026-10-09 11:33:53'),(8,'Winter Project Evaluation Week','academic_event','2026-12-07','2026-12-11','Capstone and minor project preliminary viva voce.',0,'#2563EB','2026-10-09 11:33:53'),(9,'Christmas Vacation & Year End Break','vacation','2026-12-25','2026-12-31','Winter academic recess for students and faculty.',1,'#DC2626','2026-10-09 11:33:54');
/*!40000 ALTER TABLE `academic_calendar_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admit_cards`
--

DROP TABLE IF EXISTS `admit_cards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admit_cards` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `admit_card_number` varchar(80) NOT NULL,
  `student_profile_id` int(11) NOT NULL,
  `exam_session_id` int(11) NOT NULL,
  `attendance_percentage` decimal(5,2) NOT NULL DEFAULT 85.00,
  `fee_clearance_status` enum('cleared','pending','waived') DEFAULT 'cleared',
  `eligibility_status` enum('eligible','detained','provisional') DEFAULT 'eligible',
  `status` enum('issued','withheld','collected') DEFAULT 'issued',
  `issued_at` datetime DEFAULT NULL,
  `qr_security_hash` varchar(128) NOT NULL,
  `seating_hall_allotment` varchar(150) DEFAULT 'Hall A-102, Desk #14',
  `remarks` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `admit_card_number` (`admit_card_number`),
  KEY `student_profile_id` (`student_profile_id`),
  KEY `exam_session_id` (`exam_session_id`),
  CONSTRAINT `admit_cards_ibfk_1` FOREIGN KEY (`student_profile_id`) REFERENCES `student_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `admit_cards_ibfk_2` FOREIGN KEY (`exam_session_id`) REFERENCES `exam_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admit_cards`
--

LOCK TABLES `admit_cards` WRITE;
/*!40000 ALTER TABLE `admit_cards` DISABLE KEYS */;
INSERT INTO `admit_cards` VALUES (1,'CUT/AC/2026/00142',1,1,88.50,'cleared','eligible','issued','2026-10-09 00:50:53','CUT-VERIF-AC-24050101-7F89B2','Lecture Hall LH-101, Desk #24 (Row C)','All institutional prerequisites fulfilled. Verified by CoE.','2026-10-08 19:20:53'),(2,'CUT/AC/2026/00143',2,1,94.20,'cleared','eligible','issued','2026-10-09 00:50:53','CUT-VERIF-AC-24050102-3A11C9','Lecture Hall LH-101, Desk #25 (Row C)','Exemplary attendance record. Verified by CoE.','2026-10-08 19:20:53'),(3,'CUT/AC/2026/00144',3,1,78.40,'cleared','eligible','issued','2026-10-09 00:50:53','CUT-VERIF-AC-23010145-9D42E1','Lecture Hall LH-201, Desk #42 (Row E)','Attendance above 75% threshold. Cleared by Dean Academics.','2026-10-08 19:20:53'),(7,'CUT/AC/2026/00001',1,2,86.24,'cleared','eligible','issued','2026-10-09 00:53:33','CUT-VERIF-AC-24050101-35D971','Examination Center Block C, Desk #11','Statutory Attendance Verified (>= 75.00%). Hall Ticket Cleared.','2026-10-08 19:23:33');
/*!40000 ALTER TABLE `admit_cards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance_records`
--

DROP TABLE IF EXISTS `attendance_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `attendance_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `subject_code` varchar(20) NOT NULL,
  `subject_name` varchar(100) NOT NULL,
  `faculty_name` varchar(100) NOT NULL,
  `total_classes` int(11) DEFAULT 0,
  `attended_classes` int(11) DEFAULT 0,
  `percentage` decimal(5,2) DEFAULT 100.00,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_att_student_subject` (`student_id`,`subject_code`),
  KEY `idx_att_student` (`student_id`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_records`
--

LOCK TABLES `attendance_records` WRITE;
/*!40000 ALTER TABLE `attendance_records` DISABLE KEYS */;
INSERT INTO `attendance_records` VALUES (6,1,'CS-601','Advanced Algorithms & Complexity','Prof. Ashok Sharma',39,34,87.18,'2026-10-09 13:05:06'),(7,1,'CS-602','Distributed Systems & Cloud Computing','Dr. Meenakshi Sundaram',40,28,70.00,'2026-10-09 08:26:03'),(8,1,'CS-603','Database Internals & Storage Engines','Prof. Ashok Sharma',37,29,78.38,'2026-10-09 14:41:11'),(9,1,'CS-604','Compiler Design & Formal Grammars','Dr. Vandana Saxena',34,31,91.18,'2026-10-09 08:26:03'),(10,1,'CS-605L','Advanced Computing Laboratory II','Er. Subrat Das',16,15,93.75,'2026-10-09 08:26:03'),(11,2,'CS-601','Advanced Algorithms & Complexity','Prof. Ashok Sharma',40,31,77.50,'2026-10-09 13:05:06'),(12,2,'CS-602','Distributed Systems & Cloud Computing','Dr. Meenakshi Sundaram',38,38,100.00,'2026-10-09 13:00:41'),(13,2,'CS-603','Database Internals & Storage Engines','Prof. Ashok Sharma',41,31,75.61,'2026-10-09 14:41:11'),(14,2,'CS-604','Compiler Design & Formal Grammars','Dr. Vandana Saxena',38,30,78.95,'2026-10-09 13:00:41'),(15,2,'CS-605L','Advanced Computing Laboratory II','Er. Subrat Das',37,26,70.27,'2026-10-09 13:00:41'),(16,4,'CS-601','Advanced Algorithms & Complexity','Prof. Ashok Sharma',39,38,97.44,'2026-10-09 13:05:06'),(17,4,'CS-602','Distributed Systems & Cloud Computing','Dr. Meenakshi Sundaram',36,35,97.22,'2026-10-09 13:00:41'),(18,4,'CS-603','Database Internals & Storage Engines','Prof. Ashok Sharma',38,38,100.00,'2026-10-09 14:41:11'),(19,4,'CS-604','Compiler Design & Formal Grammars','Dr. Vandana Saxena',39,38,97.44,'2026-10-09 13:00:41'),(20,4,'CS-605L','Advanced Computing Laboratory II','Er. Subrat Das',38,33,86.84,'2026-10-09 13:00:41'),(21,6,'CS-601','Advanced Algorithms & Complexity','Prof. Ashok Sharma',39,33,84.62,'2026-10-09 13:05:06'),(22,6,'CS-602','Distributed Systems & Cloud Computing','Dr. Meenakshi Sundaram',38,37,97.37,'2026-10-09 13:00:41'),(23,6,'CS-603','Database Internals & Storage Engines','Prof. Ashok Sharma',38,28,73.68,'2026-10-09 14:41:11'),(24,6,'CS-604','Compiler Design & Formal Grammars','Dr. Vandana Saxena',40,31,77.50,'2026-10-09 13:00:41'),(25,6,'CS-605L','Advanced Computing Laboratory II','Er. Subrat Das',34,30,88.24,'2026-10-09 13:00:41'),(26,7,'CS-601','Advanced Algorithms & Complexity','Prof. Ashok Sharma',37,37,100.00,'2026-10-09 13:05:06'),(27,7,'CS-602','Distributed Systems & Cloud Computing','Dr. Meenakshi Sundaram',35,26,74.29,'2026-10-09 13:00:41'),(28,7,'CS-603','Database Internals & Storage Engines','Prof. Ashok Sharma',39,37,94.87,'2026-10-09 14:41:11'),(29,7,'CS-604','Compiler Design & Formal Grammars','Dr. Vandana Saxena',38,32,84.21,'2026-10-09 13:00:41'),(30,7,'CS-605L','Advanced Computing Laboratory II','Er. Subrat Das',34,32,94.12,'2026-10-09 13:00:41'),(31,8,'CS-601','Advanced Algorithms & Complexity','Prof. Ashok Sharma',36,29,80.56,'2026-10-09 13:05:06'),(32,8,'CS-602','Distributed Systems & Cloud Computing','Dr. Meenakshi Sundaram',36,35,97.22,'2026-10-09 13:00:41'),(33,8,'CS-603','Database Internals & Storage Engines','Prof. Ashok Sharma',40,37,92.50,'2026-10-09 14:41:11'),(34,8,'CS-604','Compiler Design & Formal Grammars','Dr. Vandana Saxena',39,34,87.18,'2026-10-09 13:00:41'),(35,8,'CS-605L','Advanced Computing Laboratory II','Er. Subrat Das',38,28,73.68,'2026-10-09 13:00:41'),(36,9,'CS-601','Advanced Algorithms & Complexity','Prof. Ashok Sharma',36,28,77.78,'2026-10-09 13:05:06'),(37,9,'CS-602','Distributed Systems & Cloud Computing','Dr. Meenakshi Sundaram',36,35,97.22,'2026-10-09 13:00:41'),(38,9,'CS-603','Database Internals & Storage Engines','Prof. Ashok Sharma',40,34,85.00,'2026-10-09 14:41:11'),(39,9,'CS-604','Compiler Design & Formal Grammars','Dr. Vandana Saxena',36,27,75.00,'2026-10-09 13:00:41'),(40,9,'CS-605L','Advanced Computing Laboratory II','Er. Subrat Das',34,32,94.12,'2026-10-09 13:00:41'),(41,10,'CS-601','Advanced Algorithms & Complexity','Prof. Ashok Sharma',39,29,74.36,'2026-10-09 13:05:06'),(42,10,'CS-602','Distributed Systems & Cloud Computing','Dr. Meenakshi Sundaram',34,31,91.18,'2026-10-09 13:00:41'),(43,10,'CS-603','Database Internals & Storage Engines','Prof. Ashok Sharma',40,39,97.50,'2026-10-09 14:41:11'),(44,10,'CS-604','Compiler Design & Formal Grammars','Dr. Vandana Saxena',34,27,79.41,'2026-10-09 13:00:41'),(45,10,'CS-605L','Advanced Computing Laboratory II','Er. Subrat Das',38,28,73.68,'2026-10-09 13:00:41');
/*!40000 ALTER TABLE `attendance_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(60) NOT NULL,
  `entity_id` varchar(50) DEFAULT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payload`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_audit_created` (`created_at`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=256 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,8,'login_success','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9444','2026-10-08 03:40:56'),(2,8,'login_success','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9444','2026-10-08 03:41:35'),(3,9,'login_success','users','9','{\"username\":\"priya_cr\"}','127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9444','2026-10-08 03:41:44'),(4,8,'login_success','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 03:50:19'),(5,1,'demo_persona_switch','users','1','{\"username\":\"admin\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 03:59:14'),(6,10,'demo_persona_switch','users','10','{\"username\":\"aarav_club\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 13:35:42'),(7,1,'demo_persona_switch','users','1','{\"username\":\"admin\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 13:47:59'),(8,1,'demo_persona_switch','users','1','{\"username\":\"admin\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 13:48:40'),(9,10,'demo_persona_switch','users','10','{\"username\":\"aarav_club\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 13:50:19'),(10,8,'login_success','users','8','{\"username\":\"ashish\"}','::1','curl/8.21.0','2026-10-08 13:56:30'),(11,8,'login_success','users','8','{\"username\":\"ashish\"}','::1','curl/8.21.0','2026-10-08 13:57:31'),(12,8,'login_success','users','8','{\"username\":\"ashish\"}','::1','curl/8.21.0','2026-10-08 14:02:38'),(13,8,'login_success','users','8','{\"username\":\"ashish\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9444','2026-10-08 14:03:31'),(14,8,'submit_smart_form','smart_forms','1','{\"submission_id\":1,\"form_title\":\"Autumn 2026 Merit Scholarship & Tuition Assistance Application\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9444','2026-10-08 14:03:31'),(15,4,'login_success','users','4','{\"username\":\"prof_sharma\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9444','2026-10-08 14:03:42'),(16,4,'login_success','users','4','{\"username\":\"prof_sharma\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9444','2026-10-08 14:04:14'),(17,3,'demo_persona_switch','users','3','{\"username\":\"hod_cse\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 14:06:21'),(18,8,'login_success','users','8','{\"username\":\"ashish\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9444','2026-10-08 14:10:12'),(19,4,'login_success','users','4','{\"username\":\"prof_sharma\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9444','2026-10-08 14:10:12'),(20,3,'login_success','users','3','{\"username\":\"hod_cse\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9444','2026-10-08 14:10:12'),(21,5,'login_success','users','5','{\"username\":\"admin_staff\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9444','2026-10-08 14:10:12'),(22,6,'login_success','users','6','{\"username\":\"exam_admin\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9444','2026-10-08 14:10:13'),(23,7,'login_success','users','7','{\"username\":\"warden_singh\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9444','2026-10-08 14:10:13'),(24,1,'login_success','users','1','{\"username\":\"admin\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9444','2026-10-08 14:10:13'),(25,9,'login_success','users','9','{\"username\":\"priya_cr\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9444','2026-10-08 14:10:14'),(26,2,'demo_persona_switch','users','2','{\"username\":\"director\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 14:12:07'),(27,2,'login_success','users','2','{\"username\":\"director\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9444','2026-10-08 14:13:07'),(28,2,'create_smart_form','smart_forms','4','{\"title\":\"blood donation\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 14:20:53'),(29,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 14:22:15'),(30,2,'demo_persona_switch','users','2','{\"username\":\"director\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 14:33:22'),(31,9,'demo_persona_switch','users','9','{\"username\":\"priya_cr\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 14:33:39'),(32,9,'submit_smart_form','smart_forms','4','{\"submission_id\":2,\"form_title\":\"blood donation\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 14:34:11'),(33,2,'demo_persona_switch','users','2','{\"username\":\"director\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 14:43:17'),(34,7,'demo_persona_switch','users','7','{\"username\":\"warden_singh\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 14:53:45'),(35,10,'demo_persona_switch','users','10','{\"username\":\"aarav_club\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 14:54:24'),(36,5,'demo_persona_switch','users','5','{\"username\":\"admin_staff\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 14:54:41'),(37,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 14:55:24'),(38,8,'apply_service_request','service_requests','2','{\"request_number\":\"REQ-2026-1EED\",\"service_title\":\"Bonafide Student Certificate\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 15:02:09'),(39,7,'demo_persona_switch','users','7','{\"username\":\"warden_singh\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 15:02:21'),(40,7,'update_service_status','service_requests','2','{\"previous_status\":\"submitted\",\"new_status\":\"under_review\",\"certificate_no\":null}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 15:03:17'),(41,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 15:03:24'),(42,8,'apply_service_request','service_requests','3','{\"request_number\":\"REQ-2026-2A34\",\"service_title\":\"Bonafide Student Certificate\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 15:26:26'),(43,8,'submit_smart_form','smart_forms','2','{\"submission_id\":3,\"form_title\":\"MCA Section 1A Elective Course Preference & Lab Infrastructure Feedback\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 15:32:57'),(44,5,'demo_persona_switch','users','5','{\"username\":\"admin_staff\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 15:33:10'),(45,3,'demo_persona_switch','users','3','{\"username\":\"hod_cse\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 15:33:15'),(46,2,'demo_persona_switch','users','2','{\"username\":\"director\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 15:33:19'),(47,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 15:34:26'),(48,8,'apply_service_request','service_requests','4','{\"request_number\":\"REQ-2026-45B5\",\"service_title\":\"Bonafide Student Certificate\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 15:35:25'),(49,7,'demo_persona_switch','users','7','{\"username\":\"warden_singh\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 15:35:53'),(50,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 15:37:23'),(51,7,'demo_persona_switch','users','7','{\"username\":\"warden_singh\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 15:39:02'),(52,7,'update_service_status','service_requests','2','{\"previous_status\":\"under_review\",\"new_status\":\"ready_for_pickup\",\"certificate_no\":\"CUT\\/CERT\\/2026\\/6332\",\"pickup_date\":\"2026-10-10\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 15:39:44'),(53,1,'demo_persona_switch','users','1','{\"username\":\"admin\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 15:40:36'),(54,2,'demo_persona_switch','users','2','{\"username\":\"director\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 17:51:00'),(55,9,'demo_persona_switch','users','9','{\"username\":\"priya_cr\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 18:04:01'),(56,9,'create_smart_form','smart_forms','5','{\"title\":\"blood donation\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 18:06:06'),(57,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 18:06:27'),(58,8,'submit_smart_form','smart_forms','5','{\"submission_id\":4,\"form_title\":\"blood donation\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 18:07:18'),(59,9,'demo_persona_switch','users','9','{\"username\":\"priya_cr\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 18:07:42'),(60,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 18:09:36'),(61,9,'demo_persona_switch','users','9','{\"username\":\"priya_cr\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 18:09:43'),(62,9,'apply_service_request','service_requests','5','{\"request_number\":\"REQ-2026-9557\",\"service_title\":\"Bonafide Student Certificate\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 18:11:15'),(63,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 18:11:55'),(64,7,'demo_persona_switch','users','7','{\"username\":\"warden_singh\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 18:12:34'),(65,7,'update_service_status','service_requests','5','{\"previous_status\":\"submitted\",\"new_status\":\"action_required\",\"certificate_no\":null,\"pickup_date\":null}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 18:13:56'),(66,9,'demo_persona_switch','users','9','{\"username\":\"priya_cr\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 18:14:25'),(67,7,'demo_persona_switch','users','7','{\"username\":\"warden_singh\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 18:15:09'),(68,7,'update_service_status','service_requests','5','{\"previous_status\":\"under_review\",\"new_status\":\"ready_for_pickup\",\"certificate_no\":\"CUT\\/CERT\\/2026\\/6326\",\"pickup_date\":\"2026-10-12\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 18:16:01'),(69,7,'update_service_status','service_requests','2','{\"previous_status\":\"ready_for_pickup\",\"new_status\":\"delivered\",\"certificate_no\":\"CUT\\/CERT\\/2026\\/6332\",\"pickup_date\":\"2026-10-10\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 18:16:32'),(70,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-08 18:19:39'),(71,8,'grievance.created','grievance','6','{\"ticket_number\":\"CUT\\/GRV\\/2026\\/0006\",\"category\":\"Electrical & Power Infrastructure\",\"priority\":\"high\"}','::1','Unknown','2026-10-08 19:15:02'),(72,8,'grievance.created','grievance','7','{\"ticket_number\":\"CUT\\/GRV\\/2026\\/0007\",\"category\":\"Electrical & Power Infrastructure\",\"priority\":\"high\"}','::1','Unknown','2026-10-08 19:15:36'),(73,8,'grievance.created','grievance','8','{\"ticket_number\":\"CUT\\/GRV\\/2026\\/0008\",\"category\":\"Electrical & Power Infrastructure\",\"priority\":\"high\"}','::1','Unknown','2026-10-08 19:15:52'),(74,8,'grievance.created','grievance','9','{\"ticket_number\":\"CUT\\/GRV\\/2026\\/0009\",\"category\":\"Electrical & Power Infrastructure\",\"priority\":\"high\"}','::1','Unknown','2026-10-08 19:16:06'),(75,8,'grievance.created','grievance','10','{\"ticket_number\":\"CUT\\/GRV\\/2026\\/0010\",\"category\":\"Electrical & Power Infrastructure\",\"priority\":\"high\"}','::1','Unknown','2026-10-08 19:16:30'),(76,6,'exams.marks_entry','exam_marks','course-1','{\"session_id\":1,\"course\":\"MCA101\",\"students_updated\":1}','::1','Unknown','2026-10-08 19:23:33'),(77,6,'exams.publish_toggle','exam_session','1','{\"published\":true}','::1','Unknown','2026-10-08 19:23:33'),(78,6,'exams.marks_entry','exam_marks','course-1','{\"session_id\":1,\"course\":\"MCA101\",\"students_updated\":1}','::1','Unknown','2026-10-08 19:24:34'),(79,6,'exams.publish_toggle','exam_session','1','{\"published\":true}','::1','Unknown','2026-10-08 19:24:34'),(80,6,'exams.marks_entry','exam_marks','course-1','{\"session_id\":1,\"course\":\"MCA101\",\"students_updated\":1}','::1','Unknown','2026-10-08 19:28:46'),(81,6,'exams.publish_toggle','exam_session','1','{\"published\":true}','::1','Unknown','2026-10-08 19:28:46'),(82,6,'exams.marks_entry','exam_marks','course-1','{\"session_id\":1,\"course\":\"MCA101\",\"students_updated\":1}','::1','Unknown','2026-10-08 19:29:34'),(83,6,'exams.publish_toggle','exam_session','1','{\"published\":true}','::1','Unknown','2026-10-08 19:29:34'),(84,8,'login_success','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Linux; Android 16; Pixel 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Mobile Safari/537.36','2026-10-09 03:43:05'),(85,11,'demo_persona_switch','users','11','{\"username\":\"mess_manager\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 04:12:03'),(86,11,'demo_persona_switch','users','11','{\"username\":\"mess_manager\"}','::1','node','2026-10-09 04:34:16'),(87,11,'demo_persona_switch','users','11','{\"username\":\"mess_manager\"}','::1','node','2026-10-09 07:04:43'),(88,11,'MESS_MENU_UPDATE','mess_menu',NULL,'{\"description\":\"Mess menu updated for thursday lunch: Palak Soya Chunk Curry, Aloo Beans, Curd, Roasted Papad\"}','::1','node','2026-10-09 07:04:43'),(89,11,'demo_persona_switch','users','11','{\"username\":\"mess_manager\"}','::1','node','2026-10-09 07:06:22'),(90,11,'MESS_MENU_UPDATE','mess_menu',NULL,'{\"description\":\"Mess menu updated for thursday breakfast: Methi Puri, Aloo Tamatar Sabzi, Curd, Hot Tea \\/ Filter Coffee\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 07:51:47'),(91,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 07:57:31'),(92,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','::1','node','2026-10-09 08:03:56'),(93,8,'MESS_BULK_RSVP','mess_rsvps','1','{\"count\":8,\"status\":\"skipping\",\"rebates\":200}','::1','node','2026-10-09 08:03:56'),(94,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','::1','node','2026-10-09 08:04:03'),(95,8,'login_success','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 08:20:36'),(96,8,'login_success','users','8','{\"username\":\"ashish\"}','127.0.0.1','node','2026-10-09 08:33:40'),(97,8,'login_success','users','8','{\"username\":\"ashish\"}','127.0.0.1','node','2026-10-09 08:39:24'),(98,8,'login_success','users','8','{\"username\":\"ashish\"}','127.0.0.1','node','2026-10-09 08:39:36'),(99,8,'login_success','users','8','{\"username\":\"ashish\"}','127.0.0.1','node','2026-10-09 08:40:42'),(100,8,'MESS_BULK_RSVP','mess_rsvps','1','{\"count\":28,\"status\":\"attending\",\"rebates\":0}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 09:11:00'),(101,11,'demo_persona_switch','users','11','{\"username\":\"mess_manager\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 09:12:02'),(102,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 09:16:02'),(103,5,'demo_persona_switch','users','5','{\"username\":\"admin_staff\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 10:03:05'),(104,5,'notice.automation_settings_updated','system_settings','1','{\"interval_hours\":2,\"quiet_hours\":\"01:11:00 - 05:00:00\",\"is_enabled\":1}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 10:50:42'),(105,5,'notice.automated_cycle_executed','notice_automation','1','{\"run_at\":\"2026-10-09 12:50:50\",\"dispatched_count\":4,\"evaluated_students\":4,\"skipped_count\":0,\"bypassed_quiet_hours\":true,\"bypassed_interval\":false}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 10:50:50'),(106,5,'notice.automation_settings_updated','system_settings','1','{\"test\":true}','127.0.0.1','Unknown','2026-10-09 10:51:22'),(107,1,'notice.automation_settings_updated','system_settings','1','{\"test_numeric_str\":true}','127.0.0.1','Unknown','2026-10-09 10:51:22'),(108,NULL,'notice.automation_settings_updated','system_settings','1','{\"fallback_test\":true}','127.0.0.1','Unknown','2026-10-09 10:51:22'),(109,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 11:44:23'),(110,8,'HOSTEL_LEAVE_APPLY','hostel_leaves','3','{\"description\":\"Applied for hostel leave HL-2026-0003 (6 days to rourkela). Auto mess closure: 24 meals paused\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 12:43:36'),(111,8,'HOSTEL_LEAVE_APPLY','hostel_leaves','4','{\"description\":\"Applied for hostel leave HL-2026-0004 (5 days to rourkela). Auto mess closure: 20 meals paused\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 12:45:55'),(112,7,'demo_persona_switch','users','7','{\"username\":\"warden_singh\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 12:47:17'),(113,7,'HOSTEL_LEAVE_REVIEW','hostel_leaves','4','{\"description\":\"Hostel leave HL-2026-0004 approved by warden_singh\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 12:50:49'),(114,7,'HOSTEL_LEAVE_REVIEW','hostel_leaves','3','{\"description\":\"Hostel leave HL-2026-0003 approved by warden_singh\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 12:50:54'),(115,7,'HOSTEL_LEAVE_REVIEW','hostel_leaves','2','{\"description\":\"Hostel leave HL-2026-0042 approved by warden_singh\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 12:51:02'),(116,11,'demo_persona_switch','users','11','{\"username\":\"mess_manager\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 12:59:46'),(117,4,'demo_persona_switch','users','4','{\"username\":\"prof_sharma\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 13:00:03'),(118,4,'ATTENDANCE_SEALED','daily_attendance_sessions','2','{\"description\":\"Sealed roll call for CS-601 (Sem 6 Sec A) on 2026-10-09: 6 Present, 1 Absent, 1 Approved Leave\"}','::1','Unknown','2026-10-09 13:05:06'),(119,3,'FACULTY_ALLOCATION_UPDATED','timetable_slots','0','{\"description\":\"HOD allocated Prof. Ashok Sharma to subject CS-603 (Sem 6 Sec A)\"}','::1','Unknown','2026-10-09 13:05:22'),(120,8,'login_success','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 13:10:31'),(121,4,'demo_persona_switch','users','4','{\"username\":\"prof_sharma\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 13:34:42'),(122,5,'demo_persona_switch','users','5','{\"username\":\"admin_staff\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 13:43:41'),(123,6,'demo_persona_switch','users','6','{\"username\":\"exam_admin\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 13:47:44'),(124,1,'demo_persona_switch','users','1','{\"username\":\"admin\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 13:52:05'),(125,2,'demo_persona_switch','users','2','{\"username\":\"director\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 13:58:03'),(126,2,'demo_persona_switch','users','2','{\"username\":\"director\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 13:58:21'),(127,2,'notice.published','notice','14','{\"notice_number\":\"CUT\\/NOT\\/2026\\/468\",\"title\":\"study well\",\"target_scope\":\"all\",\"priority\":\"urgent\",\"requires_acknowledgment\":1}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:03:43'),(128,2,'notice.acknowledged','notice','14','{\"notice_number\":\"CUT\\/NOT\\/2026\\/468\",\"user_id\":2,\"ip_address\":\"127.0.0.1\",\"note\":\"Acknowledged and registered by student\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:04:00'),(129,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:05:00'),(130,8,'grievance.created','grievance','12','{\"ticket_number\":\"CUT\\/GRV\\/2026\\/0012\",\"category\":\"Hostel Mess & Dining Hygiene\",\"priority\":\"emergency\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:06:09'),(131,2,'demo_persona_switch','users','2','{\"username\":\"director\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:06:37'),(132,11,'demo_persona_switch','users','11','{\"username\":\"mess_manager\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:08:53'),(133,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:10:53'),(134,7,'demo_persona_switch','users','7','{\"username\":\"warden_singh\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:13:54'),(135,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:13:59'),(136,8,'apply_service_request','service_requests','6','{\"request_number\":\"REQ-2026-676A\",\"service_title\":\"Bonafide Student Certificate\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:17:31'),(137,5,'demo_persona_switch','users','5','{\"username\":\"admin_staff\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:18:44'),(138,5,'update_service_status','service_requests','6','{\"previous_status\":\"submitted\",\"new_status\":\"action_required\",\"certificate_no\":null,\"pickup_date\":null}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:19:43'),(139,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:19:49'),(140,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:20:25'),(141,5,'demo_persona_switch','users','5','{\"username\":\"admin_staff\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:20:33'),(142,5,'update_service_status','service_requests','6','{\"previous_status\":\"under_review\",\"new_status\":\"ready_for_pickup\",\"certificate_no\":\"CUT\\/CERT\\/2026\\/3589\",\"pickup_date\":\"2026-10-23\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:21:49'),(143,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:21:57'),(144,5,'demo_persona_switch','users','5','{\"username\":\"admin_staff\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:22:31'),(145,5,'update_service_status','service_requests','5','{\"previous_status\":\"ready_for_pickup\",\"new_status\":\"delivered\",\"certificate_no\":\"CUT\\/CERT\\/2026\\/6326\",\"pickup_date\":\"2026-10-12\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:23:13'),(146,7,'demo_persona_switch','users','7','{\"username\":\"warden_singh\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:23:30'),(147,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:23:40'),(148,8,'HOSTEL_LEAVE_APPLY','hostel_leaves','5','{\"description\":\"Applied for hostel leave HL-2026-0005 (13 days to rkl). Auto mess closure: 52 meals paused\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:24:58'),(149,7,'demo_persona_switch','users','7','{\"username\":\"warden_singh\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:25:15'),(150,7,'HOSTEL_LEAVE_REVIEW','hostel_leaves','5','{\"description\":\"Hostel leave HL-2026-0005 approved by warden_singh\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:26:16'),(151,11,'demo_persona_switch','users','11','{\"username\":\"mess_manager\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:26:25'),(152,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:27:54'),(153,8,'HOSTEL_LEAVE_APPLY','hostel_leaves','6','{\"description\":\"Applied for hostel leave HL-2026-0006 (3 days to hgcc). Auto mess closure: 12 meals paused\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:30:25'),(154,7,'demo_persona_switch','users','7','{\"username\":\"warden_singh\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:30:30'),(155,7,'HOSTEL_LEAVE_REVIEW','hostel_leaves','6','{\"description\":\"Hostel leave HL-2026-0006 approved by warden_singh\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:30:34'),(156,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:30:37'),(157,11,'demo_persona_switch','users','11','{\"username\":\"mess_manager\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:31:21'),(158,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:31:32'),(159,8,'GATEPASS_APPLY','gatepasses','5','{\"description\":\"Applied for night_outpass (GP-2026-0003) to rryyd\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:32:13'),(160,8,'GATEPASS_PUNCH','gatepasses','3','{\"description\":\"Security punch exit for pass GP-2026-0041\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:32:24'),(161,8,'GATEPASS_PUNCH','gatepasses','3','{\"description\":\"Security punch entry for pass GP-2026-0041\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:32:38'),(162,7,'demo_persona_switch','users','7','{\"username\":\"warden_singh\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:32:50'),(163,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:33:59'),(164,8,'student.duty_leave_applied','duty_leave','4','{\"leave_type\":\"sports\",\"title\":\"bput\",\"days\":3,\"dates\":\"2026-10-12 to 2026-10-14\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:35:52'),(165,3,'demo_persona_switch','users','3','{\"username\":\"hod_cse\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:36:10'),(166,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:36:51'),(167,8,'student.duty_leave_applied','duty_leave','5','{\"leave_type\":\"hackathon\",\"title\":\"wefcwd\",\"days\":4,\"dates\":\"2026-10-20 to 2026-10-23\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:37:08'),(168,3,'demo_persona_switch','users','3','{\"username\":\"hod_cse\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:37:14'),(169,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:37:28'),(170,4,'demo_persona_switch','users','4','{\"username\":\"prof_sharma\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:38:56'),(171,4,'ATTENDANCE_SEALED','daily_attendance_sessions','3','{\"description\":\"Sealed roll call for CS-603 (Sem 6 Sec A) on 2026-10-09: 5 Present, 2 Absent, 1 Approved Leave\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:41:11'),(172,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:44:56'),(173,6,'demo_persona_switch','users','6','{\"username\":\"exam_admin\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:46:17'),(174,6,'exams.schedule_created','exam_schedule','31','{\"session_id\":2,\"course_id\":1,\"date\":\"2026-10-08\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:46:39'),(175,6,'exams.marks_entry','exam_marks','course-1','{\"session_id\":2,\"course\":\"MCA101\",\"students_updated\":1}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:48:01'),(176,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:48:09'),(177,8,'notice.acknowledged','notice','14','{\"notice_number\":\"CUT\\/NOT\\/2026\\/468\",\"user_id\":8,\"ip_address\":\"127.0.0.1\",\"note\":\"Acknowledged and registered by student via Campus Hub\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:49:23'),(178,10,'demo_persona_switch','users','10','{\"username\":\"aarav_club\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:54:49'),(179,4,'demo_persona_switch','users','4','{\"username\":\"prof_sharma\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:55:34'),(180,4,'create_smart_form','smart_forms','6','{\"title\":\"blood donation\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:58:03'),(181,12,'demo_persona_switch','users','12','{\"username\":\"rohan_mohanty\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:58:10'),(182,12,'submit_smart_form','smart_forms','6','{\"submission_id\":5,\"form_title\":\"blood donation\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:58:51'),(183,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:59:00'),(184,8,'submit_smart_form','smart_forms','6','{\"submission_id\":6,\"form_title\":\"blood donation\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 14:59:15'),(185,4,'demo_persona_switch','users','4','{\"username\":\"prof_sharma\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 15:00:03'),(186,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 16:17:57'),(187,2,'demo_persona_switch','users','2','{\"username\":\"director\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 16:26:12'),(188,1,'demo_persona_switch','users','1','{\"username\":\"admin\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 16:27:39'),(189,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 16:31:49'),(190,8,'HOSTEL_LEAVE_APPLY','hostel_leaves','7','{\"description\":\"Applied for hostel leave HL-2026-0007 (5 days to rkl). Auto mess closure: 20 meals paused\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 16:32:28'),(191,7,'demo_persona_switch','users','7','{\"username\":\"warden_singh\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 16:32:32'),(192,7,'HOSTEL_LEAVE_REVIEW','hostel_leaves','7','{\"description\":\"Hostel leave HL-2026-0007 approved by warden_singh\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 16:32:49'),(193,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 16:32:58'),(194,1,'demo_persona_switch','users','1','{\"username\":\"admin\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 16:35:31'),(195,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 16:36:10'),(196,3,'demo_persona_switch','users','3','{\"username\":\"hod_cse\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 16:37:38'),(197,7,'demo_persona_switch','users','7','{\"username\":\"warden_singh\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 16:37:56'),(198,4,'demo_persona_switch','users','4','{\"username\":\"prof_sharma\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 16:44:46'),(199,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 16:45:31'),(200,4,'demo_persona_switch','users','4','{\"username\":\"prof_sharma\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 16:46:05'),(201,4,'notice.acknowledged','notice','14','{\"notice_number\":\"CUT\\/NOT\\/2026\\/468\",\"user_id\":4,\"ip_address\":\"127.0.0.1\",\"note\":\"Acknowledged and registered by student\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 16:48:37'),(202,11,'demo_persona_switch','users','11','{\"username\":\"mess_manager\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 16:53:44'),(203,11,'MESS_MENU_UPDATE','mess_menu',NULL,'{\"description\":\"Mess menu updated for thursday breakfast: Masala Dosa, Idli (2 Pcs), Medu Vada, Drumstick Sambar, Coconut Chutney\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 16:54:26'),(204,6,'demo_persona_switch','users','6','{\"username\":\"exam_admin\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 16:56:33'),(205,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 17:28:07'),(206,8,'HOSTEL_LEAVE_APPLY','hostel_leaves','8','{\"description\":\"Applied for hostel leave HL-2026-0008 (4 days to rkl). Auto mess closure: 16 meals paused\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 17:30:17'),(207,7,'demo_persona_switch','users','7','{\"username\":\"warden_singh\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 17:30:55'),(208,7,'HOSTEL_LEAVE_REVIEW','hostel_leaves','8','{\"description\":\"Hostel leave HL-2026-0008 approved by warden_singh\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 17:31:33'),(209,11,'demo_persona_switch','users','11','{\"username\":\"mess_manager\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 17:32:44'),(210,7,'demo_persona_switch','users','7','{\"username\":\"warden_singh\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 17:39:53'),(211,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 17:40:08'),(212,7,'demo_persona_switch','users','7','{\"username\":\"warden_singh\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 17:40:37'),(213,7,'HOSTEL_LEAVE_APPLY','hostel_leaves','9','{\"description\":\"Applied for hostel leave HL-2026-0009 (10 days to eye). Auto mess closure: 40 meals paused\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 17:41:14'),(214,7,'HOSTEL_LEAVE_REVIEW','hostel_leaves','9','{\"description\":\"Hostel leave HL-2026-0009 approved by warden_singh\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 17:44:18'),(215,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 17:47:42'),(216,3,'demo_persona_switch','users','3','{\"username\":\"hod_cse\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 17:52:40'),(217,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 17:52:52'),(218,9,'demo_persona_switch','users','9','{\"username\":\"priya_cr\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 17:52:55'),(219,9,'student.duty_leave_applied','duty_leave','6','{\"leave_type\":\"hackathon\",\"title\":\"fgaf\",\"days\":3,\"dates\":\"2026-10-12 to 2026-10-14\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 17:53:04'),(220,3,'demo_persona_switch','users','3','{\"username\":\"hod_cse\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 17:53:12'),(221,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 17:53:39'),(222,2,'demo_persona_switch','users','2','{\"username\":\"director\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 18:18:20'),(223,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 18:25:28'),(224,1,'demo_persona_switch','users','1','{\"username\":\"admin\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 18:52:10'),(225,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 18:56:23'),(226,6,'demo_persona_switch','users','6','{\"username\":\"exam_admin\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 19:08:44'),(227,1,'demo_persona_switch','users','1','{\"username\":\"admin\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 19:18:02'),(228,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 19:28:04'),(229,8,'HOSTEL_LEAVE_APPLY','hostel_leaves','10','{\"description\":\"Applied for hostel leave HL-2026-0010 (3 days to rkl). Auto mess closure: 12 meals paused\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 19:53:43'),(230,7,'demo_persona_switch','users','7','{\"username\":\"warden_singh\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 19:53:51'),(231,7,'HOSTEL_LEAVE_REVIEW','hostel_leaves','10','{\"description\":\"Hostel leave HL-2026-0010 approved by warden_singh\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 19:54:01'),(232,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 19:54:08'),(233,8,'HOSTEL_LEAVE_APPLY','hostel_leaves','11','{\"description\":\"Applied for hostel leave HL-2026-0011 (5 days to test). Auto mess closure: 20 meals paused\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 19:56:17'),(234,7,'demo_persona_switch','users','7','{\"username\":\"warden_singh\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 19:56:26'),(235,7,'HOSTEL_LEAVE_REVIEW','hostel_leaves','11','{\"description\":\"Hostel leave HL-2026-0011 approved by warden_singh\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 19:56:36'),(236,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 19:56:47'),(237,8,'student.duty_leave_applied','duty_leave','7','{\"leave_type\":\"hackathon\",\"title\":\"hack\",\"days\":3,\"dates\":\"2026-10-12 to 2026-10-14\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 19:57:43'),(238,4,'demo_persona_switch','users','4','{\"username\":\"prof_sharma\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 19:58:05'),(239,4,'ATTENDANCE_SEALED','daily_attendance_sessions','2','{\"description\":\"Sealed roll call for CS-601 (Sem 6 Sec A) on 2026-10-09: 4 Present, 3 Absent, 1 Approved Leave\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 19:58:35'),(240,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 19:58:49'),(241,4,'demo_persona_switch','users','4','{\"username\":\"prof_sharma\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 19:59:18'),(242,4,'create_smart_form','smart_forms','7','{\"title\":\"test\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 20:00:01'),(243,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 20:00:21'),(244,8,'submit_smart_form','smart_forms','7','{\"submission_id\":7,\"form_title\":\"test\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 20:00:37'),(245,8,'apply_service_request','service_requests','7','{\"request_number\":\"REQ-2026-7E77\",\"service_title\":\"Bonafide Student Certificate\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 20:01:20'),(246,5,'demo_persona_switch','users','5','{\"username\":\"admin_staff\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 20:01:30'),(247,5,'update_service_status','service_requests','7','{\"previous_status\":\"submitted\",\"new_status\":\"ready_for_pickup\",\"certificate_no\":\"CUT\\/CERT\\/2026\\/9305\",\"pickup_date\":\"2026-10-11\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 20:02:02'),(248,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 20:02:10'),(249,2,'demo_persona_switch','users','2','{\"username\":\"director\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 20:03:02'),(250,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 20:03:42'),(251,8,'grievance.created','grievance','13','{\"ticket_number\":\"CUT\\/GRV\\/2026\\/0013\",\"category\":\"Campus Housekeeping & Sanitation\",\"priority\":\"high\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 20:04:06'),(252,11,'demo_persona_switch','users','11','{\"username\":\"mess_manager\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 20:04:34'),(253,8,'demo_persona_switch','users','8','{\"username\":\"ashish\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 20:04:49'),(254,6,'demo_persona_switch','users','6','{\"username\":\"exam_admin\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 20:05:16'),(255,1,'demo_persona_switch','users','1','{\"username\":\"admin\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-09 20:07:05');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_tokens`
--

DROP TABLE IF EXISTS `auth_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `token` varchar(128) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `user_id` (`user_id`),
  KEY `idx_token_lookup` (`token`,`expires_at`),
  CONSTRAINT `auth_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=219 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_tokens`
--

LOCK TABLES `auth_tokens` WRITE;
/*!40000 ALTER TABLE `auth_tokens` DISABLE KEYS */;
INSERT INTO `auth_tokens` VALUES (1,8,'bf165203e510e0b3c3f09ac932bf24f856bc5fa12b9746cf3f289dc9701a9f58','2026-11-07 04:40:56','2026-10-08 03:40:56'),(2,8,'1bd05b6469c61ea502e26c9c0994c17288d11a1f4f58b5ffbeba33ca12336af0','2026-11-07 04:41:35','2026-10-08 03:41:35'),(3,9,'a3d634ff578af72689954f136e4bc6405d57bbbc4e2097150da6cecad015201f','2026-11-07 04:41:44','2026-10-08 03:41:44'),(4,8,'92c3eefe966b1920466f1334f0a38256794c6e170fad99f541181a5ec93a8968','2026-11-07 04:50:19','2026-10-08 03:50:19'),(5,1,'7c0a8013c87270f964d3be53d00e72abe349cf5d4b6fd192d9980d20579ad9d9','2026-11-07 04:59:14','2026-10-08 03:59:14'),(6,10,'0a4addc8147bf0c09e7a19a9440e3787918149b5849208ac4106a9a77cb51809','2026-11-07 14:35:42','2026-10-08 13:35:42'),(7,1,'7e589f62bda839fa24fbee08a7e28826e8d243b5dfcba1a27a680a36e4dbbe40','2026-11-07 14:47:59','2026-10-08 13:47:59'),(8,1,'08af64ffe4b8574897b68a4af12807f15cb10c0137117386f247e0d7cf7bce5d','2026-11-07 14:48:40','2026-10-08 13:48:40'),(9,10,'4e68f133b955095cea0c148402394533233ab0f9d8fb933c6b0860e040f8bae2','2026-11-07 14:50:19','2026-10-08 13:50:19'),(10,8,'da1d02bb64d59ef70f07a640d18ddcb6757b97646c01f2ea9afea5290f8ec5dd','2026-11-07 14:56:30','2026-10-08 13:56:30'),(11,8,'f8e3a1b76e0fb2b52cc22d95cccdd100de92dcdcacae65abd8170e1b9ba2d2ad','2026-11-07 14:57:31','2026-10-08 13:57:31'),(12,8,'b3096266d1b73768c2ff80b783e035a1bd201f300d302969cc98ac8632198453','2026-11-07 15:02:38','2026-10-08 14:02:38'),(13,8,'825b6db1a6daf8edd370473a0a739d9743bbdd47f70b7a8d044612557b14c11d','2026-11-07 15:03:31','2026-10-08 14:03:31'),(17,8,'bd1af41ad48cc561511e2bd0ba11350f29499703935602b8318337918454f3dc','2026-11-07 15:10:12','2026-10-08 14:10:12'),(20,5,'ee3566cda6737610fb826665deff2467280608f7c19f4db7db942266823f5f2e','2026-11-07 15:10:12','2026-10-08 14:10:12'),(21,6,'6fdd966093f2078ee8b646b520dd3faf517339045d8c96611b846dfd877120e2','2026-11-07 15:10:13','2026-10-08 14:10:13'),(22,7,'3c768f1bf69bafcddc4753c972969ece65ea572e5978909be7e1f9d7b8aa0929','2026-11-07 15:10:13','2026-10-08 14:10:13'),(23,1,'c09a1d61ddb9cadfce4e894f0aa317326e1f91e4ded732d62d7b8a07058cd9ac','2026-11-07 15:10:13','2026-10-08 14:10:13'),(24,9,'3720ecce10e32e0c99d6d200ca6b99d1efb180709b77773842b0eb1ff4267474','2026-11-07 15:10:13','2026-10-08 14:10:13'),(25,2,'b84a4aaeee99ae97a82baa06a95250336f0e587e77057ae1384a12c6c813729e','2026-11-07 15:12:07','2026-10-08 14:12:07'),(26,2,'75d0bc1321fbb2535dd32e136dd7ef187f09c1ef9290aaeddec46d25946e0dee','2026-11-07 15:13:07','2026-10-08 14:13:07'),(27,8,'79360fa9b49bd8d0503ecb59951798affbeae2a2b7db4b5ff8afbcef81939a2c','2026-11-07 15:22:15','2026-10-08 14:22:15'),(28,2,'56f834d1f3ce8c6de611aae9e4a82255cb10e512e719270ad27714b136735370','2026-11-07 15:33:22','2026-10-08 14:33:22'),(29,9,'ef42e5028fc78437a61963bd63fd80a3fe79dff4fd24f2a0069f14c10570c7be','2026-11-07 15:33:39','2026-10-08 14:33:39'),(30,2,'80bbcf6b04fab3804452f2a5d2d942447e66438648d72c27ee4228faf9710df6','2026-11-07 15:43:17','2026-10-08 14:43:17'),(31,7,'b0504a527ffe0ae6fb4774c15b5e599e08fbe703c8243471e8d5009a5029153c','2026-11-07 15:53:45','2026-10-08 14:53:45'),(32,10,'92642d946612563aa7245092db6ac09aa9f2bf65fa197d6a3de5d5fe0a54f560','2026-11-07 15:54:24','2026-10-08 14:54:24'),(33,5,'cb62060b7b571c385297a81e52dffecef0ca245c3baa38ac7f6466a8cfeb155b','2026-11-07 15:54:41','2026-10-08 14:54:41'),(34,8,'4ffd7340d02c0f413f4aca20bab2be54f40c0a93a56484f55f1ed37a3c80d085','2026-11-07 15:55:24','2026-10-08 14:55:24'),(35,7,'f23f5e028fa2babc62ae6a163179ccb6ce01c1c69674dec8bcb956664d038376','2026-11-07 16:02:21','2026-10-08 15:02:21'),(36,8,'d7ca1b015bd0e64c9c880f2f23dc27298dec8e5e75a0fc3833b9a3a43ef35f5c','2026-11-07 16:03:24','2026-10-08 15:03:24'),(37,5,'6305342712cf049a0d48cb08d88841afacd4d4c3a43b4d30b046a57c5739a05d','2026-11-07 16:33:10','2026-10-08 15:33:10'),(39,2,'5e07aeb8f28a89da0160aeee7821ad94212aceffad96b85a94aa7fbc2acd90de','2026-11-07 16:33:19','2026-10-08 15:33:19'),(40,8,'cb12644e60def1cf7b4f006c5795c0602e6421f98a79e2060408847d282f913c','2026-11-07 16:34:26','2026-10-08 15:34:26'),(41,7,'1a7d0f08b6179fbc2950298db4f853ecebdcf11d7e7fea66f558045f3a809020','2026-11-07 16:35:53','2026-10-08 15:35:53'),(42,8,'3461630bd4325536d44726cf9c7d3dd2af14764d967992aabba9e2af571389d6','2026-11-07 16:37:23','2026-10-08 15:37:23'),(43,7,'603f089ce1fcbece1f6d0e560c1007d82ce1053418b80443d4ae81189bfb1126','2026-11-07 16:39:02','2026-10-08 15:39:02'),(44,1,'6755a73a2d80bb105b5db7d11e1e7a094e1f8eda9324a113c10b4e01133f8b45','2026-11-07 16:40:36','2026-10-08 15:40:36'),(45,8,'618b0174168cfd038c818d477bdb2f4636055aeda5e6c87ef77bfcd201ba8f89','2026-11-07 17:33:43','2026-10-08 16:33:43'),(46,2,'de62115405acac01818d004b6aa76630a82b38076d0226de3255a79817e6e554','2026-11-07 17:34:00','2026-10-08 16:34:00'),(47,2,'0e7212e2648b033f0f520ff150c337cd06f866fc18721649eb114e7b26d8bef8','2026-11-07 18:51:00','2026-10-08 17:51:00'),(48,9,'340073301894ad459a7371109971b92c70e547a446df338441715f81603aa686','2026-11-07 19:04:01','2026-10-08 18:04:01'),(49,8,'435e336fada95aadc575326389c33e1d9a8845a9908c2d479e2443d47bbf9dbe','2026-11-07 19:06:27','2026-10-08 18:06:27'),(50,9,'7a84ca71025d160a96e3c1e35cbc0c27daa1ac0245ea09d237f5f475e6de845c','2026-11-07 19:07:42','2026-10-08 18:07:42'),(51,8,'4b8b64ad3b13de483a8a94890810de856d85bf1dc1f9753ea7fb95d9bafc7c16','2026-11-07 19:09:36','2026-10-08 18:09:36'),(52,9,'21026b507995792ee041f1853c8311bd26c59bc5c68bf899d0d85b775cb0f57b','2026-11-07 19:09:43','2026-10-08 18:09:43'),(53,8,'379a9b3d38dc50fa2777f87df606479fe3a964e6f8ed1a72736a63aad14c0afd','2026-11-07 19:11:55','2026-10-08 18:11:55'),(54,7,'9ea239f6363a72ff50c59f3d4b0cc4b5105f540287b56188be360aa27e11a0c4','2026-11-07 19:12:34','2026-10-08 18:12:34'),(55,9,'c746dacd872b240380dc81e9178bcbe8d2004fdd9c342623daf4d76410ffd86e','2026-11-07 19:14:25','2026-10-08 18:14:25'),(56,7,'88b2bca531b0ddc9999c4942e9e50312d851ed46760c75d7e99257697bd16a42','2026-11-07 19:15:09','2026-10-08 18:15:09'),(57,8,'86beed9766ada7a40cbb12c65535a4179f9eccefbcba750e69bb60757a64b77f','2026-11-07 19:19:39','2026-10-08 18:19:39'),(58,8,'e7d48aa0261a9f73eba43d10755ce9be99264b4ece8f62c904885ccfdc8cb455','2026-11-07 20:13:18','2026-10-08 19:13:18'),(59,7,'cd07100fb96e2e20b009209153d3fad7d83edd394ff69ab4f6db29bc173db343','2026-11-07 20:13:18','2026-10-08 19:13:18'),(60,8,'333d04f9e782d337752de76fd4b6909e341184415d7c1610a295a44ec75b674b','2026-11-07 20:15:02','2026-10-08 19:15:02'),(61,7,'9d2e0072791c45b6f01fd9cb99dc3f0f074aa587928a4129db48046eee47ef55','2026-11-07 20:15:02','2026-10-08 19:15:02'),(62,8,'ceae15fe71e250b671d35f87615c2f8a2752ab2819839e5fc531c24d9a11ff9e','2026-11-07 20:15:36','2026-10-08 19:15:36'),(63,7,'cb76579c9bb29a6c0f2acd0aaf72cd8b2ee62d8c60686a6044ac3a2e4cc6eb0b','2026-11-07 20:15:36','2026-10-08 19:15:36'),(64,8,'fd0da7f086e2fb969fd07c09061778eba1582bfcc1f0ead5118fba0cee139b07','2026-11-07 20:15:52','2026-10-08 19:15:52'),(65,7,'045d27df41ae822cfe84f0c5e9dcf125c8b46ac905e7706bdeaf97d15045dd01','2026-11-07 20:15:52','2026-10-08 19:15:52'),(66,8,'0abaced4e8a2ea3081569dcc539b515ed8bb2659639d198a83e2b8b57a67e50d','2026-11-07 20:16:06','2026-10-08 19:16:06'),(67,7,'d7863c6fefa1faa7d3e45b001637fd2d4b67e45a05cd47f460c3c2ee57ac70c2','2026-11-07 20:16:06','2026-10-08 19:16:06'),(68,8,'f495148ee2753d70f86cb3329bffb5d752f8ec686017f3c830da2371a5ff257d','2026-11-07 20:16:29','2026-10-08 19:16:29'),(69,7,'d952f8c05621185f2ec9104556312fb8fbfd36d61db8d14186080b1ceb3b9c8a','2026-11-07 20:16:29','2026-10-08 19:16:29'),(70,8,'c58b2f16892ff59cd80d156d2a141ec6f5700bf6b57ee12f7d45c348def9495b','2026-11-07 20:23:33','2026-10-08 19:23:33'),(71,6,'54bb5a05cedee16e499679202a679ddb6d6a539eb554e7c33a35f2cdc4629120','2026-11-07 20:23:33','2026-10-08 19:23:33'),(72,8,'f400f73423c61d22af2a122c5d93f834a93a8561ddd1f0a86ecfdc5ed8ae354b','2026-11-07 20:24:34','2026-10-08 19:24:34'),(73,6,'a3eff0a3a76c7783c6956bcabf425756e0f40115f97969b49b04a39ab95f95f3','2026-11-07 20:24:34','2026-10-08 19:24:34'),(74,8,'9ce1df3c3de2ee6c7a8fa149084874ccaceb8dc04e6652f25f3de98dcdf0952c','2026-11-07 20:28:46','2026-10-08 19:28:46'),(75,6,'3f48992dd73b1063c7da432cd162019cb32ee37ed3befb73794e12174cced12c','2026-11-07 20:28:46','2026-10-08 19:28:46'),(76,8,'f2b17d7bd47b095ad54f8dd09b99700c8461331b0aff13e8aea3e1b7582e103f','2026-11-07 20:29:34','2026-10-08 19:29:34'),(77,6,'87a6ae11b9b35b2934ba9a092e14d6d9b52e275a20bcaf9d7471052c384e3931','2026-11-07 20:29:34','2026-10-08 19:29:34'),(78,8,'d2de9c8272bd3a0f183f550b4a25048483dc5e085a7d449c32f4b7332070aae2','2026-11-08 04:43:05','2026-10-09 03:43:05'),(79,11,'0d3577680127a49634ec31fe210825f34ac475a695c8f9147a2cdea46f51ee84','2026-11-08 05:12:03','2026-10-09 04:12:03'),(80,11,'5f40a0174134c540dc9895769cf42a8c68dd8b801943e34002ce77a8bd519dc2','2026-11-08 05:34:16','2026-10-09 04:34:16'),(81,11,'1d7d0376bb4d022ec7832243d83bf215ea3e4e921237ae7aa510e8c31edcb0db','2026-11-08 08:04:43','2026-10-09 07:04:43'),(82,11,'1264ee37f3c3e978e13bebfccb996acea77836a4ae3241772d23204a7789db4d','2026-11-08 08:06:22','2026-10-09 07:06:22'),(83,8,'d97058282b438d271c6c24058c174ad1fd5684615bd1bccc1fbd9de3609264c9','2026-11-08 08:57:31','2026-10-09 07:57:31'),(84,8,'e941839401873300012db5dad91f7a857069fa96ed97a8af31676c1f40700601','2026-11-08 09:03:56','2026-10-09 08:03:56'),(85,8,'39504a5afaa7e5d0554bbc64a9bc1e9d7bb7d6b133416e73e50842ca1d23c325','2026-11-08 09:04:03','2026-10-09 08:04:03'),(86,8,'70e190a12b91cc56ec35e104700399555fb79544d9941a61721f0996f7845b1b','2026-11-08 09:20:36','2026-10-09 08:20:36'),(87,8,'971680c3c04526c2eceaf09299f7f029d623b87de8661716e76a87493b52ce08','2026-11-08 09:33:40','2026-10-09 08:33:40'),(88,8,'ac4f69f63a3aa4577fb2db016c04785fae8a0b39d8fee9ebe6173b853f9cce7e','2026-11-08 09:39:24','2026-10-09 08:39:24'),(89,8,'04dd4239dbc267592b59e3ed8f59b8eefd84d3d2323ab2f8628752bce1cb1fc5','2026-11-08 09:39:36','2026-10-09 08:39:36'),(90,8,'05cc29d969ebe4c29d39af76cde975d5ca3a4637e6cf08344bc7332971a641eb','2026-11-08 09:40:42','2026-10-09 08:40:42'),(91,11,'d8d833d13c6ba5a17bc5914b9d8b7576879e8bdfff31e1a2000d823b13b200bd','2026-11-08 10:12:02','2026-10-09 09:12:02'),(92,8,'3810f750e21f5b69d2bb69351e0b715c4a868d1db24e9166f83c7833183d7d68','2026-11-08 10:16:02','2026-10-09 09:16:02'),(93,7,'006eb99473b7ae50f3ccdaebaecca6eac69644651ff524b4624022f13e6a07dd','2026-11-08 10:23:35','2026-10-09 09:23:35'),(94,11,'9802fad1b9a2b0410daab35dc5d2708e826bdf23cb9ff5eed7853dba92f4df2a','2026-11-08 10:23:48','2026-10-09 09:23:48'),(95,8,'faa01bba3c92f270df668d1a185f57f7f1e58ae938ef5f1671b4327dcbfb26e1','2026-11-08 10:27:01','2026-10-09 09:27:01'),(96,7,'224b823a563bbaee672e48e0bc0939f6126ba5a137eb53e3fed2a7fa4b13685d','2026-11-08 10:27:01','2026-10-09 09:27:01'),(97,11,'ae91617c778827e0b1cb5459a5b2382637b5a41927a15ce4eb0c999efdebdae0','2026-11-08 10:27:01','2026-10-09 09:27:01'),(98,8,'3e00aef9fcc5a27cdfd6244b597454182a5be736254736d13ef36cfae19dd1f8','2026-11-08 10:27:47','2026-10-09 09:27:47'),(99,7,'3d977a1ea0e1f09f4ee2ce7df8a36ea1fe1f8348b49b1e22bdc63c67903997c5','2026-11-08 10:27:47','2026-10-09 09:27:47'),(100,11,'a3f4dc6292f60e428497da8f0ed5eb7ee59ec4df4d9c48b19808d7f0d288ccaf','2026-11-08 10:27:47','2026-10-09 09:27:47'),(101,5,'9f85de782e42707aa65284897b90d3f9a9bf979493cf514ba6403db27347d3c2','2026-11-08 11:03:05','2026-10-09 10:03:05'),(102,8,'dcdc1f29af12c00143633db83b7aee6bb530b392e09cbf4b6545c623eff6e600','2026-11-08 12:40:08','2026-10-09 11:40:08'),(103,8,'1a61d23b40466188ef8874d9208fa6f4ba342c3573f1661f8bb6fcafb89b7811','2026-11-08 12:40:24','2026-10-09 11:40:24'),(104,8,'ffc1b3f7eed640572cc074067853128df0e492b85afc7ac947687c2777683302','2026-11-08 12:44:23','2026-10-09 11:44:23'),(105,8,'da28b3a073ac02cb6eaf98c3ce3a83bf6bf892252522921449270185fbf4bfe1','2026-11-08 13:33:57','2026-10-09 12:33:57'),(106,8,'be8c18daad26af054b060b2346aa0271d16d15ad8072ac0338fb88b14f46e6f2','2026-11-08 13:34:42','2026-10-09 12:34:42'),(107,8,'d5c2b48dd68c68ebadb035399170ad91a5f2c5634e5be47d04f4003d5df999ec','2026-11-08 13:35:24','2026-10-09 12:35:24'),(108,7,'d1c9463e59abfcceb4cbbefc059c0494dcb2d7af8c6c95ace7a4762cdf7219ce','2026-11-08 13:47:17','2026-10-09 12:47:17'),(109,11,'d5c352c226eb64d20f043d3e63329a6f34787a19e8f5285db45fb95b307d5775','2026-11-08 13:59:46','2026-10-09 12:59:46'),(114,4,'a89712c2b60842220b909bb3c2fb4c273aa9b56f593b1bbbe2b31bb06cc59148','2026-10-10 18:35:06','2026-10-09 13:05:06'),(115,3,'aa9a46528a9111644390d89b246abfa458aad56ae23d05b1f6212e26a136b5e5','2026-10-10 18:35:22','2026-10-09 13:05:22'),(116,8,'e7f4e95dbc124d1c1b048f167c41857477aad000e749770a2ce993e537986812','2026-11-08 14:10:31','2026-10-09 13:10:31'),(117,4,'8866519d65c96f3394c6bdc06eeca4bf1935991732cfe46bf70b775e7b36eca7','2026-11-08 14:34:42','2026-10-09 13:34:42'),(118,5,'c806db8aba3175e6205a1e2b27dce62d24ee4b5f886a810ad54a088ae85e638e','2026-11-08 14:43:41','2026-10-09 13:43:41'),(119,6,'1011b004b8bb6f15e1e8b5b2f6921be0e352787a290f7939ef1b41c967d5ca2d','2026-11-08 14:47:44','2026-10-09 13:47:44'),(120,1,'27c328ef634dc4955b74126da3c18b48addd5a505026d3b5f049515b0a6b365a','2026-11-08 14:52:05','2026-10-09 13:52:05'),(121,2,'a65fd3e274167fea3e67f742eb5b2fc691da76bf83ac3973f84f09aaf92d6abc','2026-11-08 14:58:03','2026-10-09 13:58:03'),(122,2,'7961d1920bdf0156d010405980f6d2edd919632e25d242529bc4f2ce7292ebe2','2026-11-08 14:58:21','2026-10-09 13:58:21'),(123,8,'10438213341dae544a19e3b736aeeca13ac8ab066d42add43994f3344f344e77','2026-11-08 15:05:00','2026-10-09 14:05:00'),(124,2,'e222641d41ed79fd822c33fdd57c11a1409ef0d3914fe99f637c365da62bbb11','2026-11-08 15:06:37','2026-10-09 14:06:37'),(125,11,'e0b64083fa8f5b5bc890093d7b1f41492dca73f53565b87557173036dedeaea2','2026-11-08 15:08:53','2026-10-09 14:08:53'),(126,8,'367f24b870d8fc6cb0eda067940f186df6f3ccaa2ac69446d2c3de78e8396361','2026-11-08 15:10:53','2026-10-09 14:10:53'),(127,7,'8b1817f5e60650d580d338b330ac5605b0309bd55ce0f41fc78c0c2e404bdb9b','2026-11-08 15:13:54','2026-10-09 14:13:54'),(128,8,'020f83c5d9366ab6d818a347b6848819e7f31d1f7716c3e5c6a1f3db93563d8f','2026-11-08 15:13:59','2026-10-09 14:13:59'),(129,5,'439767bd708d52c8fd4e4ebcb88e7e238debd5221ee785a5b9543be7080f11ea','2026-11-08 15:18:44','2026-10-09 14:18:44'),(130,8,'6bb656ca682283aecb79ff957cb72026ad880f6caa890bd357dab06403c23d72','2026-11-08 15:19:49','2026-10-09 14:19:49'),(131,8,'79a7277367502d9bc6f9dbc419e7a7d924b365e359068aab57e8d9ad5e0f234f','2026-11-08 15:20:25','2026-10-09 14:20:25'),(132,5,'5f588239ed5e9fdb709f0f0c11986445c7c05774c0bb83ba596ecbca4f3c2826','2026-11-08 15:20:33','2026-10-09 14:20:33'),(133,8,'29f513f52ff161fd89edeae86612d594f4956aab6e6c1e273dde53b4e8610b29','2026-11-08 15:21:57','2026-10-09 14:21:57'),(134,5,'8869b8b194f592e9693e0686dcd0dd12b645e8b92f022a60b3cecdbbb1f86a31','2026-11-08 15:22:31','2026-10-09 14:22:31'),(135,7,'e49623738da3de7700251a8f240ed62bcb8a352326fa68c5ddb2bfd029b65065','2026-11-08 15:23:30','2026-10-09 14:23:30'),(136,8,'7095c3008e1e9e4af02e85e9e6cf87a15bc607736a59141ff77832c01c54b4eb','2026-11-08 15:23:40','2026-10-09 14:23:40'),(137,7,'cf7a3ae87a566554b9cabfc5fcad12e7d20466b57812b5c3518624146fb01871','2026-11-08 15:25:15','2026-10-09 14:25:15'),(138,11,'7c7f5292716429626861c8242a66071a7ce7aead51f261125928bc69e62b6bc2','2026-11-08 15:26:25','2026-10-09 14:26:25'),(139,8,'0bb65ee07838f095dc6828cc30cc006249a820451dd116ba767cf1507d8eb857','2026-11-08 15:27:54','2026-10-09 14:27:54'),(140,7,'4ab2ca1445d8d1e1cb21761e7c15aa25db3e49193b63ea9255bbb9a5d7496ac4','2026-11-08 15:30:30','2026-10-09 14:30:30'),(141,8,'14c17a80f200dbf0126160caf79317488b4ddf3b77111388124527ec577795ed','2026-11-08 15:30:37','2026-10-09 14:30:37'),(142,11,'074afebfc934ae61eaa39b774c2886354e03fb8264b7aac79cc0f32bf8c8ad4c','2026-11-08 15:31:21','2026-10-09 14:31:21'),(143,8,'0425eb9d230dcea51734d39634d5677faeb6a78763c680e64eb06a83be350e88','2026-11-08 15:31:32','2026-10-09 14:31:32'),(144,7,'ea04b82d12ad1d141bca8c4a02a0e7960e7801e9e3bba00ccf97a1cc7a7298b1','2026-11-08 15:32:50','2026-10-09 14:32:50'),(145,8,'b6c25c4218c235d58616e5fa74032c318a7066c049a12e9cbc3e93decbf163fd','2026-11-08 15:33:59','2026-10-09 14:33:59'),(146,3,'7ffc6cea5558672d41503db038baa544888b5a641ca4900a210667737efe7c29','2026-11-08 15:36:10','2026-10-09 14:36:10'),(147,8,'90f372c4c1f1c1a0ee62782a8da8e5ec3f57eb467efea195a71412c773859147','2026-11-08 15:36:51','2026-10-09 14:36:51'),(148,3,'b74e7be9f513bccd01862fca4a1951b89f900cb13169a1c7d950f84a093f2ab0','2026-11-08 15:37:14','2026-10-09 14:37:14'),(149,8,'f12b6746bcdc28f1058d32da373d0d7efe4201274958fdef78cbafdac3b30e5b','2026-11-08 15:37:28','2026-10-09 14:37:28'),(150,4,'b14410a932bd65d6c9af8930b36d2941d89042fcb3f5ebb6473782c9ebf14252','2026-11-08 15:38:56','2026-10-09 14:38:56'),(151,8,'86f2b3a38fc6291365738a9e59919038bdc145c585b77743647e5f4a84cffbb3','2026-11-08 15:44:56','2026-10-09 14:44:56'),(152,6,'4061035ada678fa11ed9339590cb043a5da0e339fb608d9b1c24b15c17b2bdc4','2026-11-08 15:46:17','2026-10-09 14:46:17'),(153,8,'56fcc12e21c35dd3e2681a44423ee886da498ca20c7be502ee97321ed672bff1','2026-11-08 15:48:09','2026-10-09 14:48:09'),(154,10,'527d939a8701464e92368ebaf4e9b71ac56468fcba9c792ac64dff5b9cbe7459','2026-11-08 15:54:49','2026-10-09 14:54:49'),(155,4,'16e0b192057c082823af97d8ab03c1401ec819e46ab873da9cfc75ac6b0b38f5','2026-11-08 15:55:34','2026-10-09 14:55:34'),(156,12,'99ae4cef9c85c88fb0e67ab7dcae5f9433375b2c94c4c7400a88ddb8ac748b57','2026-11-08 15:58:10','2026-10-09 14:58:10'),(157,8,'b1705c9a4605ec241ce32e5961316ecd2579625df9a512811ee850ca52929895','2026-11-08 15:59:00','2026-10-09 14:59:00'),(158,4,'79366c21a3f250a7bc9e0a53a229a05babdfc190e93fc4c53ed384d822df6055','2026-11-08 16:00:03','2026-10-09 15:00:03'),(159,2,'614f3b283d0d1ae7187a060eb14d47223bfb81197614c500b8adbf6d2511a2ba','2026-11-08 17:08:50','2026-10-09 16:08:50'),(160,8,'556c37066b355afd4d1a3d6180c01ff263487f03364b77e50900fdd0f9982089','2026-11-08 17:08:50','2026-10-09 16:08:50'),(161,11,'132f04dffb7c3fcf356806e430ef98dbc0682f16bdd209a872fd00eea2723c45','2026-11-08 17:08:50','2026-10-09 16:08:50'),(162,8,'ed370688f2059f3d84f4529a0813636aa3712b6619154e088efafc073f536ecb','2026-11-08 17:08:50','2026-10-09 16:08:50'),(163,11,'ee59959b8896a0de7fc6a77391234516892399e17f18c94ea18cd21af412310e','2026-11-08 17:08:50','2026-10-09 16:08:50'),(164,8,'d9b353778c6660a6b7ec33e02ac4d979b797e813c77b533c07c20aed948e6db3','2026-11-08 17:08:50','2026-10-09 16:08:50'),(165,11,'d196010a01a3c9850acc69fb59baa07210fdebc100364a2aaeb75628f8540bad','2026-11-08 17:08:50','2026-10-09 16:08:50'),(166,8,'8c3116db74a3078c4a1139d2ff3bdf6238872dceb99c5c76b7c74ab37269ca37','2026-11-08 17:09:10','2026-10-09 16:09:10'),(167,8,'9c8e54da1204ca162917f6f9cec8b47e02d899149ff080010f93eebb716240df','2026-11-08 17:09:10','2026-10-09 16:09:10'),(168,11,'bedb8387af8d7e5f9c480a221eb379cc23cd557fc0a6b30bc58305d37d4941cb','2026-11-08 17:09:10','2026-10-09 16:09:10'),(169,8,'8b343cfe5a033743ef97e01378ee356b42671417808ed59c2e2cf4d0f805d5f4','2026-11-08 17:17:57','2026-10-09 16:17:57'),(170,2,'d120e71511e0af055f0036be2be6251ab2e65d08786955377d9215ae1813f9a8','2026-11-08 17:26:12','2026-10-09 16:26:12'),(171,1,'cdf0efa5a28056ef1e7f63158c96c985b2255ee397509c5e76bc2d466fc4d148','2026-11-08 17:27:39','2026-10-09 16:27:39'),(172,8,'effffb629e0438ebf23902d64b5a0742f0c1218744f7ba6fd68eaf829bb8232a','2026-11-08 17:31:49','2026-10-09 16:31:49'),(173,7,'738d3b5846555c3ac9b50851766fa79f0b3cbf8a76ad5fc5eec310558166d9af','2026-11-08 17:32:32','2026-10-09 16:32:32'),(174,8,'092c7ca9ae6278c6d9bb27d698072d506f0869347faa9c9b1a83bbddf1deebb8','2026-11-08 17:32:58','2026-10-09 16:32:58'),(175,1,'0b34bff597b9603fb242cf53bbe6649e2d1e2b7e9c1a063bd12e9bcf02079222','2026-11-08 17:35:31','2026-10-09 16:35:31'),(176,8,'9e2b46533e9aa088459da83b7ecaa7ac41ad9c7aa8ec4b437f2f462393e11b96','2026-11-08 17:36:10','2026-10-09 16:36:10'),(177,3,'b45dfdc052bb4a54a1b26235c3cbe2920a4a86c29f3f6d006eb6ccc3bf06ec53','2026-11-08 17:37:38','2026-10-09 16:37:38'),(178,7,'dcd2492a9a58d0d180a6ea5b0b07081cfdd8fe6fff504852f245c7dd307d0892','2026-11-08 17:37:56','2026-10-09 16:37:56'),(179,4,'9d749789e8c7864e9fbe6c32364a4eefb805c4de8abf62a77a31b240e2926157','2026-11-08 17:44:46','2026-10-09 16:44:46'),(180,8,'606027a964666a4cdaf823147970422c4838dfc43e001bf8d763c205a9a603c5','2026-11-08 17:45:31','2026-10-09 16:45:31'),(181,4,'aa1bca5a54a2a8c8a76758be2fc22ee38e1ece4f71f4bd6af1bbdec158668e07','2026-11-08 17:46:05','2026-10-09 16:46:05'),(182,11,'c0aad0bd50b46ecc306a14d11f0323b0e97afcdfbf4cbaaeb07172e57b00544e','2026-11-08 17:53:44','2026-10-09 16:53:44'),(183,6,'6caaa701be4a4cb1084b453dc568fdeb2d7b0f03a0c6ba8caa6f74b233aaa4a3','2026-11-08 17:56:33','2026-10-09 16:56:33'),(184,8,'49001327c70667b0998d7ea13a7a72fb79dd39b4d4de89a55ad5de708d930dbe','2026-11-08 18:28:07','2026-10-09 17:28:07'),(185,7,'fdcf599dd0606001ae8168a9fa6d206c5760bd9651cd4b089baec528ff21a72f','2026-11-08 18:30:55','2026-10-09 17:30:55'),(186,11,'1aea5f8ec713b4ed71e538b28189713f28a18c276a0fcde2c48c19e92cb4af84','2026-11-08 18:32:44','2026-10-09 17:32:44'),(187,7,'13a567b6d3b9a5ea193a320955484ea663c3853631b2e588d7272ed2fca52d7a','2026-11-08 18:39:53','2026-10-09 17:39:53'),(188,8,'00b72b39439af2b756fbbaf141fca6b77113d6c2ef9be05bb2c6fec845cf8df4','2026-11-08 18:40:08','2026-10-09 17:40:08'),(189,7,'eed04ac22b1c025e17eedd91cdf294544adbf06d0fb39249947cc337af7aa982','2026-11-08 18:40:37','2026-10-09 17:40:37'),(190,8,'befbac80f64b867db807dd59a4b8b754ebfb9e73e47a8baeda6eba5331fc42d9','2026-11-08 18:47:42','2026-10-09 17:47:42'),(191,3,'3cb270db177565845312723354cc7dc5236be8e9646aa08c44fda60db01dbd78','2026-11-08 18:52:40','2026-10-09 17:52:40'),(192,8,'b68bb5ef53777341901b0ef3d4b1294e462a261c87d3de94a48f96150226e43e','2026-11-08 18:52:52','2026-10-09 17:52:52'),(193,9,'664deb994fdecc97812520df98cbac8a70841e9cb2a81964972d05088423cd38','2026-11-08 18:52:55','2026-10-09 17:52:55'),(194,3,'a2b17cfb72f0ba2d2953d5505e17ccc08778e8b103a5daef31a3c3723a08a0e9','2026-11-08 18:53:12','2026-10-09 17:53:12'),(195,8,'0534563cb31f84c5d4210fc96c6fd586dd7fedda5af3808628aaac9337057172','2026-11-08 18:53:39','2026-10-09 17:53:39'),(196,2,'c5148e89dcd592b60d86d9d2f25814ddf8a925586b1ece6146b72f024d142889','2026-11-08 19:18:20','2026-10-09 18:18:20'),(197,8,'35692b2757ec955a7081b0f5c67e7aff104b471cc9d6c8d239cdbf02ce06474f','2026-11-08 19:25:28','2026-10-09 18:25:28'),(198,1,'b6e50dd0b822212d066236aa2c1e65b301b9de3b12fdd6166808750078ce7116','2026-11-08 19:52:10','2026-10-09 18:52:10'),(199,8,'50267d8e2484af1f50183029fe3b07fa2457e3277ef89be2e1c0c10de19ed55d','2026-11-08 19:56:23','2026-10-09 18:56:23'),(200,6,'002a1f3b80191590239312a2590acdaebe96cf37a7eb2c2c16c16ed2c1e627df','2026-11-08 20:08:44','2026-10-09 19:08:44'),(201,1,'23729dde5b5a6590d3a4e058aed23040407c318f923886e1176c6423d2606f7b','2026-11-08 20:18:02','2026-10-09 19:18:02'),(202,8,'a4717f24d70da395b6dc38c5531148636ebf40c2f937382c75364c920d73275a','2026-11-08 20:28:04','2026-10-09 19:28:04'),(203,7,'9285f6b2d3ad28651a039f2d49df23deaf42f2eb36cd038a7390076d9496084c','2026-11-08 20:53:51','2026-10-09 19:53:51'),(204,8,'3f1b69092ade2b0d8da0e95af5d06849bc45cfd83b98383585c58c66470ba44d','2026-11-08 20:54:08','2026-10-09 19:54:08'),(205,7,'2c04f69cfc83aa4a81ba4db6658eca34fc449ac73633f056ba660839ffa5e9ec','2026-11-08 20:56:26','2026-10-09 19:56:26'),(206,8,'ed29a636c9166f48372ba600fd530b47c3c7e09067f25c1cf582d7a4a87f30bb','2026-11-08 20:56:47','2026-10-09 19:56:47'),(207,4,'929392dd1036807836d0024e2c2d6d426aeb46ffd9dddc6aa0c03803657231aa','2026-11-08 20:58:05','2026-10-09 19:58:05'),(208,8,'0bb2e3e04dd3e40b27709eabd9a42119b879161c5363d10b6975c25c9bbf7383','2026-11-08 20:58:49','2026-10-09 19:58:49'),(209,4,'39b055d4fb2cbe5a47329c07c1752db632fe4bc3b2eb621934d260f5ec4eea31','2026-11-08 20:59:18','2026-10-09 19:59:18'),(210,8,'5c18f97cb01b0a4069fe0fc88db3a389b31bf128fbe7387515af2fabaf1ed6e8','2026-11-08 21:00:21','2026-10-09 20:00:21'),(211,5,'2e64b4d9492065cc3d49505570dc133daa732ac31f2582a80782d38128061712','2026-11-08 21:01:30','2026-10-09 20:01:30'),(212,8,'25be813096dfcafe481aa1f10059ee828aef26ebc1e8c106af0740586c79bf61','2026-11-08 21:02:10','2026-10-09 20:02:10'),(213,2,'366dd2a28218e6b76775b81b9014ef204b89f1bc20132c258f0d9689beea351a','2026-11-08 21:03:02','2026-10-09 20:03:02'),(214,8,'34bba25b11dddda777a45a30c503b55aa83281110ac300d66adcbbd4a0c5230d','2026-11-08 21:03:42','2026-10-09 20:03:42'),(215,11,'a2db38bca6167a3d70feedf5813ccdaf275e5a44becb2f49c977ad4520b71350','2026-11-08 21:04:34','2026-10-09 20:04:34'),(216,8,'77317c6974c2d3649a9f6b5d01259470f09acca983ecc48c8299524e6575d540','2026-11-08 21:04:49','2026-10-09 20:04:49'),(217,6,'819717350ae17509fd36f14439bdaf56ffe6302823cdae6a5e6fa99c4e845981','2026-11-08 21:05:16','2026-10-09 20:05:16'),(218,1,'17b069d74d6a2f63db9fc5ed8946584c0831b72df729495e4dae3d2f48a7a08f','2026-11-08 21:07:05','2026-10-09 20:07:05');
/*!40000 ALTER TABLE `auth_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chatbot_learned_qa`
--

DROP TABLE IF EXISTS `chatbot_learned_qa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chatbot_learned_qa` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question_pattern` varchar(255) NOT NULL,
  `keywords` varchar(500) NOT NULL,
  `answer_text` text NOT NULL,
  `answer_hi` text DEFAULT NULL,
  `answer_or` text DEFAULT NULL,
  `category` varchar(64) DEFAULT 'general',
  `action_route` varchar(128) DEFAULT NULL,
  `taught_by_user_id` int(11) DEFAULT NULL,
  `times_used` int(11) DEFAULT 0,
  `is_verified` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_keywords` (`keywords`(255)),
  KEY `idx_verified` (`is_verified`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chatbot_learned_qa`
--

LOCK TABLES `chatbot_learned_qa` WRITE;
/*!40000 ALTER TABLE `chatbot_learned_qa` DISABLE KEYS */;
INSERT INTO `chatbot_learned_qa` VALUES (1,'What time does the administrative office start and close?','office time, opening time, office starts, working hours, timings, timing, open, close, hours','The Central University Administrative Offices open at 09:30 AM and close at 05:00 PM (Monday through Friday). Counter clearances operate from 10:00 AM to 03:00 PM.','केंद्रीय विश्वविद्यालय प्रशासनिक कार्यालय सोमवार से शुक्रवार प्रातः 09:30 बजे से सायं 05:00 बजे तक खुलते हैं। छात्र काउंटर 10:00 AM से 03:00 PM तक संचालित होते हैं।','କେନ୍ଦ୍ରୀୟ ବିଶ୍ୱବିଦ୍ୟାଳୟ ପ୍ରଶାସନିକ କାର୍ଯ୍ୟାଳୟ ସୋମବାରରୁ ଶୁକ୍ରବାର ସକାଳ ୦୯:୩୦ ରୁ ଅପରାହ୍ନ ୦୫:୦୦ ପର୍ଯ୍ୟନ୍ତ ଖୋଲା ରହିଥାଏ। ଛାତ୍ର କାଉଣ୍ଟର ସକାଳ ୧୦:୦୦ ରୁ ୩:୦୦ ପର୍ଯ୍ୟନ୍ତ ଚାଲେ।','administration','/profile',NULL,6,1,'2026-10-09 15:23:35','2026-10-09 19:12:27'),(2,'How can I apply for a duplicate student ID card?','duplicate id, lost id, id card, new id card, lost id card, missing id','To obtain a Duplicate Identity Card, submit an application via the Digital Services desk with an affidavit/loss declaration. Standard processing fee is ₹150 with a 48-hour issue SLA.','डुप्लिकेट आईडी कार्ड प्राप्त करने के लिए डिजिटल सेवा डेस्क पर शपथ पत्र के साथ आवेदन प्रस्तुत करें। ₹150 शुल्क के साथ 48 घंटे में काउंटर से प्राप्त करें।','ଡୁପ୍ଲିକେଟ୍ ଆଇଡି କାର୍ଡ ପାଇଁ ଡିଜିଟାଲ୍ ସେବା କେନ୍ଦ୍ରରେ ଆବେଦନ କରନ୍ତୁ। ₹୧୫୦ ଫିସ୍ ସହ ୪୮ ଘଣ୍ଟା ମଧ୍ୟରେ ନୂତନ କାର୍ଡ ମିଳିବ।','services','/services',NULL,5,1,'2026-10-09 15:23:35','2026-10-09 15:23:35'),(3,'What is the mess rebate rule when skipping dinners?','mess rebate, dinner skip, rebate rule, food credit, skip dinner, mess refund','Hostel residents must toggle \"Skip Dinner\" before 05:00 PM daily. Each skipped meal awards a ₹25 institutional dining rebate credit adjusted in the next monthly ledger.','छात्र प्रतिदिन सायं 05:00 बजे से पूर्व \"Skip Dinner\" चुनें। प्रत्येक रद्द भोजन पर ₹25 का मेस रिबेट क्रेडिट अगले बिल में स्वतः समायोजित होता है।','ପ୍ରତିଦିନ ସନ୍ଧ୍ୟା ୦୫:୦୦ ପୂର୍ବରୁ \"Skip Dinner\" କରନ୍ତୁ। ପ୍ରତ୍ୟେକ ବାତିଲ ଡିନର ପାଇଁ ₹୨୫ ରିବେଟ୍ ଆପଣଙ୍କ ମାସିକ ବିଲରେ ଯୋଗ ହେବ।','mess','/mess',NULL,5,1,'2026-10-09 15:23:35','2026-10-09 15:23:35'),(4,'What is the 75% attendance rule for semester exams?','75% attendance, attendance rule, exam eligibility, debarment, attendance threshold, bput rule','Under BPUT Academic Regulation 14.2, students must maintain 75.00% aggregate attendance across theory and labs to remain eligible for examination hall ticket release.','बीपीयूटी विनियम 14.2 के तहत परीक्षा हॉल टिकट प्राप्त करने हेतु 75.00% उपस्थिति अनिवार्य है। 75% से कम पर परीक्षा बहिष्कार का नियम लागू होता है।','BPUT ଶିକ୍ଷାଗତ ନିୟମାବଳୀ ୧୪.୨ ଅନୁଯାୟୀ ପରୀକ୍ଷା ହଲ୍ ଟିକେଟ୍ ପାଇବା ପାଇଁ ୭୫% ଉପସ୍ଥିତି ବାଧ୍ୟତାମୂଳକ।','academics','/academics',NULL,5,1,'2026-10-09 15:23:35','2026-10-09 15:23:35'),(5,'What time does the robotics lab open on weekends?','robotics lab, open, weekend, saturday, robotics','The Advanced Robotics Laboratory opens at 10:00 AM on Saturdays and is closed on Sundays.',NULL,NULL,'laboratories',NULL,5,1,1,'2026-10-09 15:30:34','2026-10-09 15:30:34');
/*!40000 ALTER TABLE `chatbot_learned_qa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chatbot_messages`
--

DROP TABLE IF EXISTS `chatbot_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chatbot_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` int(11) NOT NULL,
  `sender_type` enum('student','bot','human_staff') NOT NULL,
  `sender_user_id` int(11) DEFAULT NULL,
  `message_text` text NOT NULL,
  `is_learned` tinyint(1) DEFAULT 0,
  `action_route` varchar(128) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_session` (`session_id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chatbot_messages`
--

LOCK TABLES `chatbot_messages` WRITE;
/*!40000 ALTER TABLE `chatbot_messages` DISABLE KEYS */;
INSERT INTO `chatbot_messages` VALUES (1,2,'student',5,'test',0,NULL,'2026-10-09 15:33:59'),(2,2,'bot',NULL,'I do not currently have the verified official answer for this query in the university handbook. I have flagged this for the Support Staff Desk to review. Once answered by staff, I will remember it permanently.',0,NULL,'2026-10-09 15:33:59'),(3,2,'student',5,'test',0,NULL,'2026-10-09 15:34:01'),(4,2,'bot',NULL,'I do not currently have the verified official answer for this query in the university handbook. I have flagged this for the Support Staff Desk to review. Once answered by staff, I will remember it permanently.',0,NULL,'2026-10-09 15:34:01'),(5,2,'student',5,'yrst',0,NULL,'2026-10-09 15:38:51'),(6,2,'bot',NULL,'I do not currently have the verified official answer for this query in the university handbook. I have flagged this for the Support Staff Desk to review. Once answered by staff, I will remember it permanently.',0,NULL,'2026-10-09 15:38:54'),(7,2,'student',5,'hi',0,NULL,'2026-10-09 15:39:03'),(8,2,'bot',NULL,'Hello! I’m CampusDesk, your Central University of Technology virtual assistant. How can I assist you today?',0,NULL,'2026-10-09 15:39:05'),(9,2,'student',5,'hi',0,NULL,'2026-10-09 16:02:31'),(10,2,'bot',NULL,'Hello! I’m CampusDesk, your Central University of Technology virtual assistant. How can I assist you today?',0,NULL,'2026-10-09 16:02:33'),(11,2,'student',5,'Do I have to submit physical copy of my scholarship',0,NULL,'2026-10-09 16:02:48'),(12,2,'bot',NULL,'Most scholarship applications and supporting documents are accepted electronically through the Central University of Technology portal. A physical copy is only required if the scholarship guidelines explicitly state so or if you are submitting a hard‑copy award letter. If you are unsure, please contact the Office of Student Financial Services at 555‑123‑4567 or email sfs@cut.edu for confirmation.',0,NULL,'2026-10-09 16:02:49'),(13,3,'student',7,'hi',0,NULL,'2026-10-09 18:18:36'),(14,3,'bot',NULL,'Hello! I’m CampusDesk, your Central University of Technology virtual assistant. How can I assist you today—whether it’s about courses, campus services, or any other university matter?',0,NULL,'2026-10-09 18:18:37'),(15,1,'bot',NULL,'Session marked resolved by Support Officer. If you have any further questions, you can continue chatting at any time.',0,NULL,'2026-10-09 18:18:47'),(16,4,'student',4,'hi',0,NULL,'2026-10-09 19:11:56'),(17,4,'bot',NULL,'Hello! I’m CampusDesk, your Central University of Technology virtual assistant. How can I assist you today?',0,NULL,'2026-10-09 19:11:58'),(18,4,'student',4,'What time does the office start and close?',0,NULL,'2026-10-09 19:12:27'),(19,4,'bot',NULL,'The Central University Administrative Offices open at 09:30 AM and close at 05:00 PM (Monday through Friday). Counter clearances operate from 10:00 AM to 03:00 PM.',1,'/profile','2026-10-09 19:12:27'),(20,2,'student',5,'hi',0,NULL,'2026-10-09 19:15:50'),(21,2,'bot',NULL,'Hello! I’m CampusDesk, your Central University of Technology assistant. How can I help you today?',0,NULL,'2026-10-09 19:15:51'),(22,4,'bot',NULL,'Session marked resolved by Support Officer. If you have any further questions, you can continue chatting at any time.',0,NULL,'2026-10-09 19:19:56'),(23,7,'student',6,'hi',0,NULL,'2026-10-09 22:27:07'),(24,7,'bot',NULL,'Hello! I’m CampusDesk, your Central University of Technology virtual assistant. How can I assist you today?',0,NULL,'2026-10-09 22:27:08'),(25,7,'student',6,'hi',0,NULL,'2026-10-10 01:35:59'),(26,7,'bot',NULL,'Hello! I’m CampusDesk, your Central University of Technology virtual assistant. How can I assist you today?',0,NULL,'2026-10-10 01:36:01');
/*!40000 ALTER TABLE `chatbot_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chatbot_sessions`
--

DROP TABLE IF EXISTS `chatbot_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chatbot_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `session_token` varchar(64) NOT NULL,
  `status` enum('bot','escalated_pending','human_active','resolved','closed') DEFAULT 'bot',
  `human_request_count` int(11) DEFAULT 0,
  `unresolved_question` text DEFAULT NULL,
  `escalated_at` datetime DEFAULT NULL,
  `assigned_staff_id` int(11) DEFAULT NULL,
  `resolved_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chatbot_sessions`
--

LOCK TABLES `chatbot_sessions` WRITE;
/*!40000 ALTER TABLE `chatbot_sessions` DISABLE KEYS */;
INSERT INTO `chatbot_sessions` VALUES (1,8,'SESS-BBB7545DFFEC1D61199E2FCB','resolved',0,NULL,NULL,NULL,'2026-10-09 18:18:47','2026-10-09 15:32:42','2026-10-09 18:18:47'),(2,5,'SESS-C52F577B585406E14BF19104','bot',0,'yrst',NULL,NULL,NULL,'2026-10-09 15:33:59','2026-10-09 15:38:54'),(3,7,'SESS-5E6996C3245AF68348BC0C09','bot',0,NULL,NULL,NULL,NULL,'2026-10-09 18:18:31','2026-10-09 18:18:31'),(4,4,'SESS-4A626D6FCADE604D1DCBBF28','resolved',0,NULL,NULL,NULL,'2026-10-09 19:19:56','2026-10-09 19:11:53','2026-10-09 19:19:56'),(5,1,'SESS-84A20B14A20BDAB2A8D09AEA','bot',0,NULL,NULL,NULL,NULL,'2026-10-09 19:22:10','2026-10-09 19:22:10'),(6,4,'SESS-1ED7971C884FEB54CD1C9357','bot',0,NULL,NULL,NULL,NULL,'2026-10-09 22:22:17','2026-10-09 22:22:17'),(7,6,'SESS-CC85403CC7527D009729258D','bot',0,NULL,NULL,NULL,NULL,'2026-10-09 22:27:02','2026-10-09 22:27:02');
/*!40000 ALTER TABLE `chatbot_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chatbot_settings`
--

DROP TABLE IF EXISTS `chatbot_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chatbot_settings` (
  `setting_key` varchar(64) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chatbot_settings`
--

LOCK TABLES `chatbot_settings` WRITE;
/*!40000 ALTER TABLE `chatbot_settings` DISABLE KEYS */;
INSERT INTO `chatbot_settings` VALUES ('campus_office_hours','Monday to Friday, 09:30 AM to 05:00 PM','2026-10-09 15:23:35'),('grok_api_key','','2026-10-09 15:35:32'),('grok_model','openai/gpt-oss-20b','2026-10-09 15:35:32'),('human_escalation_threshold','2','2026-10-09 15:23:35');
/*!40000 ALTER TABLE `chatbot_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `courses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `department_id` int(11) NOT NULL,
  `program_id` int(11) NOT NULL,
  `semester` int(11) NOT NULL DEFAULT 1,
  `credits` int(11) NOT NULL DEFAULT 4,
  `max_internal_marks` int(11) NOT NULL DEFAULT 40,
  `max_external_marks` int(11) NOT NULL DEFAULT 60,
  `pass_percentage` decimal(5,2) DEFAULT 40.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `department_id` (`department_id`),
  KEY `program_id` (`program_id`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `courses_ibfk_2` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,'MCA101','Advanced Data Structures & Algorithms',1,1,1,4,40,60,40.00,'2026-10-08 19:20:53'),(2,'MCA102','Relational Database Management Systems',1,1,1,4,40,60,40.00,'2026-10-08 19:20:53'),(3,'MCA103','Computer Networks & TCP/IP Protocols',1,1,1,4,40,60,40.00,'2026-10-08 19:20:53'),(4,'MCA104','Software Engineering & Agile Lifecycle',1,1,1,4,40,60,40.00,'2026-10-08 19:20:53'),(5,'MCA105','Advanced Web Technologies & Cloud Stacks',1,1,1,4,40,60,40.00,'2026-10-08 19:20:53'),(6,'CSE301','Discrete Mathematics & Graph Theory',1,2,3,4,40,60,40.00,'2026-10-08 19:20:53'),(7,'CSE302','Digital Logic & Computer Organization',1,2,3,4,40,60,40.00,'2026-10-08 19:20:53'),(8,'CSE303','Object Oriented Programming with Java',1,2,3,4,40,60,40.00,'2026-10-08 19:20:53'),(9,'CSE304','Operating System Principles & Unix',1,2,3,4,40,60,40.00,'2026-10-08 19:20:53'),(10,'CSE305','Analog & Digital Data Communications',1,2,3,4,40,60,40.00,'2026-10-08 19:20:53');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `daily_attendance_entries`
--

DROP TABLE IF EXISTS `daily_attendance_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `daily_attendance_entries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `roll_number` varchar(50) NOT NULL,
  `student_name` varchar(150) NOT NULL,
  `status` enum('present','absent','approved_od') NOT NULL DEFAULT 'present',
  `od_leave_id` int(11) DEFAULT NULL,
  `od_type` varchar(50) DEFAULT NULL,
  `od_title` varchar(255) DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_session` (`session_id`),
  KEY `idx_student` (`student_id`),
  CONSTRAINT `daily_attendance_entries_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `daily_attendance_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_attendance_entries`
--

LOCK TABLES `daily_attendance_entries` WRITE;
/*!40000 ALTER TABLE `daily_attendance_entries` DISABLE KEYS */;
INSERT INTO `daily_attendance_entries` VALUES (1,1,1,'24050101','Ashish Toppo','present',NULL,NULL,NULL,'Present in lecture','2026-10-09 13:00:41'),(2,1,2,'24050102','Priya Patel','absent',NULL,NULL,NULL,'Uninformed absence','2026-10-09 13:00:41'),(3,1,4,'24050103','Rohan Mohanty','present',NULL,NULL,NULL,'Present in lecture','2026-10-09 13:00:41'),(4,1,6,'24050104','Ananya Senapati','present',NULL,NULL,NULL,'Present in lecture','2026-10-09 13:00:41'),(5,1,7,'24050105','Biswajit Sahoo','present',NULL,NULL,NULL,'Present in lecture','2026-10-09 13:00:41'),(6,1,8,'24050106','Smruti Mishra','present',NULL,NULL,NULL,'Present in lecture','2026-10-09 13:00:41'),(7,1,9,'24050107','Debashish Jena','present',NULL,NULL,NULL,'Present in lecture','2026-10-09 13:00:41'),(8,1,10,'24050108','Subhashree Das','present',NULL,NULL,NULL,'Present in lecture','2026-10-09 13:00:41'),(17,3,1,'24050101','Ashish Toppo','approved_od',1,'hackathon','BPUT Hackathon 2026 Grand Finale - Problem Statement 07','Sanctioned leave: BPUT Hackathon 2026 Grand Finale - Problem Statement 07','2026-10-09 14:41:11'),(18,3,2,'24050102','Priya Patel','absent',NULL,NULL,NULL,'','2026-10-09 14:41:11'),(19,3,4,'24050103','Rohan Mohanty','present',NULL,NULL,NULL,'','2026-10-09 14:41:11'),(20,3,6,'24050104','Ananya Senapati','absent',NULL,NULL,NULL,'','2026-10-09 14:41:11'),(21,3,7,'24050105','Biswajit Sahoo','present',NULL,NULL,NULL,'','2026-10-09 14:41:11'),(22,3,8,'24050106','Smruti Mishra','present',NULL,NULL,NULL,'','2026-10-09 14:41:11'),(23,3,9,'24050107','Debashish Jena','present',NULL,NULL,NULL,'','2026-10-09 14:41:11'),(24,3,10,'24050108','Subhashree Das','present',NULL,NULL,NULL,'','2026-10-09 14:41:11'),(25,2,1,'24050101','Ashish Toppo','approved_od',1,'hackathon','BPUT Hackathon 2026 Grand Finale - Problem Statement 07','','2026-10-09 19:58:35'),(26,2,2,'24050102','Priya Patel','present',NULL,NULL,NULL,'Absent without prior intimation','2026-10-09 19:58:35'),(27,2,4,'24050103','Rohan Mohanty','absent',NULL,NULL,NULL,'','2026-10-09 19:58:35'),(28,2,6,'24050104','Ananya Senapati','present',NULL,NULL,NULL,'','2026-10-09 19:58:35'),(29,2,7,'24050105','Biswajit Sahoo','absent',NULL,NULL,NULL,'','2026-10-09 19:58:35'),(30,2,8,'24050106','Smruti Mishra','absent',NULL,NULL,NULL,'','2026-10-09 19:58:35'),(31,2,9,'24050107','Debashish Jena','present',NULL,NULL,NULL,'','2026-10-09 19:58:35'),(32,2,10,'24050108','Subhashree Das','present',NULL,NULL,NULL,'','2026-10-09 19:58:35');
/*!40000 ALTER TABLE `daily_attendance_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `daily_attendance_sessions`
--

DROP TABLE IF EXISTS `daily_attendance_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `daily_attendance_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `timetable_slot_id` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT 1,
  `semester` int(11) DEFAULT 6,
  `section` varchar(10) DEFAULT 'A',
  `subject_code` varchar(20) NOT NULL,
  `subject_name` varchar(150) NOT NULL,
  `faculty_user_id` int(11) NOT NULL,
  `faculty_name` varchar(150) NOT NULL,
  `attendance_date` date NOT NULL,
  `slot_time` varchar(50) DEFAULT '09:00 AM - 10:00 AM',
  `total_students` int(11) DEFAULT 0,
  `present_count` int(11) DEFAULT 0,
  `absent_count` int(11) DEFAULT 0,
  `approved_od_count` int(11) DEFAULT 0,
  `status` enum('draft','sealed') DEFAULT 'sealed',
  `sealed_at` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_subject_date` (`subject_code`,`attendance_date`),
  KEY `idx_faculty` (`faculty_user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_attendance_sessions`
--

LOCK TABLES `daily_attendance_sessions` WRITE;
/*!40000 ALTER TABLE `daily_attendance_sessions` DISABLE KEYS */;
INSERT INTO `daily_attendance_sessions` VALUES (1,NULL,1,6,'A','CS-601','Advanced Algorithms & Complexity',4,'Prof. Ashok Sharma','2026-10-07','09:00 AM - 10:00 AM',8,7,1,0,'sealed','2026-10-07 10:05:00','Paper register synchronized to digital ledger','2026-10-09 13:00:41','2026-10-09 13:00:41'),(2,NULL,1,6,'A','CS-601','Advanced Algorithms',4,'Prof. Ashok Sharma','2026-10-09','09:00 AM - 10:00 AM',8,4,3,1,'sealed','2026-10-10 01:28:35','','2026-10-09 13:05:06','2026-10-09 19:58:35'),(3,NULL,1,6,'A','CS-603','Database Internals',4,'Prof. Ashok Sharma','2026-10-09','09:00 AM - 10:00 AM',8,5,2,1,'sealed','2026-10-09 20:11:11','','2026-10-09 14:41:11','2026-10-09 14:41:11');
/*!40000 ALTER TABLE `daily_attendance_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `departments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(30) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,'CSE','Computer Science and Engineering','Department of Computer Science & Information Technology','2026-10-08 03:38:01'),(2,'ECE','Electronics and Communication Engineering','Department of Electronics and Communication','2026-10-08 03:38:01'),(3,'MECH','Mechanical Engineering','Department of Mechanical Engineering','2026-10-08 03:38:01'),(4,'CIVIL','Civil Engineering','Department of Civil Engineering','2026-10-08 03:38:01'),(5,'ADMIN','General Administration','Central University Administrative Services','2026-10-08 03:38:01');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_marks`
--

DROP TABLE IF EXISTS `exam_marks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `exam_marks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `exam_session_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `student_profile_id` int(11) NOT NULL,
  `internal_marks` decimal(5,2) DEFAULT 0.00,
  `external_marks` decimal(5,2) DEFAULT 0.00,
  `total_marks` decimal(5,2) DEFAULT 0.00,
  `grade_letter` varchar(5) DEFAULT 'F',
  `grade_points` decimal(4,2) DEFAULT 0.00,
  `result_status` enum('pass','fail','absent','malpractice') DEFAULT 'pass',
  `credits` int(11) NOT NULL DEFAULT 4,
  `evaluated_by_user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `exam_session_id` (`exam_session_id`),
  KEY `course_id` (`course_id`),
  KEY `student_profile_id` (`student_profile_id`),
  CONSTRAINT `exam_marks_ibfk_1` FOREIGN KEY (`exam_session_id`) REFERENCES `exam_sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exam_marks_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exam_marks_ibfk_3` FOREIGN KEY (`student_profile_id`) REFERENCES `student_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_marks`
--

LOCK TABLES `exam_marks` WRITE;
/*!40000 ALTER TABLE `exam_marks` DISABLE KEYS */;
INSERT INTO `exam_marks` VALUES (14,1,1,1,36.00,52.00,88.00,'A+',9.00,'pass',4,6,'2026-10-08 19:29:28','2026-10-08 19:29:28'),(15,1,2,1,38.00,54.00,92.00,'O',10.00,'pass',4,6,'2026-10-08 19:29:28','2026-10-08 19:29:28'),(16,1,3,1,33.00,48.00,81.00,'A',8.00,'pass',4,6,'2026-10-08 19:29:28','2026-10-08 19:29:28'),(17,1,4,1,35.00,51.00,86.00,'A+',9.00,'pass',4,6,'2026-10-08 19:29:28','2026-10-08 19:29:28'),(18,1,5,1,37.00,55.00,92.00,'O',10.00,'pass',4,6,'2026-10-08 19:29:28','2026-10-08 19:29:28'),(19,1,1,2,38.00,56.00,94.00,'O',10.00,'pass',4,6,'2026-10-08 19:29:28','2026-10-08 19:29:28'),(20,1,2,2,39.00,57.00,96.00,'O',10.00,'pass',4,6,'2026-10-08 19:29:28','2026-10-08 19:29:28'),(21,1,3,2,36.00,53.00,89.00,'A+',9.00,'pass',4,6,'2026-10-08 19:29:28','2026-10-08 19:29:28'),(22,1,4,2,37.00,54.00,91.00,'O',10.00,'pass',4,6,'2026-10-08 19:29:28','2026-10-08 19:29:28'),(23,1,5,2,39.00,58.00,97.00,'O',10.00,'pass',4,6,'2026-10-08 19:29:28','2026-10-08 19:29:28'),(24,1,1,1,38.00,55.00,93.00,'O',10.00,'pass',4,6,'2026-10-08 19:29:34','2026-10-08 19:29:34'),(25,2,1,1,35.00,52.00,87.00,'A+',9.00,'pass',4,6,'2026-10-09 14:48:01','2026-10-09 14:48:01');
/*!40000 ALTER TABLE `exam_marks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_schedules`
--

DROP TABLE IF EXISTS `exam_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `exam_schedules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `exam_session_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `exam_date` date NOT NULL,
  `start_time` time NOT NULL DEFAULT '10:00:00',
  `end_time` time NOT NULL DEFAULT '13:00:00',
  `shift_name` varchar(60) DEFAULT 'Morning Session (10:00 AM - 01:00 PM)',
  `hall_name` varchar(100) NOT NULL DEFAULT 'LH-101 (Lecture Hall Complex)',
  `seating_plan` varchar(255) DEFAULT 'Rows 1-6 (All Enrolled Candidates)',
  `invigilator_name` varchar(150) DEFAULT 'Prof. Ashok Sharma',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `exam_session_id` (`exam_session_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `exam_schedules_ibfk_1` FOREIGN KEY (`exam_session_id`) REFERENCES `exam_sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exam_schedules_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_schedules`
--

LOCK TABLES `exam_schedules` WRITE;
/*!40000 ALTER TABLE `exam_schedules` DISABLE KEYS */;
INSERT INTO `exam_schedules` VALUES (21,1,1,'2026-11-16','10:00:00','13:00:00','Morning Session (10:00 AM - 01:00 PM)','LH-101 (Lecture Hall Complex)','Hall 101: Rows A-F','Prof. Ashok Sharma','2026-10-08 19:29:28'),(22,1,2,'2026-11-18','10:00:00','13:00:00','Morning Session (10:00 AM - 01:00 PM)','LH-101 (Lecture Hall Complex)','Hall 101: Rows A-F','Dr. Meenakshi Sundaram','2026-10-08 19:29:28'),(23,1,3,'2026-11-20','10:00:00','13:00:00','Morning Session (10:00 AM - 01:00 PM)','LH-102 (Lecture Hall Complex)','Hall 102: Rows A-D','Prof. Sunil Narang','2026-10-08 19:29:28'),(24,1,4,'2026-11-23','10:00:00','13:00:00','Morning Session (10:00 AM - 01:00 PM)','LH-101 (Lecture Hall Complex)','Hall 101: Rows A-F','Prof. Ashok Sharma','2026-10-08 19:29:28'),(25,1,5,'2026-11-25','10:00:00','13:00:00','Morning Session (10:00 AM - 01:00 PM)','Computer Lab 3 (Systems Wing)','Terminals T01 - T60','Dr. Vandana Saxena','2026-10-08 19:29:28'),(26,1,6,'2026-11-17','10:00:00','13:00:00','Morning Session (10:00 AM - 01:00 PM)','LH-201 (Second Floor Wing)','Hall 201: Desk 1-80','Prof. Ashok Sharma','2026-10-08 19:29:28'),(27,1,7,'2026-11-19','10:00:00','13:00:00','Morning Session (10:00 AM - 01:00 PM)','LH-201 (Second Floor Wing)','Hall 201: Desk 1-80','Dr. Meenakshi Sundaram','2026-10-08 19:29:28'),(28,1,8,'2026-11-21','10:00:00','13:00:00','Morning Session (10:00 AM - 01:00 PM)','LH-201 (Second Floor Wing)','Hall 201: Desk 1-80','Prof. Sunil Narang','2026-10-08 19:29:28'),(29,1,9,'2026-11-24','10:00:00','13:00:00','Morning Session (10:00 AM - 01:00 PM)','LH-202 (Second Floor Wing)','Hall 202: Desk 1-80','Prof. Ashok Sharma','2026-10-08 19:29:28'),(30,1,10,'2026-11-26','10:00:00','13:00:00','Morning Session (10:00 AM - 01:00 PM)','LH-201 (Second Floor Wing)','Hall 201: Desk 1-80','Dr. Vandana Saxena','2026-10-08 19:29:28'),(31,2,1,'2026-10-08','10:00:00','13:00:00','Morning Session (10:00 AM - 01:00 PM)','LH-101 (Lecture Hall Complex)','Rows 1-6 (All Enrolled Candidates)','Prof. Ashok Sharma','2026-10-09 14:46:39');
/*!40000 ALTER TABLE `exam_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_sessions`
--

DROP TABLE IF EXISTS `exam_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `exam_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_code` varchar(60) NOT NULL,
  `title` varchar(200) NOT NULL,
  `academic_year` varchar(20) NOT NULL DEFAULT '2026-2027',
  `term_type` enum('end_sem','mid_sem','supplementary','practical') DEFAULT 'end_sem',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `admit_cards_published` tinyint(1) DEFAULT 1,
  `results_published` tinyint(1) DEFAULT 1,
  `status` enum('draft','scheduled','ongoing','evaluating','results_declared') DEFAULT 'results_declared',
  `exam_center_name` varchar(150) DEFAULT 'Main Academic Block - Examination Center',
  `chief_invigilator_name` varchar(150) DEFAULT 'Dr. Vandana Saxena',
  `instructions` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_code` (`session_code`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_sessions`
--

LOCK TABLES `exam_sessions` WRITE;
/*!40000 ALTER TABLE `exam_sessions` DISABLE KEYS */;
INSERT INTO `exam_sessions` VALUES (1,'AUTUMN-2026-ENDSEM','Autumn End-Semester Regular & Backlog Examinations 2026','2026-2027','end_sem','2026-11-16','2026-11-28',1,1,'results_declared','Examination Center Complex - Academic Block C','Dr. Vandana Saxena (Controller of Examinations)','1. Candidates must arrive at the examination venue 30 minutes before the commencement of the exam.\n2. Valid printed Admit Card along with University Identity Card is strictly mandatory for hall entry.\n3. Electronic devices, smartwatches, and programmable calculators are strictly prohibited inside the hall.\n4. Candidates will not be permitted to leave the examination hall before the first 60 minutes have elapsed.\n5. Maintain silence and strictly observe all institutional examination codes of conduct.','2026-10-08 19:20:53'),(2,'SPRING-2027-MIDSEM','Spring Mid-Semester Institutional Sessional Examinations 2027','2026-2027','mid_sem','2027-02-15','2027-02-22',1,0,'scheduled','Main Academic Block - Lecture Hall Complex','Prof. Ashok Sharma','Mid-term evaluation carrying 40% weightage toward continuous internal assessment. Bring scientific calculator and drawing stationery.','2026-10-08 19:20:53');
/*!40000 ALTER TABLE `exam_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gatepasses`
--

DROP TABLE IF EXISTS `gatepasses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gatepasses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pass_number` varchar(32) NOT NULL,
  `student_id` int(11) NOT NULL,
  `pass_type` enum('day_outpass','night_outpass','emergency','vacation') NOT NULL DEFAULT 'day_outpass',
  `destination` varchar(255) NOT NULL,
  `reason` text NOT NULL,
  `out_time_expected` datetime NOT NULL,
  `in_time_expected` datetime NOT NULL,
  `actual_out_time` datetime DEFAULT NULL,
  `actual_in_time` datetime DEFAULT NULL,
  `status` enum('pending','approved','rejected','departed','returned','overdue') DEFAULT 'pending',
  `qr_token` varchar(64) NOT NULL,
  `security_code` varchar(8) NOT NULL,
  `warden_action_by` int(11) DEFAULT NULL,
  `warden_remarks` varchar(255) DEFAULT NULL,
  `curfew_breach_minutes` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `pass_number` (`pass_number`),
  KEY `idx_gp_student` (`student_id`),
  KEY `idx_gp_status` (`status`),
  KEY `idx_gp_sec_code` (`security_code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gatepasses`
--

LOCK TABLES `gatepasses` WRITE;
/*!40000 ALTER TABLE `gatepasses` DISABLE KEYS */;
INSERT INTO `gatepasses` VALUES (3,'GP-2026-0041',1,'day_outpass','Civil Town Market & Book Depo','Purchase reference textbooks for Compiler Design and lab components','2026-10-09 16:30:00','2026-10-09 20:00:00','2026-10-09 16:32:24','2026-10-09 16:32:38','returned','GP-TOKEN-41-7a88d0eaf9199ebe','4921',NULL,'Approved by Chief Warden Col. Mahendra Singh. Strictly return before 20:00 hrs.',0,'2026-10-09 08:26:03'),(4,'GP-2026-0038',1,'night_outpass','Home Visit (Rourkela Sector 4)','Family function over the weekend, parent consent verified via registered phone','2026-10-04 17:00:00','2026-10-06 19:30:00','2026-10-04 17:12:00','2026-10-06 19:15:00','returned','GP-TOKEN-38-ac08849baae5a24e','1183',NULL,'Return verified at Security Gate Main Terminal.',0,'2026-10-09 08:26:03'),(5,'GP-2026-0003',1,'night_outpass','rryyd','yrdydyd','2026-10-09 14:31:00','2026-10-09 16:31:00',NULL,NULL,'pending','GP-VERIFY-6099b63c93440529064d','5698',NULL,NULL,0,'2026-10-09 14:32:13');
/*!40000 ALTER TABLE `gatepasses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grievance_categories`
--

DROP TABLE IF EXISTS `grievance_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `grievance_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `department_name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `default_sla_hours` int(11) NOT NULL DEFAULT 24,
  `priority_default` enum('low','medium','high','emergency') DEFAULT 'medium',
  `icon_name` varchar(50) DEFAULT 'Wrench',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grievance_categories`
--

LOCK TABLES `grievance_categories` WRITE;
/*!40000 ALTER TABLE `grievance_categories` DISABLE KEYS */;
INSERT INTO `grievance_categories` VALUES (1,'hostel_maintenance','Hostel & Residential Maintenance','Hostel Administration & Caretaker Division','Room furniture, carpentry, door locks, window glass, cupboard fixtures, and hostel civil repairs.',24,'medium','Home',1,'2026-10-08 19:04:49'),(2,'electrical_power','Electrical & Power Infrastructure','Estate Electrical Engineering Unit','Ceiling fans, lighting fixtures, power sockets, switchboards, geysers, and emergency corridor power backup.',12,'high','Zap',1,'2026-10-08 19:04:49'),(3,'it_network','Campus Wi-Fi & IT Infrastructure','Central Computer & Network Center','Hostel Wi-Fi access points, LAN Ethernet ports, ERP student portal bugs, and smart classroom digital boards.',24,'medium','Wifi',1,'2026-10-08 19:04:49'),(4,'academic_course','Academic & Departmental Evaluation','Department Academic Grievance Cell','Timetable collisions, lab computer workstation issues, continuous evaluation record discrepancies, and syllabus grievances.',48,'medium','GraduationCap',1,'2026-10-08 19:04:49'),(5,'mess_food','Hostel Mess & Dining Hygiene','Central Mess Advisory & Food Safety Committee','Meal quality, drinking water RO purifiers, dining hall sanitation, and special dietary adherence.',12,'high','UtensilsCrossed',1,'2026-10-08 19:04:49'),(6,'sanitation_cleaning','Campus Housekeeping & Sanitation','Estate Sanitation & Housekeeping Unit','Washroom deep cleaning, plumbing drainage, garbage clearance, and academic corridor housekeeping.',12,'medium','Droplets',1,'2026-10-08 19:04:49'),(7,'admin_finance','Administrative & Accounts Counter','Office of the Registrar & Finance Division','Fee receipt reconciliation, scholarship verification issues, security deposit refund, and administrative desk delays.',72,'low','FileText',1,'2026-10-08 19:04:49');
/*!40000 ALTER TABLE `grievance_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grievance_timeline`
--

DROP TABLE IF EXISTS `grievance_timeline`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `grievance_timeline` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `grievance_id` int(11) NOT NULL,
  `actor_user_id` int(11) DEFAULT NULL,
  `action` varchar(80) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `actor_user_id` (`actor_user_id`),
  KEY `idx_timeline_grv` (`grievance_id`),
  CONSTRAINT `grievance_timeline_ibfk_1` FOREIGN KEY (`grievance_id`) REFERENCES `grievances` (`id`) ON DELETE CASCADE,
  CONSTRAINT `grievance_timeline_ibfk_2` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grievance_timeline`
--

LOCK TABLES `grievance_timeline` WRITE;
/*!40000 ALTER TABLE `grievance_timeline` DISABLE KEYS */;
INSERT INTO `grievance_timeline` VALUES (1,1,8,'TICKET_LOGGED','Maintenance request logged by student Ashish Toppo via Campus Hub.','2026-10-08 15:04:49'),(2,1,NULL,'AUTO_ROUTED','Auto-routing engine routed ticket to Estate Electrical Unit based on residential location Boys Hostel Block B.','2026-10-08 16:04:49'),(3,1,7,'TECHNICIAN_ASSIGNED','Assigned to duty electrician Ramesh Kumar (+91 98765-43210). Physical verification OTP generated: 7421.','2026-10-08 17:04:49'),(4,1,7,'WORK_IN_PROGRESS','Technician on site in Block B inspecting ceiling fan regulator and socket contacts.','2026-10-08 18:04:49'),(5,2,8,'TICKET_LOGGED','Logged via Campus Hub.','2026-10-06 15:04:49'),(6,2,NULL,'AUTO_ROUTED','Routed to Computer Center.','2026-10-06 17:04:49'),(7,2,5,'PHYSICALLY_RESOLVED','PoE switch connector replaced. Speed verified at 115 Mbps.','2026-10-07 07:04:49'),(8,2,8,'STUDENT_RATED','Student confirmed OTP 3918 and rated service 5 stars.','2026-10-08 19:04:49'),(9,3,9,'TICKET_LOGGED','Logged by Class Representative Priya Sharma.','2026-10-08 13:04:49'),(10,3,NULL,'AUTO_ROUTED','Auto-routed to Department of Computer Science & Engineering (HOD: Dr. Aris Thorne).','2026-10-08 14:04:49'),(11,3,3,'TECHNICIAN_ASSIGNED','Assigned to Lab Incharge for HDMI optical converter replacement.','2026-10-08 17:04:49'),(12,4,8,'TICKET_LOGGED','Logged by resident Ashish Toppo.','2026-10-08 02:04:49'),(13,4,NULL,'AUTO_ROUTED','Auto-routed to Sanitation Unit.','2026-10-08 03:04:49'),(14,4,NULL,'SLA_BREACHED','SLA limit of 12 hours elapsed without resolution.','2026-10-08 14:04:49'),(15,4,NULL,'ESCALATED','System daemon escalated ticket to Chief Hostel Warden & Estate Officer.','2026-10-08 17:04:49'),(16,5,8,'TICKET_LOGGED','Maintenance request CUT/GRV/2026/0005 logged by ashish.','2026-10-08 19:13:18'),(17,5,NULL,'AUTO_ROUTED','Auto-routing engine routed ticket to Estate Electrical Engineering Unit. Target SLA: 6 hours.','2026-10-08 19:13:18'),(18,6,8,'TICKET_LOGGED','Maintenance request CUT/GRV/2026/0006 logged by ashish.','2026-10-08 19:15:02'),(19,6,NULL,'AUTO_ROUTED','Auto-routing engine routed ticket to Estate Electrical Engineering Unit. Target SLA: 6 hours.','2026-10-08 19:15:02'),(20,6,7,'TECHNICIAN_ASSIGNED','Assigned to Rajesh Sharma (+91 98110 44219). Status updated to In-Progress. Technician instructed to carry replacement anchor regulator and safety test kit.','2026-10-08 19:15:02'),(21,6,7,'PHYSICALLY_RESOLVED','Resolution completed: Replaced burnt regulator with new Cona 5-step modular regulator. Tested and grounded properly. (Physical OTP 6476 verified)','2026-10-08 19:15:02'),(22,6,8,'STUDENT_RATED','Student rated maintenance service: 5/5 stars. Review: \'Electrician arrived within 2 hours, wore safety gear and fixed it quickly. Very satisfied.\'','2026-10-08 19:15:02'),(23,7,8,'TICKET_LOGGED','Maintenance request CUT/GRV/2026/0007 logged by ashish.','2026-10-08 19:15:36'),(24,7,NULL,'AUTO_ROUTED','Auto-routing engine routed ticket to Estate Electrical Engineering Unit. Target SLA: 6 hours.','2026-10-08 19:15:36'),(25,7,7,'TECHNICIAN_ASSIGNED','Assigned to Rajesh Sharma (+91 98110 44219). Status updated to In-Progress. Technician instructed to carry replacement anchor regulator and safety test kit.','2026-10-08 19:15:36'),(26,7,7,'PHYSICALLY_RESOLVED','Resolution completed: Replaced burnt regulator with new Cona 5-step modular regulator. Tested and grounded properly. (Physical OTP 7634 verified)','2026-10-08 19:15:36'),(27,7,8,'STUDENT_RATED','Student rated maintenance service: 5/5 stars. Review: \'Electrician arrived within 2 hours, wore safety gear and fixed it quickly. Very satisfied.\'','2026-10-08 19:15:37'),(28,8,8,'TICKET_LOGGED','Maintenance request CUT/GRV/2026/0008 logged by ashish.','2026-10-08 19:15:52'),(29,8,NULL,'AUTO_ROUTED','Auto-routing engine routed ticket to Estate Electrical Engineering Unit. Target SLA: 6 hours.','2026-10-08 19:15:52'),(30,8,7,'TECHNICIAN_ASSIGNED','Assigned to Rajesh Sharma (+91 98110 44219). Status updated to In-Progress. Technician instructed to carry replacement anchor regulator and safety test kit.','2026-10-08 19:15:52'),(31,8,7,'PHYSICALLY_RESOLVED','Resolution completed: Replaced burnt regulator with new Cona 5-step modular regulator. Tested and grounded properly. (Physical OTP 4854 verified)','2026-10-08 19:15:52'),(32,8,8,'STUDENT_RATED','Student rated maintenance service: 5/5 stars. Review: \'Electrician arrived within 2 hours, wore safety gear and fixed it quickly. Very satisfied.\'','2026-10-08 19:15:53'),(33,9,8,'TICKET_LOGGED','Maintenance request CUT/GRV/2026/0009 logged by ashish.','2026-10-08 19:16:06'),(34,9,NULL,'AUTO_ROUTED','Auto-routing engine routed ticket to Estate Electrical Engineering Unit. Target SLA: 6 hours.','2026-10-08 19:16:06'),(35,9,7,'TECHNICIAN_ASSIGNED','Assigned to Rajesh Sharma (+91 98110 44219). Status updated to In-Progress. Technician instructed to carry replacement anchor regulator and safety test kit.','2026-10-08 19:16:06'),(36,9,7,'PHYSICALLY_RESOLVED','Resolution completed: Replaced burnt regulator with new Cona 5-step modular regulator. Tested and grounded properly. (Physical OTP 8440 verified)','2026-10-08 19:16:06'),(37,9,8,'STUDENT_RATED','Student rated maintenance service: 5/5 stars. Review: \'Electrician arrived within 2 hours, wore safety gear and fixed it quickly. Very satisfied.\'','2026-10-08 19:16:06'),(38,10,8,'TICKET_LOGGED','Maintenance request CUT/GRV/2026/0010 logged by ashish.','2026-10-08 19:16:30'),(39,10,NULL,'AUTO_ROUTED','Auto-routing engine routed ticket to Estate Electrical Engineering Unit. Target SLA: 6 hours.','2026-10-08 19:16:30'),(40,10,7,'TECHNICIAN_ASSIGNED','Assigned to Rajesh Sharma (+91 98110 44219). Status updated to In-Progress. Technician instructed to carry replacement anchor regulator and safety test kit.','2026-10-08 19:16:30'),(41,10,7,'PHYSICALLY_RESOLVED','Resolution completed: Replaced burnt regulator with new Cona 5-step modular regulator. Tested and grounded properly. (Physical OTP 4027 verified)','2026-10-08 19:16:30'),(42,10,8,'STUDENT_RATED','Student rated maintenance service: 5/5 stars. Review: \'Electrician arrived within 2 hours, wore safety gear and fixed it quickly. Very satisfied.\'','2026-10-08 19:16:30'),(43,12,8,'TICKET_LOGGED','Maintenance request CUT/GRV/2026/0012 logged by ashish.','2026-10-09 14:06:09'),(44,12,NULL,'AUTO_ROUTED','Smart Routing Engine: Routed to Chief Mess Manager (Central Mess Advisory Committee) for kitchen quality control and dining contractor compliance. Target SLA: 4 hours.','2026-10-09 14:06:09'),(45,12,11,'TECHNICIAN_ASSIGNED','Assigned to biswajity (986986976969). Status updated to In-Progress. Assigned for on-site inspection and repair.','2026-10-09 14:09:44'),(46,12,11,'PHYSICALLY_RESOLVED','Resolution completed: fdhmdhgdhddhdf','2026-10-09 14:10:28'),(47,12,8,'STUDENT_RATED','Student rated maintenance service: 1/5 stars. Review: \'tetstststsdtdtdtdtetgfxjfxjfsjxfsjxxfxfsxfjsfxjsfxjsfxjqsfxjfxjg\'','2026-10-09 14:13:19'),(48,13,8,'TICKET_LOGGED','Maintenance request CUT/GRV/2026/0013 logged by ashish.','2026-10-09 20:04:06'),(49,13,NULL,'AUTO_ROUTED','Smart Routing Engine: Routed to Chief Hostel Warden (Hostel Administration & Caretaker Division) for residential inspection and duty caretaker delegation. Target SLA: 6 hours.','2026-10-09 20:04:06');
/*!40000 ALTER TABLE `grievance_timeline` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grievances`
--

DROP TABLE IF EXISTS `grievances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `grievances` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ticket_number` varchar(60) NOT NULL,
  `user_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `location_type` varchar(60) NOT NULL,
  `location_details` varchar(255) NOT NULL,
  `priority` enum('low','medium','high','emergency') DEFAULT 'medium',
  `status` enum('submitted','acknowledged','assigned','in_progress','resolved','escalated','closed','rejected') DEFAULT 'submitted',
  `sla_hours` int(11) NOT NULL DEFAULT 24,
  `sla_deadline` datetime NOT NULL,
  `assigned_department` varchar(150) NOT NULL,
  `assigned_staff_id` int(11) DEFAULT NULL,
  `assigned_technician_name` varchar(150) DEFAULT NULL,
  `assigned_technician_contact` varchar(50) DEFAULT NULL,
  `assigned_at` datetime DEFAULT NULL,
  `attachment_name` varchar(255) DEFAULT NULL,
  `attachment_url` varchar(255) DEFAULT NULL,
  `resolution_notes` text DEFAULT NULL,
  `resolution_otp` varchar(10) DEFAULT NULL,
  `resolved_at` datetime DEFAULT NULL,
  `is_escalated` tinyint(1) DEFAULT 0,
  `escalated_at` datetime DEFAULT NULL,
  `escalated_to` varchar(150) DEFAULT NULL,
  `escalation_reason` text DEFAULT NULL,
  `student_rating` int(11) DEFAULT NULL,
  `student_feedback` text DEFAULT NULL,
  `rated_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ticket_number` (`ticket_number`),
  KEY `assigned_staff_id` (`assigned_staff_id`),
  KEY `idx_grv_user` (`user_id`),
  KEY `idx_grv_cat` (`category_id`),
  KEY `idx_grv_status` (`status`),
  KEY `idx_grv_deadline` (`sla_deadline`),
  CONSTRAINT `grievances_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `grievances_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `grievance_categories` (`id`),
  CONSTRAINT `grievances_ibfk_3` FOREIGN KEY (`assigned_staff_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grievances`
--

LOCK TABLES `grievances` WRITE;
/*!40000 ALTER TABLE `grievances` DISABLE KEYS */;
INSERT INTO `grievances` VALUES (1,'CUT/GRV/2026/001',8,2,'Ceiling fan capacitor failure and sparking charging point','The ceiling fan in Room B-204 turns at very low RPM even on regulator level 5. Also, the secondary 3-pin laptop socket shows intermittent sparking and smell of overheated plastic.','hostel_room','Boys Hostel Block B, Room B-204','high','in_progress',12,'2026-10-09 05:04:49','Estate Electrical Engineering Unit',7,'Ramesh Kumar (Senior Electrical Technician)','+91 98765-43210','2026-10-09 00:34:49',NULL,NULL,NULL,'7421',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-08 15:04:49','2026-10-08 19:04:49'),(2,'CUT/GRV/2026/002',8,3,'Wi-Fi Access Point CUT-HOSTEL-B2 dropping connections intermittently','High packet loss and random disconnection from campus intranet during peak evening study hours (8 PM - 11 PM).','hostel_room','Boys Hostel Block B, 2nd Floor Corridor','medium','resolved',24,'2026-10-06 21:04:49','Central Computer & Network Center',5,'V. K. Sharma (Network Systems Engineer)','+91 98112-33445','2026-10-07 08:34:49',NULL,NULL,'Replaced crimped RJ45 patch connector on PoE switch port 14 and upgraded access point firmware to v4.8. Signal strength verified at -52 dBm across rooms B-201 to B-208.','3918','2026-10-07 09:04:49',0,NULL,NULL,NULL,5,'Wi-Fi connection is rock solid now. Speed tested at 115 Mbps. Thank you!','2026-10-09 00:34:49','2026-10-06 15:04:49','2026-10-08 19:04:49'),(3,'CUT/GRV/2026/003',9,4,'Overhead ceiling projector HDMI color tint in Lecture Hall C-201','The digital ceiling projector in Hall C-201 exhibits severe pink tint and drops HDMI video input every 15 minutes during MCA Section A lectures.','academic_block','Lecture Hall C-201','medium','assigned',48,'2026-10-10 09:04:49','Department Academic Grievance Cell',3,'Lab Incharge - Multimedia Systems',NULL,NULL,NULL,NULL,NULL,'6245',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-08 13:04:49','2026-10-08 19:04:49'),(4,'CUT/GRV/2026/004',8,6,'Main plumbing pipe leakage causing floor flooding','Continuous water leakage from main flush inlet pipe near stall 3 causing water accumulation in common passage.','hostel_room','Hostel Block B, 1st Floor East Washroom','high','escalated',12,'2026-10-08 16:04:49','Estate Sanitation & Housekeeping Unit',7,NULL,NULL,NULL,NULL,NULL,NULL,'9154',NULL,1,'2026-10-08 22:34:49','Chief Hostel Warden & Estate Officer','SLA breached by 5 hours without technician dispatch. Automatically escalated to executive leadership tier.',NULL,NULL,NULL,'2026-10-08 02:04:49','2026-10-08 19:04:49'),(5,'CUT/GRV/2026/0005',8,2,'Ceiling Fan Regulator Sparking and High Noise','The ceiling fan speed regulator in Room 204 B-Block is throwing visible sparks whenever switched from speed 2 to 3. Needs immediate replacement before short circuit occurs.','hostel_room','Boys Hostel Block B, Room B-204','high','submitted',6,'2026-10-09 03:13:18','Estate Electrical Engineering Unit (Hostel Division)',7,NULL,NULL,NULL,NULL,NULL,NULL,'8863',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-08 19:13:18','2026-10-09 09:21:49'),(6,'CUT/GRV/2026/0006',8,2,'Ceiling Fan Regulator Sparking and High Noise','The ceiling fan speed regulator in Room 204 B-Block is throwing visible sparks whenever switched from speed 2 to 3. Needs immediate replacement before short circuit occurs.','hostel_room','Boys Hostel Block B - Room 204','high','closed',6,'2026-10-09 03:15:02','Estate Electrical Engineering Unit (Hostel Division)',7,'Rajesh Sharma','+91 98110 44219','2026-10-09 00:45:02',NULL,NULL,'Replaced burnt regulator with new Cona 5-step modular regulator. Tested and grounded properly.','6476','2026-10-09 00:45:02',0,NULL,NULL,NULL,5,'Electrician arrived within 2 hours, wore safety gear and fixed it quickly. Very satisfied.','2026-10-09 00:45:02','2026-10-08 19:15:02','2026-10-09 09:21:49'),(7,'CUT/GRV/2026/0007',8,2,'Ceiling Fan Regulator Sparking and High Noise','The ceiling fan speed regulator in Room 204 B-Block is throwing visible sparks whenever switched from speed 2 to 3. Needs immediate replacement before short circuit occurs.','hostel_room','Boys Hostel Block B - Room 204','high','closed',6,'2026-10-09 03:15:36','Estate Electrical Engineering Unit (Hostel Division)',7,'Rajesh Sharma','+91 98110 44219','2026-10-09 00:45:36',NULL,NULL,'Replaced burnt regulator with new Cona 5-step modular regulator. Tested and grounded properly.','7634','2026-10-09 00:45:36',0,NULL,NULL,NULL,5,'Electrician arrived within 2 hours, wore safety gear and fixed it quickly. Very satisfied.','2026-10-09 00:45:36','2026-10-08 19:15:36','2026-10-09 09:21:49'),(8,'CUT/GRV/2026/0008',8,2,'Ceiling Fan Regulator Sparking and High Noise','The ceiling fan speed regulator in Room 204 B-Block is throwing visible sparks whenever switched from speed 2 to 3. Needs immediate replacement before short circuit occurs.','hostel_room','Boys Hostel Block B - Room 204','high','closed',6,'2026-10-09 03:15:52','Estate Electrical Engineering Unit (Hostel Division)',7,'Rajesh Sharma','+91 98110 44219','2026-10-09 00:45:52',NULL,NULL,'Replaced burnt regulator with new Cona 5-step modular regulator. Tested and grounded properly.','4854','2026-10-09 00:45:52',0,NULL,NULL,NULL,5,'Electrician arrived within 2 hours, wore safety gear and fixed it quickly. Very satisfied.','2026-10-09 00:45:53','2026-10-08 19:15:52','2026-10-09 09:21:49'),(9,'CUT/GRV/2026/0009',8,2,'Ceiling Fan Regulator Sparking and High Noise','The ceiling fan speed regulator in Room 204 B-Block is throwing visible sparks whenever switched from speed 2 to 3. Needs immediate replacement before short circuit occurs.','hostel_room','Boys Hostel Block B - Room 204','high','closed',6,'2026-10-09 03:16:06','Estate Electrical Engineering Unit (Hostel Division)',7,'Rajesh Sharma','+91 98110 44219','2026-10-09 00:46:06',NULL,NULL,'Replaced burnt regulator with new Cona 5-step modular regulator. Tested and grounded properly.','8440','2026-10-09 00:46:06',0,NULL,NULL,NULL,5,'Electrician arrived within 2 hours, wore safety gear and fixed it quickly. Very satisfied.','2026-10-09 00:46:06','2026-10-08 19:16:06','2026-10-09 09:21:49'),(10,'CUT/GRV/2026/0010',8,2,'Ceiling Fan Regulator Sparking and High Noise','The ceiling fan speed regulator in Room 204 B-Block is throwing visible sparks whenever switched from speed 2 to 3. Needs immediate replacement before short circuit occurs.','hostel_room','Boys Hostel Block B - Room 204','high','closed',6,'2026-10-09 03:16:30','Estate Electrical Engineering Unit (Hostel Division)',7,'Rajesh Sharma','+91 98110 44219','2026-10-09 00:46:30',NULL,NULL,'Replaced burnt regulator with new Cona 5-step modular regulator. Tested and grounded properly.','4027','2026-10-09 00:46:30',0,NULL,NULL,NULL,5,'Electrician arrived within 2 hours, wore safety gear and fixed it quickly. Very satisfied.','2026-10-09 00:46:30','2026-10-08 19:16:30','2026-10-09 09:21:49'),(11,'CUT/GRV/2026/0011',8,5,'Dining Hall Drinking Water RO Purifier Filter Replacement','Drinking water dispenser at dining counter 2 has slight turbidity and filter service warning light is blinking. Requires RO candle replacement.','cafeteria_mess','Central Hostel Dining Hall — Water Station 2','high','in_progress',12,'2026-10-09 22:51:49','Central Mess Advisory & Food Safety Committee',11,'Ramesh Kumar (Catering Maintenance)','+91 94371 88201','2026-10-09 14:51:49',NULL,NULL,NULL,'4821',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-09 05:21:49','2026-10-09 09:21:49'),(12,'CUT/GRV/2026/0012',8,5,'Dining Hall Food Quality & Kitchen Hygiene Concern','Drinking water purifier filter warning light is blinking and chapati hot-case heater is failing.','cafeteria_mess','akash bhawan','emergency','closed',4,'2026-10-09 20:06:09','Central Mess Advisory & Food Safety Committee',11,'biswajity','986986976969','2026-10-09 19:39:44',NULL,NULL,'fdhmdhgdhddhdf','6530','2026-10-09 19:40:28',0,NULL,NULL,NULL,1,'tetstststsdtdtdtdtetgfxjfxjfsjxfsjxxfxfsxfjsfxjsfxjsfxjqsfxjfxjg','2026-10-09 19:43:19','2026-10-09 14:06:09','2026-10-09 14:13:19'),(13,'CUT/GRV/2026/0013',8,6,'Hostel Washroom Pipe Leakage & Water Tap Overflow','Water tap is leaking continuously in 2nd-floor washroom, causing pooling near corridor passage.','hostel_room','Boys Hostel Block B, Room B-204','high','submitted',6,'2026-10-10 04:04:06','Hostel Administration & Caretaker Division',7,NULL,NULL,NULL,NULL,NULL,NULL,'4184',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-09 20:04:06','2026-10-09 20:04:06');
/*!40000 ALTER TABLE `grievances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hostel_leaves`
--

DROP TABLE IF EXISTS `hostel_leaves`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hostel_leaves` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `leave_number` varchar(32) NOT NULL,
  `student_id` int(11) NOT NULL,
  `hostel_name` varchar(100) NOT NULL,
  `room_number` varchar(30) NOT NULL,
  `leave_type` enum('home_visit','personal_work','festival_holiday','family_emergency','medical_home') DEFAULT 'home_visit',
  `destination` varchar(255) NOT NULL,
  `emergency_contact` varchar(30) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `departure_time` time DEFAULT '08:00:00',
  `return_time` time DEFAULT '20:00:00',
  `total_days` int(11) NOT NULL DEFAULT 1,
  `reason` text NOT NULL,
  `parent_consent_confirmed` tinyint(1) DEFAULT 1,
  `auto_close_mess` tinyint(1) DEFAULT 1,
  `mess_meals_paused_count` int(11) DEFAULT 0,
  `mess_rebate_credits_accrued` int(11) DEFAULT 0,
  `status` enum('pending','approved','rejected','departed','completed','cancelled') DEFAULT 'pending',
  `warden_action_by` int(11) DEFAULT NULL,
  `warden_remarks` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `leave_number` (`leave_number`),
  KEY `idx_student_status` (`student_id`,`status`),
  KEY `idx_dates` (`start_date`,`end_date`),
  KEY `idx_hostel` (`hostel_name`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hostel_leaves`
--

LOCK TABLES `hostel_leaves` WRITE;
/*!40000 ALTER TABLE `hostel_leaves` DISABLE KEYS */;
INSERT INTO `hostel_leaves` VALUES (1,'HL-2026-0041',1,'Boys Hostel Block B','B-204','festival_holiday','Sundargarh, Odisha (Home Residence)','+91 94370 12345','2026-10-18','2026-10-24','07:30:00','21:00:00',7,'Traveling home for Durga Puja & Dussehra family congregation and university mid-semester break.',1,1,28,700,'approved',7,'Verified with guardian over phone. Travel leave sanctioned; mess dining automatically paused for 7 days.','2026-10-09 12:30:13','2026-10-09 12:30:13'),(2,'HL-2026-0042',1,'Boys Hostel Block B','B-204','personal_work','Bhubaneswar (Passport Regional Office)','+91 94370 12345','2026-10-29','2026-10-31','06:00:00','20:30:00',3,'Appointment at Regional Passport Office Bhubaneswar for urgent biometric verification.',1,1,12,300,'approved',7,'Verified with guardian (+91 94370 12345). Home leave sanctioned; mess dining automatically paused.','2026-10-09 12:30:13','2026-10-09 12:51:02'),(3,'HL-2026-0003',1,'Boys Hostel Block B','B-204','medical_home','rourkela','+91 94370 12345','2026-10-14','2026-10-19','08:00:00','20:00:00',6,'holidays',1,1,24,600,'approved',7,'Verified with guardian (+91 94370 12345). Home leave sanctioned; mess dining automatically paused.','2026-10-09 12:43:36','2026-10-09 12:50:54'),(4,'HL-2026-0004',1,'Boys Hostel Block B','B-204','medical_home','rourkela','+91 94370 12345','2026-10-14','2026-10-18','08:00:00','20:00:00',5,'test',1,1,20,500,'approved',7,'Verified with guardian (+91 94370 12345). Home leave sanctioned; mess dining automatically paused.','2026-10-09 12:45:55','2026-10-09 12:50:49'),(5,'HL-2026-0005',1,'Boys Hostel Block B','B-204','home_visit','rkl','+91 94370 12345','2026-10-12','2026-10-24','10:02:00','07:19:00',13,'atdtktcktd c tdtcu dduclducdlu',1,1,52,1300,'approved',7,'Verified with guardian (+91 94370 12345). Home leave sanctioned; mess dining automatically paused.','2026-10-09 14:24:58','2026-10-09 14:26:16'),(6,'HL-2026-0006',1,'Boys Hostel Block B','B-204','home_visit','hgcc','+91 94370 12345','2026-10-10','2026-10-12','08:00:00','20:00:00',3,'uyh',1,1,12,300,'approved',7,'Verified with guardian (+91 94370 12345). Home leave sanctioned; mess dining automatically paused.','2026-10-09 14:30:25','2026-10-09 14:30:34'),(7,'HL-2026-0007',1,'Boys Hostel Block B','B-204','home_visit','rkl','+91 94370 12345','2026-10-10','2026-10-14','08:00:00','20:00:00',5,'it imp',1,1,20,500,'approved',7,'Verified with guardian (+91 94370 12345). Home leave sanctioned; mess dining automatically paused.','2026-10-09 16:32:28','2026-10-09 16:32:49'),(8,'HL-2026-0008',1,'Boys Hostel Block B','B-204','home_visit','rkl','+91 94370 12345','2026-10-11','2026-10-14','08:00:00','20:00:00',4,'this is a test',1,1,16,400,'approved',7,'Verified with guardian (+91 94370 12345). Home leave sanctioned; mess dining automatically paused.','2026-10-09 17:30:17','2026-10-09 17:31:33'),(9,'HL-2026-0009',7,'Boys Hostel Block B','B-204','home_visit','eye','+91 94370 12345','2026-10-15','2026-10-24','08:00:00','20:00:00',10,'ear',1,1,40,1000,'approved',7,'Verified with guardian (+91 94370 12345). Home leave sanctioned; mess dining automatically paused.','2026-10-09 17:41:14','2026-10-09 17:44:18'),(10,'HL-2026-0010',1,'Boys Hostel Block B','B-204','home_visit','rkl','+91 94370 12345','2026-10-16','2026-10-18','08:00:00','20:00:00',3,'test',1,1,12,300,'approved',7,'Verified with guardian (+91 94370 12345). Home leave sanctioned; mess dining automatically paused.','2026-10-09 19:53:43','2026-10-09 19:54:01'),(11,'HL-2026-0011',1,'Boys Hostel Block B','B-204','home_visit','test','+91 94370 12345','2026-10-14','2026-10-18','08:00:00','20:00:00',5,'test1',1,1,20,500,'approved',7,'Verified with guardian (+91 94370 12345). Home leave sanctioned; mess dining automatically paused.','2026-10-09 19:56:17','2026-10-09 19:56:36');
/*!40000 ALTER TABLE `hostel_leaves` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mess_feedback`
--

DROP TABLE IF EXISTS `mess_feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mess_feedback` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `meal_type` enum('breakfast','lunch','snacks','dinner') NOT NULL,
  `rating_taste` tinyint(4) NOT NULL DEFAULT 4,
  `rating_hygiene` tinyint(4) NOT NULL DEFAULT 4,
  `comment` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_feedback_date` (`date`,`meal_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mess_feedback`
--

LOCK TABLES `mess_feedback` WRITE;
/*!40000 ALTER TABLE `mess_feedback` DISABLE KEYS */;
/*!40000 ALTER TABLE `mess_feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mess_menu`
--

DROP TABLE IF EXISTS `mess_menu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mess_menu` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `day_of_week` enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
  `meal_type` enum('breakfast','lunch','snacks','dinner') NOT NULL,
  `items` text NOT NULL,
  `nutritional_tags` varchar(100) DEFAULT 'Pure Vegetarian',
  `is_special` tinyint(1) DEFAULT 0,
  `cutoff_time` time NOT NULL DEFAULT '17:00:00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_mess_day_meal` (`day_of_week`,`meal_type`)
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mess_menu`
--

LOCK TABLES `mess_menu` WRITE;
/*!40000 ALTER TABLE `mess_menu` DISABLE KEYS */;
INSERT INTO `mess_menu` VALUES (1,'monday','breakfast','Idli, Sambhar, Coconut Chutney, Boiled Eggs / Banana, Tea/Coffee','South Indian Breakfast',0,'07:00:00'),(2,'monday','lunch','Steamed Rice, Yellow Dal Tadka, Seasonal Mix Veg, Paneer Bhurji / Egg Curry, Curd, Papad','Balanced Thali',0,'11:00:00'),(3,'monday','snacks','Veg Cutlet, Mint Chutney, Hot Masala Tea','Evening Snacks',0,'16:00:00'),(4,'monday','dinner','Tawa Roti, Jeera Rice, Dal Makhani, Aloo Gobhi Adraki, Gulab Jamun','North Indian Dinner',0,'17:00:00'),(5,'tuesday','breakfast','Aloo Paratha with White Butter, Pickle, Dahi, Tea/Coffee','Punjabi Breakfast',0,'07:00:00'),(6,'tuesday','lunch','Jeera Rice, Chana Dal, Bhindi Masala, Kadhi Pakoda, Boondi Raita','Regional Thali',0,'11:00:00'),(7,'tuesday','snacks','Samosa, Tamarind Chutney, Ginger Tea','Evening Snacks',0,'16:00:00'),(8,'tuesday','dinner','Butter Roti, Peas Pulao, Rajma Masala, Baingan Bharta, Moong Dal Halwa','Chef Special Dinner',1,'17:00:00'),(9,'wednesday','breakfast','Poha with Peanuts, Sev, Boiled Sprouts, Jalebi, Tea/Coffee','Light Breakfast',0,'07:00:00'),(10,'wednesday','lunch','Steamed Rice, Moong Dal, Lauki Kofta, Chicken Curry / Shahi Paneer, Green Salad','Non-Veg Option Day',1,'11:00:00'),(11,'wednesday','snacks','Upma, Coconut Chutney, Filter Coffee','Evening Snacks',0,'16:00:00'),(12,'wednesday','dinner','Phulka, Dal Fry, Kashmiri Dum Aloo, Jeera Pulao, Fruit Custard','Homestyle Dinner',0,'17:00:00'),(13,'thursday','breakfast','Masala Dosa, Idli (2 Pcs), Medu Vada, Drumstick Sambar, Coconut Chutney','High Protein',0,'07:00:00'),(14,'thursday','lunch','Rice, Dal Palak, Soya Chunk Curry, Aloo Beans, Curd, Roasted Papad','Nutritious Thali',0,'11:00:00'),(15,'thursday','snacks','Dhokla, Green Chilli, Masala Chai','Evening Snacks',0,'16:00:00'),(16,'thursday','dinner','Missi Roti, Dal Tadka, Mix Veg Kadai, Vegetable Khichdi, Kheer','Traditional Dinner',0,'17:00:00'),(17,'friday','breakfast','Methi Puri, Aloo Tamatar Sabzi, Curd, Tea/Coffee','Traditional Breakfast',0,'07:00:00'),(18,'friday','lunch','Veg Biryani, Mirchi Ka Salan, Dal Maharani, Boondi Raita, Onion Rings','Biryani Day',1,'11:00:00'),(19,'friday','snacks','Bread Pakoda, Sauce, Masala Tea','Evening Snacks',0,'16:00:00'),(20,'friday','dinner','Tandoori Roti, Dal Makhani, Paneer Butter Masala / Fish Curry, Rasgulla','Weekend Feast',1,'17:00:00'),(21,'saturday','breakfast','Pav Bhaji / Bread Butter Jam, Boiled Eggs, Tea/Coffee','Continental/Street Style',0,'07:00:00'),(22,'saturday','lunch','Steamed Rice, Arhar Dal, Chole Bhature, Cucumber Salad, Pickle','Weekend Special',1,'11:00:00'),(23,'saturday','snacks','Bhel Puri, Nimbu Pani / Tea','Evening Snacks',0,'16:00:00'),(24,'saturday','dinner','Tawa Roti, Dal Fry, Gatta Curry, Khichdi, Fruit Salad','Comfort Dinner',0,'17:00:00'),(25,'sunday','breakfast','Chole Kulche, Sweet Lassi, Fresh Fruits, Tea/Coffee','Sunday Brunch Special',1,'08:00:00'),(26,'sunday','lunch','Fried Rice, Veg Manchurian / Chilli Chicken, Hakka Noodles, Hot & Sour Soup','Oriental Sunday Special',1,'11:30:00'),(27,'sunday','snacks','Biscuits & Cookies, Hot Masala Tea','Evening Snacks',0,'16:00:00'),(28,'sunday','dinner','Phulka Roti, Dal Tadka, Aloo Shimlamirch, Jeera Rice, Ice Cream','Light Sunday Dinner',1,'17:00:00');
/*!40000 ALTER TABLE `mess_menu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mess_rsvps`
--

DROP TABLE IF EXISTS `mess_rsvps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mess_rsvps` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `meal_type` enum('breakfast','lunch','snacks','dinner') NOT NULL,
  `status` enum('attending','skipping') DEFAULT 'attending',
  `rebate_credits` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_mess_student_date_meal` (`student_id`,`date`,`meal_type`),
  KEY `idx_mess_date_meal` (`date`,`meal_type`)
) ENGINE=InnoDB AUTO_INCREMENT=277 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mess_rsvps`
--

LOCK TABLES `mess_rsvps` WRITE;
/*!40000 ALTER TABLE `mess_rsvps` DISABLE KEYS */;
INSERT INTO `mess_rsvps` VALUES (1,1,'2026-10-05','breakfast','attending',0,'2026-10-09 09:11:00'),(2,1,'2026-10-05','lunch','attending',0,'2026-10-09 09:11:00'),(3,1,'2026-10-05','snacks','attending',0,'2026-10-09 09:11:00'),(4,1,'2026-10-05','dinner','attending',0,'2026-10-09 09:11:00'),(5,1,'2026-10-06','breakfast','attending',0,'2026-10-09 09:11:00'),(6,1,'2026-10-06','lunch','attending',0,'2026-10-09 09:11:00'),(7,1,'2026-10-06','snacks','attending',0,'2026-10-09 09:11:00'),(8,1,'2026-10-06','dinner','attending',0,'2026-10-09 09:11:00'),(9,1,'2026-10-07','breakfast','attending',0,'2026-10-09 09:11:00'),(10,1,'2026-10-07','lunch','attending',0,'2026-10-09 09:11:00'),(11,1,'2026-10-07','snacks','attending',0,'2026-10-09 09:11:00'),(12,1,'2026-10-07','dinner','attending',0,'2026-10-09 09:11:00'),(13,1,'2026-10-08','breakfast','attending',0,'2026-10-09 09:11:00'),(14,1,'2026-10-08','lunch','attending',0,'2026-10-09 09:11:00'),(15,1,'2026-10-08','snacks','attending',0,'2026-10-09 09:11:00'),(16,1,'2026-10-08','dinner','attending',0,'2026-10-09 09:11:00'),(17,1,'2026-10-09','breakfast','attending',0,'2026-10-09 09:11:00'),(18,1,'2026-10-09','lunch','attending',0,'2026-10-09 09:11:00'),(19,1,'2026-10-09','snacks','attending',0,'2026-10-09 09:11:00'),(20,1,'2026-10-09','dinner','attending',0,'2026-10-09 09:11:00'),(21,1,'2026-10-10','breakfast','attending',0,'2026-10-09 09:11:00'),(22,1,'2026-10-10','lunch','skipping',25,'2026-10-09 09:11:00'),(23,1,'2026-10-10','snacks','skipping',25,'2026-10-09 09:11:00'),(24,1,'2026-10-10','dinner','skipping',25,'2026-10-09 09:11:00'),(25,1,'2026-10-11','breakfast','skipping',25,'2026-10-09 09:11:00'),(26,1,'2026-10-11','lunch','skipping',25,'2026-10-09 09:11:00'),(27,1,'2026-10-11','snacks','skipping',25,'2026-10-09 09:11:00'),(28,1,'2026-10-11','dinner','skipping',25,'2026-10-09 09:11:00'),(29,1,'2026-10-18','breakfast','skipping',25,'2026-10-09 12:30:13'),(30,1,'2026-10-18','lunch','skipping',25,'2026-10-09 12:30:13'),(31,1,'2026-10-18','snacks','skipping',25,'2026-10-09 12:30:13'),(32,1,'2026-10-18','dinner','skipping',25,'2026-10-09 12:30:13'),(33,1,'2026-10-19','breakfast','skipping',25,'2026-10-09 12:30:13'),(34,1,'2026-10-19','lunch','skipping',25,'2026-10-09 12:30:13'),(35,1,'2026-10-19','snacks','skipping',25,'2026-10-09 12:30:13'),(36,1,'2026-10-19','dinner','skipping',25,'2026-10-09 12:30:13'),(37,1,'2026-10-20','breakfast','skipping',25,'2026-10-09 12:30:13'),(38,1,'2026-10-20','lunch','skipping',25,'2026-10-09 12:30:13'),(39,1,'2026-10-20','snacks','skipping',25,'2026-10-09 12:30:13'),(40,1,'2026-10-20','dinner','skipping',25,'2026-10-09 12:30:13'),(41,1,'2026-10-21','breakfast','skipping',25,'2026-10-09 12:30:13'),(42,1,'2026-10-21','lunch','skipping',25,'2026-10-09 12:30:13'),(43,1,'2026-10-21','snacks','skipping',25,'2026-10-09 12:30:13'),(44,1,'2026-10-21','dinner','skipping',25,'2026-10-09 12:30:13'),(45,1,'2026-10-22','breakfast','skipping',25,'2026-10-09 12:30:13'),(46,1,'2026-10-22','lunch','skipping',25,'2026-10-09 12:30:13'),(47,1,'2026-10-22','snacks','skipping',25,'2026-10-09 12:30:13'),(48,1,'2026-10-22','dinner','skipping',25,'2026-10-09 12:30:13'),(49,1,'2026-10-23','breakfast','skipping',25,'2026-10-09 12:30:13'),(50,1,'2026-10-23','lunch','skipping',25,'2026-10-09 12:30:13'),(51,1,'2026-10-23','snacks','skipping',25,'2026-10-09 12:30:13'),(52,1,'2026-10-23','dinner','skipping',25,'2026-10-09 12:30:13'),(53,1,'2026-10-24','breakfast','skipping',25,'2026-10-09 12:30:13'),(54,1,'2026-10-24','lunch','skipping',25,'2026-10-09 12:30:13'),(55,1,'2026-10-24','snacks','skipping',25,'2026-10-09 12:30:13'),(56,1,'2026-10-24','dinner','skipping',25,'2026-10-09 12:30:13'),(57,1,'2026-10-14','breakfast','skipping',25,'2026-10-09 12:43:36'),(58,1,'2026-10-14','lunch','skipping',25,'2026-10-09 12:43:36'),(59,1,'2026-10-14','snacks','skipping',25,'2026-10-09 12:43:36'),(60,1,'2026-10-14','dinner','skipping',25,'2026-10-09 12:43:36'),(61,1,'2026-10-15','breakfast','skipping',25,'2026-10-09 12:43:36'),(62,1,'2026-10-15','lunch','skipping',25,'2026-10-09 12:43:36'),(63,1,'2026-10-15','snacks','skipping',25,'2026-10-09 12:43:36'),(64,1,'2026-10-15','dinner','skipping',25,'2026-10-09 12:43:36'),(65,1,'2026-10-16','breakfast','skipping',25,'2026-10-09 12:43:36'),(66,1,'2026-10-16','lunch','skipping',25,'2026-10-09 12:43:36'),(67,1,'2026-10-16','snacks','skipping',25,'2026-10-09 12:43:36'),(68,1,'2026-10-16','dinner','skipping',25,'2026-10-09 12:43:36'),(69,1,'2026-10-17','breakfast','skipping',25,'2026-10-09 12:43:36'),(70,1,'2026-10-17','lunch','skipping',25,'2026-10-09 12:43:36'),(71,1,'2026-10-17','snacks','skipping',25,'2026-10-09 12:43:36'),(72,1,'2026-10-17','dinner','skipping',25,'2026-10-09 12:43:36'),(101,1,'2026-10-12','breakfast','skipping',25,'2026-10-09 14:24:58'),(102,1,'2026-10-12','lunch','skipping',25,'2026-10-09 14:24:58'),(103,1,'2026-10-12','snacks','skipping',25,'2026-10-09 14:24:58'),(104,1,'2026-10-12','dinner','skipping',25,'2026-10-09 14:24:58'),(105,1,'2026-10-13','breakfast','skipping',25,'2026-10-09 14:24:58'),(106,1,'2026-10-13','lunch','skipping',25,'2026-10-09 14:24:58'),(107,1,'2026-10-13','snacks','skipping',25,'2026-10-09 14:24:58'),(108,1,'2026-10-13','dinner','skipping',25,'2026-10-09 14:24:58'),(187,7,'2026-10-10','breakfast','attending',0,'2026-10-09 16:42:39'),(205,7,'2026-10-15','breakfast','skipping',25,'2026-10-09 17:41:14'),(206,7,'2026-10-15','lunch','skipping',25,'2026-10-09 17:41:14'),(207,7,'2026-10-15','snacks','skipping',25,'2026-10-09 17:41:14'),(208,7,'2026-10-15','dinner','skipping',25,'2026-10-09 17:41:14'),(209,7,'2026-10-16','breakfast','skipping',25,'2026-10-09 17:41:14'),(210,7,'2026-10-16','lunch','skipping',25,'2026-10-09 17:41:14'),(211,7,'2026-10-16','snacks','skipping',25,'2026-10-09 17:41:14'),(212,7,'2026-10-16','dinner','skipping',25,'2026-10-09 17:41:14'),(213,7,'2026-10-17','breakfast','skipping',25,'2026-10-09 17:41:14'),(214,7,'2026-10-17','lunch','skipping',25,'2026-10-09 17:41:14'),(215,7,'2026-10-17','snacks','skipping',25,'2026-10-09 17:41:14'),(216,7,'2026-10-17','dinner','skipping',25,'2026-10-09 17:41:14'),(217,7,'2026-10-18','breakfast','skipping',25,'2026-10-09 17:41:14'),(218,7,'2026-10-18','lunch','skipping',25,'2026-10-09 17:41:14'),(219,7,'2026-10-18','snacks','skipping',25,'2026-10-09 17:41:14'),(220,7,'2026-10-18','dinner','skipping',25,'2026-10-09 17:41:14'),(221,7,'2026-10-19','breakfast','skipping',25,'2026-10-09 17:41:14'),(222,7,'2026-10-19','lunch','skipping',25,'2026-10-09 17:41:14'),(223,7,'2026-10-19','snacks','skipping',25,'2026-10-09 17:41:14'),(224,7,'2026-10-19','dinner','skipping',25,'2026-10-09 17:41:14'),(225,7,'2026-10-20','breakfast','skipping',25,'2026-10-09 17:41:14'),(226,7,'2026-10-20','lunch','skipping',25,'2026-10-09 17:41:14'),(227,7,'2026-10-20','snacks','skipping',25,'2026-10-09 17:41:14'),(228,7,'2026-10-20','dinner','skipping',25,'2026-10-09 17:41:14'),(229,7,'2026-10-21','breakfast','skipping',25,'2026-10-09 17:41:14'),(230,7,'2026-10-21','lunch','skipping',25,'2026-10-09 17:41:14'),(231,7,'2026-10-21','snacks','skipping',25,'2026-10-09 17:41:14'),(232,7,'2026-10-21','dinner','skipping',25,'2026-10-09 17:41:14'),(233,7,'2026-10-22','breakfast','skipping',25,'2026-10-09 17:41:14'),(234,7,'2026-10-22','lunch','skipping',25,'2026-10-09 17:41:14'),(235,7,'2026-10-22','snacks','skipping',25,'2026-10-09 17:41:14'),(236,7,'2026-10-22','dinner','skipping',25,'2026-10-09 17:41:14'),(237,7,'2026-10-23','breakfast','skipping',25,'2026-10-09 17:41:14'),(238,7,'2026-10-23','lunch','skipping',25,'2026-10-09 17:41:14'),(239,7,'2026-10-23','snacks','skipping',25,'2026-10-09 17:41:14'),(240,7,'2026-10-23','dinner','skipping',25,'2026-10-09 17:41:14'),(241,7,'2026-10-24','breakfast','skipping',25,'2026-10-09 17:41:14'),(242,7,'2026-10-24','lunch','skipping',25,'2026-10-09 17:41:14'),(243,7,'2026-10-24','snacks','skipping',25,'2026-10-09 17:41:14'),(244,7,'2026-10-24','dinner','skipping',25,'2026-10-09 17:41:14');
/*!40000 ALTER TABLE `mess_rsvps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notice_automation_settings`
--

DROP TABLE IF EXISTS `notice_automation_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notice_automation_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `is_enabled` tinyint(1) DEFAULT 1,
  `interval_hours` int(11) DEFAULT 1,
  `quiet_hours_enabled` tinyint(1) DEFAULT 1,
  `quiet_hours_start` time DEFAULT '00:00:00',
  `quiet_hours_end` time DEFAULT '05:00:00',
  `max_reminders_per_student` int(11) DEFAULT 5,
  `initial_delay_hours` int(11) DEFAULT 1,
  `warning_tone` varchar(50) DEFAULT 'statutory',
  `custom_directive_note` text DEFAULT NULL,
  `last_run_at` datetime DEFAULT NULL,
  `last_run_status` varchar(50) DEFAULT 'idle',
  `last_run_summary` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`last_run_summary`)),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notice_automation_settings`
--

LOCK TABLES `notice_automation_settings` WRITE;
/*!40000 ALTER TABLE `notice_automation_settings` DISABLE KEYS */;
INSERT INTO `notice_automation_settings` VALUES (1,1,2,1,'01:11:00','05:00:00',5,2,'statutory','Urgent Notice: This is an automated periodic reminder. You are mandated to submit your formal acknowledgment immediately.','2026-10-09 16:20:50','completed','{\"run_at\":\"2026-10-09 12:50:50\",\"dispatched_count\":4,\"evaluated_students\":4,\"skipped_count\":0,\"bypassed_quiet_hours\":true,\"bypassed_interval\":false}','2026-10-09 10:50:50');
/*!40000 ALTER TABLE `notice_automation_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notice_reads`
--

DROP TABLE IF EXISTS `notice_reads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notice_reads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `notice_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `first_read_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `acknowledged_at` timestamp NULL DEFAULT NULL,
  `acknowledgment_note` varchar(255) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_notice` (`notice_id`,`user_id`),
  KEY `user_id` (`user_id`),
  KEY `idx_notice_reads_audit` (`notice_id`,`acknowledged_at`),
  CONSTRAINT `notice_reads_ibfk_1` FOREIGN KEY (`notice_id`) REFERENCES `notices` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notice_reads_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notice_reads`
--

LOCK TABLES `notice_reads` WRITE;
/*!40000 ALTER TABLE `notice_reads` DISABLE KEYS */;
INSERT INTO `notice_reads` VALUES (4,7,9,'2026-10-02 04:44:22','2026-10-02 04:45:05','Understood and UGC portal reference recorded','127.0.0.1'),(5,13,9,'2026-10-08 04:00:00','2026-10-08 04:02:15','Will attend with Section A agenda points','127.0.0.1'),(6,8,9,'2026-10-04 08:50:00','2026-10-04 08:52:10','Cleared exam rules','127.0.0.1'),(7,8,8,'2026-10-05 03:00:00',NULL,NULL,'127.0.0.1'),(8,13,1,'2026-10-08 16:26:42',NULL,NULL,'127.0.0.1'),(9,11,1,'2026-10-08 16:34:56',NULL,NULL,'127.0.0.1'),(10,13,7,'2026-10-08 18:18:30','2026-10-08 18:19:34','CUT/DIR/SENATE/2026/012','127.0.0.1'),(13,7,8,'2026-10-08 18:19:49','2026-10-08 18:20:06','CUT/DIR/CIR/2026/041','127.0.0.1'),(32,10,8,'2026-10-08 18:54:06',NULL,NULL,'127.0.0.1'),(33,13,2,'2026-10-09 14:00:10',NULL,NULL,'127.0.0.1'),(34,14,2,'2026-10-09 14:03:50','2026-10-09 14:04:00','Acknowledged and registered by student','127.0.0.1'),(36,14,8,'2026-10-09 14:49:23','2026-10-09 14:49:23','Acknowledged and registered by student via Campus Hub','127.0.0.1'),(37,14,4,'2026-10-09 16:48:34','2026-10-09 16:48:37','Acknowledged and registered by student','127.0.0.1'),(39,14,1,'2026-10-09 18:52:15',NULL,NULL,'127.0.0.1');
/*!40000 ALTER TABLE `notice_reads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notice_reminders`
--

DROP TABLE IF EXISTS `notice_reminders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notice_reminders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `notice_id` int(11) NOT NULL,
  `sender_user_id` int(11) NOT NULL,
  `recipient_user_id` int(11) NOT NULL,
  `recipient_email` varchar(150) NOT NULL,
  `recipient_name` varchar(150) NOT NULL,
  `recipient_roll` varchar(50) NOT NULL,
  `email_subject` varchar(255) NOT NULL,
  `email_body` text NOT NULL,
  `custom_note` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `is_automated` tinyint(1) DEFAULT 0,
  `reminder_sequence` int(11) DEFAULT 1,
  `trigger_reason` varchar(100) DEFAULT 'manual',
  `dispatched_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_rem_recipient` (`recipient_user_id`,`is_read`),
  KEY `idx_rem_notice` (`notice_id`,`dispatched_at`),
  KEY `sender_user_id` (`sender_user_id`),
  CONSTRAINT `notice_reminders_ibfk_1` FOREIGN KEY (`notice_id`) REFERENCES `notices` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notice_reminders_ibfk_2` FOREIGN KEY (`sender_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notice_reminders_ibfk_3` FOREIGN KEY (`recipient_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notice_reminders`
--

LOCK TABLES `notice_reminders` WRITE;
/*!40000 ALTER TABLE `notice_reminders` DISABLE KEYS */;
INSERT INTO `notice_reminders` VALUES (1,7,2,8,'ashish.toppo@student.campus.edu','Ashish Toppo','24050101','[URGENT STATUTORY REMINDER] Mandatory Anti-Ragging Undertaking Acknowledgment Required','Dear Ashish Toppo (Roll No: 24050101),\n\nOur central institutional records indicate that you have NOT yet submitted your formal acknowledgment for the following statutory university directive:\n\n--------------------------------------------------------------------------------\nCircular Reference: CUT/NOT/2026/001\nDirective Subject:  Mandatory Anti-Ragging Institutional Undertaking & Supreme Court Compliance Guidelines (2026-27)\nIssuing Authority:  Dr. Radhakrishnan Pillai (Director / Principal)\n--------------------------------------------------------------------------------\n\nURGENT INSTRUCTION FROM DIRECTORATE:\nFinal reminder before semester registration debarment. Please record your acknowledgment immediately.\n\nAs per the directives of the Hon\'ble Supreme Court of India and university bylaws, you are required to log into the Central ERP portal (http://localhost:5173/notices) immediately, review the circular text, and click the \'I Acknowledge & Understand\' button.\n\nFailure to record your institutional acknowledgment may lead to suspension of hostel amenities and semester examination debarment.\n\nRegards,\nCentral Governance & Compliance Registry\nCentral University of Technology','Final reminder before semester registration debarment. Please record your acknowledgment immediately.',0,0,1,'manual','2026-10-08 18:04:53'),(2,7,2,10,'aarav.robotics@student.campus.edu','Aarav Verma','23010145','[AUTOMATED REMINDER #1] Action Required: CUT/NOT/2026/001 — Mandatory Anti-Ragging Institutional Undertaking & Supreme Court Compliance Guidelines (2026-27)','Dear Aarav Verma (Roll No: 23010145),\n\nThis is an AUTOMATED PERIODIC COMPLIANCE REMINDER (Dispatch #1) generated by the Central Institutional Governance Daemon.\n\nOfficial records verify that you have NOT yet submitted your mandatory statutory acknowledgment for the following circular:\n\n--------------------------------------------------------------------------------\nCircular Reference: CUT/DIR/CIR/2026/041\nDirective Subject:  Mandatory Anti-Ragging Institutional Undertaking & Supreme Court Compliance Guidelines (2026-27)\nPromulgated Date:   2026-10-01 09:30:00\nTarget Cohort:      all\nIssuing Officer:    Dr. Radhakrishnan Pillai (Director / Principal)\n--------------------------------------------------------------------------------\n\nDIRECTIVE DETAILS & WARNING:\nUrgent Notice: This is an automated periodic reminder. You are mandated to submit your formal acknowledgment immediately.\n\nSCHEDULED INTERVAL DISPATCH POLICY:\nThis automated daemon dispatches notifications at intervals of 2 hour(s) exclusively to unacknowledged students (excluding the designated overnight quiet window between 12:00 AM and 05:00 AM).\n\nYou are instructed to log into the Central ERP portal (http://localhost:5173/notices) immediately and record your institutional acknowledgment.\n\nFailure to comply will escalate your record to the Dean of Academic Affairs and may result in examination hall ticket debarment.\n\nRegards,\nCentral Automated Governance System\nCentral University of Technology','Urgent Notice: This is an automated periodic reminder. You are mandated to submit your formal acknowledgment immediately.',0,1,1,'automated_interval','2026-10-09 10:50:50'),(3,8,6,8,'ashish.toppo@student.campus.edu','Ashish Toppo','24050101','[AUTOMATED REMINDER #1] Action Required: CUT/NOT/2026/002 — Autumn End-Semester 2026 Examination Registration Deadline & Hall Ticket Window','Dear Ashish Toppo (Roll No: 24050101),\n\nThis is an AUTOMATED PERIODIC COMPLIANCE REMINDER (Dispatch #1) generated by the Central Institutional Governance Daemon.\n\nOfficial records verify that you have NOT yet submitted your mandatory statutory acknowledgment for the following circular:\n\n--------------------------------------------------------------------------------\nCircular Reference: CUT/COE/EXAM/2026/088\nDirective Subject:  Autumn End-Semester 2026 Examination Registration Deadline & Hall Ticket Window\nPromulgated Date:   2026-10-03 11:15:00\nTarget Cohort:      all\nIssuing Officer:    Dr. Vandana Saxena (Controller of Examinations)\n--------------------------------------------------------------------------------\n\nDIRECTIVE DETAILS & WARNING:\nUrgent Notice: This is an automated periodic reminder. You are mandated to submit your formal acknowledgment immediately.\n\nSCHEDULED INTERVAL DISPATCH POLICY:\nThis automated daemon dispatches notifications at intervals of 2 hour(s) exclusively to unacknowledged students (excluding the designated overnight quiet window between 12:00 AM and 05:00 AM).\n\nYou are instructed to log into the Central ERP portal (http://localhost:5173/notices) immediately and record your institutional acknowledgment.\n\nFailure to comply will escalate your record to the Dean of Academic Affairs and may result in examination hall ticket debarment.\n\nRegards,\nCentral Automated Governance System\nCentral University of Technology','Urgent Notice: This is an automated periodic reminder. You are mandated to submit your formal acknowledgment immediately.',0,1,1,'automated_interval','2026-10-09 10:50:50'),(4,8,6,10,'aarav.robotics@student.campus.edu','Aarav Verma','23010145','[AUTOMATED REMINDER #1] Action Required: CUT/NOT/2026/002 — Autumn End-Semester 2026 Examination Registration Deadline & Hall Ticket Window','Dear Aarav Verma (Roll No: 23010145),\n\nThis is an AUTOMATED PERIODIC COMPLIANCE REMINDER (Dispatch #1) generated by the Central Institutional Governance Daemon.\n\nOfficial records verify that you have NOT yet submitted your mandatory statutory acknowledgment for the following circular:\n\n--------------------------------------------------------------------------------\nCircular Reference: CUT/COE/EXAM/2026/088\nDirective Subject:  Autumn End-Semester 2026 Examination Registration Deadline & Hall Ticket Window\nPromulgated Date:   2026-10-03 11:15:00\nTarget Cohort:      all\nIssuing Officer:    Dr. Vandana Saxena (Controller of Examinations)\n--------------------------------------------------------------------------------\n\nDIRECTIVE DETAILS & WARNING:\nUrgent Notice: This is an automated periodic reminder. You are mandated to submit your formal acknowledgment immediately.\n\nSCHEDULED INTERVAL DISPATCH POLICY:\nThis automated daemon dispatches notifications at intervals of 2 hour(s) exclusively to unacknowledged students (excluding the designated overnight quiet window between 12:00 AM and 05:00 AM).\n\nYou are instructed to log into the Central ERP portal (http://localhost:5173/notices) immediately and record your institutional acknowledgment.\n\nFailure to comply will escalate your record to the Dean of Academic Affairs and may result in examination hall ticket debarment.\n\nRegards,\nCentral Automated Governance System\nCentral University of Technology','Urgent Notice: This is an automated periodic reminder. You are mandated to submit your formal acknowledgment immediately.',0,1,1,'automated_interval','2026-10-09 10:50:50'),(5,10,7,8,'ashish.toppo@student.campus.edu','Ashish Toppo','24050101','[AUTOMATED REMINDER #1] Action Required: CUT/NOT/2026/004 — Hostel Inspection & Electrical Safety Compliance — Boys Hostel Block B','Dear Ashish Toppo (Roll No: 24050101),\n\nThis is an AUTOMATED PERIODIC COMPLIANCE REMINDER (Dispatch #1) generated by the Central Institutional Governance Daemon.\n\nOfficial records verify that you have NOT yet submitted your mandatory statutory acknowledgment for the following circular:\n\n--------------------------------------------------------------------------------\nCircular Reference: CUT/HW/BHB/2026/054\nDirective Subject:  Hostel Inspection & Electrical Safety Compliance — Boys Hostel Block B\nPromulgated Date:   2026-10-06 16:45:00\nTarget Cohort:      hostel\nIssuing Officer:    Col. Mahendra Singh (Retd) (Chief Hostel Warden)\n--------------------------------------------------------------------------------\n\nDIRECTIVE DETAILS & WARNING:\nUrgent Notice: This is an automated periodic reminder. You are mandated to submit your formal acknowledgment immediately.\n\nSCHEDULED INTERVAL DISPATCH POLICY:\nThis automated daemon dispatches notifications at intervals of 2 hour(s) exclusively to unacknowledged students (excluding the designated overnight quiet window between 12:00 AM and 05:00 AM).\n\nYou are instructed to log into the Central ERP portal (http://localhost:5173/notices) immediately and record your institutional acknowledgment.\n\nFailure to comply will escalate your record to the Dean of Academic Affairs and may result in examination hall ticket debarment.\n\nRegards,\nCentral Automated Governance System\nCentral University of Technology','Urgent Notice: This is an automated periodic reminder. You are mandated to submit your formal acknowledgment immediately.',0,1,1,'automated_interval','2026-10-09 10:50:50');
/*!40000 ALTER TABLE `notice_reminders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notices`
--

DROP TABLE IF EXISTS `notices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `notice_number` varchar(60) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `category` enum('academic','administrative','examination','hostel_mess','cultural_sports','placement','general') DEFAULT 'general',
  `priority` enum('normal','important','urgent','circular') DEFAULT 'normal',
  `is_pinned` tinyint(1) DEFAULT 0,
  `requires_acknowledgment` tinyint(1) DEFAULT 0,
  `auto_reminders_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `target_scope` enum('all','department','semester','section','hostel','tag') DEFAULT 'all',
  `department_id` int(11) DEFAULT NULL,
  `program_id` int(11) DEFAULT NULL,
  `semester` int(11) DEFAULT NULL,
  `section` varchar(10) DEFAULT NULL,
  `hostel_name` varchar(100) DEFAULT NULL,
  `target_tag_id` int(11) DEFAULT NULL,
  `author_user_id` int(11) NOT NULL,
  `reference_circular_no` varchar(100) DEFAULT NULL,
  `attachment_name` varchar(255) DEFAULT NULL,
  `attachment_url` varchar(255) DEFAULT NULL,
  `attachment_size` varchar(50) DEFAULT NULL,
  `expires_at` date DEFAULT NULL,
  `status` enum('published','archived','draft') DEFAULT 'published',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `notice_number` (`notice_number`),
  KEY `department_id` (`department_id`),
  KEY `program_id` (`program_id`),
  KEY `target_tag_id` (`target_tag_id`),
  KEY `author_user_id` (`author_user_id`),
  KEY `idx_notice_scope` (`target_scope`,`department_id`,`semester`,`section`),
  KEY `idx_notice_created` (`created_at`,`is_pinned`),
  CONSTRAINT `notices_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `notices_ibfk_2` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `notices_ibfk_3` FOREIGN KEY (`target_tag_id`) REFERENCES `tags` (`id`) ON DELETE SET NULL,
  CONSTRAINT `notices_ibfk_4` FOREIGN KEY (`author_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notices`
--

LOCK TABLES `notices` WRITE;
/*!40000 ALTER TABLE `notices` DISABLE KEYS */;
INSERT INTO `notices` VALUES (7,'CUT/NOT/2026/001','Mandatory Anti-Ragging Institutional Undertaking & Supreme Court Compliance Guidelines (2026-27)','In accordance with the directives of the Hon\'ble Supreme Court of India and UGC Regulations on Curbing the Menace of Ragging in Higher Educational Institutions, all enrolled students across undergraduate and postgraduate programmes are hereby mandated to submit their annual Anti-Ragging Affidavit.\n\nFailure to record your institutional acknowledgment and verify your online submission reference before the stipulated deadline shall attract formal administrative inquiry and potential debarment from hostel amenities and semester examinations.\n\nAll students must read the attached statutory circular and formally record their acknowledgment on this ERP portal.','administrative','urgent',1,1,1,'all',NULL,NULL,NULL,NULL,NULL,NULL,2,'CUT/DIR/CIR/2026/041','UGC_Anti_Ragging_Statutory_Compliance_Directive.pdf','/documents/statutory/UGC_Anti_Ragging_2026.pdf','1.8 MB','2026-11-30','published','2026-10-01 04:00:00','2026-10-08 15:32:42'),(8,'CUT/NOT/2026/002','Autumn End-Semester 2026 Examination Registration Deadline & Hall Ticket Window','The Controller of Examinations announces that the online examination form verification and clearance window for the Autumn End-Semester 2026 session will close strictly at 05:00 PM IST on October 25, 2026.\n\nKey Directives:\n1. Minimum 75% aggregate lecture attendance across registered theory courses is non-negotiable for admit card issuance.\n2. Fee clearance receipt must reflect verified zero outstanding in the Finance Module.\n3. Physical Hall Tickets / Admit Cards will be distributed via designated department counters beginning October 28, 2026 upon physical presentation of the Student ID Card.\n\nAll eligible candidates must acknowledge this circular.','examination','circular',1,1,1,'all',NULL,NULL,NULL,NULL,NULL,NULL,6,'CUT/COE/EXAM/2026/088','EndSem_Autumn2026_Exam_Instructions_Rulebook.pdf','/documents/exams/EndSem_Autumn2026_Instructions.pdf','2.4 MB','2026-10-25','published','2026-10-03 05:45:00','2026-10-09 09:05:53'),(9,'CUT/NOT/2026/003','Department of CSE: Mid-Term Laboratory Practical Assessment & Code Audit Schedule','Attention: Students of Computer Science & Engineering (All Semesters).\n\nThe Departmental Academic Committee will conduct the Mid-Term Practical Evaluation and Code Audit from October 18 to October 21, 2026 in Computing Labs 102 & 204.\n\nAll students must bring:\n1. Physical Practical Record File signed by respective lab mentors.\n2. GitHub repository access for all lab submissions.\n3. Verified student ID card.','academic','important',0,0,1,'department',1,NULL,NULL,NULL,NULL,NULL,3,'CUT/CSE/HOD/2026/119','CSE_MidTerm_Lab_Evaluation_Roster.pdf','/documents/cse/CSE_Lab_Schedule.pdf','1.4 MB','2026-10-22','published','2026-10-05 08:30:00','2026-10-08 15:32:42'),(10,'CUT/NOT/2026/004','Hostel Inspection & Electrical Safety Compliance — Boys Hostel Block B','This notice is strictly directed to all residents of Boys Hostel Block B.\n\nA joint inspection team led by the Chief Hostel Warden and Campus Electrical Engineer will conduct room checks on Saturday, October 14, 2026 starting at 10:00 AM.\n\nAll residents are instructed to be present with their room keys and institutional identity cards. High-power heating appliances are strictly prohibited under hostel bylaws.','hostel_mess','important',0,1,1,'hostel',NULL,NULL,NULL,NULL,'Boys Hostel Block B',NULL,7,'CUT/HW/BHB/2026/054','Hostel_Safety_Bylaws_2026.pdf','/documents/hostel/BoysHostel_B_Bylaws.pdf','890 KB','2026-10-15','published','2026-10-06 11:15:00','2026-10-08 15:32:42'),(11,'CUT/NOT/2026/005','Distinguished Guest Lecture on Cloud Computing Systems — Venue Update (Section A)','Dear Classmates (Department of CSE, Semester 1, Section A),\n\nPlease note that tomorrow\'s distinguished guest lecture by Dr. Arindam Mitra (Principal Systems Architect) has been shifted to Seminar Hall 2 (Aryabhatta Complex) due to audiovisual setup.\n\nReporting time is 02:15 PM sharp. Attendance is compulsory and will count towards formal course credits.','academic','normal',0,0,1,'section',1,NULL,1,'A',NULL,NULL,9,'CUT/CSE/CR/2026/007',NULL,NULL,NULL,'2026-10-10','published','2026-10-07 04:50:00','2026-10-08 15:32:42'),(12,'CUT/NOT/2026/006','Campus Placement & Industry Internship Registration Sprint 2026','The Central Training & Placement Cell invites eligible students across all engineering branches to register on the National Career Portal.\n\nKey Dates:\n- Registration Window Opens: October 10, 2026\n- Resume Verification Counter: Administrative Block, Desk 4\n- Mandatory Pre-Placement Talk: Central Auditorium, October 16 at 11:00 AM.\n\nPlease verify that your verified ERP profile snapshot reflects updated contact info.','placement','important',0,0,1,'department',1,NULL,NULL,NULL,NULL,NULL,5,'CUT/TPO/2026/302','Campus_Placement_Roadmap_2026.pdf','/documents/placement/TPO_Roadmap_2026.pdf','3.1 MB','2026-10-16','published','2026-10-07 10:00:00','2026-10-08 15:32:42'),(13,'CUT/NOT/2026/007','Academic Senate Consultation Meeting with All Elected Class Representatives (CRs)','This directive is exclusively addressed to all officially recognized Class Representatives (CRs).\n\nThe Director will chair a special consultative session with student representatives on Friday, October 17, 2026 at 04:00 PM in the Senate Council Chamber.\n\nAgenda:\n1. Feedback on lecture delivery and laboratory equipment adequacy.\n2. Winter festival planning committee nominations.\n3. Student grievance redressal turnaround times.','administrative','urgent',1,1,1,'tag',NULL,NULL,NULL,NULL,NULL,1,2,'CUT/DIR/SENATE/2026/012','Senate_Consultation_Agenda_October2026.pdf','/documents/senate/CR_Meeting_Agenda.pdf','650 KB','2026-10-18','published','2026-10-08 02:30:00','2026-10-09 11:02:14'),(14,'CUT/NOT/2026/468','study well','All shortlisted teams must submit their ongoing work and deliverables on the Wooble Platform — the designated evaluation platform of BPUT Hackathon 2026 from Today onwards.\n\nTeams are required to complete this submission before the Mid-Level Evaluation starts. Please ensure your work is submitted on Wooble prior to your evaluation round.','academic','urgent',1,1,1,'all',2,NULL,NULL,NULL,NULL,NULL,2,'cut/67',NULL,NULL,NULL,NULL,'published','2026-10-09 14:03:43','2026-10-09 14:03:43');
/*!40000 ALTER TABLE `notices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(100) NOT NULL,
  `name` varchar(150) NOT NULL,
  `module` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (1,'view_own_profile','View Own Profile','profile','View verified student or staff profile','2026-10-08 03:38:01'),(2,'edit_own_profile','Edit Own Profile Details','profile','Request or update permitted profile items','2026-10-08 03:38:01'),(3,'view_student_profile','View Student Profiles','student','View full student ERP profiles within scope','2026-10-08 03:38:01'),(4,'manage_users','Manage Users & Credentials','admin','Create, update, deactivate user accounts','2026-10-08 03:38:01'),(5,'manage_roles_tags','Manage Roles and Tags','admin','Configure RBAC roles, tags and permissions','2026-10-08 03:38:01'),(6,'create_form','Create Smart Forms','forms','Design and publish dynamic ERP-linked forms','2026-10-08 03:38:01'),(7,'view_form_submissions','View Form Submissions','forms','View, search and export collected form data','2026-10-08 03:38:01'),(8,'publish_notice','Publish Campus Notices','notices','Create targeted campus announcements','2026-10-08 03:38:01'),(9,'view_notices','View Notices','notices','Read notices targeted to user role/group','2026-10-08 03:38:01'),(10,'create_service_request','Submit Service Requests','services','Apply for bonafide, fee structure, certificates','2026-10-08 03:38:01'),(11,'process_service_request','Process Service Requests','services','Approve, prepare and deliver student certificates','2026-10-08 03:38:01'),(12,'submit_complaint','Submit Grievance Complaint','complaints','Log maintenance or campus grievances','2026-10-08 03:38:01'),(13,'manage_complaints','Manage & Resolve Complaints','complaints','Assign, update SLA and resolve grievances','2026-10-08 03:38:01'),(14,'manage_attendance','Take & Edit Attendance','academics','Log lecture attendance for assigned batches','2026-10-08 03:38:01'),(15,'view_attendance','View Attendance Records','academics','View subject-wise attendance percentages','2026-10-08 03:38:01'),(16,'manage_exams','Manage Examinations','exams','Manage exam schedules, seating, hall tickets, marks','2026-10-08 03:38:01'),(17,'manage_hostel','Manage Hostel & Gate Passes','hostel','Approve leave, room allocation, mess toggle','2026-10-08 03:38:01'),(18,'manage_clubs','Manage Clubs & Events','clubs','Organize events, recruit members, publish club notices','2026-10-08 03:38:01'),(19,'view_command_center','View Command Center Analytics','analytics','Access high-level institutional overview','2026-10-08 03:38:01'),(20,'','apply_service_request','services','Review, approve, and issue official certificates','2026-10-08 14:51:41');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `programs`
--

DROP TABLE IF EXISTS `programs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `programs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `department_id` int(11) NOT NULL,
  `code` varchar(30) NOT NULL,
  `name` varchar(150) NOT NULL,
  `degree_level` enum('UG','PG','Diploma','Doctorate') DEFAULT 'UG',
  `duration_years` int(11) DEFAULT 4,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `programs_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `programs`
--

LOCK TABLES `programs` WRITE;
/*!40000 ALTER TABLE `programs` DISABLE KEYS */;
INSERT INTO `programs` VALUES (1,1,'MCA','Master of Computer Applications','PG',2,'2026-10-08 03:38:01'),(2,1,'BTECH-CSE','B.Tech in Computer Science and Engineering','UG',4,'2026-10-08 03:38:01'),(3,2,'BTECH-ECE','B.Tech in Electronics and Communication','UG',4,'2026-10-08 03:38:01'),(4,3,'BTECH-ME','B.Tech in Mechanical Engineering','UG',4,'2026-10-08 03:38:01');
/*!40000 ALTER TABLE `programs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role_permissions` (
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `permission_id` (`permission_id`),
  CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
INSERT INTO `role_permissions` VALUES (1,1),(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),(1,8),(1,9),(1,10),(1,11),(1,12),(1,13),(1,14),(1,15),(1,16),(1,17),(1,18),(1,19),(2,1),(2,3),(2,6),(2,7),(2,8),(2,9),(2,11),(2,13),(2,15),(2,19),(3,1),(3,3),(3,6),(3,7),(3,8),(3,9),(3,11),(3,14),(3,15),(3,19),(4,1),(4,3),(4,6),(4,7),(4,8),(4,9),(4,14),(4,15),(5,1),(5,3),(5,6),(5,7),(5,8),(5,9),(5,11),(5,13),(5,19),(6,1),(6,3),(6,6),(6,7),(6,8),(6,9),(6,16),(7,6),(7,7),(8,1),(8,3),(8,6),(8,7),(8,8),(8,9),(8,13),(8,17),(9,1),(9,2),(9,9),(9,10),(9,12),(9,15),(9,20),(10,1),(10,6),(10,7),(10,8),(10,9),(10,18);
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `display_name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'system_admin','System Administrator','Full system technical access, role & configuration management','2026-10-08 03:38:01'),(2,'director','Director / Principal','Institutional analytics, high-level approvals, campus visibility','2026-10-08 03:38:01'),(3,'hod','Head of Department (HOD)','Departmental oversight, approvals, teachers and students view','2026-10-08 03:38:01'),(4,'teacher','Faculty Member / Teacher','Class attendance, course materials, smart forms, student grading','2026-10-08 03:38:01'),(5,'admin_staff','Administrative Staff','Student service center, certificate processing, official letters','2026-10-08 03:38:01'),(6,'exam_admin','Examination Administrator','Admit cards, exam scheduling, marks moderation, result publishing','2026-10-08 03:38:01'),(7,'admission_staff','Admission Officer','Student admission intake, document verification, enrollment','2026-10-08 03:38:01'),(8,'warden','Hostel Warden','Hostel rooms, gate passes, hostel complaints, mess oversight','2026-10-08 03:38:01'),(9,'student','Student','Student self-service portal, forms, requests, attendance, results','2026-10-08 03:38:01'),(10,'club_coordinator','Club Coordinator','Club member roster, campus events, registrations','2026-10-08 03:38:01'),(11,'mess_manager','Mess Manager','Dining Contractor & Kitchen Operations Supervisor','2026-10-09 04:07:35');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_request_timeline`
--

DROP TABLE IF EXISTS `service_request_timeline`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `service_request_timeline` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `request_id` int(11) NOT NULL,
  `actor_user_id` int(11) NOT NULL,
  `action` varchar(80) NOT NULL,
  `previous_status` varchar(50) DEFAULT NULL,
  `new_status` varchar(50) NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_request` (`request_id`),
  CONSTRAINT `fk_timeline_request` FOREIGN KEY (`request_id`) REFERENCES `service_requests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_request_timeline`
--

LOCK TABLES `service_request_timeline` WRITE;
/*!40000 ALTER TABLE `service_request_timeline` DISABLE KEYS */;
INSERT INTO `service_request_timeline` VALUES (1,1,8,'Request Submitted',NULL,'submitted','Application submitted with verified ERP profile snapshot.','2026-10-08 05:21:41'),(2,1,3,'Under Review','submitted','under_review','Verified student enrollment with Department of Computer Science & Engineering records.','2026-10-08 08:21:41'),(3,1,3,'Certificate Issued','under_review','ready','Digital Bonafide Certificate generated and digitally signed by Central Registrar.','2026-10-08 10:21:41'),(4,2,8,'Request Submitted',NULL,'submitted','Application submitted with auto-verified ERP profile snapshot.','2026-10-08 15:02:09'),(5,2,7,'Marked Under Review','submitted','under_review','ready by 10th please collect from the office','2026-10-08 15:03:17'),(6,1,3,'Physical Collection Scheduled','under_review','ready_for_pickup','Certificate signed and stamped with official seal. Scheduled for physical collection at Counter Window 3.','2026-10-08 15:06:56'),(7,2,3,'Extra Data / In-Person Visit Requested','under_review','action_required','Candidate instructed to report to CSE Dept Office with company offer letter and HOD clearance.','2026-10-08 15:06:56'),(8,3,8,'Request Submitted',NULL,'submitted','Application submitted with auto-verified ERP profile snapshot.','2026-10-08 15:26:26'),(9,4,8,'Request Submitted',NULL,'submitted','Application submitted with auto-verified ERP profile snapshot.','2026-10-08 15:35:25'),(10,2,8,'Student Submitted Additional Context','action_required','under_review','why rejected','2026-10-08 15:38:48'),(11,2,7,'Approved & Scheduled for Physical Collection','under_review','ready_for_pickup','Scheduled for physical pickup on 2026-10-10 (10:30 AM – 01:00 PM (Morning Counter Session)) at Administrative Block — Counter Window 3 (Academic & Certificates Desk). Pass: PASS-2026-CUT-0002','2026-10-08 15:39:44'),(12,5,9,'Request Submitted',NULL,'submitted','Application submitted with auto-verified ERP profile snapshot.','2026-10-08 18:11:15'),(13,5,7,'Extra Data / In-Person Visit Requested','submitted','action_required','Action needed: bring addhar. Report in person on 2026-10-10 at Administrative Block — Academic Verification Counter 1.','2026-10-08 18:13:56'),(14,5,9,'Student Submitted Additional Context','action_required','under_review','ok','2026-10-08 18:15:01'),(15,5,7,'Approved & Scheduled for Physical Collection','under_review','ready_for_pickup','Scheduled for physical pickup on 2026-10-12 (02:30 PM – 05:00 PM (Afternoon Counter Session)) at Administrative Block — Counter Window 3 (Academic & Certificates Desk). Pass: PASS-2026-CUT-0005','2026-10-08 18:16:01'),(16,2,7,'Physical Stamp & Signature Handed Over','ready_for_pickup','delivered','Document physically verified, stamped with official university seal, and handed over to candidate.','2026-10-08 18:16:32'),(17,6,8,'Request Submitted',NULL,'submitted','Application submitted with auto-verified ERP profile snapshot.','2026-10-09 14:17:31'),(18,6,5,'Extra Data / In-Person Visit Requested','submitted','action_required','Action needed: please bring or doc. Report in person on 2026-10-10 at Administrative Block — Academic Verification Counter 1.','2026-10-09 14:19:43'),(19,6,8,'Student Submitted Additional Context','action_required','under_review','ok','2026-10-09 14:20:18'),(20,6,5,'Approved & Scheduled for Physical Collection','under_review','ready_for_pickup','Scheduled for physical pickup on 2026-10-23 (10:30 AM – 01:00 PM (Morning Counter Session)) at Administrative Block — Counter Window 3 (Academic & Certificates Desk). Pass: PASS-2026-CUT-0006','2026-10-09 14:21:49'),(21,5,5,'Physical Stamp & Signature Handed Over','ready_for_pickup','delivered','Document physically verified, stamped with official university seal, and handed over to candidate.','2026-10-09 14:23:13'),(22,7,8,'Request Submitted',NULL,'submitted','Application submitted with auto-verified ERP profile snapshot.','2026-10-09 20:01:20'),(23,7,5,'Approved & Scheduled for Physical Collection','submitted','ready_for_pickup','Scheduled for physical pickup on 2026-10-11 (10:30 AM – 01:00 PM (Morning Counter Session)) at Administrative Block — Counter Window 3 (Academic & Certificates Desk). Pass: PASS-2026-CUT-0007','2026-10-09 20:02:02');
/*!40000 ALTER TABLE `service_request_timeline` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_requests`
--

DROP TABLE IF EXISTS `service_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `service_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `request_number` varchar(50) NOT NULL,
  `service_type_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `student_profile_id` int(11) DEFAULT NULL,
  `erp_snapshot` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`erp_snapshot`)),
  `purpose` text NOT NULL,
  `additional_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`additional_details`)),
  `status` enum('submitted','under_review','action_required','ready_for_pickup','ready','delivered','rejected') NOT NULL DEFAULT 'submitted',
  `assigned_staff_id` int(11) DEFAULT NULL,
  `sla_deadline` datetime NOT NULL,
  `admin_notes` text DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `certificate_number` varchar(80) DEFAULT NULL,
  `issued_at` datetime DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `pickup_date` date DEFAULT NULL,
  `pickup_slot` varchar(100) DEFAULT NULL,
  `pickup_location` varchar(150) DEFAULT NULL,
  `pickup_slip_token` varchar(80) DEFAULT NULL,
  `missing_info_requested` text DEFAULT NULL,
  `verification_visit_date` date DEFAULT NULL,
  `verification_venue` varchar(150) DEFAULT NULL,
  `student_response_data` text DEFAULT NULL,
  `handover_officer_id` int(11) DEFAULT NULL,
  `handover_notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `request_number` (`request_number`),
  UNIQUE KEY `certificate_number` (`certificate_number`),
  KEY `idx_user` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_service_type` (`service_type_id`),
  KEY `idx_sla` (`sla_deadline`),
  CONSTRAINT `fk_sr_service_type` FOREIGN KEY (`service_type_id`) REFERENCES `service_types` (`id`),
  CONSTRAINT `fk_sr_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_requests`
--

LOCK TABLES `service_requests` WRITE;
/*!40000 ALTER TABLE `service_requests` DISABLE KEYS */;
INSERT INTO `service_requests` VALUES (1,'REQ-2026-0814',1,8,1,'{\"full_name\":{\"label\":\"Full Name\",\"value\":\"Ashish Toppo\"},\"roll_number\":{\"label\":\"Roll Number\",\"value\":\"24050101\"},\"registration_number\":{\"label\":\"Registration Number\",\"value\":\"REG2024MCA088\"},\"program_name\":{\"label\":\"Program \\/ Degree\",\"value\":\"Master of Computer Applications\"},\"department_name\":{\"label\":\"Department\",\"value\":\"Computer Science and Engineering\"},\"current_semester\":{\"label\":\"Current Semester\",\"value\":\"Semester 1\"},\"college_email\":{\"label\":\"Official Email\",\"value\":\"ashish.toppo@student.campus.edu\"},\"phone_number\":{\"label\":\"Contact Number\",\"value\":\"+91 98765 11223\"}}','State Bank of India — Application for National Education Loan Scheme (Ref: SBI-EDU-88219)',NULL,'ready_for_pickup',3,'2026-10-09 20:21:41',NULL,NULL,'CUT/CERT/2026/0814','2026-10-08 20:21:41',NULL,'2026-10-08 08:51:41','2026-10-08 15:06:28','2026-10-10','10:30 AM – 01:00 PM (Morning Counter Session)','Administrative Block — Counter Window 3 (Academic & Certificates Desk)','SLIP-2026-CUT-0814',NULL,NULL,NULL,NULL,NULL,NULL),(2,'REQ-2026-1EED',1,8,1,'{\"full_name\":{\"label\":\"Full Name\",\"value\":\"Ashish Toppo\"},\"roll_number\":{\"label\":\"Roll Number\",\"value\":\"24050101\"},\"registration_number\":{\"label\":\"Registration Number\",\"value\":\"REG2024MCA088\"},\"program_name\":{\"label\":\"Program \\/ Degree\",\"value\":\"Master of Computer Applications\"},\"department_name\":{\"label\":\"Department\",\"value\":\"Computer Science and Engineering\"},\"current_semester\":{\"label\":\"Current Semester\",\"value\":\"Semester 1\"},\"section\":{\"label\":\"Section\",\"value\":\"A\"},\"college_email\":{\"label\":\"Official Email\",\"value\":\"ashish.toppo@student.campus.edu\"},\"phone_number\":{\"label\":\"Contact Number\",\"value\":\"+91 98765 11223\"},\"father_name\":{\"label\":\"Father \\/ Guardian\",\"value\":\"Samuel Toppo\"},\"hostel_resident\":{\"label\":\"Campus Residence\",\"value\":\"Boys Hostel Block B B-204\"}}','test','{\"notes\":\"test\"}','delivered',7,'2026-10-09 17:02:09','ready by 10th please collect from the office',NULL,'CUT/CERT/2026/6332','2026-10-08 17:39:44','2026-10-08 20:16:32','2026-10-08 15:02:09','2026-10-08 18:16:32','2026-10-10','10:30 AM – 01:00 PM (Morning Counter Session)','Administrative Block — Counter Window 3 (Academic & Certificates Desk)','PASS-2026-CUT-0002','Missing: Official offer letter from company and Departmental Attendance Certificate signed by HOD. Please visit in person with hard copies.','2026-10-09','CSE Department Office — HOD Cabin (Room 204)','why rejected',7,'Document physically verified, stamped with official university seal, and handed over to candidate.'),(3,'REQ-2026-2A34',1,8,1,'{\"full_name\":{\"label\":\"Full Name\",\"value\":\"Ashish Toppo\"},\"roll_number\":{\"label\":\"Roll Number\",\"value\":\"24050101\"},\"registration_number\":{\"label\":\"Registration Number\",\"value\":\"REG2024MCA088\"},\"program_name\":{\"label\":\"Program \\/ Degree\",\"value\":\"Master of Computer Applications\"},\"department_name\":{\"label\":\"Department\",\"value\":\"Computer Science and Engineering\"},\"current_semester\":{\"label\":\"Current Semester\",\"value\":\"Semester 1\"},\"section\":{\"label\":\"Section\",\"value\":\"A\"},\"college_email\":{\"label\":\"Official Email\",\"value\":\"ashish.toppo@student.campus.edu\"},\"phone_number\":{\"label\":\"Contact Number\",\"value\":\"+91 98765 11223\"},\"father_name\":{\"label\":\"Father \\/ Guardian\",\"value\":\"Samuel Toppo\"},\"hostel_resident\":{\"label\":\"Campus Residence\",\"value\":\"Boys Hostel Block B B-204\"}}','qwecqcq','{\"notes\":\"qwdcqdcqcqcqec\"}','submitted',NULL,'2026-10-09 17:26:26',NULL,NULL,NULL,NULL,NULL,'2026-10-08 15:26:26','2026-10-08 15:26:26',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(4,'REQ-2026-45B5',1,8,1,'{\"full_name\":{\"label\":\"Full Name\",\"value\":\"Ashish Toppo\"},\"roll_number\":{\"label\":\"Roll Number\",\"value\":\"24050101\"},\"registration_number\":{\"label\":\"Registration Number\",\"value\":\"REG2024MCA088\"},\"program_name\":{\"label\":\"Program \\/ Degree\",\"value\":\"Master of Computer Applications\"},\"department_name\":{\"label\":\"Department\",\"value\":\"Computer Science and Engineering\"},\"current_semester\":{\"label\":\"Current Semester\",\"value\":\"Semester 1\"},\"section\":{\"label\":\"Section\",\"value\":\"A\"},\"college_email\":{\"label\":\"Official Email\",\"value\":\"ashish.toppo@student.campus.edu\"},\"phone_number\":{\"label\":\"Contact Number\",\"value\":\"+91 98765 11223\"},\"father_name\":{\"label\":\"Father \\/ Guardian\",\"value\":\"Samuel Toppo\"},\"hostel_resident\":{\"label\":\"Campus Residence\",\"value\":\"Boys Hostel Block B B-204\"}}','sergvsdfgvsdfgvsdfv','{\"notes\":\"edgvdfvsdfavdfvdfw\"}','submitted',NULL,'2026-10-09 17:35:25',NULL,NULL,NULL,NULL,NULL,'2026-10-08 15:35:25','2026-10-08 15:35:25',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(5,'REQ-2026-9557',1,9,2,'{\"full_name\":{\"label\":\"Full Name\",\"value\":\"Priya Patel\"},\"roll_number\":{\"label\":\"Roll Number\",\"value\":\"24050102\"},\"registration_number\":{\"label\":\"Registration Number\",\"value\":\"REG2024MCA089\"},\"program_name\":{\"label\":\"Program \\/ Degree\",\"value\":\"Master of Computer Applications\"},\"department_name\":{\"label\":\"Department\",\"value\":\"Computer Science and Engineering\"},\"current_semester\":{\"label\":\"Current Semester\",\"value\":\"Semester 1\"},\"section\":{\"label\":\"Section\",\"value\":\"A\"},\"college_email\":{\"label\":\"Official Email\",\"value\":\"priya.patel@student.campus.edu\"},\"phone_number\":{\"label\":\"Contact Number\",\"value\":\"+91 98765 11224\"},\"father_name\":{\"label\":\"Father \\/ Guardian\",\"value\":\"Dinesh Patel\"},\"hostel_resident\":{\"label\":\"Campus Residence\",\"value\":\"Girls Hostel Block A GH-112\"}}','test2','{\"notes\":\"need  urgent\"}','delivered',5,'2026-10-09 20:11:15',NULL,NULL,'CUT/CERT/2026/6326','2026-10-08 20:16:01','2026-10-09 16:23:13','2026-10-08 18:11:15','2026-10-09 14:23:13','2026-10-12','02:30 PM – 05:00 PM (Afternoon Counter Session)','Administrative Block — Counter Window 3 (Academic & Certificates Desk)','PASS-2026-CUT-0005','bring addhar','2026-10-10','Administrative Block — Academic Verification Counter 1','ok',5,'Document physically verified, stamped with official university seal, and handed over to candidate.'),(6,'REQ-2026-676A',1,8,1,'{\"full_name\":{\"label\":\"Full Name\",\"value\":\"Ashish Toppo\"},\"roll_number\":{\"label\":\"Roll Number\",\"value\":\"24050101\"},\"registration_number\":{\"label\":\"Registration Number\",\"value\":\"REG2024MCA088\"},\"program_name\":{\"label\":\"Program \\/ Degree\",\"value\":\"Master of Computer Applications\"},\"department_name\":{\"label\":\"Department\",\"value\":\"Computer Science and Engineering\"},\"current_semester\":{\"label\":\"Current Semester\",\"value\":\"Semester 6\"},\"section\":{\"label\":\"Section\",\"value\":\"A\"},\"college_email\":{\"label\":\"Official Email\",\"value\":\"ashish.toppo@student.campus.edu\"},\"phone_number\":{\"label\":\"Contact Number\",\"value\":\"+91 98765 11223\"},\"father_name\":{\"label\":\"Father \\/ Guardian\",\"value\":\"Samuel Toppo\"},\"hostel_resident\":{\"label\":\"Campus Residence\",\"value\":\"Boys Hostel Block B B-204\"}}','stipend','{\"notes\":\"please do it fast need\"}','ready_for_pickup',5,'2026-10-10 16:17:31',NULL,NULL,'CUT/CERT/2026/3589','2026-10-09 16:21:49',NULL,'2026-10-09 14:17:31','2026-10-09 14:21:49','2026-10-23','10:30 AM – 01:00 PM (Morning Counter Session)','Administrative Block — Counter Window 3 (Academic & Certificates Desk)','PASS-2026-CUT-0006','please bring or doc','2026-10-10','Administrative Block — Academic Verification Counter 1','ok',NULL,NULL),(7,'REQ-2026-7E77',1,8,1,'{\"full_name\":{\"label\":\"Full Name\",\"value\":\"Ashish Toppo\"},\"roll_number\":{\"label\":\"Roll Number\",\"value\":\"24050101\"},\"registration_number\":{\"label\":\"Registration Number\",\"value\":\"REG2024MCA088\"},\"program_name\":{\"label\":\"Program \\/ Degree\",\"value\":\"Master of Computer Applications\"},\"department_name\":{\"label\":\"Department\",\"value\":\"Computer Science and Engineering\"},\"current_semester\":{\"label\":\"Current Semester\",\"value\":\"Semester 6\"},\"section\":{\"label\":\"Section\",\"value\":\"A\"},\"college_email\":{\"label\":\"Official Email\",\"value\":\"ashish.toppo@student.campus.edu\"},\"phone_number\":{\"label\":\"Contact Number\",\"value\":\"+91 98765 11223\"},\"father_name\":{\"label\":\"Father \\/ Guardian\",\"value\":\"Samuel Toppo\"},\"hostel_resident\":{\"label\":\"Campus Residence\",\"value\":\"Boys Hostel Block B B-204\"}}','test','{\"notes\":\"test\"}','ready_for_pickup',5,'2026-10-10 22:01:20',NULL,NULL,'CUT/CERT/2026/9305','2026-10-09 22:02:02',NULL,'2026-10-09 20:01:20','2026-10-09 20:02:02','2026-10-11','10:30 AM – 01:00 PM (Morning Counter Session)','Administrative Block — Counter Window 3 (Academic & Certificates Desk)','PASS-2026-CUT-0007',NULL,NULL,'Administrative Block — Verification Counter 1',NULL,NULL,NULL);
/*!40000 ALTER TABLE `service_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_types`
--

DROP TABLE IF EXISTS `service_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `service_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text NOT NULL,
  `category` enum('Academic','Financial','Conduct','Identity','General') NOT NULL DEFAULT 'Academic',
  `sla_hours` int(11) NOT NULL DEFAULT 48,
  `fee_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `requires_purpose` tinyint(1) NOT NULL DEFAULT 1,
  `requires_supporting_doc` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_types`
--

LOCK TABLES `service_types` WRITE;
/*!40000 ALTER TABLE `service_types` DISABLE KEYS */;
INSERT INTO `service_types` VALUES (1,'bonafide','Bonafide Student Certificate','Official institutional certificate confirming current enrollment, academic term, program of study, and valid student status for banks, visas, or travel concessions.','Academic',24,0.00,1,0,1,'2026-10-08 14:51:41'),(2,'fee_structure','Official Fee Structure Certificate','Certified breakdown of academic tuition, laboratory, examination, and hostel fees required for bank education loan disbursements or corporate sponsorships.','Financial',24,0.00,1,0,1,'2026-10-08 14:51:41'),(3,'character_cert','Conduct & Character Certificate','Attestation of good moral character, disciplinary standing, and campus conduct issued by the Office of the Dean of Student Welfare.','Conduct',48,0.00,1,0,1,'2026-10-08 14:51:41'),(4,'noc_internship','No Objection Certificate (NOC) for Internship / Industrial Training','Formal institutional authorization permitting the student to participate in external corporate internships or academic research during vacation or off-campus terms.','Academic',48,0.00,1,0,1,'2026-10-08 14:51:41'),(5,'duplicate_id','Duplicate Student Identity Card & Smart Pass','Replacement of lost, damaged, or stolen physical institutional smart card pass. Requires declaration of loss and processing fee.','Identity',72,100.00,1,1,1,'2026-10-08 14:51:41'),(6,'course_completion','Provisional Course Completion & Medium of Instruction Attestation','Official letter certifying English medium of instruction, completion of credit requirements, and expected convocation standing for higher education admissions.','Academic',72,0.00,1,0,1,'2026-10-08 14:51:41');
/*!40000 ALTER TABLE `service_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `smart_form_fields`
--

DROP TABLE IF EXISTS `smart_form_fields`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `smart_form_fields` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `form_id` int(11) NOT NULL,
  `field_key` varchar(80) NOT NULL,
  `label` varchar(255) NOT NULL,
  `field_type` enum('text','textarea','number','select','radio','checkbox','date','file','consent') DEFAULT 'text',
  `help_text` varchar(255) DEFAULT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options`)),
  `is_required` tinyint(1) DEFAULT 1,
  `order_index` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `form_id` (`form_id`),
  CONSTRAINT `smart_form_fields_ibfk_1` FOREIGN KEY (`form_id`) REFERENCES `smart_forms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `smart_form_fields`
--

LOCK TABLES `smart_form_fields` WRITE;
/*!40000 ALTER TABLE `smart_form_fields` DISABLE KEYS */;
INSERT INTO `smart_form_fields` VALUES (1,1,'annual_income','Gross Family Annual Income (in INR)','number','Combined annual income of parents/guardians from all sources',NULL,1,1,'2026-10-08 13:52:31'),(2,1,'cgpa_last_sem','Previous Qualifying Examination CGPA or Percentage','text','e.g., 8.75 CGPA or 84.5%',NULL,1,2,'2026-10-08 13:52:31'),(3,1,'category_quota','Social Category / Admission Quota','select','Select your verified category','[\"General\",\"OBC-NCL\",\"SC\",\"ST\",\"EWS\"]',1,3,'2026-10-08 13:52:31'),(4,1,'financial_need_statement','Statement of Need & Extenuating Financial Background','textarea','Explain briefly why you are applying for institutional tuition fee assistance',NULL,1,4,'2026-10-08 13:52:31'),(5,1,'income_cert_no','Revenue Office Income Certificate Number','text','Certificate serial number as issued by Tehsildar / District Magistrate',NULL,0,5,'2026-10-08 13:52:31'),(6,1,'accuracy_declaration','I confirm that all financial particulars submitted above are true and complete under penalty of disciplinary action.','consent',NULL,NULL,1,6,'2026-10-08 13:52:31'),(7,2,'elective_preference','Preferred Specialization Elective for Semester 2','radio','Select your highest priority specialization track','[\"Cloud Architecture & Kubernetes Orchestration\",\"Deep Learning & Natural Language Processing\",\"Cyber Forensics & Zero-Trust Defense\"]',1,1,'2026-10-08 13:52:31'),(8,2,'lab_infrastructure_feedback','Systems & Database Lab Hardware Performance Rating','select','Evaluate current terminal capabilities in Lab Block A-104','[\"Excellent (Zero Latency & Updated Toolchains)\",\"Adequate (Meets Curriculum Requirements)\",\"Needs RAM & Linux GPU Upgrade\"]',1,2,'2026-10-08 13:52:31'),(9,2,'cr_batch_suggestions','Additional Class Suggestions for Faculty Coordinator','textarea','Enter any scheduling or laboratory accessibility feedback for the HOD',NULL,0,3,'2026-10-08 13:52:31'),(10,3,'departure_date','Scheduled Date of Campus Departure','date','Date on which you will exit hostel gate',NULL,1,1,'2026-10-08 13:52:31'),(11,3,'expected_return_date','Anticipated Date of Return to Campus','date','Must be before Autumn term recommencement',NULL,1,2,'2026-10-08 13:52:31'),(12,3,'vacation_contact_address','Emergency Contact Person Name & Contact Number during Leave','text','Parent/Guardian details at home location',NULL,1,3,'2026-10-08 13:52:31'),(13,3,'key_handover_consent','I undertake to lock all personal lockers and deposit room keys with the hostel caretaker prior to departure.','consent',NULL,NULL,1,4,'2026-10-08 13:52:31'),(14,4,'participate_in_blood_donation','participate in blood donation','consent','it will hel others',NULL,1,1,'2026-10-08 14:20:53'),(15,4,'test','test','date','',NULL,1,2,'2026-10-08 14:20:53'),(16,5,'please_check_for_concent','please check for concent','consent','click in the box',NULL,1,1,'2026-10-08 18:06:06'),(17,5,'when_are_you_avlable','when are you avlable','date','',NULL,1,2,'2026-10-08 18:06:06'),(18,6,'by_click_you_allow_us_to_take_and_sell_your_blood','by click you allow us to take and sell your blood','consent','Provide relevant context or explanation',NULL,1,1,'2026-10-09 14:58:03'),(19,6,'when_are_you_av','when are you av','date','',NULL,1,2,'2026-10-09 14:58:03'),(20,7,'test','test','date','Provide relevant context or explanation',NULL,1,1,'2026-10-09 20:00:01');
/*!40000 ALTER TABLE `smart_form_fields` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `smart_form_submissions`
--

DROP TABLE IF EXISTS `smart_form_submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `smart_form_submissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `form_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `erp_snapshot` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`erp_snapshot`)),
  `answers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`answers`)),
  `status` enum('submitted','under_review','approved','rejected') DEFAULT 'submitted',
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewer_notes` text DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `reviewed_by` (`reviewed_by`),
  KEY `idx_submissions_form` (`form_id`,`user_id`),
  CONSTRAINT `smart_form_submissions_ibfk_1` FOREIGN KEY (`form_id`) REFERENCES `smart_forms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `smart_form_submissions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `smart_form_submissions_ibfk_3` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `smart_form_submissions`
--

LOCK TABLES `smart_form_submissions` WRITE;
/*!40000 ALTER TABLE `smart_form_submissions` DISABLE KEYS */;
INSERT INTO `smart_form_submissions` VALUES (1,1,8,'{\"full_name\":{\"label\":\"Full Name\",\"value\":\"Ashish Toppo\"},\"roll_number\":{\"label\":\"Roll Number\",\"value\":\"24050101\"},\"registration_number\":{\"label\":\"Registration Number\",\"value\":\"REG2024MCA088\"},\"program_name\":{\"label\":\"Program \\/ Degree\",\"value\":\"Master of Computer Applications\"},\"current_semester\":{\"label\":\"Current Semester\",\"value\":\"1\"},\"college_email\":{\"label\":\"Institutional Email\",\"value\":\"ashish.toppo@student.campus.edu\"},\"phone_number\":{\"label\":\"Student Mobile\",\"value\":\"+91 98765 11223\"},\"father_name\":{\"label\":\"Father\'s Name\",\"value\":\"Samuel Toppo\"},\"parent_phone\":{\"label\":\"Parent \\/ Guardian Phone\",\"value\":\"+91 94371 88990\"}}','{\"annual_income\":180000,\"category_quota\":\"OBC-NCL\",\"financial_need_statement\":\"Single earning farmer family.\",\"accuracy_declaration\":true,\"income_cert_no\":\"REV-OD-2025-09881\",\"cgpa_last_sem\":\"8.85\"}','submitted',NULL,NULL,'2026-10-08 14:03:31','2026-10-08 14:03:31'),(2,4,9,'{\"full_name\":{\"label\":\"Full Name\",\"value\":\"Priya Patel\"},\"roll_number\":{\"label\":\"Roll Number\",\"value\":\"24050102\"},\"program_name\":{\"label\":\"Program \\/ Degree\",\"value\":\"Master of Computer Applications\"},\"current_semester\":{\"label\":\"Current Semester\",\"value\":\"1\"},\"college_email\":{\"label\":\"Institutional Email\",\"value\":\"priya.patel@student.campus.edu\"},\"room_number\":{\"label\":\"Room Number\",\"value\":\"GH-112\"},\"blood_group\":{\"label\":\"Blood Group\",\"value\":\"O+\"}}','{\"participate_in_blood_donation\":true,\"test\":\"2026-10-30\"}','submitted',NULL,NULL,'2026-10-08 14:34:11','2026-10-08 14:34:11'),(3,2,8,'{\"full_name\":{\"label\":\"Full Name\",\"value\":\"Ashish Toppo\"},\"roll_number\":{\"label\":\"Roll Number\",\"value\":\"24050101\"},\"college_email\":{\"label\":\"Institutional Email\",\"value\":\"ashish.toppo@student.campus.edu\"},\"current_semester\":{\"label\":\"Current Semester\",\"value\":\"1\"},\"section\":{\"label\":\"Section\",\"value\":\"A\"}}','{\"elective_preference\":\"Cloud Architecture & Kubernetes Orchestration\",\"lab_infrastructure_feedback\":\"Adequate (Meets Curriculum Requirements)\",\"cr_batch_suggestions\":\"hgkxhkxfhkxf\"}','submitted',NULL,NULL,'2026-10-08 15:32:57','2026-10-08 15:32:57'),(4,5,8,'{\"full_name\":{\"label\":\"Full Name\",\"value\":\"Ashish Toppo\"},\"roll_number\":{\"label\":\"Roll Number\",\"value\":\"24050101\"},\"program_name\":{\"label\":\"Program \\/ Degree\",\"value\":\"Master of Computer Applications\"},\"current_semester\":{\"label\":\"Current Semester\",\"value\":\"1\"},\"college_email\":{\"label\":\"Institutional Email\",\"value\":\"ashish.toppo@student.campus.edu\"},\"admission_number\":{\"label\":\"Admission Number\",\"value\":\"ADM-2024-4102\"},\"department_name\":{\"label\":\"Department\",\"value\":\"Computer Science and Engineering\"},\"section\":{\"label\":\"Section\",\"value\":\"A\"},\"current_year\":{\"label\":\"Academic Year\",\"value\":\"1\"},\"personal_email\":{\"label\":\"Personal Email\",\"value\":\"ashish.personal@gmail.com\"},\"phone_number\":{\"label\":\"Student Mobile\",\"value\":\"+91 98765 11223\"},\"guardian_name\":{\"label\":\"Guardian Name\",\"value\":\"Samuel Toppo\"},\"mother_name\":{\"label\":\"Mother\'s Name\",\"value\":\"Anjali Toppo\"},\"permanent_address\":{\"label\":\"Permanent Residential Address\",\"value\":\"Plot 142, Kalinga Vihar, Sector 4, Rourkela, Odisha - 769015\"},\"room_number\":{\"label\":\"Room Number\",\"value\":\"B-204\"},\"blood_group\":{\"label\":\"Blood Group\",\"value\":\"B+\"}}','{\"please_check_for_concent\":true,\"when_are_you_avlable\":\"2026-10-22\"}','submitted',NULL,NULL,'2026-10-08 18:07:18','2026-10-08 18:07:18'),(5,6,12,'{\"full_name\":{\"label\":\"Full Name\",\"value\":\"Rohan Mohanty\"},\"roll_number\":{\"label\":\"Roll Number\",\"value\":\"24050103\"},\"program_name\":{\"label\":\"Program \\/ Degree\",\"value\":\"Master of Computer Applications\"},\"current_semester\":{\"label\":\"Current Semester\",\"value\":\"6\"},\"college_email\":{\"label\":\"Institutional Email\",\"value\":\"rohan.mohanty@student.campus.edu\"},\"registration_number\":{\"label\":\"Registration Number\",\"value\":\"2024050103\"},\"phone_number\":{\"label\":\"Student Mobile\",\"value\":\"+91 94371 88201\"},\"personal_email\":{\"label\":\"Personal Email\",\"value\":\"\"},\"current_year\":{\"label\":\"Academic Year\",\"value\":\"3\"},\"admission_number\":{\"label\":\"Admission Number\",\"value\":\"\"},\"guardian_name\":{\"label\":\"Guardian Name\",\"value\":\"\"},\"blood_group\":{\"label\":\"Blood Group\",\"value\":\"\"}}','{\"by_click_you_allow_us_to_take_and_sell_your_blood\":true,\"when_are_you_av\":\"2026-10-10\"}','submitted',NULL,NULL,'2026-10-09 14:58:51','2026-10-09 14:58:51'),(6,6,8,'{\"full_name\":{\"label\":\"Full Name\",\"value\":\"Ashish Toppo\"},\"roll_number\":{\"label\":\"Roll Number\",\"value\":\"24050101\"},\"program_name\":{\"label\":\"Program \\/ Degree\",\"value\":\"Master of Computer Applications\"},\"current_semester\":{\"label\":\"Current Semester\",\"value\":\"6\"},\"college_email\":{\"label\":\"Institutional Email\",\"value\":\"ashish.toppo@student.campus.edu\"},\"registration_number\":{\"label\":\"Registration Number\",\"value\":\"REG2024MCA088\"},\"phone_number\":{\"label\":\"Student Mobile\",\"value\":\"+91 98765 11223\"},\"personal_email\":{\"label\":\"Personal Email\",\"value\":\"ashish.personal@gmail.com\"},\"current_year\":{\"label\":\"Academic Year\",\"value\":\"1\"},\"admission_number\":{\"label\":\"Admission Number\",\"value\":\"ADM-2024-4102\"},\"guardian_name\":{\"label\":\"Guardian Name\",\"value\":\"Samuel Toppo\"},\"blood_group\":{\"label\":\"Blood Group\",\"value\":\"B+\"}}','{\"by_click_you_allow_us_to_take_and_sell_your_blood\":true,\"when_are_you_av\":\"2026-10-10\"}','submitted',NULL,NULL,'2026-10-09 14:59:15','2026-10-09 14:59:15'),(7,7,8,'{\"full_name\":{\"label\":\"Full Name\",\"value\":\"Ashish Toppo\"},\"roll_number\":{\"label\":\"Roll Number\",\"value\":\"24050101\"},\"program_name\":{\"label\":\"Program \\/ Degree\",\"value\":\"Master of Computer Applications\"},\"current_semester\":{\"label\":\"Current Semester\",\"value\":\"6\"},\"college_email\":{\"label\":\"Institutional Email\",\"value\":\"ashish.toppo@student.campus.edu\"},\"current_year\":{\"label\":\"Academic Year\",\"value\":\"1\"},\"section\":{\"label\":\"Section\",\"value\":\"A\"},\"phone_number\":{\"label\":\"Student Mobile\",\"value\":\"+91 98765 11223\"}}','{\"test\":\"2026-10-15\"}','submitted',NULL,NULL,'2026-10-09 20:00:37','2026-10-09 20:00:37');
/*!40000 ALTER TABLE `smart_form_submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `smart_forms`
--

DROP TABLE IF EXISTS `smart_forms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `smart_forms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `creator_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(80) DEFAULT 'General',
  `status` enum('draft','published','closed','archived') DEFAULT 'published',
  `target_scope` varchar(80) DEFAULT 'all',
  `target_department_id` int(11) DEFAULT NULL,
  `target_program_id` int(11) DEFAULT NULL,
  `target_semester` int(11) DEFAULT NULL,
  `target_section` varchar(10) DEFAULT NULL,
  `erp_fields` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`erp_fields`)),
  `allow_multiple_submissions` tinyint(1) DEFAULT 0,
  `expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `creator_id` (`creator_id`),
  KEY `target_department_id` (`target_department_id`),
  KEY `target_program_id` (`target_program_id`),
  KEY `idx_forms_status` (`status`,`target_scope`),
  CONSTRAINT `smart_forms_ibfk_1` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `smart_forms_ibfk_2` FOREIGN KEY (`target_department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `smart_forms_ibfk_3` FOREIGN KEY (`target_program_id`) REFERENCES `programs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `smart_forms`
--

LOCK TABLES `smart_forms` WRITE;
/*!40000 ALTER TABLE `smart_forms` DISABLE KEYS */;
INSERT INTO `smart_forms` VALUES (1,4,'Autumn 2026 Merit Scholarship & Tuition Assistance Application','Official institutional scholarship application for eligible students in Autumn Term. Verified student identity fields are automatically locked from your university profile.','Scholarship','published','all',NULL,NULL,NULL,NULL,'[\"full_name\",\"roll_number\",\"registration_number\",\"program_name\",\"current_semester\",\"college_email\",\"phone_number\",\"father_name\",\"parent_phone\"]',0,NULL,'2026-10-08 13:52:31','2026-10-08 13:52:31'),(2,9,'MCA Section 1A Elective Course Preference & Lab Infrastructure Feedback','Class Representative batch consultation for Section 1A ahead of the upcoming Department Academic Committee review meeting.','Academic','published','program',NULL,NULL,NULL,NULL,'[\"full_name\",\"roll_number\",\"college_email\",\"current_semester\",\"section\"]',0,NULL,'2026-10-08 13:52:31','2026-10-08 13:52:31'),(3,7,'Hostel Resident Winter Break Outstation Departure Declaration','Mandatory institutional declaration for all hostel boarders proceeding on vacation during winter break. Gate passes will be issued against verified submissions.','Hostel','published','all',NULL,NULL,NULL,NULL,'[\"full_name\",\"roll_number\",\"hostel_name\",\"room_number\",\"phone_number\",\"parent_phone\"]',0,NULL,'2026-10-08 13:52:31','2026-10-08 13:52:31'),(4,2,'blood donation','helo','Event','published','all',NULL,NULL,NULL,NULL,'[\"full_name\",\"roll_number\",\"program_name\",\"current_semester\",\"college_email\",\"room_number\",\"blood_group\"]',0,NULL,'2026-10-08 14:20:53','2026-10-08 14:20:53'),(5,9,'blood donation','test2','Event','published','program',NULL,NULL,NULL,NULL,'[\"full_name\",\"roll_number\",\"program_name\",\"current_semester\",\"college_email\",\"admission_number\",\"department_name\",\"section\",\"current_year\",\"personal_email\",\"phone_number\",\"guardian_name\",\"mother_name\",\"permanent_address\",\"room_number\",\"blood_group\"]',0,NULL,'2026-10-08 18:06:06','2026-10-08 18:06:06'),(6,4,'blood donation','','Academic','published','all',NULL,NULL,NULL,NULL,'[\"full_name\",\"roll_number\",\"program_name\",\"current_semester\",\"college_email\",\"registration_number\",\"phone_number\",\"personal_email\",\"current_year\",\"admission_number\",\"guardian_name\",\"blood_group\"]',0,NULL,'2026-10-09 14:58:03','2026-10-09 14:58:03'),(7,4,'test','test','Academic','published','all',NULL,NULL,NULL,NULL,'[\"full_name\",\"roll_number\",\"program_name\",\"current_semester\",\"college_email\",\"current_year\",\"section\",\"phone_number\"]',0,NULL,'2026-10-09 20:00:01','2026-10-09 20:00:01');
/*!40000 ALTER TABLE `smart_forms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_profiles`
--

DROP TABLE IF EXISTS `staff_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `staff_profiles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `employee_code` varchar(50) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `designation` varchar(100) NOT NULL,
  `department_id` int(11) NOT NULL,
  `qualification` varchar(100) DEFAULT NULL,
  `official_email` varchar(150) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `cabin_location` varchar(100) DEFAULT NULL,
  `joining_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `employee_code` (`employee_code`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `staff_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `staff_profiles_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_profiles`
--

LOCK TABLES `staff_profiles` WRITE;
/*!40000 ALTER TABLE `staff_profiles` DISABLE KEYS */;
INSERT INTO `staff_profiles` VALUES (1,1,'EMP-ADM-001','Sunil Narang','Chief IT Administrator',5,'M.Tech CSE','admin@campus.edu','+91 98765 43210','Admin Block A-102','2020-07-01','2026-10-08 03:38:01','2026-10-08 03:38:01'),(2,2,'EMP-DIR-001','Dr. Radhakrishnan Pillai','Director / Principal',5,'Ph.D. IIT Delhi','director@campus.edu','+91 98765 43200','Directorate Wing Room 1','2018-01-15','2026-10-08 03:38:01','2026-10-08 03:38:01'),(3,3,'EMP-CSE-HOD','Dr. Meenakshi Sundaram','Professor & HOD (CSE)',1,'Ph.D. IISc','hod.cse@campus.edu','+91 98765 43201','Department Block C-201','2019-06-10','2026-10-08 03:38:01','2026-10-08 03:38:01'),(4,4,'EMP-CSE-FAC01','Prof. Ashok Sharma','Associate Professor',1,'M.Tech CSE','ashok.sharma@campus.edu','+91 98765 43202','Faculty Cabin C-104','2021-08-01','2026-10-08 03:38:01','2026-10-08 03:38:01'),(5,5,'EMP-ADM-STAFF','Rajesh Kulkarni','Senior Administrative Officer',5,'M.A., PGDCA','records@campus.edu','+91 98765 43203','Student Service Counter 2','2017-04-12','2026-10-08 03:38:01','2026-10-08 03:38:01'),(6,6,'EMP-EXAM-COE','Dr. Vandana Saxena','Controller of Examinations',5,'Ph.D. Mathematics','controller.exams@campus.edu','+91 98765 43204','Examination Cell E-01','2019-11-01','2026-10-08 03:38:01','2026-10-08 03:38:01'),(7,7,'EMP-HOSTEL-01','Col. Mahendra Singh (Retd)','Chief Hostel Warden',5,'M.Sc. Defence Studies','warden.bh1@campus.edu','+91 98765 43205','Boys Hostel 1 Office','2022-03-01','2026-10-08 03:38:01','2026-10-08 03:38:01'),(8,11,'STAFF-MESS-01','Ramesh Pradhan','Mess Manager & Dining Contractor',1,'Hotel Management & Food Safety','mess.manager@campus.edu','+91 98765 43299','Central Mess Complex','2022-07-01','2026-10-09 04:08:48','2026-10-09 04:08:48');
/*!40000 ALTER TABLE `staff_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_duty_leaves`
--

DROP TABLE IF EXISTS `student_duty_leaves`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_duty_leaves` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `leave_type` enum('hackathon','sports','cultural','medical','personal_emergency') NOT NULL DEFAULT 'hackathon',
  `title` varchar(255) NOT NULL,
  `organization_or_hospital` varchar(255) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_days` int(11) NOT NULL DEFAULT 1,
  `reason` text NOT NULL,
  `proof_document` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewer_remarks` varchar(255) DEFAULT NULL,
  `lecture_credits_granted` int(11) NOT NULL DEFAULT 0,
  `approved_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_student` (`student_id`),
  KEY `idx_dates` (`start_date`,`end_date`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_duty_leaves`
--

LOCK TABLES `student_duty_leaves` WRITE;
/*!40000 ALTER TABLE `student_duty_leaves` DISABLE KEYS */;
INSERT INTO `student_duty_leaves` VALUES (1,1,'hackathon','BPUT Hackathon 2026 Grand Finale - Problem Statement 07','Fretbox & BPUT Innovation Hub, Rourkela','2026-10-08','2026-10-10',3,'Officially selected to represent Central University of Technology at BPUT Hackathon 2026 on Campus Life OS.','CUT_HACKATHON_SELECTION_LETTER_2026.pdf','approved',4,'Approved by HOD CSE Dr. Ashok Sharma. Official collegiate technical representation. Attendance credited as Present.',12,'2026-10-07 14:30:00','2026-10-06 04:45:00'),(2,1,'sports','Inter-College East Zone Cricket Tournament','Utkal University Sports Complex, Bhubaneswar','2026-09-14','2026-09-16',3,'Member of university cricket squad for inter-collegiate championship qualifiers.','CUT_SPORTS_BOARD_RECOMMENDATION.pdf','approved',4,'Approved by Sports Officer & Dean Student Welfare. All 3 days condoned.',10,'2026-09-12 11:00:00','2026-09-11 04:00:00'),(3,2,'medical','Viral Pyrexia & Dehydration with Inpatient Admission','Capital Multi-Speciality Hospital, Unit-6','2026-09-21','2026-09-24',4,'Admitted with severe viral fever and gastroenteritis. Prescribed strict bed rest and IV fluid therapy.','HOSPITAL_DISCHARGE_CERTIFICATE_1042.pdf','approved',4,'Approved under Medical Condonation Clause 4.2 of University Academic Regulations.',14,'2026-09-26 16:45:00','2026-09-25 06:50:00'),(4,1,'sports','bput','hack','2026-10-12','2026-10-14',3,'th4wtwyyrsrsfdfdhfdhfdhddfdhhdhdhdftdhthdhdhfddf','rhfsrsrsr','pending',NULL,NULL,12,NULL,'2026-10-09 14:35:52'),(5,1,'hackathon','wefcwd','efcwdcfw','2026-10-20','2026-10-23',4,'utuytdtud','adcsdcwd','pending',NULL,NULL,16,NULL,'2026-10-09 14:37:08'),(6,2,'hackathon','fgaf','fdgfg','2026-10-12','2026-10-14',3,'ghegh',NULL,'pending',NULL,NULL,12,NULL,'2026-10-09 17:53:04'),(7,1,'hackathon','hack','test','2026-10-12','2026-10-14',3,'test just',NULL,'pending',NULL,NULL,12,NULL,'2026-10-09 19:57:43');
/*!40000 ALTER TABLE `student_duty_leaves` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_profiles`
--

DROP TABLE IF EXISTS `student_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_profiles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `roll_number` varchar(50) NOT NULL,
  `registration_number` varchar(50) NOT NULL,
  `admission_number` varchar(50) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT 'Male',
  `college_email` varchar(150) NOT NULL,
  `personal_email` varchar(150) DEFAULT NULL,
  `phone_number` varchar(20) NOT NULL,
  `department_id` int(11) NOT NULL,
  `program_id` int(11) NOT NULL,
  `current_semester` int(11) NOT NULL DEFAULT 1,
  `current_year` int(11) NOT NULL DEFAULT 1,
  `section` varchar(10) DEFAULT 'A',
  `father_name` varchar(150) DEFAULT NULL,
  `mother_name` varchar(150) DEFAULT NULL,
  `guardian_name` varchar(150) DEFAULT NULL,
  `parent_phone` varchar(20) DEFAULT NULL,
  `permanent_address` text DEFAULT NULL,
  `hostel_resident` tinyint(1) DEFAULT 0,
  `hostel_name` varchar(100) DEFAULT NULL,
  `room_number` varchar(30) DEFAULT NULL,
  `academic_status` enum('regular','probation','detained','graduated') DEFAULT 'regular',
  `blood_group` varchar(10) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `roll_number` (`roll_number`),
  UNIQUE KEY `registration_number` (`registration_number`),
  UNIQUE KEY `admission_number` (`admission_number`),
  KEY `program_id` (`program_id`),
  KEY `idx_student_dept` (`department_id`,`current_semester`,`section`),
  CONSTRAINT `student_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_profiles_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  CONSTRAINT `student_profiles_ibfk_3` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_profiles`
--

LOCK TABLES `student_profiles` WRITE;
/*!40000 ALTER TABLE `student_profiles` DISABLE KEYS */;
INSERT INTO `student_profiles` VALUES (1,8,'24050101','REG2024MCA088','ADM-2024-4102','Ashish Toppo','2002-05-14','Male','ashish.toppo@student.campus.edu','ashish.personal@gmail.com','+91 98765 11223',1,1,6,1,'A','Samuel Toppo','Anjali Toppo','Samuel Toppo','+91 94371 88990','Plot 142, Kalinga Vihar, Sector 4, Rourkela, Odisha - 769015',1,'Boys Hostel Block B','B-204','regular','B+','2026-10-08 03:38:01','2026-10-09 13:00:00'),(2,9,'24050102','REG2024MCA089','ADM-2024-4103','Priya Patel','2002-08-22','Female','priya.patel@student.campus.edu','priya.patel@gmail.com','+91 98765 11224',1,1,6,1,'A','Dinesh Patel','Hansaben Patel','Dinesh Patel','+91 94371 88991','Flat 302, Green Park Enclave, Cuttack, Odisha - 753001',1,'Girls Hostel Block A','GH-112','regular','O+','2026-10-08 03:38:01','2026-10-09 13:00:00'),(3,10,'23010145','REG2023CSE045','ADM-2023-3045','Aarav Verma','2003-11-05','Male','aarav.robotics@student.campus.edu','aarav.v@gmail.com','+91 98765 11225',1,2,3,2,'B','Ramesh Verma','Sunita Verma','Ramesh Verma','+91 94371 88992','Sector 7, CDA Colony, Bhubaneswar, Odisha - 751010',0,NULL,NULL,'regular','A+','2026-10-08 03:38:01','2026-10-08 03:38:01'),(4,12,'24050103','2024050103','','Rohan Mohanty',NULL,'Male','rohan.mohanty@student.campus.edu',NULL,'+91 94371 88201',1,1,6,3,'A',NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'regular',NULL,'2026-10-09 13:00:00','2026-10-09 13:00:00'),(6,13,'24050104','2024050104','ADM24050104','Ananya Senapati',NULL,'Female','ananya.senapati@student.campus.edu',NULL,'+91 94372 99312',1,1,6,3,'A',NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'regular',NULL,'2026-10-09 13:00:41','2026-10-09 13:00:41'),(7,14,'24050105','2024050105','ADM24050105','Biswajit Sahoo',NULL,'Male','biswajit.sahoo@student.campus.edu',NULL,'+91 98610 44551',1,1,6,3,'A',NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'regular',NULL,'2026-10-09 13:00:41','2026-10-09 13:00:41'),(8,15,'24050106','2024050106','ADM24050106','Smruti Mishra',NULL,'Female','smruti.mishra@student.campus.edu',NULL,'+91 94378 12345',1,1,6,3,'A',NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'regular',NULL,'2026-10-09 13:00:41','2026-10-09 13:00:41'),(9,16,'24050107','2024050107','ADM24050107','Debashish Jena',NULL,'Male','debashish.jena@student.campus.edu',NULL,'+91 99370 77889',1,1,6,3,'A',NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'regular',NULL,'2026-10-09 13:00:41','2026-10-09 13:00:41'),(10,17,'24050108','2024050108','ADM24050108','Subhashree Das',NULL,'Female','subhashree.das@student.campus.edu',NULL,'+91 98611 22334',1,1,6,3,'A',NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'regular',NULL,'2026-10-09 13:00:41','2026-10-09 13:00:41');
/*!40000 ALTER TABLE `student_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_semester_summaries`
--

DROP TABLE IF EXISTS `student_semester_summaries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_semester_summaries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_profile_id` int(11) NOT NULL,
  `exam_session_id` int(11) NOT NULL,
  `semester` int(11) NOT NULL,
  `total_credits_registered` int(11) NOT NULL DEFAULT 20,
  `total_credits_earned` int(11) NOT NULL DEFAULT 20,
  `sgpa` decimal(4,2) NOT NULL DEFAULT 8.00,
  `cgpa` decimal(4,2) NOT NULL DEFAULT 8.00,
  `classification` varchar(60) DEFAULT 'First Class with Distinction',
  `backlog_count` int(11) DEFAULT 0,
  `is_published` tinyint(1) DEFAULT 1,
  `published_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_profile_id` (`student_profile_id`),
  KEY `exam_session_id` (`exam_session_id`),
  CONSTRAINT `student_semester_summaries_ibfk_1` FOREIGN KEY (`student_profile_id`) REFERENCES `student_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_semester_summaries_ibfk_2` FOREIGN KEY (`exam_session_id`) REFERENCES `exam_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_semester_summaries`
--

LOCK TABLES `student_semester_summaries` WRITE;
/*!40000 ALTER TABLE `student_semester_summaries` DISABLE KEYS */;
INSERT INTO `student_semester_summaries` VALUES (1,1,1,1,20,20,9.20,9.20,'First Class with Distinction',0,1,'2026-10-09 00:51:17','2026-10-08 19:21:17'),(2,2,1,1,20,20,9.80,9.80,'First Class with Exemplary Honors',0,1,'2026-10-09 00:51:17','2026-10-08 19:21:17'),(3,1,1,1,24,24,9.33,9.33,'First Class with Distinction',0,1,'2026-10-09 00:53:33','2026-10-08 19:23:33'),(4,2,1,1,20,20,9.80,9.80,'First Class with Distinction',0,1,'2026-10-09 00:53:33','2026-10-08 19:23:33'),(5,1,1,1,28,28,9.43,9.43,'First Class with Distinction',0,1,'2026-10-09 00:54:34','2026-10-08 19:24:34'),(6,2,1,1,20,20,9.80,9.80,'First Class with Distinction',0,1,'2026-10-09 00:54:34','2026-10-08 19:24:34'),(7,1,1,1,32,32,9.50,9.50,'First Class with Distinction',0,1,'2026-10-09 00:58:46','2026-10-08 19:28:46'),(8,2,1,1,20,20,9.80,9.80,'First Class with Distinction',0,1,'2026-10-09 00:58:46','2026-10-08 19:28:46'),(9,1,1,1,20,20,9.20,9.20,'First Class with Distinction',0,1,'2026-10-09 00:59:28','2026-10-08 19:29:28'),(10,2,1,1,20,20,9.80,9.80,'First Class with Exemplary Honors',0,1,'2026-10-09 00:59:28','2026-10-08 19:29:28'),(11,1,1,1,24,24,9.33,9.33,'First Class with Distinction',0,1,'2026-10-09 00:59:34','2026-10-08 19:29:34'),(12,2,1,1,20,20,9.80,9.80,'First Class with Distinction',0,1,'2026-10-09 00:59:34','2026-10-08 19:29:34');
/*!40000 ALTER TABLE `student_semester_summaries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tag_permissions`
--

DROP TABLE IF EXISTS `tag_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tag_permissions` (
  `tag_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`tag_id`,`permission_id`),
  KEY `permission_id` (`permission_id`),
  CONSTRAINT `tag_permissions_ibfk_1` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tag_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tag_permissions`
--

LOCK TABLES `tag_permissions` WRITE;
/*!40000 ALTER TABLE `tag_permissions` DISABLE KEYS */;
INSERT INTO `tag_permissions` VALUES (1,6),(1,7),(1,8);
/*!40000 ALTER TABLE `tag_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(60) NOT NULL,
  `display_name` varchar(120) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
INSERT INTO `tags` VALUES (1,'class_representative','Class Representative (CR)','Elected student representative for class coordination',1,'2026-10-08 03:38:01'),(2,'deputy_cr','Deputy Class Representative','Assistant student representative',1,'2026-10-08 03:38:01'),(3,'club_president','Club President','Head of recognized campus club',1,'2026-10-08 03:38:01'),(4,'event_volunteer','Event Volunteer','Assigned helper for academic/cultural fest',1,'2026-10-08 03:38:01'),(5,'hostel_representative','Hostel Wing Representative','Student liaison for hostel wing issues',1,'2026-10-08 03:38:01');
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timetable_slots`
--

DROP TABLE IF EXISTS `timetable_slots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timetable_slots` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `department_id` int(11) NOT NULL DEFAULT 1,
  `semester` int(11) NOT NULL DEFAULT 6,
  `section` varchar(10) NOT NULL DEFAULT 'A',
  `day_of_week` enum('monday','tuesday','wednesday','thursday','friday','saturday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `subject_code` varchar(20) NOT NULL,
  `subject_name` varchar(100) NOT NULL,
  `faculty_name` varchar(100) NOT NULL,
  `faculty_user_id` int(11) DEFAULT NULL,
  `room_number` varchar(50) NOT NULL,
  `status` enum('scheduled','cancelled','rescheduled') DEFAULT 'scheduled',
  `notice_note` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tt_lookup` (`department_id`,`semester`,`section`,`day_of_week`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timetable_slots`
--

LOCK TABLES `timetable_slots` WRITE;
/*!40000 ALTER TABLE `timetable_slots` DISABLE KEYS */;
INSERT INTO `timetable_slots` VALUES (16,1,6,'A','monday','09:00:00','10:00:00','CS-601','Advanced Algorithms','Prof. Ashok Sharma',4,'LH-302','scheduled',NULL,'2026-10-09 13:00:00'),(17,1,6,'A','monday','10:00:00','11:00:00','CS-602','Distributed Systems','Dr. Meenakshi Sundaram',3,'LH-302','scheduled',NULL,'2026-10-09 13:00:00'),(18,1,6,'A','monday','11:15:00','12:15:00','CS-603','Database Internals','Prof. Ashok Sharma',4,'LH-302','scheduled',NULL,'2026-10-09 13:05:22'),(19,1,6,'A','monday','13:30:00','16:30:00','CS-605L','Cloud Systems Laboratory','Er. Subrat Das',4,'Computing Lab 4','scheduled',NULL,'2026-10-09 13:00:00'),(20,1,6,'A','tuesday','09:00:00','10:00:00','CS-604','Compiler Design','Dr. Vandana Saxena',6,'LH-302','scheduled',NULL,'2026-10-09 13:00:00'),(21,1,6,'A','tuesday','10:00:00','11:00:00','CS-601','Advanced Algorithms','Prof. Ashok Sharma',4,'LH-302','scheduled',NULL,'2026-10-09 13:00:00'),(22,1,6,'A','tuesday','11:15:00','12:15:00','CS-602','Distributed Systems','Dr. Meenakshi Sundaram',3,'LH-302','scheduled',NULL,'2026-10-09 13:00:00'),(23,1,6,'A','wednesday','09:00:00','10:00:00','CS-603','Database Internals','Prof. Ashok Sharma',4,'LH-302','scheduled',NULL,'2026-10-09 13:05:22'),(24,1,6,'A','wednesday','10:00:00','11:00:00','CS-604','Compiler Design','Dr. Vandana Saxena',6,'LH-302','scheduled',NULL,'2026-10-09 13:00:00'),(25,1,6,'A','wednesday','11:15:00','12:15:00','CS-601','Advanced Algorithms','Prof. Ashok Sharma',4,'LH-302','scheduled',NULL,'2026-10-09 13:00:00'),(26,1,6,'A','thursday','09:00:00','10:00:00','CS-602','Distributed Systems','Dr. Meenakshi Sundaram',3,'LH-302','scheduled',NULL,'2026-10-09 13:00:00'),(27,1,6,'A','thursday','10:00:00','11:00:00','CS-603','Database Internals','Prof. Ashok Sharma',4,'LH-302','scheduled',NULL,'2026-10-09 13:05:22'),(28,1,6,'A','friday','09:00:00','10:00:00','CS-604','Compiler Design','Dr. Vandana Saxena',6,'LH-302','scheduled',NULL,'2026-10-09 13:00:00'),(29,1,6,'A','friday','10:00:00','11:00:00','CS-601','Advanced Algorithms','Prof. Ashok Sharma',4,'LH-302','scheduled',NULL,'2026-10-09 13:00:00'),(30,1,6,'A','friday','11:15:00','12:15:00','CS-602','Distributed Systems','Dr. Meenakshi Sundaram',3,'LH-302','scheduled',NULL,'2026-10-09 13:00:00');
/*!40000 ALTER TABLE `timetable_slots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_tags`
--

DROP TABLE IF EXISTS `user_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL,
  `department_id` int(11) DEFAULT NULL,
  `scope_details` varchar(255) DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `tag_id` (`tag_id`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `user_tags_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_tags_ibfk_3` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_tags`
--

LOCK TABLES `user_tags` WRITE;
/*!40000 ALTER TABLE `user_tags` DISABLE KEYS */;
INSERT INTO `user_tags` VALUES (1,9,1,1,'MCA Section A - Academic Year 2026-27','2027-06-30 23:59:59','2026-10-08 03:38:01');
/*!40000 ALTER TABLE `user_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(80) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `primary_role_id` int(11) NOT NULL,
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `last_login_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `primary_role_id` (`primary_role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`primary_role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','admin@campus.edu','$2y$10$ICbrw/DTwlH0q8RQGIKbcOEVgDfo40FgVt/G0M.jqkCvVmpCS/DkG',1,'active','2026-10-08 19:40:13','2026-10-08 03:38:01','2026-10-08 14:10:13'),(2,'director','director@campus.edu','$2y$10$ICbrw/DTwlH0q8RQGIKbcOEVgDfo40FgVt/G0M.jqkCvVmpCS/DkG',2,'active','2026-10-08 19:43:07','2026-10-08 03:38:01','2026-10-08 14:13:07'),(3,'hod_cse','hod.cse@campus.edu','$2y$10$ICbrw/DTwlH0q8RQGIKbcOEVgDfo40FgVt/G0M.jqkCvVmpCS/DkG',3,'active','2026-10-08 19:40:12','2026-10-08 03:38:01','2026-10-08 14:10:12'),(4,'prof_sharma','ashok.sharma@campus.edu','$2y$10$ICbrw/DTwlH0q8RQGIKbcOEVgDfo40FgVt/G0M.jqkCvVmpCS/DkG',4,'active','2026-10-08 19:40:12','2026-10-08 03:38:01','2026-10-08 14:10:12'),(5,'admin_staff','records@campus.edu','$2y$10$ICbrw/DTwlH0q8RQGIKbcOEVgDfo40FgVt/G0M.jqkCvVmpCS/DkG',5,'active','2026-10-08 19:40:12','2026-10-08 03:38:01','2026-10-08 14:10:12'),(6,'exam_admin','controller.exams@campus.edu','$2y$10$ICbrw/DTwlH0q8RQGIKbcOEVgDfo40FgVt/G0M.jqkCvVmpCS/DkG',6,'active','2026-10-08 19:40:13','2026-10-08 03:38:01','2026-10-08 14:10:13'),(7,'warden_singh','warden.bh1@campus.edu','$2y$10$ICbrw/DTwlH0q8RQGIKbcOEVgDfo40FgVt/G0M.jqkCvVmpCS/DkG',8,'active','2026-10-08 19:40:13','2026-10-08 03:38:01','2026-10-08 14:10:13'),(8,'ashish','ashish.toppo@student.campus.edu','$2y$10$ICbrw/DTwlH0q8RQGIKbcOEVgDfo40FgVt/G0M.jqkCvVmpCS/DkG',9,'active','2026-10-09 18:40:31','2026-10-08 03:38:01','2026-10-09 13:10:31'),(9,'priya_cr','priya.patel@student.campus.edu','$2y$10$ICbrw/DTwlH0q8RQGIKbcOEVgDfo40FgVt/G0M.jqkCvVmpCS/DkG',9,'active','2026-10-08 19:40:13','2026-10-08 03:38:01','2026-10-08 14:10:13'),(10,'aarav_club','aarav.robotics@student.campus.edu','$2y$10$ICbrw/DTwlH0q8RQGIKbcOEVgDfo40FgVt/G0M.jqkCvVmpCS/DkG',10,'active',NULL,'2026-10-08 03:38:01','2026-10-08 03:38:01'),(11,'mess_manager','mess.manager@campus.edu','$2y$10$s0SJabDtgr78Ci0Oy2Y9M.WqwezBhXoybGVgVyREGlysd7nzEAMfe',11,'active',NULL,'2026-10-09 04:07:35','2026-10-09 04:07:35'),(12,'rohan_mohanty','rohan.mohanty@student.campus.edu','$2y$10$IJ8.WxTC8mcBYD7wEh5JI.bvd1CZxFMTFWePIBMCsPjtjC4EtBwWu',9,'active',NULL,'2026-10-09 13:00:00','2026-10-09 13:00:00'),(13,'ananya_senapati','ananya.senapati@student.campus.edu','$2y$10$IJ8.WxTC8mcBYD7wEh5JI.bvd1CZxFMTFWePIBMCsPjtjC4EtBwWu',9,'active',NULL,'2026-10-09 13:00:00','2026-10-09 13:00:00'),(14,'biswajit_sahoo','biswajit.sahoo@student.campus.edu','$2y$10$U4dhG6GoldUZzaUJnGms0e6vR5.MmB2Ejp5GrMKqXZcUOsI7/SBBG',9,'active',NULL,'2026-10-09 13:00:41','2026-10-09 13:00:41'),(15,'smruti_mishra','smruti.mishra@student.campus.edu','$2y$10$U4dhG6GoldUZzaUJnGms0e6vR5.MmB2Ejp5GrMKqXZcUOsI7/SBBG',9,'active',NULL,'2026-10-09 13:00:41','2026-10-09 13:00:41'),(16,'debashish_jena','debashish.jena@student.campus.edu','$2y$10$U4dhG6GoldUZzaUJnGms0e6vR5.MmB2Ejp5GrMKqXZcUOsI7/SBBG',9,'active',NULL,'2026-10-09 13:00:41','2026-10-09 13:00:41'),(17,'subhashree_das','subhashree.das@student.campus.edu','$2y$10$U4dhG6GoldUZzaUJnGms0e6vR5.MmB2Ejp5GrMKqXZcUOsI7/SBBG',9,'active',NULL,'2026-10-09 13:00:41','2026-10-09 13:00:41');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-10  2:09:20
