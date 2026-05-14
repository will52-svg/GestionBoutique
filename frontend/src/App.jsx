import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// 1. DÉFINIR L'URL DE TON BACKEND SUR RENDER
const API_URL = "https://TA_NOUVELLE_URL_RENDER.onrender.com";

function App() {
  const [produits, setProduits] = useState([]);
  const [panier, setPanier] = useState([]);
  const [nomClient, setNomClient] = useState('');
  const [dateVente, setDateVente] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProd, setSelectedProd] = useState(null);
  const [prixSaisi, setPrixSaisi] = useState(0);
  const [quantite, setQuantite] = useState(1);

  // CHARGEMENT DES PRODUITS (Depuis Render maintenant !)
  useEffect(() => {
    axios.get(`${API_URL}/produits`)
      .then(res => setProduits(res.data))
      .catch(err => console.error("Erreur de connexion au serveur Render"));
  }, []);

  const ajouterAuPanier = () => {
    if (!selectedProd) return alert("Sélectionnez un article");
    
    setPanier([...panier, {
      id: selectedProd.id,
      designation: selectedProd.designation,
      pu: parseFloat(prixSaisi),
      qte: parseInt(quantite),
      total: parseFloat(prixSaisi) * parseInt(quantite)
    }]);

    setSelectedProd(null);
    setPrixSaisi(0);
    setQuantite(1);
    // On ne vide plus le nom du client ici pour qu'il reste jusqu'à la facture finale
    document.getElementById('selectProd').value = ""; 
  };

  const retirerDuPanier = (index) => {
    const nouveauPanier = panier.filter((_, i) => i !== index);
    setPanier(nouveauPanier);
  };

  // BOUTON VALIDER ET IMPRIMER (ENVOI À AIVEN + IMPRESSION)
  const validerEtImprimer = () => {
    if (panier.length === 0 || !nomClient) return alert("Vérifiez le nom et le tableau");
    
    // On prépare les données pour le BackEnd
    const dataVente = {
      nomClient: nomClient,
      date: dateVente,
      panier: panier
    };

    // 1. On envoie les données à Render pour enregistrer dans Aiven
    axios.post(`${API_URL}/valider-facture`, dataVente)
      .then(() => {
        // 2. Si l'enregistrement a réussi, on imprime
        window.print();
        
        // 3. On vide tout pour la vente suivante
        setPanier([]); 
        setNomClient('');
        alert("Vente enregistrée en ligne et impression lancée !");
      })
      .catch(err => {
        console.error(err);
        alert("Erreur lors de l'enregistrement sur Aiven");
      });
  };
  
  const telechargerHistorique = () => {
    if (panier.length === 0) return alert("Le tableau est vide !");
    try {
      const doc = new jsPDF();
      doc.text("HISTORIQUE DES PAIEMENTS", 105, 20, { align: "center" });
      const rows = panier.map(i => [i.id, i.designation, i.pu, i.qte, i.total]);
      autoTable(doc, {
        startY: 30,
        head: [['ID', 'Désignation', 'PU', 'Qté', 'Total']],
        body: rows,
      });
      doc.save("historique.pdf");
    } catch (err) {
      alert("Erreur PDF : " + err.message);
    }
  };

  return (
    <div style={{ padding: '25px', fontFamily: 'Arial' }}>
      <h2 style={{ color: '#2c3e50' }}>GESTION COMMERCIALE V1.0 - CLOUD MODE</h2>
      
      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <input type="text" placeholder="Nom Client" value={nomClient} onChange={e => setNomClient(e.target.value)} />
        
        <select id="selectProd" style={{ marginLeft: '10px' }} onChange={e => {
          const p = produits.find(x => String(x.id) === e.target.value);
          setSelectedProd(p);
          setPrixSaisi(p ? p.prix_unitaire : 0);
        }}>
          <option value="">-- Choisir Article --</option>
          {produits.map(p => <option key={p.id} value={p.id}>{p.id} - {p.designation}</option>)}
        </select>

        <label style={{ marginLeft: '10px' }}><b>PU :</b></label>
        <input type="number" value={prixSaisi} onChange={e => setPrixSaisi(e.target.value)} style={{ width: '100px' }} />

        <label style={{ marginLeft: '10px' }}><b>Qté :</b></label>
        <input type="number" value={quantite} onChange={e => setQuantite(e.target.value)} style={{ width: '60px' }} />
        
        <button onClick={ajouterAuPanier} style={{ marginLeft: '10px', background: '#2c3e50', color: 'white' }}>AJOUTER</button>
      </div>

      <table width="100%" border="1" style={{ borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr style={{ background: '#eee' }}>
            <th>ID</th>
            <th>Désignation</th>
            <th>PU</th>
            <th>Qté</th>
            <th>Total</th>
            <th>Action</th> 
          </tr>
        </thead>
        <tbody>
          {panier.map((item, i) => (
            <tr key={i} style={{ textAlign: 'center' }}>
              <td>{item.id}</td>
              <td>{item.designation}</td>
              <td>{item.pu}</td>
              <td>{item.qte}</td>
              <td>{item.total}</td>
              <td>
                <button onClick={() => retirerDuPanier(i)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Retirer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', gap: '20px' }}>
        <button onClick={validerEtImprimer} style={{ flex: 1, padding: '15px', background: '#27ae60', color: 'white', fontWeight: 'bold' }}>VALIDER ET IMPRIMER</button>
        <button onClick={telechargerHistorique} style={{ flex: 1, padding: '15px', background: '#2980b9', color: 'white', fontWeight: 'bold' }}>HISTORIQUE DES PAIEMENTS</button>
      </div>
    </div>
  );
}

export default App;