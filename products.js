import { auth, db, storage } from './firebaseConfig.js';
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
    // Buton ștergere
    const deleteButton = document.createElement('button');
    deleteButton.textContent = "Șterge";
    deleteButton.style.backgroundColor = '#e74c3c';
    deleteButton.style.margin = '5px';
    deleteButton.addEventListener("click", () => deleteProduct(productId));

    // Buton modificare
    const editButton = document.createElement('button');
    editButton.textContent = "Modifică";
    editButton.style.backgroundColor = '#3498db';
    editButton.style.margin = '5px';
    editButton.addEventListener("click", () => openEditForm(productId, data));

    card.appendChild(editButton);
    card.appendChild(deleteButton);
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
function openEditForm(productId, productData) {
    // Completează formularul de adăugare cu datele produsului
    document.getElementById("productName").value = productData.name;
    document.getElementById("productDescription").value = productData.description;
    document.getElementById("productPrice").value = productData.price;

    // Arată formularul
    document.getElementById("addProductForm").style.display = "block";

    // Schimbă funcționalitatea butonului de adăugare în salvare modificare
    const addButton = document.getElementById("addProductButton");
    addButton.textContent = "Salvează modificări";

    addButton.onclick = async () => {
        const updatedProduct = {
            name: document.getElementById("productName").value,
            description: document.getElementById("productDescription").value,
            price: parseFloat(document.getElementById("productPrice").value),
        };

        try {
            await updateDoc(doc(db, "products", productId), updatedProduct);
            alert("Produs modificat cu succes.");
            document.getElementById("addProductForm").style.display = "none";
            loadProducts();
            // Resetăm butonul
            addButton.textContent = "Adaugă";
            addButton.onclick = addProduct; // restaurăm acțiunea originală
        } catch (error) {
            console.error("Eroare la modificare produs:", error);
            alert("Eroare la modificare produs.");
        }
    };
}
// ... toate funcțiile tale existente

// Expune funcțiile global pentru utilizare în HTML sau în alte module
window.addProduct = addProduct;
window.searchProducts = searchProducts;
window.loadProducts = loadProducts;
window.stergeProdus = deleteProduct;
