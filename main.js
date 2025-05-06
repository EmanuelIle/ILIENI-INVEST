// main.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

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

        // Afișare locală
        const li = document.createElement("li");
        li.style.display = "block";
        li.innerHTML = `
            <strong>${name}</strong><br>
            ${description ? `<em>${description}</em><br>` : ""}
            <span>Preț: ${price} RON</span><br>
            ${imageUrl ? `<img src="${imageUrl}" alt="${name}" style="max-width: 150px; margin-top: 5px;"><br>` : ""}
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

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const li = document.createElement("li");
            li.style.display = "block";
            li.innerHTML = `
                <strong>${data.name}</strong><br>
                ${data.description ? `<em>${data.description}</em><br>` : ""}
                <span>Preț: ${data.price} RON</span><br>
                ${data.imageUrl ? `<img src="${data.imageUrl}" alt="${data.name}" style="max-width: 150px; margin-top: 5px;"><br>` : ""}
                <hr>
            `;
            productList.appendChild(li);
        });
    } catch (error) {
        console.error("Eroare la încărcarea produselor:", error);
    }
}
window.addEventListener("load", () => {
    loadProducts(); // Afișează produsele imediat la încărcare
});

