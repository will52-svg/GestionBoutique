-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : jeu. 14 mai 2026 à 22:22
-- Version du serveur : 5.7.40
-- Version de PHP : 8.0.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `gestion_boutique`
--

-- --------------------------------------------------------

--
-- Structure de la table `produits`
--

DROP TABLE IF EXISTS `produits`;
CREATE TABLE IF NOT EXISTS `produits` (
  `id` varchar(10) NOT NULL,
  `designation` varchar(255) NOT NULL,
  `prix_unitaire` decimal(10,2) DEFAULT '0.00',
  `stock_initial` int(11) DEFAULT '0',
  `sorties` int(11) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=26 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `produits`
--

INSERT INTO `produits` (`id`, `designation`, `prix_unitaire`, `stock_initial`, `sorties`) VALUES
('PROD001', 'TASSEAUX', '5500.00', 15000, 100),
('PROD002', 'MOULURES', '0.00', 0, 4),
('PROD003', 'PANNEAUX 3D', '0.00', 0, 6),
('PROD004', 'PIERRE PVC', '0.00', 0, 18),
('PROD005', 'ROULEAU PVC', '0.00', 0, 28),
('PROD006', 'PLAQUE UV', '0.00', 0, 23),
('PROD007', 'FRISE', '0.00', 0, 16),
('PROD008', 'APPLIQUES MURALES', '0.00', 0, 1),
('PROD009', 'PLAFONNIERS', '0.00', 0, 3),
('PROD010', 'LUSTRES', '0.00', 0, 3),
('PROD011', 'COLLE SILICONE', '0.00', 0, 0),
('PROD012', 'VIS A TASSEAUX', '0.00', 0, 0),
('PROD013', 'FER A PLAQUE', '0.00', 0, 0),
('PROD014', 'RUBAN LED', '0.00', 0, 0),
('PROD015', 'TRANSFO', '0.00', 0, 0),
('PROD016', 'INTERRUPTEURS', '0.00', 0, 0),
('PROD017', 'PLAQUE MELAMINE', '0.00', 0, 0),
('PROD018', 'PLAQUE EN BAMBOU', '0.00', 0, 0),
('PROD019', 'SPOTS', '0.00', 0, 0),
('PROD020', 'LUMIERES RAILS', '0.00', 0, 0),
('PROD021', 'WC', '0.00', 0, 0),
('PROD022', 'COLONNE DE DOUCHE', '0.00', 0, 0),
('PROD023', 'LEVIER DE CUISINE', '0.00', 0, 0),
('PROD024', 'MITIGEUSES', '0.00', 0, 0),
('PROD025', 'ROBINETS', '0.00', 0, 0);

-- --------------------------------------------------------

--
-- Structure de la table `ventes`
--

DROP TABLE IF EXISTS `ventes`;
CREATE TABLE IF NOT EXISTS `ventes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date_vente` date NOT NULL,
  `produit_id` varchar(10) NOT NULL,
  `quantite_vendue` int(11) NOT NULL,
  `client` varchar(255) DEFAULT NULL,
  `total_vente` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `produit_id` (`produit_id`)
) ENGINE=MyISAM AUTO_INCREMENT=25 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `ventes`
--

INSERT INTO `ventes` (`id`, `date_vente`, `produit_id`, `quantite_vendue`, `client`, `total_vente`) VALUES
(1, '2026-05-14', '2', 2, 'ABI', '4000.00'),
(2, '2026-05-14', '2', 2, 'ABI', '4000.00'),
(3, '2026-05-14', 'PROD008', 1, 'Y', '1.00'),
(4, '2026-05-14', 'PROD005', 5, 'Gril', '10000.00'),
(5, '2026-05-14', 'PROD005', 5, 'Gril', '10000.00'),
(6, '2026-05-14', 'PROD009', 3, 'HUk', '6000.00'),
(7, '2026-05-14', 'PROD007', 3, 'Gril', '18000.00'),
(8, '2026-05-14', 'PROD007', 3, 'Gril', '18000.00'),
(9, '2026-05-14', 'PROD010', 3, 'Gran', '0.00'),
(10, '2026-05-14', 'PROD005', 3, 'Gil', '6000.00'),
(11, '2026-05-14', 'PROD005', 3, 'Gil', '6000.00'),
(12, '2026-05-14', 'PROD007', 5, 'Gtil', '15000.00'),
(13, '2026-05-14', 'PROD007', 5, 'Gtil', '15000.00'),
(14, '2026-05-14', 'PROD004', 6, 'Gril', '6000.00'),
(15, '2026-05-14', 'PROD004', 6, 'Gril', '6000.00'),
(16, '2026-05-14', 'PROD006', 6, 'Mira', '12000.00'),
(17, '2026-05-14', 'PROD006', 6, 'Mira', '12000.00'),
(18, '2026-05-14', 'PROD003', 3, 'Gri', '6000.00'),
(19, '2026-05-14', 'PROD003', 3, 'Gri', '6000.00'),
(20, '2026-05-14', 'PROD006', 3, 'Gri', '19050.00'),
(21, '2026-05-14', 'PROD006', 8, 'Gal', '24000.00'),
(22, '2026-05-14', 'PROD005', 6, 'gil', '12000.00'),
(23, '2026-05-14', 'PROD005', 6, 'gil', '12000.00'),
(24, '2026-05-14', 'PROD004', 6, 'jul', '12120.00');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
