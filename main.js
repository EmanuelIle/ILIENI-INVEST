// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

document.addEventListener("DOMContentLoaded", () => {
  
// Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyByP5ViWW4msYRqketugoVtPSUbu-Ykhts",
  authDomain: "ilieni-invest.firebaseapp.com",
  projectId: "ilieni-invest",
  storageBucket: "ilieni-invest.appspot.com",
  messagingSenderId: "1083438978721",
  appId: "1:1083438978721:web:fa4c2aaf6cd53286e302e0",
  measurementId: "G-2XBHW5934G"
};

// Inițializări Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Elemente DOM
const authForm = document.getElementById("authForm");
const addProductForm = document.getElementById("addProductForm");
const productList = document.getElementById("productList");
const logoutButton = document.getElementById("logoutButton");
const welcomeMessage = document.getElementById("welcomeMessage");
const noProductsMessage = document.getElementById("noProducts");
const cartSection = document.getElementById("cartSection");
const cartItemsList = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");

// Coș
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// -------- AUTENTIFICARE --------
function handleAuth() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const isRegister = document.getElementById('authTitle').textContent === 'Înregistrare';

  if (isRegister) {
    // Creare cont nou
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("Cont creat:", userCredential.user);
        // Trimite email de verificare
        userCredential.user.sendEmailVerification()
          .then(() => {
            console.log('Emailul de verificare a fost trimis!');
            alert('Contul a fost creat. Te rugăm să îți verifici emailul pentru a-l activa.');
          })
          .catch((error) => {
            console.error('Eroare la trimiterea emailului de verificare:', error);
          });
      })
      .catch((error) => alert(error.message));
  } else {
    // Autentificare utilizator existent
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("Autentificat:", userCredential.user);

        // Verifică dacă utilizatorul și-a confirmat emailul
        if (!userCredential.user.emailVerified) {
          alert('Te rugăm să îți verifici emailul înainte de a continua!');
          userCredential.user.sendEmailVerification()
            .then(() => {
              console.log('Emailul de verificare a fost trimis!');
            })
            .catch((error) => {
              console.error('Eroare la trimiterea emailului de verificare:', error);
            });
        } else {
          // Aici poți continua procesul dacă emailul este verificat
          console.log('Emailul a fost verificat, utilizatorul este complet autentificat!');
        }
      })
      .catch((error) => alert(error.message));
  }
}

function toggleAuth() {
  const title = document.getElementById('authTitle');
  const emailField = document.getElementById('email');
  const passwordField = document.getElementById('password');

  if (title.textContent === 'Autentificare') {
    title.textContent = 'Înregistrare';
    emailField.placeholder = 'Email pentru înregistrare';
    passwordField.placeholder = 'Parolă pentru înregistrare';
  } else {
    title.textContent = 'Autentificare';
    emailField.placeholder = 'Email';
    passwordField.placeholder = 'Parolă';
  }
}

function logout() {
  signOut(auth).then(() => window.location.reload());
}

// -------- PRODUSE --------
async function addProduct() {
  const name = document.getElementById('productName').value;
  const description = document.getElementById('productDescription').value;
  const price = parseFloat(document.getElementById('productPrice').value);
  const quantity = parseInt(document.getElementById('productQuantity').value);
  const imageFile = document.getElementById('productImage').files[0];

  if (!name || !price || !quantity) {
    alert("Completează toate câmpurile!");
    return;
  }

  let imageUrl = "";
  if (imageFile) {
    const imgRef = storageRef(storage, `product_images/${imageFile.name}`);
    await uploadBytes(imgRef, imageFile);
    imageUrl = await getDownloadURL(imgRef);
    console.log("Image uploaded at:", imageUrl);
  }

  await addDoc(collection(db, "products"), {
    name,
    description,
    price,
    quantity,
    imageUrl
  });

  loadProducts();
  addProductForm.reset();
}

async function loadProducts() {
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
        Preț: ${data.price} RON<br>
        Stoc: ${data.quantity}<br>
        ${data.imageUrl ? `<img src="${data.imageUrl}" style="max-width:150px;"><br>` : ""}
        <button onclick="addToCart('${doc.id}', '${data.name}', ${data.price})">Adaugă în coș</button>
      `;
      productList.appendChild(li);
    });
  }
}

// -------- COȘ --------
function addToCart(productId, productName, productPrice) {
  const item = cart.find(i => i.productId === productId);
  if (item) {
    item.quantity++;
  } else {
    cart.push({ productId, productName, productPrice, quantity: 1 });
  }
  saveCart();
  updateCartDisplay();
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartDisplay() {
  cartItemsList.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    total += item.productPrice * item.quantity;
    const li = document.createElement("li");
    li.textContent = `${item.productName} x${item.quantity} - ${item.productPrice * item.quantity} RON`;
    cartItemsList.appendChild(li);
  });

  cartTotal.innerHTML = `<strong>Total:</strong> ${total} RON`;
  cartSection.style.display = cart.length ? 'block' : 'none';
}

function finalizeOrder() {
  alert("Comanda a fost trimisă!");
  cart = [];
  saveCart();
  updateCartDisplay();
}

function clearCart() {
  cart = [];
  saveCart();
  updateCartDisplay();
}

// -------- UTILIZATOR --------
function displayWelcomeMessage(user) {
  if (!welcomeMessage || !logoutButton || !authForm || !addProductForm) {
    console.warn("Unele elemente nu există în DOM!");
    return;
  }

  welcomeMessage.style.display = 'block';
  welcomeMessage.textContent = `Bine ai venit, ${user.email}`;
  logoutButton.style.display = 'inline-block';
  authForm.style.display = 'none';
  addProductForm.style.display = 'block';
}

// -------- MONITORIZARE STARE --------
onAuthStateChanged(auth, (user) => {
  if (user) {
    displayWelcomeMessage(user);
    loadProducts();
    updateCartDisplay();
  } else {
    authForm.style.display = 'block';
    addProductForm.style.display = 'none';
    cartSection.style.display = 'none';
  }
});

// -------- EXPUNERE FUNCȚII --------
window.handleAuth = handleAuth;
window.toggleAuth = toggleAuth;
window.logout = logout;
window.addProduct = addProduct;
window.addToCart = addToCart;
window.finalizeOrder = finalizeOrder;
window.clearCart = clearCart;
}); // final DOMContentLoaded
