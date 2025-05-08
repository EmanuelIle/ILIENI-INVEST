// main.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

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
const db = getFirestore(app);
const storage = getStorage(app);

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

async function addProduct() {
    const name = document.getElementById("productName").value.trim();
    const description = document.getElementById("productDescription").value.trim();
    const price = document.getElementById("productPrice").value.trim();
    const imageInput = document.getElementById("productImage");

    if (!name || !price) {
        alert("Te rugăm să completezi toate câmpurile obligatorii!");
        return;
    }

    let imageUrl = "";
    const imageFile = imageInput.files[0];

    if (imageFile) {
        try {
            const imageRef = ref(storage, `product_images/${Date.now()}_${imageFile.name}`);
            await uploadBytes(imageRef, imageFile);
            imageUrl = await getDownloadURL(imageRef);
        } catch (error) {
            console.error("Eroare la upload imagine:", error);
            alert("Eroare la încărcarea imaginii.");
            return;
        }
    }

    try {
        await addDoc(collection(db, "products"), {
            name,
            description,
            price,
            imageUrl,
            createdAt: new Date()
        });

        alert("Produs adăugat cu succes!");

        const card = document.createElement('div');
card.className = 'product-card';

const img = document.createElement('img');
img.src = imageUrl;
img.alt = name;
title.textContent = name;
desc.textContent = description;
priceElement.textContent = `Preț: ${price} RON`;

const title = document.createElement('h3');
title.textContent = product.name;

const desc = document.createElement('p');
desc.textContent = product.description;

const price = document.createElement('div');
price.className = 'price';
price.textContent = `Preț: ${product.price} RON`;

card.appendChild(img);
card.appendChild(title);
card.appendChild(desc);
card.appendChild(price);

// Adaugă cardul în grid
document.getElementById("productGrid").appendChild(card);


        // Resetare formular
        document.getElementById("productName").value = "";
        document.getElementById("productDescription").value = "";
        document.getElementById("productPrice").value = "";
        imageInput.value = "";

    } catch (error) {
        console.error("Eroare la salvare în Firestore:", error);
        alert("Eroare la salvarea anunțului.");
    }
}
window.addProduct = addProduct;
document.addEventListener("DOMContentLoaded", () => {
    const addBtn = document.getElementById("addProductButton");
    if (addBtn) {
        addBtn.addEventListener("click", addProduct);
    }
});
import { query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

async function loadProducts() {
    try {
        const productList = document.getElementById("productList");
        productList.innerHTML = ""; // Curățăm lista anterioară

        const productsQuery = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(productsQuery);

        const grid = document.getElementById("productGrid");
grid.innerHTML = "";

querySnapshot.forEach((doc) => {
    const data = doc.data();

 const card = document.createElement('div');
card.className = 'product-card';

const img = document.createElement('img');
img.src = imageUrl;
img.alt = name;

const title = document.createElement('h3');
title.textContent = name; // Folosește name în loc de product.name

const desc = document.createElement('p');
desc.textContent = description; // Folosește description în loc de product.description

const priceElement = document.createElement('div');
priceElement.className = 'price';
priceElement.textContent = `Preț: ${price} RON`; // Folosește price în loc de product.price

card.appendChild(img);
card.appendChild(title);
card.appendChild(desc);
card.appendChild(priceElement);

// Adaugă cardul în grid
document.getElementById("productGrid").appendChild(card);
