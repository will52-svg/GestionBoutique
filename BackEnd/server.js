const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

// CONFIGURATION CORS : Port 5173 (celui de ton navigateur)
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json());

// CONNEXION BDD
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'gestion_boutique'
});

db.connect((err) => {
    if (err) return console.error('Erreur MySQL:', err);
    console.log('Connecté à MySQL sur le port 3000');
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
    panier.forEach(item => {
        const sqlVente = "INSERT INTO ventes (date_vente, produit_id, quantite_vendue, client, total_vente) VALUES (?, ?, ?, ?, ?)";
        db.query(sqlVente, [date, item.id, item.qte, nomClient, item.total]);

        const sqlUpdate = "UPDATE produits SET sorties = sorties + ? WHERE id = ?";
        db.query(sqlUpdate, [item.qte, item.id]);
    });
    res.json({ message: "Succès" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});