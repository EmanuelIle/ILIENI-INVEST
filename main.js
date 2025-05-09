// Importă modulele necesare din Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";
import { getFirestore, collection, addDoc, query, orderBy, getDocs, doc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

// Configurația Firebase
const firebaseConfig = {
    apiKey: "AIzaSyByP5ViWW4msYRqketugoVtPSUbu-Ykhts",
    authDomain: "ilieni-invest.firebaseapp.com",
    projectId: "ilieni-invest",
    storageBucket: "ilieni-invest.firebasestorage.app",
    messagingSenderId: "1083438978721",
    appId: "1:1083438978721:web:fa4c2aaf6cd53286e302e0",
    measurementId: "G-2XBHW5934G"
};

// Inițializează aplicația Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

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

// Funcția pentru toggle între autentificare și înregistrare
function toggleAuth() {
    const title = document.getElementById('authTitle');
    if (title.textContent === "Autentificare") {
        title.textContent = "Înregistrare";
    } else {
        title.textContent = "Autentificare";
    }
}

// Funcția pentru adăugarea unui produs
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
        // Adaugă produsul în Firestore
        await addDoc(collection(db, "products"), {
            name,
            description,
            price,
            imageUrl,
            createdAt: new Date()
        });

        alert("Produs adăugat cu succes!");

        // Crează cardul pentru produs
        const card = document.createElement('div');
        card.className = 'product-card';

        const img = document.createElement('img');
        img.src = imageUrl || 'default-image.jpg'; // Folosește imagine de fallback în caz că nu există imagine

        const title = document.createElement('h3');
        title.textContent = name;

        const desc = document.createElement('p');
        desc.textContent = description;

        const priceElement = document.createElement('div');
        priceElement.className = 'price';
        priceElement.textContent = `Preț: ${price} RON`;

        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(desc);
        card.appendChild(priceElement);

        // Adaugă cardul în grid
        document.getElementById("productGrid").appendChild(card);

        // Resetează formularul
        document.getElementById("productName").value = "";
        document.getElementById("productDescription").value = "";
        document.getElementById("productPrice").value = "";
        imageInput.value = "";

    } catch (error) {
        console.error("Eroare la salvare în Firestore:", error);
        alert("Eroare la salvarea anunțului.");
    }
}

// Funcția de căutare a produselor
function searchProducts() {
    const searchInput = document.getElementById("searchInput").value.toLowerCase();
    const productCards = document.querySelectorAll(".product-card");

    productCards.forEach(card => {
        const productName = card.querySelector('h3').textContent.toLowerCase();
        if (productName.includes(searchInput)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}

// Funcția care șterge un produs
async function deleteProduct(productId) {
    try {
        // Verificăm dacă produsul există înainte de a-l șterge
        const productRef = doc(db, "products", productId);
        const productSnapshot = await getDoc(productRef);

        if (!productSnapshot.exists()) {
            alert("Produsul nu mai există.");
            return;
        }

        // Șterge documentul din Firestore
        await deleteDoc(productRef);

        // Îndepărtează cardul din UI
        const productCard = document.getElementById(productId);
        if (productCard) {
            productCard.remove();
        }

        alert("Produsul a fost șters cu succes!");
    } catch (error) {
        console.error("Eroare la ștergerea produsului:", error);
        alert("Eroare la ștergerea produsului.");
    }
}

// Încarcă produsele și adaugă butonul de ștergere
async function loadProducts() {
    try {
        const productList = document.getElementById("productList");
        productList.innerHTML = ""; // Curățăm lista anterioară

        const productsQuery = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(productsQuery);

        const grid = document.getElementById("productGrid");
        grid.innerHTML = ""; // Curăță grid-ul de produse

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const productId = doc.id;

            const card = document.createElement('div');
            card.className = 'product-card';
            card.id = productId; // Setează id-ul cardului pentru a-l putea șterge

            const img = document.createElement('img');
            img.src = data.imageUrl || 'default-image.jpg'; // Imaginea produsului
            img.alt = data.name;

            const title = document.createElement('h3');
            title.textContent = data.name;

            const desc = document.createElement('p');
            desc.textContent = data.description;

            const priceElement = document.createElement('div');
            priceElement.className = 'price';
            priceElement.textContent = `Preț: ${data.price} RON`;

            // Verifică dacă utilizatorul este autentificat
            const user = auth.currentUser;
            if (user) {
                // Butonul de ștergere apare doar dacă utilizatorul este logat
                const deleteButton = document.createElement('button');
                deleteButton.textContent = "Șterge";
                deleteButton.style.backgroundColor = '#e74c3c'; // Roșu pentru buton
                deleteButton.style.marginTop = '10px';
                deleteButton.addEventListener("click", () => deleteProduct(productId)); // Atașează funcția de ștergere

                card.appendChild(deleteButton); // Adaugă butonul de ștergere
            }

            // Adăugăm elementele la card
            card.appendChild(img);
            card.appendChild(title);
            card.appendChild(desc);
            card.appendChild(priceElement);

            // Adăugăm cardul în grid
            grid.appendChild(card);
        });
    } catch (error) {
        console.error("Eroare la încărcarea produselor:", error);
        alert("Eroare la încărcarea produselor.");
    }
}

// Atașează funcțiile la evenimente
window.handleAuth = handleAuth;
window.toggleAuth = toggleAuth;
window.addProduct = addProduct;
document.getElementById("addProductButton").addEventListener("click", addProduct);
document.getElementById("searchInput").addEventListener("keyup", searchProducts);

// Încarcă produsele atunci când documentul este gata
document.addEventListener("DOMContentLoaded", loadProducts);
