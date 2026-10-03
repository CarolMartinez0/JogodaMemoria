import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  getDocs, 
  where, 
  collection, 
  addDoc, 
  serverTimestamp 
} from "firebase/firestore";

// Configuração do projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAe5B2dhbhac-8trzE6s1dpj4EYcZJ7h8E",
  authDomain: "storygirljogodamemoria.firebaseapp.com",
  projectId: "storygirljogodamemoria",
  storageBucket: "storygirljogodamemoria.firebasestorage.app",
  messagingSenderId: "449905726241",
  appId: "1:449905726241:web:52033a47c39e73b7316460",
  measurementId: "G-SE4KRP4JDZ"
};

// Inicialização
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
    // 1. Garante que o usuário está autenticado anonimamente
    let user = auth.currentUser;
    if (!user) {
      const userCredential = await signInAnonymously(auth);
      user = userCredential.user;
    }

    // Referência do documento na coleção 'jogadores'
    const playerRef = doc(db, "jogadores", user.uid);
    
    // 2. Dados exatos exigidos pelas Security Rules do Firestore
    const firestoreData = {
      nome: userData.nome,
      modoAcesso: userData.modoAcesso || 'cadastro',
      tipoUsuario: userData.tipoUsuario || 'visitante',
      participarRanking: userData.participarRanking ?? true,
      pontuacaoMaxima: 0 // 🔒 Obrigatoriamente inteiro 0 conforme a regra
    };

    // Adiciona anoEscolar apenas se fornecido
    if (userData.tipoUsuario === 'aluno' && userData.anoEscolar) {
      firestoreData.anoEscolar = userData.anoEscolar;
    }

    // 3. Salva no Firestore
    await setDoc(playerRef, firestoreData);

    // 4. Retorna o objeto completo com o UID para o Vue utilizar em memória
    return {
      uid: user.uid,
      ...firestoreData
    };

  } catch (error) {
    console.error("Erro no processo de cadastro:", error);
    throw error;
  }
};

// Exportações para uso nos componentes
export { auth, db, collection, addDoc };