// main.js (gazduit pe GitHub Pages)
import './firebaseConfig.js';
import './products.js';
import './auth.js';

// Pornim aplicația (ex: încărcăm produsele)
loadProducts();

document.getElementById("addProductButton").addEventListener("click", addProduct);
document.getElementById("searchInput").addEventListener("keyup", searchProducts);

// Încarcă produsele atunci când documentul este gata
document.addEventListener("DOMContentLoaded", loadProducts);

