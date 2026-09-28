import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, doc, setDoc,getDoc,query,getDocs,where,collection, addDoc, serverTimestamp } from "firebase/firestore";

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
    // 🔍 1. VALIDAÇÃO ANTES DE TUDO: Se for aluno, precisamos checar o código da turma
    let nomeTurmaDeduzido = '';
    
    // 1. IMPORTANTE: Certifique-se de importar collection, query, where e getDocs do firestore lá no topo do arquivo:
// import { getFirestore, doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";

if (userData.tipoUsuario === 'aluno') {
  if (!userData.codigoTurmaVinculado) {
    throw new Error("O código da turma é obrigatório para alunos.");
  }

  const codigoDigitado = userData.codigoTurmaVinculado.trim();
  console.log("Procurando turma onde o campo codigoTurma seja igual a:", codigoDigitado);

  // 🕵️‍♂️ Criamos uma query para buscar dentro da coleção 'jogadores'
  const turmasRef = collection(db, "jogadores");
  const q = query(turmasRef, where("codigoTurma", "==", codigoDigitado));
  
  // Executa a busca
  const querySnapshot = await getDocs(q);

  // Se o snapshot NÃO estiver vazio, significa que encontramos a turma!
  if (!querySnapshot.empty) {
    console.log("Turma encontrada com sucesso!");
    
    // Pegamos os dados do primeiro documento encontrado (já que o código deve ser único)
    const dadosDaTurma = querySnapshot.docs[0].data();
    
    // Pegamos o nome da turma que está lá no seu banco ("9anob-tarde")
    nomeTurmaDeduzido = dadosDaTurma.nomeTurma; 
  } else {
    console.log("Nenhuma turma encontrada com esse campo codigoTurma.");
    throw new Error("Código de turma inválido! Verifique com a sua professora.");
  }
}
    // Primeiro, garante que o usuário está autenticado anonimamente
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;

    // Dados que serão salvos na coleção 'jogadores'
    const playerRef = doc(db, "jogadores", user.uid);
    
    // Dados base estruturados
    const finalData = {
      uid: user.uid,
      nome: userData.nome,
      tipoUsuario: userData.tipoUsuario,
      participarRanking: userData.participarRanking,
      recordes: {
        facil: 0,
        medio: 0,
        dificil: 0
      },
      createdAt: serverTimestamp()
    };

    // Aplicamos as regras específicas para cada tipo de usuário
    if (userData.tipoUsuario === 'professor') {
      finalData.escola = userData.escola;
      finalData.nomeTurma = userData.nomeTurma; // Nome que ela escolheu
      finalData.codigoTurma = userData.codigoTurma.trim(); // ID único gerado
    } else if (userData.tipoUsuario === 'aluno') {
      finalData.escola = userData.escola || '';
      finalData.anoLetivo = userData.anoLetivo || '';
      finalData.codigoTurmaVinculado = userData.codigoTurmaVinculado.trim();
      finalData.nomeTurma = nomeTurmaDeduzido; // 🌟 SALVA O NOME DEDUZIDO DA PROFESSORA!
    } else {
      finalData.escola = '';
      finalData.anoLetivo = '';
    }

    // Salva o jogador no Firestore
    await setDoc(playerRef, finalData);

    // Guardamos o nome da turma no localStorage para o GameBoard usar no ranking sem ter que ler o banco de novo
    if (finalData.nomeTurma) {
      localStorage.setItem('nome_turma_atual', finalData.nomeTurma);
    }

    return finalData;

  } catch (error) {
    console.error("Erro no processo de cadastro:", error);
    throw error; // Repassa o erro para a sua tela de Login/Cadastro exibir o alerta na tela
  }
};
// 3. Exportações para usar nos outros componentes (como o GameBoard)
export { auth, db, collection, addDoc };