import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = "http://localhost:5000/api";

function App() {
  const [produits, setProduits] = useState([]);
  const [panier, setPanier] = useState([]);
  const [nomClient, setNomClient] = useState('');
  const [dateVente, setDateVente] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProd, setSelectedProd] = useState(null);
  const [prixSaisi, setPrixSaisi] = useState(0);
  const [quantite, setQuantite] = useState(1);

  // Charger les produits au démarrage
  useEffect(() => {
    axios.get(`${API_URL}/produits`)
      .then(res => setProduits(res.data))
      .catch(err => console.error("Le serveur BackEnd est-il lancé ?"));
  }, []);

  const ajouterAuPanier = () => {
    if (!selectedProd || prixSaisi <= 0) return alert("Vérifiez l'article et le prix");
    
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
    document.getElementById('selectProd').value = ""; 
  };

  const retirerDuPanier = (index) => {
    setPanier(panier.filter((_, i) => i !== index));
  };

  const validerEtImprimer = () => {
    if (panier.length === 0 || !nomClient) return alert("Nom client ou panier vide !");
    
    const dataVente = {
      nomClient: nomClient,
      date: dateVente,
      panier: panier
    };

    // Envoi du panier complet au serveur
    axios.post(`${API_URL}/valider-facture`, dataVente)
      .then(() => {
        alert("Vente enregistrée dans la base Aiven !");
        window.print(); // Lance l'impression
        setPanier([]); 
        setNomClient('');
      })
      .catch(err => {
        console.error(err);
        alert("Erreur lors de l'enregistrement");
      });
  };

  const telechargerHistorique = () => {
    if (panier.length === 0) return alert("Le tableau est vide !");
    const doc = new jsPDF();
    doc.text("FACTURE PROVISOIRE", 105, 20, { align: "center" });
    doc.text(`Client: ${nomClient}`, 20, 30);
    const rows = panier.map(i => [i.id, i.designation, i.pu, i.qte, i.total]);
    autoTable(doc, {
      startY: 40,
      head: [['ID', 'Désignation', 'PU', 'Qté', 'Total']],
      body: rows,
    });
    doc.save(`Facture_${nomClient}.pdf`);
  };

  return (
    <div style={{ padding: '25px', fontFamily: 'Arial', maxWidth: '1000px', margin: 'auto' }}>
      <h2 style={{ color: '#2c3e50', textAlign: 'center' }}>GESTION COMMERCIALE - BOUTIQUE</h2>
      
      {/* 1. Zone Client - Séparée pour ne pas être réinitialisée */}
      <div style={{ background: '#ecf0f1', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
        <label><b>CLIENT : </b></label>
        <input 
          type="text" 
          placeholder="Entrer le nom du client" 
          value={nomClient} 
          onChange={e => setNomClient(e.target.value)} 
          style={{ padding: '8px', width: '300px', border: '1px solid #bdc3c7', borderRadius: '4px' }} 
        />
        <label style={{ marginLeft: '20px' }}><b>DATE : </b></label>
        <input type="date" value={dateVente} onChange={e => setDateVente(e.target.value)} style={{ padding: '8px' }} />
      </div>

      {/* 2. Zone Article - C'est ici qu'on ajoute au panier */}
      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd' }}>
        <label><b>ARTICLE : </b></label>
        <select id="selectProd" style={{ padding: '8px', width: '200px' }} onChange={e => {
          const p = produits.find(x => String(x.id) === e.target.value);
          setSelectedProd(p);
          setPrixSaisi(p ? p.prix_unitaire : 0);
        }}>
          <option value="">-- Sélectionner --</option>
          {produits.map(p => <option key={p.id} value={p.id}>{p.designation}</option>)}
        </select>

        <label style={{ marginLeft: '15px' }}><b>PRIX : </b></label>
        <input type="number" value={prixSaisi} onChange={e => setPrixSaisi(e.target.value)} style={{ width: '100px', padding: '8px' }} />

        <label style={{ marginLeft: '15px' }}><b>QTÉ : </b></label>
        <input type="number" value={quantite} onChange={e => setQuantite(e.target.value)} style={{ width: '70px', padding: '8px' }} />
        
        <button onClick={ajouterAuPanier} style={{ marginLeft: '20px', padding: '10px 20px', background: '#2c3e50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          AJOUTER AU PANIER
        </button>
      </div>

      {/* 3. Tableau des ventes */}
      <table width="100%" border="1" style={{ borderCollapse: 'collapse', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ background: '#34495e', color: 'white' }}>
            <th style={{ padding: '12px' }}>ID</th>
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
              <td style={{ padding: '10px' }}>{item.id}</td>
              <td>{item.designation}</td>
              <td>{item.pu.toLocaleString()}</td>
              <td>{item.qte}</td>
              <td>{(item.pu * item.qte).toLocaleString()} FCFA</td>
              <td>
                <button onClick={() => retirerDuPanier(i)} style={{ color: '#e74c3c', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                  Retirer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 4. Actions finales */}
      <div style={{ display: 'flex', gap: '20px' }}>
        <button onClick={validerEtImprimer} style={{ flex: 1, padding: '15px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
          VALIDER & ENREGISTRER (AIVEN)
        </button>
        <button onClick={telechargerHistorique} style={{ flex: 1, padding: '15px', background: '#2980b9', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
          TÉLÉCHARGER FACTURE PDF
        </button>
      </div>
    </div>
  );
  }

export default App;