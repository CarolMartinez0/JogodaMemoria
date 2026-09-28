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
    // Garante que o usuário está autenticado anonimamente
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;

    // Referência do documento na coleção 'jogadores'
    const playerRef = doc(db, "jogadores", user.uid);
    
    // Dados base estruturados
    const finalData = {
      uid: user.uid,
      nome: userData.nome,
      modoAcesso: userData.modoAcesso || 'cadastro',
      tipoUsuario: userData.tipoUsuario || 'visitante',
      participarRanking: userData.participarRanking ?? true,
      recordes: {
        facil: 0,
        medio: 0,
        dificil: 0
      },
      createdAt: serverTimestamp()
    };

    // Se for aluno em modo cadastro, salva o Ano Escolar livre
    if (userData.tipoUsuario === 'aluno' && userData.anoEscolar) {
      finalData.anoEscolar = userData.anoEscolar;
    }

    // Salva o jogador no Firestore
    await setDoc(playerRef, finalData);

    return finalData;

  } catch (error) {
    console.error("Erro no processo de cadastro:", error);
    throw error;
  }
};

// Exportações para uso nos componentes
export { auth, db, collection, addDoc };