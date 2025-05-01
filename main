// main.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyByP5ViWW4msYRqketugoVtPSUbu-Ykhts",
    authDomain: "ilieni-invest.firebaseapp.com",
    projectId: "ilieni-invest",
    storageBucket: "ilieni-invest.firebasestorage.app",
    messagingSenderId: "1083438978721",
    appId: "1:1083438978721:web:fa4c2aaf6cd53286e302e0",
    measurementId: "G-2XBHW5934G"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// Funcțiile pentru autentificare și adăugare produs
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

function toggleAuth() {
    const title = document.getElementById('authTitle');
    if (title.textContent === "Autentificare") {
        title.textContent = "Înregistrare";
    } else {
        title.textContent = "Autentificare";
    }
}

window.handleAuth = handleAuth;
window.toggleAuth = toggleAuth;

function addProduct() {
    const name = document.getElementById("productName").value.trim();
    const description = document.getElementById("productDescription").value.trim();
    const price = document.getElementById("productPrice").value.trim();
    const imageInput = document.getElementById("productImage");

    if (!name || !price) {
        alert("Te rugăm să completezi toate câmpurile obligatorii!");
        return;
    }

    const li = document.createElement("li");
    li.style.display = "block";
    li.innerHTML = `
        <strong>${name}</strong><br>
        ${description ? `<em>${description}</em><br>` : ""}
        ${price ? `<span>Preț: ${price} RON</span><br>` : ""}
        ${imageInput.files[0] ? `<img src="${URL.createObjectURL(imageInput.files[0])}" alt="${name}" style="max-width: 150px; margin-top: 5px;"><br>` : ""}
        <hr>
    `;

    document.getElementById("productList").appendChild(li);

    document.getElementById("productName").value = "";
    document.getElementById("productDescription").value = "";
    document.getElementById("productPrice").value = "";
    imageInput.value = "";
}

window.addProduct = addProduct;

function searchProducts() {
    const input = document.getElementById("searchInput").value.toLowerCase();
    const items = document.querySelectorAll("#productList li");

    items.forEach((li) => {
        li.style.display = li.textContent.toLowerCase().includes(input) ? "block" : "none";
    });
}

window.searchProducts = searchProducts;
