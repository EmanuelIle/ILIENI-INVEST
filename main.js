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

// Variabilă pentru utilizatorul curent
let currentUser = null;

// Verifică starea de autentificare a utilizatorului
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        // Actualizăm UI-ul pentru utilizatorul logat
        document.getElementById("authForm").style.display = "none";
        document.getElementById("welcomeMessage").textContent = "Bine ai venit, " + user.email + "!";
        document.getElementById("welcomeMessage").style.display = "block";
        document.getElementById("addProductForm").style.display = "block"; // Permite adăugarea de produse
    } else {
        currentUser = null;
        // Actualizăm UI-ul pentru utilizatorul neautentificat
        document.getElementById("authForm").style.display = "block";
        document.getElementById("welcomeMessage").style.display = "none";
        document.getElementById("addProductForm").style.display = "none"; // Ascundem adăugarea de produse
    }
});

function handleAuth() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (document.getElementById('authTitle').textContent === "Autentificare") {
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                // Actualizăm UI-ul pentru autentificare reușită
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
                // Actualizăm UI-ul pentru înregistrare reușită
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
    if (!currentUser) {
        alert("Trebuie să te autentifici pentru a adăuga un produs.");
        return;
    }

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
            createdAt: new Date(),
            userId: currentUser.uid // Salvăm ID-ul utilizatorului care a adăugat produsul
        });

        alert("Produs adăugat cu succes!");

        // Afișare locală
        const li = document.createElement("li");
        li.style.display = "block";
        li.innerHTML = `  
            <strong>${name}</strong><br>
            ${description ? `<em>${description}</em><br>` : ""}
            <span>Preț: ${price} RON</span><br>
            ${imageUrl ? `<img src="${imageUrl}" alt="${name}" style="max-width: 150px; margin-top: 5px;"><br>` : ""}
            <button class="edit-btn" onclick="editProduct('${name}')">Modifică</button>
            <button class="delete-btn" onclick="deleteProduct('${name}')">Șterge</button>
            <hr>
        `;
        document.getElementById("productList").appendChild(li);

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

async function deleteProduct(productId) {
    if (!currentUser) {
        alert("Trebuie să te autentifici pentru a șterge un produs.");
        return;
    }

    try {
        const productRef = doc(db, "products", productId);
        await deleteDoc(productRef);
        alert("Produs șters cu succes!");
        loadProducts(); // Reîncărcăm lista de produse
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

    // Logica de editare a produsului, similară cu cea de adăugare, dar modificăm produsul existent
    // De exemplu, putem prelua datele existente și le putem actualiza
}

window.addProduct = addProduct;
window.deleteProduct = deleteProduct;
window.editProduct = editProduct;

async function loadProducts() {
    try {
        const productList = document.getElementById("productList");
        productList.innerHTML = ""; // Curățăm lista anterioară

        const productsQuery = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(productsQuery);

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const li = document.createElement("li");
            li.style.display = "block";
            li.innerHTML = `  
                <strong>${data.name}</strong><br>
                ${data.description ? `<em>${data.description}</em><br>` : ""}
                <span>Preț: ${data.price} RON</span><br>
                ${data.imageUrl ? `<img src="${data.imageUrl}" alt="${data.name}" style="max-width: 150px; margin-top: 5px;"><br>` : ""}
                ${data.userId === currentUser.uid ? `
                    <button class="edit-btn" onclick="editProduct('${data.name}')">Modifică</button>
                    <button class="delete-btn" onclick="deleteProduct('${data.name}')">Șterge</button>
                ` : ""}
                <hr>
            `;
            productList.appendChild(li);
        });
    } catch (error) {
        console.error("Eroare la încărcarea produselor:", error);
    }
}

window.addEventListener("load", () => {
    loadProducts(); // Afi
