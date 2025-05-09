import { auth, db, storage } from './firebaseConfig.js';
// Funcția pentru toggle între autentificare și înregistrare
function toggleAuth() {
    const title = document.getElementById('authTitle');
    if (title.textContent === "Autentificare") {
        title.textContent = "Înregistrare";
    } else {
        title.textContent = "Autentificare";
    }
}
