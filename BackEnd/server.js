const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuration de la connexion à Aiven
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false
    }
});

db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à Aiven :', err.message);
        return;
    }
    console.log('Connecté à la base de données MySQL sur Aiven !');

    // --- INJECTION AUTOMATIQUE DU FICHIER SQL ---
    const sqlPath = path.join(__dirname, 'gestion_boutique.sql');
    
    if (fs.existsSync(sqlPath)) {
        fs.readFile(sqlPath, 'utf8', (err, data) => {
            if (err) {
                console.error("Erreur de lecture du fichier SQL:", err);
                return;
            }

            // On sépare les requêtes par ";" pour les exécuter une par une
            const queries = data.split(';').filter(q => q.trim() !== '');
            
            queries.forEach(query => {
                db.query(query, (err) => {
                    if (err) {
                        // On ignore l'erreur si la table existe déjà
                        if (!err.message.includes("already exists")) {
                            console.log("Info SQL :", err.message);
                        }
                    }
                });
            });
            console.log("Script SQL traité (Tables créées/vérifiées).");
        });
    } else {
        console.log("Fichier gestion_boutique.sql introuvable, injection ignorée.");
    }
});

// --- ROUTES DE L'APPLICATION ---

// Récupérer tous les produits
app.get('/produits', (req, res) => {
    db.query('SELECT * FROM produits', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Enregistrer une vente et mettre à jour le stock
app.post('/ventes', (req, res) => {
    const { client, produits } = req.body; // produits est un tableau d'objets {id, quantite}

    // On utilise une transaction pour être sûr que tout s'enregistre bien
    db.beginTransaction((err) => {
        if (err) return res.status(500).json(err);

        produits.forEach((p) => {
            // 1. Ajouter la vente
            const sqlVente = 'INSERT INTO ventes (nom_client, produit_id, quantite, date_vente) VALUES (?, ?, ?, NOW())';
            db.query(sqlVente, [client, p.id, p.quantite], (err) => {
                if (err) return db.rollback(() => res.status(500).json(err));

                // 2. Mettre à jour les sorties dans la table produits
                const sqlUpdate = 'UPDATE produits SET sorties = sorties + ? WHERE id = ?';
                db.query(sqlUpdate, [p.quantite, p.id], (err) => {
                    if (err) return db.rollback(() => res.status(500).json(err));
                });
            });
        });

        db.commit((err) => {
            if (err) return db.rollback(() => res.status(500).json(err));
            res.json({ message: "Vente enregistrée et stock mis à jour !" });
        });
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Serveur Backend lancé sur le port ${PORT}`);
});