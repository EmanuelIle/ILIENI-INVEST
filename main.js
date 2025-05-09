// Importarea modulului Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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
const db = getFirestore(app);

// Elemente din HTML
const authForm = document.getElementById("authForm");
const addProductForm = document.getElementById("addProductForm");
const productList = document.getElementById("productList");
const logoutButton = document.getElementById("logoutButton");
const welcomeMessage = document.getElementById("welcomeMessage");
const noProductsMessage = document.getElementById("noProducts");
const cartSection = document.getElementById("cartSection");
const cartItemsList = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");

let cart = [];

// Funcție de autentificare
function handleAuth() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Verifică dacă utilizatorul vrea să se autentifice sau să se înregistreze
    const isRegister = document.getElementById('authTitle').textContent === 'Înregistrare';

    if (isRegister) {
        firebase.auth().createUserWithEmailAndPassword(email, password).then((userCredential) => {
            console.log("Contul a fost creat cu succes!", userCredential);
        }).catch((error) => {
            console.error("Eroare la înregistrare:", error);
        });
    } else {
        firebase.auth().signInWithEmailAndPassword(email, password).then((userCredential) => {
            console.log("Autentificare reușită!", userCredential);
            document.getElementById('welcomeMessage').style.display = 'block';
            document.getElementById('welcomeMessage').textContent = `Bine ai venit, ${userCredential.user.email}!`;
            document.getElementById('authForm').style.display = 'none';
            document.getElementById('logoutButton').style.display = 'block';
        }).catch((error) => {
            console.error("Eroare la autentificare:", error);
        });
    }
}


// Funcție pentru a afisa mesajul de bun venit
function displayWelcomeMessage(user) {
  welcomeMessage.style.display = 'block';
  welcomeMessage.innerHTML = `Bun venit, ${user.email}`;
  logoutButton.style.display = 'inline-block';
}

// Funcție pentru a schimba între autentificare și înregistrare
function toggleAuth() {
    const authForm = document.getElementById('authForm');
    const authTitle = document.getElementById('authTitle');
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');

    if (authTitle.textContent === 'Autentificare') {
        authTitle.textContent = 'Înregistrare';
        emailField.placeholder = 'Email pentru înregistrare';
        passwordField.placeholder = 'Parolă pentru înregistrare';
    } else {
        authTitle.textContent = 'Autentificare';
        emailField.placeholder = 'Email';
        passwordField.placeholder = 'Parolă';
    }
}

// Funcție pentru a deconecta utilizatorul
function logout() {
    // Dacă folosești Firebase:
    firebase.auth().signOut().then(() => {
        console.log('Te-ai deconectat cu succes.');
        window.location.reload();  // Poți actualiza pagina sau redirecționa utilizatorul.
    }).catch((error) => {
        console.error('Eroare la deconectare:', error);
    });
}

// Funcție pentru a comuta vizibilitatea formularului de autentificare
function toggleAuthForm(show) {
  authForm.style.display = show ? 'block' : 'none';
  addProductForm.style.display = show ? 'none' : 'block';
  cartSection.style.display = show ? 'none' : 'block';
}

// Funcție pentru a adăuga produse în Firebase
function addProduct() {
    const productName = document.getElementById('productName').value;
    const productDescription = document.getElementById('productDescription').value;
    const productPrice = document.getElementById('productPrice').value;
    const productQuantity = document.getElementById('productQuantity').value;
    const productImage = document.getElementById('productImage').files[0];

    if (!productName || !productPrice || !productQuantity) {
        alert("Te rog completează toate câmpurile necesare.");
        return;
    }

    // Salvează produsul într-un array sau în Firebase
    console.log('Produs adăugat:', productName, productDescription, productPrice, productQuantity, productImage);
}

// Funcție pentru a încarca imaginea în Firebase Storage
async function uploadImage(imageFile) {
  const storageRef = firebase.storage().ref();
  const imageRef = storageRef.child('images/' + imageFile.name);
  await imageRef.put(imageFile);
  const downloadURL = await imageRef.getDownloadURL();
  return downloadURL;
}

// Funcție pentru a încărca produsele din Firebase
async function loadProducts() {
  const productList = document.getElementById("productList");
  productList.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "products"));

  if (querySnapshot.empty) {
    noProductsMessage.style.display = 'block';
  } else {
    noProductsMessage.style.display = 'none';
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${data.name}</strong><br>
        ${data.description ? `<em>${data.description}</em><br>` : ""}
        <span>Preț: ${data.price} RON</span><br>
        <span>Bucăți disponibile: ${data.quantity}</span><br>
        ${data.imageUrl ? `<img src="${data.imageUrl}" alt="${data.name}" style="max-width: 150px; margin-top: 5px;"><br>` : ""}
        <button onclick="addToCart('${doc.id}', '${data.name}', ${data.price})">Adaugă în coș</button>
      `;
      productList.appendChild(li);
    });
  }
}

// Funcție pentru a adăuga produse în coș
function addToCart(productId, productName, productPrice) {
  const productInCart = cart.find(item => item.productId === productId);
  if (productInCart) {
    productInCart.quantity++;
  } else {
    cart.push({ productId, productName, productPrice, quantity: 1 });
  }
  updateCartDisplay();
}

// Funcție pentru a actualiza vizualizarea coșului
function updateCartDisplay() {
  cartItemsList.innerHTML = "";
  let total = 0;
  cart.forEach(item => {
    total += item.productPrice * item.quantity;
    const li = document.createElement("li");
    li.innerHTML = `${item.productName} x${item.quantity} - ${item.productPrice * item.quantity} RON`;
    cartItemsList.appendChild(li);
  });

  cartTotal.innerHTML = `<strong>Total:</strong> ${total} RON`;
  cartSection.style.display = 'block';
}

// Funcție pentru a finaliza comanda
function finalizeOrder() {
  alert('Comanda ta a fost trimisă!');
  cart = [];
  updateCartDisplay();
}

// Funcție pentru a goli coșul
function clearCart() {
  cart = [];
  updateCartDisplay();
}

// Ascultător pentru modificările stării utilizatorului
onAuthStateChanged(auth, (user) => {
  if (user) {
    displayWelcomeMessage(user);
    loadProducts();
  } else {
    toggleAuthForm(true);
  }
});
