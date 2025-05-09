import { auth } from './firebaseConfig.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

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
    title.textContent = title.textContent === "Autentificare" ? "Înregistrare" : "Autentificare";
}

// Fă funcțiile accesibile din HTML
window.handleAuth = handleAuth;
window.toggleAuth = toggleAuth;

