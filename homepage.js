// Importação de funções do Firebase para autenticação, Firestore e controle de estado
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Configuração do Firebase com as credenciais do projeto
const firebaseConfig = {
    apiKey: "AIzaSyDXp48Mex8YHTg4LoYMVaNRq6TwVJ5YRJI",
    authDomain: "login-pw-ii.firebaseapp.com",
    projectId: "login-pw-ii",
    storageBucket: "login-pw-ii.firebasestorage.app",
    messagingSenderId: "388491329964",
    appId: "1:388491329964:web:0807dab7609f20e4c27a09",
    measurementId: "G-P0ER11FFC2"
};


// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(); // Configura o Firebase Authentication
const db = getFirestore(); // Configura o Firestore

// Monitora o estado de autenticação do usuário
onAuthStateChanged(auth, (user) => {
    // Busca o ID do usuário autenticado salvo no localStorage
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    
    // Se o ID estiver no localStorage, tenta obter os dados do Firestore
    if (loggedInUserId) {
        console.log(user);
        const docRef = doc(db, "users", loggedInUserId); // Referência ao documento do usuário no Firestore

        getDoc(docRef) // Busca o documento
        .then((docSnap) => {
            // Se o documento existir, exibe os dados na interface
            if (docSnap.exists()) {
                const userData = docSnap.data();
                document.getElementById('loggedUserFName').innerText = userData.firstName;
                document.getElementById('loggedUserEmail').innerText = userData.email;
                document.getElementById('loggedUserLName').innerText = userData.lastName;
            } else {
                console.log("no document found matching id");
            }
        })
        .catch((error) => {
            console.log("Documento não encontrado");
        });
    } else {
        console.log("Id de usuário não encontrado no Local storage");
    }
});

// Lógica de logout
const logoutButton = document.getElementById('logout');
logoutButton.addEventListener('click', () => {
    localStorage.removeItem('loggedInUserId'); // Remove o ID do localStorage
    signOut(auth) // Realiza o logout
    .then(() => {
        window.location.href = 'index.html'; // Redireciona para a página de login
    })
    .catch((error) => {
        console.error('Error Signing out:', error);
    });
});
