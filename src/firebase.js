import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, doc, setDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";

// Substitua estes valores pelos dados do seu projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAe5B2dhbhac-8trzE6s1dpj4EYcZJ7h8E",
  authDomain: "storygirljogodamemoria.firebaseapp.com",
  projectId: "storygirljogodamemoria",
  storageBucket: "storygirljogodamemoria.firebasestorage.app",
  messagingSenderId: "449905726241",
  appId: "1:449905726241:web:52033a47c39e73b7316460",
  measurementId: "G-SE4KRP4JDZ"
};

// 2. Inicialização
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export const analytics = getAnalytics(app);
/**
 * Função para registrar o usuário e criar o perfil no Firestore
 * @param {Object} userData - Dados vindos do formulário de cadastro
 */
export const registerUser = async (userData) => {
  try {
    // Primeiro, garante que o usuário está autenticado anonimamente
    // Isso é importante para bater com suas Rules (auth != null)
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;

    // Dados que serão salvos na coleção 'jogadores'
    const playerRef = doc(db, "jogadores", user.uid);
    
    const finalData = {
  uid: user.uid,
  nome: userData.nome,
  tipoUsuario: userData.tipoUsuario, // 'responsavel'
  // Se for aluno, salva o dado. Se for responsável, salva string vazia.
  escola: userData.tipoUsuario === 'aluno' ? userData.escola : '', 
  anoLetivo: userData.tipoUsuario === 'aluno' ? userData.anoLetivo : '',
  participarRanking: userData.participarRanking,
  recordes: {
  facil: 0,
  medio:  0,
  dificil: 0
},
  createdAt: serverTimestamp()
};

    await setDoc(playerRef, finalData);

    // Retornamos os dados para o App.vue saber quem está logado
    return finalData;

  } catch (error) {
    console.error("Erro no processo de cadastro:", error);
    throw error;
  }
};

// 3. Exportações para usar nos outros componentes (como o GameBoard)
export { auth, db, collection, addDoc };