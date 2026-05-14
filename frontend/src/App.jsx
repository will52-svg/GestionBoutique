import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function App() {
  const [produits, setProduits] = useState([]);
  const [panier, setPanier] = useState([]);
  const [nomClient, setNomClient] = useState('');
  const [dateVente, setDateVente] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProd, setSelectedProd] = useState(null);
  const [prixSaisi, setPrixSaisi] = useState(0);
  const [quantite, setQuantite] = useState(1);

  // CHARGEMENT DES PRODUITS
  useEffect(() => {
    axios.get('http://localhost:3000/produits')
      .then(res => setProduits(res.data))
      .catch(err => console.error("Le serveur ne répond pas sur le port 3000"));
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

  // VIDAGE DE TOUS LES CHAMPS
  setSelectedProd(null);
  setPrixSaisi(0);
  setQuantite(1);
  setNomClient(''); // <--- CETTE LIGNE VIDE LE NOM DU CLIENT
  
  document.getElementById('selectProd').value = ""; 
};

  // BOUTON VALIDER ET IMPRIMER (IMPRESSION SYSTÈME + VIDAGE)
  const validerEtImprimer = () => {
    if (panier.length === 0 || !nomClient) return alert("Vérifiez le nom et le tableau");
    
    // 1. On lance l'impression de la page (Fenêtre Windows/Navigateur)
    window.print();
    
    // 2. On vide le panier et le nom après l'impression
    setPanier([]); 
    setNomClient('');
    
    alert("Impression lancée et panier vidé !");
  };
  
 const telechargerHistorique = () => {
  if (panier.length === 0) return alert("Le tableau est vide !");

  try {
    const doc = new jsPDF();
    doc.text("HISTORIQUE DES PAIEMENTS", 105, 20, { align: "center" });

    const rows = panier.map(i => [i.id, i.designation, i.pu, i.qte, i.total]);

    // On appelle autoTable directement avec le document (doc)
    autoTable(doc, {
      startY: 30,
      head: [['ID', 'Désignation', 'PU', 'Qté', 'Total']],
      body: rows,
    });

    doc.save("historique.pdf");
  } catch (err) {
    console.error(err);
    alert("Erreur PDF : " + err.message);
  }
};

  return (
    <div style={{ padding: '25px', fontFamily: 'Arial' }}>
      <h2 style={{ color: '#2c3e50' }}>GESTION COMMERCIALE V1.0</h2>
      
      
<div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
  <input type="text" placeholder="Nom Client" value={nomClient} onChange={e => setNomClient(e.target.value)} />
  
  <select id="selectProd" style={{ marginLeft: '10px' }} onChange={e => {
    const p = produits.find(x => x.id === e.target.value);
    setSelectedProd(p);
    setPrixSaisi(p ? p.prix_unitaire : 0);
  }}>
    <option value="">-- Choisir Article --</option>
    {produits.map(p => <option key={p.id} value={p.id}>{p.id} - {p.designation}</option>)}
  </select>

  
  <label style={{ marginLeft: '10px' }}><b>PU :</b></label>
  <input 
    type="number" 
    value={prixSaisi} 
    onChange={e => setPrixSaisi(e.target.value)} 
    style={{ width: '100px' }} 
  />

 
  <label style={{ marginLeft: '10px' }}><b>Qté :</b></label>
  <input 
    type="number" 
    value={quantite} 
    onChange={e => setQuantite(e.target.value)} 
    style={{ width: '60px' }} 
  />
  
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
        <button 
          onClick={() => retirerDuPanier(i)} 
          style={{ 
            background: '#e74c3c', 
            color: 'white', 
            border: 'none', 
            padding: '5px 10px', 
            borderRadius: '4px',
            cursor: 'pointer' 
          }}
        >
          Retirer
        </button>
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
const retirerDuPanier = (index) => {
  const nouveauPanier = panier.filter((_, i) => i !== index);
  setPanier(nouveauPanier);
};

export default App;