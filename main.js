import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";
import { getFirestore, collection, addDoc, query, orderBy, getDocs, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
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

let currentUser = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        document.getElementById("authForm").style.display = "none";
        document.getElementById("welcomeMessage").textContent = "Bine ai venit, " + user.email + "!";
        document.getElementById("welcomeMessage").style.display = "block";
        document.getElementById("addProductForm").style.display = "block";
    } else {
        currentUser = null;
        document.getElementById("authForm").style.display = "block";
        document.getElementById("welcomeMessage").style.display = "none";
        document.getElementById("addProductForm").style.display = "none";
    }
});

function handleAuth() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (document.getElementById('authTitle').textContent === "Autentificare") {
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                // Ascunde formularul de autentificare
                document.getElementById("authForm").style.display = "none";
                // Afișează mesajul de bun venit
                document.getElementById("welcomeMessage").textContent = "Bine ai venit, " + user.email + "!";
                document.getElementById("welcomeMessage").style.display = "block";
                // Afișează formularul de adăugare produse
                document.getElementById("addProductForm").style.display = "block";
                // Afișează butonul de logout
                document.getElementById("logoutButton").style.display = "block";
            })
            .catch((error) => {
                alert("Eroare la autentificare: " + error.message);
            });
    } else {
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                // Ascunde formularul de autentificare
                document.getElementById("authForm").style.display = "none";
                // Afișează mesajul de bun venit
                document.getElementById("welcomeMessage").textContent = "Cont creat! Bine ai venit, " + user.email + "!";
                document.getElementById("welcomeMessage").style.display = "block";
                // Afișează formularul de adăugare produse
                document.getElementById("addProductForm").style.display = "block";
                // Afișează butonul de logout
                document.getElementById("logoutButton").style.display = "block";
            })
            .catch((error) => {
                alert("Eroare la înregistrare: " + error.message);
            });
    }
}

// Funcția de Logout
function logout() {
    signOut(auth)
        .then(() => {
            // Ascunde secțiunile specifice utilizatorului
            document.getElementById("authForm").style.display = "block";  // Afișează formularul de autentificare
            document.getElementById("welcomeMessage").style.display = "none"; // Ascunde mesajul de bun venit
            document.getElementById("addProductForm").style.display = "none"; // Ascunde formularul de adăugare produs
            document.getElementById("logoutButton").style.display = "none";  // Ascunde butonul de logout
        })
        .catch((error) => {
            alert("Eroare la deconectare: " + error.message);
        });
}

window.logout = logout;  // Face funcția accesibilă în HTML
function toggleAuth() {
    const title = document.getElementById('authTitle');
    title.textContent = title.textContent === "Autentificare" ? "Înregistrare" : "Autentificare";
}

window.handleAuth = handleAuth;
window.toggleAuth = toggleAuth;

async function addProduct() {
    if (!currentUser) {
        alert("Trebuie să te autentifici pentru a adăuga un produs.");
        return;
    }

    const name = document.getElementById("productName").value.trim();
    const description = document.getElementById("productDescription").value.trim();
    const price = document.getElementById("productPrice").value.trim();
    const quantity = document.getElementById("productQuantity").value.trim();
    const imageInput = document.getElementById("productImage");

    if (!name || !price || !quantity) {
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
            quantity,
            imageUrl,
            createdAt: new Date(),
            userId: currentUser.uid
        });

        alert("Produs adăugat cu succes!");
        loadProducts();

        document.getElementById("productName").value = "";
        document.getElementById("productDescription").value = "";
        document.getElementById("productPrice").value = "";
        document.getElementById("productQuantity").value = "";
        imageInput.value = "";

    } catch (error) {
        console.error("Eroare la salvare în Firestore:", error);
        alert("Eroare la salvarea produsului.");
    }
}

async function loadProducts() {
    try {
        const productList = document.getElementById("productList");
        productList.innerHTML = "";

        const productsQuery = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(productsQuery);

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const productId = docSnap.id;
            const li = document.createElement("li");
            li.style.display = "block";
            li.innerHTML = `  
                <strong>${data.name}</strong><br>
                ${data.description ? `<em>${data.description}</em><br>` : ""}
                <span>Preț: ${data.price} RON</span><br>
                <span>Bucăți disponibile: ${data.quantity}</span><br>
                ${data.imageUrl ? `<img src="${data.imageUrl}" alt="${data.name}" style="max-width: 150px; margin-top: 5px;"><br>` : ""}
                <button onclick='addToCart(${JSON.stringify({ name: data.name, price: data.price })})'>Adaugă în coș</button><br>
                ${data.userId === currentUser?.uid ? `  
                    <button class="edit-btn" onclick="editProduct('${productId}')">Modifică</button>
                    <button class="delete-btn" onclick="deleteProduct('${productId}')">Șterge</button>
                ` : ""}
                <hr>
            `;
            productList.appendChild(li);
        });
    } catch (error) {
        console.error("Eroare la încărcarea produselor:", error);
    }
}

async function deleteProduct(productId) {
    if (!currentUser) {
        alert("Trebuie să te autentifici pentru a șterge un produs.");
        return;
    }

    try {
        const productRef = doc(db, "products", productId);
        await deleteDoc(productRef);
        alert("Produs șters cu succes!");
        loadProducts();
    } catch (error) {
        console.error("Eroare la ștergere produs:", error);
        alert("Eroare la ștergerea produsului.");
    }
}

async function editProduct(productId) {
    if (!currentUser) {
        alert("Trebuie să te autentifici pentru a modifica un produs.");
        return;
    }
    alert("Funcția de editare va fi implementată.");
}

let cart = [];

function addToCart(product) {
    cart.push(product);
    updateCartUI();
}

function updateCartUI() {
    const cartSection = document.getElementById("cartSection");
    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");

    if (cart.length === 0) {
        cartSection.style.display = "none";
        return;
    }

    cartSection.style.display = "block";
    cartItems.innerHTML = "";

    let total = 0;

    cart.forEach((item, index) => {
        total += parseFloat(item.price);

        const li = document.createElement("li");
        li.innerHTML = `
            ${item.name} - ${item.price} RON
            <button style="margin-left:10px;" onclick="removeFromCart(${index})">❌</button>
        `;
        cartItems.appendChild(li);
    });

    cartTotal.textContent = `Total: ${total.toFixed(2)} RON`;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function clearCart() {
    cart = [];
    updateCartUI();
}

function finalizeOrder() {
    if (cart.length === 0) {
        alert("Coșul este gol!");
        return;
    }

    let message = "Comanda a fost trimisă cu următoarele produse:\n\n";
    cart.forEach(item => {
        message += `• ${item.name} - ${item.price} RON\n`;
    });

    message += `\nTotal: ${cart.reduce((sum, item) => sum + parseFloat(item.price), 0).toFixed(2)} RON`;
    alert(message);

    clearCart();
}

window.addProduct = addProduct;
window.deleteProduct = deleteProduct;
window.editProduct = editProduct;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.finalizeOrder = finalizeOrder;

window.addEventListener("load", () => {
    loadProducts();
});
