const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

// 1. CONFIGURATION CORS : On autorise tout pour le moment pour faciliter les tests
// Plus tard, on mettra l'adresse de ton site Vercel ici.
app.use(cors());

app.use(express.json());

// 2. CONNEXION BDD : On utilise les variables d'environnement de Render
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false // Indispensable pour la sécurité d'Aiven
    }
});

db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à Aiven:', err.message);
        return;
    }
    console.log('Connecté avec succès à la base de données Aiven !');
});

// Route pour les produits
app.get('/produits', (req, res) => {
    db.query("SELECT * FROM produits", (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

// Route pour valider la facture
app.post('/valider-facture', (req, res) => {
    const { nomClient, date, panier } = req.body;
    
    // On utilise une boucle pour gérer les requêtes proprement
    const promises = panier.map(item => {
        return new Promise((resolve, reject) => {
            const sqlVente = "INSERT INTO ventes (date_vente, produit_id, quantite_vendue, client, total_vente) VALUES (?, ?, ?, ?, ?)";
            db.query(sqlVente, [date, item.id, item.qte, nomClient, item.total], (err) => {
                if (err) return reject(err);
                
                const sqlUpdate = "UPDATE produits SET sorties = sorties + ? WHERE id = ?";
                db.query(sqlUpdate, [item.qte, item.id], (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });
        });
    });

    Promise.all(promises)
        .then(() => res.json({ message: "Succès" }))
        .catch(err => res.status(500).json(err));
});

// 3. PORT DYNAMIQUE : Indispensable pour Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});