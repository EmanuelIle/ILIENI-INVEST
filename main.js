/**
 * Ilieni Invest - Magazin Online
 * Aplicație web pentru administrarea și vânzarea produselor
 */

// Import Firebase
// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { 
  getStorage, 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL,
  deleteObject 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

// Se execută când DOM-ul este complet încărcat
document.addEventListener("DOMContentLoaded", () => {
  // Configurare Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyByP5ViWW4msYRqketugoVtPSUbu-Ykhts",,
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

  // Elemente DOM - Autentificare
  const authForm = document.getElementById("authForm");
  const authTitle = document.getElementById("authTitle");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const toggleAuthBtn = document.getElementById("toggleAuthBtn");
  const logoutButton = document.getElementById("logoutButton");
  const welcomeMessage = document.getElementById("welcomeMessage");

  // Elemente DOM - Produse
  const addProductForm = document.getElementById("addProductForm");
  const productNameInput = document.getElementById("productName");
  const productDescriptionInput = document.getElementById("productDescription");
  const productPriceInput = document.getElementById("productPrice");
  const productQuantityInput = document.getElementById("productQuantity");
  const productImageInput = document.getElementById("productImage");
  const productIdInput = document.getElementById("productId");
  const productCategoryInput = document.getElementById("productCategory");
  const previewImage = document.getElementById("previewImage");
  const saveProductBtn = document.getElementById("saveProductBtn");
  const cancelProductBtn = document.getElementById("cancelProductBtn");
  const productList = document.getElementById("productList");
  const noProductsMessage = document.getElementById("noProducts");
  const productSearch = document.getElementById("productSearch");
  const categoryFilter = document.getElementById("categoryFilter");

  // Elemente DOM - Coș
  const cartSection = document.getElementById("cartSection");
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  const orderBtn = document.getElementById("orderBtn");
  const clearCartBtn = document.getElementById("clearCartBtn");

  // Elemente DOM - Modal
  const modal = document.getElementById("modal");
  const modalContent = document.getElementById("modalContent");
  const closeModal = document.querySelector(".close");

  // Variabile globale
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let currentUser = null;
  let isEditing = false;

  /**
   * ===================================
   * FUNCȚII DE AUTENTIFICARE
   * ===================================
   */

  // Inițializează formularul de autentificare
  function initAuthForm() {
    authForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await handleAuth();
    });

    toggleAuthBtn.addEventListener("click", toggleAuth);
  }

  // Gestionează procesul de autentificare/înregistrare
  async function handleAuth() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const isRegister = authTitle.textContent === 'Înregistrare';

    try {
      if (isRegister) {
        // Creare cont nou
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Trimite email de verificare
        await sendEmailVerification(userCredential.user);
        
        showModal(
          'Cont creat cu succes', 
          `
          <p>Contul tău a fost creat cu succes.</p>
          <p>Am trimis un email de verificare la adresa <strong>${email}</strong>.</p>
          <p>Te rugăm să verifici email-ul (inclusiv folderul SPAM) și să confirmi contul.</p>
          `
        );
      } else {
        // Autentificare utilizator existent
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Verifică dacă utilizatorul și-a confirmat emailul
        if (!userCredential.user.emailVerified) {
          await sendEmailVerification(userCredential.user);
          
          showModal(
            'Verificare email necesară', 
            `
            <p>Te rugăm să îți verifici email-ul înainte de a continua!</p>
            <p>Am trimis un nou email de verificare la adresa <strong>${email}</strong>.</p>
            <p>După confirmare, te rugăm să te autentifici din nou.</p>
            `
          );
          
          // Deconectare utilizator până confirmă email-ul
          await signOut(auth);
        }
      }
    } catch (error) {
      // Tratare erori autentificare
      let errorMessage = 'A apărut o eroare la procesarea cererii.';
      
      switch(error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Acest email este deja utilizat. Încearcă să te autentifici.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Adresa de email nu este validă.';
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Email sau parolă incorectă.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Parola este prea slabă. Folosește minim 6 caractere.';
          break;
      }
      
      showModal('Eroare', `<p>${errorMessage}</p>`);
    }
  }

  // Schimbă între modul de autentificare și înregistrare
  function toggleAuth() {
    const isLogin = authTitle.textContent === 'Autentificare';
    
    authTitle.textContent = isLogin ? 'Înregistrare' : 'Autentificare';
    toggleAuthBtn.innerHTML = isLogin 
      ? '<i class="fas fa-exchange-alt"></i> Comută la Autentificare' 
      : '<i class="fas fa-exchange-alt"></i> Comută la Înregistrare';
    
    const submitBtn = authForm.querySelector('button[type="submit"]');
    submitBtn.innerHTML = isLogin 
      ? '<i class="fas fa-user-plus"></i> Înregistrare' 
      : '<i class="fas fa-sign-in-alt"></i> Autentificare';
    
    emailInput.placeholder = isLogin ? 'Email pentru înregistrare' : 'Email pentru autentificare';
    passwordInput.placeholder = isLogin ? 'Creează o parolă' : 'Introdu parola';
    
    // Resetează formularul
    authForm.reset();
  }

  // Deconectare utilizator
  async function logout() {
    try {
      await signOut(auth);
      showModal('Deconectare', '<p>Ai fost deconectat cu succes!</p>');
    } catch (error) {
      showModal('Eroare', `<p>A apărut o eroare la deconectare: ${error.message}</p>`);
    }
  }

  // Afișează mesaj de bun venit pentru utilizator
  function displayWelcomeMessage(user) {
    if (welcomeMessage && logoutButton) {
      welcomeMessage.style.display = 'block';
      welcomeMessage.innerHTML = `<i class="fas fa-user-circle"></i> Bine ai venit, <strong>${user.email}</strong>`;
      logoutButton.style.display = 'inline-block';
    }
  }

  /**
   * ===================================
   * FUNCȚII PENTRU PRODUSE
   * ===================================
   */

  // Inițializează formularul de produse
  function initProductForm() {
    // Previzualizare imagine
    productImageInput.addEventListener('change', previewProductImage);
    
    // Submit formular
    addProductForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveProduct();
    });
    
    // Anulare formular
    cancelProductBtn.addEventListener('click', () => {
      resetProductForm();
      addProductForm.style.display = 'none';
    });
    
    // Filtrare produse
    productSearch.addEventListener('input', filterProducts);
    categoryFilter.addEventListener('change', filterProducts);
  }

  // Previzualizare imagine produs
  function previewProductImage(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        previewImage.src = e.target.result;
        previewImage.style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else {
      previewImage.style.display = 'none';
    }
  }

  // Setează categoria produsului și afișează formularul
  function selectCategory(category) {
    resetProductForm();
    productCategoryInput.value = category;
    addProductForm.style.display = 'block';
    
    // Scroll la formular
    addProductForm.scrollIntoView({ behavior: 'smooth' });
  }

  // Resetează formularul de produse
  function resetProductForm() {
    isEditing = false;
    productIdInput.value = '';
    addProductForm.reset();
    previewImage.style.display = 'none';
    saveProductBtn.innerHTML = '<i class="fas fa-save"></i> Salvează produs';
  }

  // Salvează (adaugă sau actualizează) un produs
  async function saveProduct() {
    try {
      const name = productNameInput.value.trim();
      const description = productDescriptionInput.value.trim();
      const price = parseFloat(productPriceInput.value);
      const quantity = parseInt(productQuantityInput.value);
      const imageFile = productImageInput.files[0];
      const category = productCategoryInput.value;
      
      if (!name || !price || !quantity || !category) {
        throw new Error("Completează toate câmpurile obligatorii!");
      }
      
      // Procesare imagine
      let imageUrl = "";
      if (imageFile) {
        const imagePath = `product_images/${category}/${Date.now()}_${imageFile.name}`;
        const imgRef = storageRef(storage, imagePath);
        await uploadBytes(imgRef, imageFile);
        imageUrl = await getDownloadURL(imgRef);
      }
      
      // Pregătește datele produsului
      const productData = {
        name,
        description,
        price,
        quantity,
        category,
        lastModified: new Date().toISOString()
      };
      
      if (imageUrl) {
        productData.imageUrl = imageUrl;
      }
      
      if (isEditing && productIdInput.value) {
        // Actualizare produs existent
        const docRef = doc(db, "products", productIdInput.value);
        
        // Dacă nu am încărcat o imagine nouă, păstrăm imaginea veche
        if (!imageUrl) {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().imageUrl) {
            productData.imageUrl = docSnap.data().imageUrl;
          }
        }
        
        await updateDoc(docRef, productData);
        showModal('Succes', '<p>Produsul a fost actualizat cu succes!</p>');
      } else {
        // Adăugare produs nou
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: new Date().toISOString()
        });
        showModal('Succes', '<p>Produsul a fost adăugat cu succes!</p>');
      }
      
      // Resetează și ascunde formularul
      resetProductForm();
      addProductForm.style.display = 'none';
      
      // Reîncarcă lista de produse
      await loadProducts();
      
    } catch (error) {
      showModal('Eroare', `<p>${error.message}</p>`);
    }
  }

  // Încarcă produsele din Firestore
  async function loadProducts() {
    try {
      productList.innerHTML = "";
      
      const q = query(
        collection(db, "products"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        noProductsMessage.style.display = 'block';
        return;
      }
      
      noProductsMessage.style.display = 'none';
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const productId = doc.id;
        createProductCard(data, productId);
      });
      
      // Aplică filtrele actuale
      filterProducts();
      
    } catch (error) {
      showModal('Eroare', `<p>Nu s-au putut încărca produsele: ${error.message}</p>`);
    }
  }

  // Creează un card de produs în interfață
  function createProductCard(data, productId) {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.dataset.category = data.category || '';
    
    // Construiește imaginea produsului
    let productImageHtml = '';
    if (data.imageUrl) {
      productImageHtml = `<img src="${data.imageUrl}" alt="${data.name}" class="product-image">`;
    } else {
      productImageHtml = `
        <div class="product-image no-image">
          <i class="fas fa-image"></i>
          <p>Fără imagine</p>
        </div>
      `;
    }
    
    // Construiește starea stocului
    let stockStatus = '';
    if (data.quantity <= 0) {
      stockStatus = '<span class="out-of-stock">Stoc epuizat</span>';
    } else if (data.quantity < 5) {
      stockStatus = `<span class="low-stock">Stoc limitat: ${data.quantity} buc</span>`;
    } else {
      stockStatus = `<span class="in-stock">În stoc: ${data.quantity} buc</span>`;
    }
    
    // Setează conținutul cardului
    productCard.innerHTML = `
      ${productImageHtml}
      <div class="product-info">
        <h3 class="product-title">${data.name}</h3>
        <p class="product-description">${data.description || 'Fără descriere'}</p>
        <div class="product-price">${data.price.toFixed(2)} RON</div>
        <div class="product-stock">${stockStatus}</div>
        <div class="product-actions">
          <button class="btn-primary add-to-cart" data-id="${productId}" ${data.quantity <= 0 ? 'disabled' : ''}>
            <i class="fas fa-cart-plus"></i> Adaugă în coș
          </button>
          <button class="btn-secondary edit-product" data-id="${productId}">
            <i class="fas fa-edit"></i> Modifică
          </button>
        </div>
      </div>
    `;
    
    // Adaugă evenimentele pentru butoane
    const addToCartBtn = productCard.querySelector('.add-to-cart');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', () => {
        addToCart(productId, data.name, data.price, data.imageUrl);
      });
    }
    
    const editBtn = productCard.querySelector('.edit-product');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        editProduct(productId);
      });
    }
    
    productList.appendChild(productCard);
  }

  // Filtrează produsele afișate în funcție de căutare și categorie
  function filterProducts() {
    const searchTerm = productSearch.value.toLowerCase();
    const categoryValue = categoryFilter.value.toLowerCase();
    
    const productCards = productList.querySelectorAll('.product-card');
    let visibleCount = 0;
    
    productCards.forEach(card => {
      const productName = card.querySelector('.product-title').textContent.toLowerCase();
      const productDescription = card.querySelector('.product-description').textContent.toLowerCase();
      const productCategory = (card.dataset.category || '').toLowerCase();
      
      // Verifică dacă produsul se potrivește cu criteriile de filtrare
      const matchesSearch = 
        productName.includes(searchTerm) || 
        productDescription.includes(searchTerm);
      
      const matchesCategory = 
        !categoryValue || 
        productCategory.includes(categoryValue);
      
      if (matchesSearch && matchesCategory) {
        card.style.display = 'block';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });
    
    // Actualizează mesajul "Nu s-au găsit produse"
    if (visibleCount === 0 && productCards.length > 0) {
      noProductsMessage.style.display = 'block';
      noProductsMessage.textContent = 'Nu s-au găsit produse care să corespundă criteriilor de căutare.';
    } else {
      noProductsMessage.style.display = visibleCount === 0 ? 'block' : 'none';
      noProductsMessage.textContent = 'Nu au fost găsite produse.';
    }
  }

  // Deschide formularul pentru editarea unui produs
  async function editProduct(productId) {
    try {
      isEditing = true;
      const docRef = doc(db, "products", productId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const product = docSnap.data();
        
        // Completează formularul cu datele produsului
        productIdInput.value = productId;
        productNameInput.value = product.name || '';
        productDescriptionInput.value = product.description || '';
        productPriceInput.value = product.price || '';
        productQuantityInput.value = product.quantity || '';
        productCategoryInput.value = product.category || '';
        
        // Afișează imaginea existentă
        if (product.imageUrl) {
          previewImage.src = product.imageUrl;
          previewImage.style.display = 'block';
        } else {
          previewImage.style.display = 'none';
        }
        
        // Actualizează textul butonului
        saveProductBtn.innerHTML = '<i class="fas fa-save"></i> Actualizează produs';
        
        // Afișează formularul
        addProductForm.style.display = 'block';
        addProductForm.scrollIntoView({ behavior: 'smooth' });
      } else {
        throw new Error("Produsul nu a fost găsit!");
      }
    } catch (error) {
      showModal('Eroare', `<p>Nu s-a putut edita produsul: ${error.message}</p>`);
    }
  }

  /**
   * ===================================
   * FUNCȚII PENTRU COȘ
   * ===================================
   */
  
  // Inițializează coșul de cumpărături
  function initCart() {
    // Adaugă evenimentele pentru butoanele coșului
    orderBtn.addEventListener('click', finalizeOrder);
    clearCartBtn.addEventListener('click', clearCart);
    
    // Actualizează afișarea coșului
    updateCartDisplay();
  }

  // Adaugă un produs în coș
  async function addToCart(productId, productName, productPrice, productImage) {
    try {
      // Verifică dacă produsul are stoc disponibil
      const docRef = doc(db, "products", productId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error("Produsul nu a fost găsit!");
      }
      
      const product = docSnap.data();
      if (product.quantity <= 0) {
        throw new Error("Produsul nu mai este în stoc!");
      }
      
      // Caută produsul în coș
      const existingItem = cart.find(item => item.productId === productId);
      
      if (existingItem) {
        // Verifică dacă mai există stoc pentru cantitatea cerută
        if (existingItem.quantity >= product.quantity) {
          throw new Error(`Stoc insuficient! Doar ${product.quantity} bucăți disponibile.`);
        }
        // Actualizează cantitatea
        existingItem.quantity++;
      } else {
        // Adaugă produsul nou în coș
        cart.push({
          productId,
          productName,
          productPrice,
          productImage,
          quantity: 1
        });
      }
      
      // Salvează coșul în localStorage și actualizează afișarea
      saveCart();
      updateCartDisplay();
      
      // Afișează o notificare
      showToast(`Produsul "${productName}" a fost adăugat în coș`, 'success');
      
    } catch (error) {
      showModal('Eroare', `<p>${error.message}</p>`);
    }
  }

  // Salvează coșul în localStorage
  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // Actualizează afișarea coșului
  function updateCartDisplay() {
    cartItems.innerHTML = "";
    let total = 0;
    
    if (cart.length === 0) {
      cartItems.innerHTML = '<p class="empty-message">Coșul tău este gol</p>';
      cartSection.style.display = 'none';
      cartTotal.querySelector('span').textContent = '0 RON';
      return;
    }
    
    // Afișează itemele din coș
    cart.forEach((item, index) => {
      const itemTotal = item.productPrice * item.quantity;
      total += itemTotal;
      
      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';
      
      // Construiește imaginea produsului
      let itemImageHtml = '';
      if (item.productImage) {
        itemImageHtml = `<img src="${item.productImage}" alt="${item.productName}" class="cart-item-image">`;
      }
      
      cartItem.innerHTML = `
        ${itemImageHtml}
        <div class="cart-item-info">
          <div class="cart-item-title">${item.productName}</div>
          <div class="cart-item-price">${item.productPrice.toFixed(2)} RON x ${item.quantity} = ${itemTotal.toFixed(2)} RON</div>
        </div>
        <div class="cart-item-actions">
          <div class="quantity-control">
            <button type="button" class="quantity-btn decrease" data-index="${index}">-</button>
            <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-index="${index}">
            <button type="button" class="quantity-btn increase" data-index="${index}">+</button>
          </div>
          <button type="button" class="remove-item" data-index="${index}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
      
      // Adaugă evenimentele pentru butoanele de cantitate
      const decreaseBtn = cartItem.querySelector('.decrease');
      const increaseBtn = cartItem.querySelector('.increase');
      const quantityInput = cartItem.querySelector('.quantity-input');
      const removeBtn = cartItem.querySelector('.remove-item');
      
      decreaseBtn.addEventListener('click', () => {
        updateCartItemQuantity(index, item.quantity - 1);
      });
      
      increaseBtn.addEventListener('click', () => {
        updateCartItemQuantity(index, item.quantity + 1);
      });
      
      quantityInput.addEventListener('change', (e) => {
        updateCartItemQuantity(index, parseInt(e.target.value) || 1);
      });
      
      removeBtn.addEventListener('click', () => {
        removeCartItem(index);
      });
      
      cartItems.appendChild(cartItem);
    });
    
    // Actualizează totalul și afișează secțiunea coșului
    cartTotal.querySelector('span').textContent = `${total.toFixed(2)} RON`;
    cartSection.style.display = 'block';
  }

  // Actualizează cantitatea unui produs din coș
  async function updateCartItemQuantity(index, newQuantity) {
    if (index < 0 || index >= cart.length) return;
    
    try {
      // Asigură-te că noua cantitate este cel puțin 1
      newQuantity = Math.max(1, newQuantity);
      
      // Verifică stocul disponibil
      const productId = cart[index].productId;
      const docRef = doc(db, "products", productId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const product = docSnap.data();
        
        if (newQuantity > product.quantity) {
          throw new Error(`Stoc insuficient! Doar ${product.quantity} bucăți disponibile.`);
        }
        
        // Actualizează cantitatea
        cart[index].quantity = newQuantity;
        saveCart();
        updateCartDisplay();
      }
    } catch (error) {
      showModal('Eroare', `<p>${error.message}</p>`);
    }
  }

  // Elimină un produs din coș
  function removeCartItem(index) {
    if (index < 0 || index >= cart.length) return;
    
    const productName = cart[index].productName;
    cart.splice(index, 1);
    saveCart();
    updateCartDisplay();
    
    showToast(`Produsul "${productName}" a fost eliminat din coș`, 'warning');
  }

  // Finalizează comanda
  function finalizeOrder() {
    if (cart.length === 0) {
      showModal('Coș gol', '<p>Nu ai niciun produs în coș!</p>');
      return;
    }
    
    // Aici se poate implementa logica de procesare a comenzii
    // De exemplu, salvarea comenzii în Firestore
    
    showModal(
      'Comandă finalizată',
      `
      <p>Comanda ta a fost trimisă cu succes!</p>
      <p>Vei primi un email cu confirmarea și detaliile comenzii.</p>
      <p>Îți mulțumim pentru achiziție!</p>
      `
    );
    
    // Golește coșul după finalizarea comenzii
    cart = [];
    saveCart();
    updateCartDisplay();
  }

  // Golește coșul de cumpărături
  function clearCart() {
    if (cart.length === 0) return;
    
    showModal(
      'Golire coș',
      `
      <p>Ești sigur că vrei să golești coșul?</p>
      <p>Toate produsele vor fi eliminate.</p>
      <div class="modal-actions">
        <button class="btn-primary" id="confirmClearCart">
          <i class="fas fa-check"></i> Da, golește coșul
        </button>
        <button class="btn-secondary" id="cancelClearCart">
          <i class="fas fa-times"></i> Nu, păstrează produsele
        </button>
      </div>
      `
    );
    
    // Adaugă evenimentele pentru butoanele de confirmare
    document.getElementById('confirmClearCart').addEventListener('click', () => {
      cart = [];
      saveCart();
      updateCartDisplay();
      closeModalFunc();
      showToast('Coșul a fost golit', 'info');
    });
    
    document.getElementById('cancelClearCart').addEventListener('click', closeModalFunc);
  }

  /**
   * ===================================
   * FUNCȚII UTILITARE
   * ===================================
   */
  
  // Afișează modal
  function showModal(title, content) {
    modalContent.innerHTML = `
      <h2>${title}</h2>
      <div class="modal-body">${content}</div>
    `;
    modal.style.display = 'block';
  }

  // Închide modal
  function closeModalFunc() {
    modal.style.display = 'none';
  }

  // Afișează un toast/notificare
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <i class="fas ${
          type === 'success' ? 'fa-check-circle' : 
          type === 'warning' ? 'fa-exclamation-triangle' : 
          'fa-info-circle'
        }"></i>
        <p>${message}</p>
      </div>
      <button class="toast-close">×</button>
    `;
    
    document.body.appendChild(toast);
    
    // Animație de intrare
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    // Închide toast-ul după 3 secunde
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
    
    // Adaugă eveniment pentru închidere manuală
    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    });
  }

  /**
   * ===================================
   * INIȚIALIZARE APLICAȚIE
   * ===================================
   */
  
  // Inițializează formularul de autentificare
  initAuthForm();
  
  // Inițializează formularul de produse
  initProductForm();
  
  // Inițializează coșul de cumpărături
  initCart();
  
  // Eveniment pentru închiderea modal-ului
  closeModal.addEventListener('click', closeModalFunc);
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModalFunc();
    }
  });
  
  // Monitorizează starea autentificării
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    
    if (user && user.emailVerified) {
      // Utilizator autentificat și verificat
      authForm.style.display = 'none';
      displayWelcomeMessage(user);
      loadProducts();
    } else {
      // Utilizator neautentificat sau neverificat
      authForm.style.display = 'block';
      addProductForm.style.display = 'none';
      welcomeMessage.style.display = 'none';
      logoutButton.style.display = 'none';
      noProductsMessage.style.display = 'none';
      cartSection.style.display = 'none';
      productList.innerHTML = '';
    }
  });

  // Expune funcții necesare în obiectul global window
  window.handleAuth = handleAuth;
  window.toggleAuth = toggleAuth;
  window.logout = logout;
  window.selectCategory = selectCategory;
  window.editProduct = editProduct;
  window.addToCart = addToCart;
  window.finalizeOrder = finalizeOrder;
  window.clearCart = clearCart;
  
}); // final DOMContentLoaded
