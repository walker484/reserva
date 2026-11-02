
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  getCountFromServer
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getDatabase,
  ref,
  onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// CONFIGURAÇÃO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyDsZUHfZ7EBatnMwwR4FKgPWLjZybIm9KI",
  authDomain: "walker-midia.firebaseapp.com",
  databaseURL: "https://walker-midia-default-rtdb.firebaseio.com",
  projectId: "walker-midia",
  storageBucket: "walker-midia.firebasestorage.app",
  messagingSenderId: "223143706690",
  appId: "1:223143706690:web:3c9e81a0d21173a59caddb"
};

// INICIAR FIREBASE
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

// UID DO ADMINISTRADOR
const ADMIN_UID = "7TAC1PMMwAMyrL3LUcboCHKjWJq2";

// STATUS REALTIME DATABASE
const bolinha = document.getElementById("bolinha-firebase");
const textoStatus = document.getElementById("texto-firebase");

if (bolinha && textoStatus) {
  const conexao = ref(rtdb, ".info/connected");

  onValue(conexao, (snapshot) => {
    if (snapshot.val() === true) {
      bolinha.className = "bolinha-firebase conectado";
      textoStatus.textContent = "Firebase conectado";
    } else {
      bolinha.className = "bolinha-firebase desconectado";
      textoStatus.textContent = "Firebase desconectado";
    }
  }, (erro) => {
    console.error("Erro na conexão:", erro);
    bolinha.className = "bolinha-firebase desconectado";
    textoStatus.textContent = "Falha na conexão";
  });
}

// ELEMENTOS DO LOGIN
const formulario = document.getElementById("form-login");
const campoEmail = document.getElementById("email");
const campoSenha = document.getElementById("senha");
const mensagem = document.getElementById("erro");
const botaoEntrar = document.getElementById("btn-entrar");

// MOSTRAR MENSAGEM
function mostrarMensagem(texto) {
  if (!mensagem) return;

  mensagem.textContent = texto;
  mensagem.classList.add("visivel");
}

// LOGIN
if (formulario) {
  formulario.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (mensagem) {
      mensagem.classList.remove("visivel");
    }

    const email = campoEmail.value.trim();
    const senha = campoSenha.value;

    try {
      botaoEntrar.disabled = true;
      botaoEntrar.textContent = "Entrando...";

      const resultado = await signInWithEmailAndPassword(
        auth,
        email,
        senha
      );

      // CONFIRMAR PERFIL
      const ehAdmin = resultado.user.uid === ADMIN_UID;

      // GUARDAR PERFIL PARA A PRÓXIMA PÁGINA
      sessionStorage.setItem(
        "perfilDaviWalker",
        ehAdmin ? "admin" : "cliente"
      );

      sessionStorage.setItem("loginBemVindo", "sim");

      // ADMIN E CLIENTE VÃO PARA A PÁGINA DE ENTRADA
      window.location.href = "./entrada.html";

    } catch (erro) {
      console.error("Erro no login:", erro);

      if (
        erro.code === "auth/invalid-credential" ||
        erro.code === "auth/wrong-password" ||
        erro.code === "auth/user-not-found"
      ) {
        mostrarMensagem("E-mail ou senha incorretos.");

      } else if (erro.code === "auth/too-many-requests") {
        mostrarMensagem("Muitas tentativas. Aguarde um pouco.");

      } else if (erro.code === "auth/network-request-failed") {
        mostrarMensagem("Verifique sua conexão com a internet.");

      } else {
        mostrarMensagem("Não foi possível entrar. Tente novamente.");
      }

      botaoEntrar.disabled = false;
      botaoEntrar.textContent = "Entrar";
    }
  });
}

// CONTADOR DE USUÁRIOS
async function atualizarContador() {
  const elemento = document.getElementById("total-usuarios");

  if (!elemento) return;

  try {
    const resultado = await getCountFromServer(
      collection(db, "usuarios")
    );

    elemento.textContent = resultado.data().count;

  } catch (erro) {
    console.error("Erro no contador:", erro);
    elemento.textContent = "—";
  }
}

atualizarContador();
