// Importa as funções necessárias do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Configurações do Firebase
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

// Função para exibir mensagens temporárias na interface
function showMessage(message, divId) {
    var messageDiv = document.getElementById(divId);
    messageDiv.style.display = "block";
    messageDiv.innerHTML = message;
    messageDiv.style.opacity = 1;
    setTimeout(function() {
        messageDiv.style.opacity = 0;
    }, 5000); // A mensagem desaparece após 5 segundos
}

// Lógica de cadastro de novos usuários
const signUp = document.getElementById('submitSignUp');
signUp.addEventListener('click', (event) => {
    event.preventDefault(); // Previne o comportamento padrão do botão

    // Captura os dados do formulário de cadastro
    const email = document.getElementById('rEmail').value;
    const password = document.getElementById('rPassword').value;
    const firstName = document.getElementById('fName').value;
    const lastName = document.getElementById('lName').value;

    const auth = getAuth(); // Configura o serviço de autenticação
    const db = getFirestore(); // Conecta ao Firestore

    // Cria uma conta com e-mail e senha
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const user = userCredential.user; // Usuário autenticado
        const userData = { email, firstName, lastName }; // Dados do usuário para salvar

        showMessage('Conta criada com sucesso', 'signUpMessage'); // Exibe mensagem de sucesso

        // Salva os dados do usuário no Firestore
        const docRef = doc(db, "users", user.uid);
        setDoc(docRef, userData)
        .then(() => {
            window.location.href = 'index.html'; // Redireciona para a página de login após cadastro
        })
        .catch((error) => {
            console.error("Error writing document", error);
        });
    })
    .catch((error) => {
        const errorCode = error.code;
        if (errorCode == 'auth/email-already-in-use') {
            showMessage('Endereço de email já existe', 'signUpMessage');
        } else {
            showMessage('não é possível criar usuário', 'signUpMessage');
        }
    });
});

// Lógica de login de usuários existentes
const signIn = document.getElementById('submitSignIn');
signIn.addEventListener('click', (event) => {
    event.preventDefault(); // Previne o comportamento padrão do botão

    // Captura os dados do formulário de login
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const auth = getAuth(); // Configura o serviço de autenticação

    // Realiza o login com e-mail e senha
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        showMessage('usuário logado com sucesso', 'signInMessage'); // Exibe mensagem de sucesso
        const user = userCredential.user;

        // Salva o ID do usuário no localStorage
        localStorage.setItem('loggedInUserId', user.uid);

        window.location.href = 'homepage.html'; // Redireciona para a página inicial
    })
    .catch((error) => {
        const errorCode = error.code;
        if (errorCode === 'auth/invalid-credential') {
            showMessage('Email ou Senha incorreta', 'signInMessage');
        } else {
            showMessage('Essa conta não existe', 'signInMessage');
        }
    });
});

// Lógica de login com Google
// Seleciona todos os botões de login com Google
const googleLoginButtons = document.querySelectorAll('.google-login-button');

// Adiciona o evento de clique para cada botão
googleLoginButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
        event.preventDefault(); // Previne o comportamento padrão
        loginWithGoogle(); // Chama a função de login com Google
    });
});

// Função reutilizável para login com Google
function loginWithGoogle() {
    const auth = getAuth(); // Configura o serviço de autenticação
    const provider = new GoogleAuthProvider(); // Cria o provedor do Google
    const db = getFirestore(); // Conecta ao Firestore

    // Abre o popup para login com Google
    signInWithPopup(auth, provider)
    .then((result) => {
        const user = result.user; // Usuário autenticado
        const userData = {
            email: user.email,
            firstName: user.displayName.split(' ')[0],
            lastName: user.displayName.split(' ').slice(1).join(' '),
        };

        // Exibe mensagem de sucesso
        showMessage('Usuário logado com Google com sucesso', 'signInMessage');

        // Salva os dados do usuário no Firestore
        const docRef = doc(db, "users", user.uid);
        setDoc(docRef, userData, { merge: true }) // Atualiza se o documento já existir
        .then(() => {
            // Salva o ID do usuário no localStorage
            localStorage.setItem('loggedInUserId', user.uid);
            window.location.href = 'homepage.html'; // Redireciona para a página inicial
        })
        .catch((error) => {
            console.error("Erro ao salvar os dados do usuário no Firestore:", error);
        });
    })
    .catch((error) => {
        console.error("Erro ao autenticar com Google:", error);
        showMessage('Erro ao autenticar com Google', 'signInMessage');
    });
}

// Lógica para exibir a caixa de recuperação de senha usando o pop-up do navegador
const recoveryLink = document.querySelector('.recover a');

recoveryLink.addEventListener('click', (event) => {
    event.preventDefault(); // Previne o comportamento padrão do link

    // Exibe o prompt para o usuário inserir o e-mail
    const recoveryEmail = prompt("Digite seu e-mail para recuperação de senha:");

    if (recoveryEmail) {
        const auth = getAuth(); // Configura o serviço de autenticação
        const db = getFirestore(); // Conecta ao Firestore

        // Verifica se o e-mail está presente no Firestore
        const usersRef = doc(db, "users", recoveryEmail); // Assumindo que o e-mail é a chave do documento ou armazenado dessa forma
        getDoc(usersRef)
            .then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    // O e-mail existe no Firestore, envia o e-mail de recuperação
                    sendPasswordResetEmail(auth, recoveryEmail)
                        .then(() => {
                            alert("E-mail de recuperação enviado com sucesso. Verifique sua caixa de entrada.");
                        })
                        .catch((error) => {
                            const errorCode = error.code;
                            let errorMessage = "Ocorreu um erro. Tente novamente.";
                            if (errorCode === 'auth/invalid-email') {
                                errorMessage = "O e-mail inserido é inválido. Tente novamente.";
                            }
                            alert(errorMessage);
                        });
                } else {
                    // O e-mail não foi encontrado no Firestore, informa ao usuário
                    alert("E-mail não encontrado. Tente novamente.");
                }
            })
            .catch((error) => {
                console.error("Erro ao verificar o e-mail no Firestore:", error);
                alert("Erro ao verificar o e-mail. Tente novamente.");
            });
    } else {
        alert("Por favor, insira um e-mail válido.");
    }
});