// Funcția pentru autentificare și înregistrare
function handleAuth() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (document.getElementById('authTitle').textContent === "Autentificare") {
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                document.getElementById("authForm").style.display = "none";
                document.getElementById("welcomeMessage").textContent = "Bine ai venit, " + user.email + "!";
                document.getElementById("welcomeMessage").style.display = "block";
                document.getElementById("addProductForm").style.display = "block";
            })
            .catch((error) => {
                alert("Eroare la autentificare: " + error.message);
            });
    } else {
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                document.getElementById("authForm").style.display = "none";
                document.getElementById("welcomeMessage").textContent = "Cont creat! Bine ai venit, " + user.email + "!";
                document.getElementById("welcomeMessage").style.display = "block";
                document.getElementById("addProductForm").style.display = "block";
            })
            .catch((error) => {
                alert("Eroare la înregistrare: " + error.message);
            });
    }
}

window.handleAuth = handleAuth;

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

