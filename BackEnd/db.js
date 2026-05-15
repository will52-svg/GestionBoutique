require('dotenv').config(); // Charge les variables du fichier .env
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});
// ... reste du code identique

connection.connect((err) => {
  if (err) {
    console.error('Erreur de connexion SQL :', err.message);
    return;
  }
  console.log('Félicitations ! Ton BackEnd est relié à la base Boutique.');
});

module.exports = connection;