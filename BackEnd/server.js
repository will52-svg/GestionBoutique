const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// ROUTE 1 : Récupérer les produits pour ton menu déroulant
app.get('/api/produits', (req, res) => {
  const query = "SELECT * FROM produits";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// ROUTE 2 : Valider tout le panier d'un coup
app.post('/api/valider-facture', (req, res) => {
  const { nomClient, date, panier } = req.body;

  // On prépare les données pour une insertion groupée
  // Format attendu par mysql2 : [[val1, val2...], [val1, val2...]]
  const valeurs = panier.map(item => [
    date,
    item.id,
    item.qte,
    nomClient,
    item.total
  ]);

  const query = "INSERT INTO ventes (date_vente, produit_id, quantite_vendue, client, total_vente) VALUES ?";

  db.query(query, [valeurs], (err, result) => {
    if (err) {
      console.error("Erreur SQL lors de l'insertion du panier:", err);
      return res.status(500).json(err);
    }
    res.json({ message: "Facture enregistrée avec succès !", count: result.affectedRows });
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});