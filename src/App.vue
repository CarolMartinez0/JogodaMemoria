<template>
  <div id="app">
    <div v-if="carregando" class="start-screen">
      <div class="records">
         <p>Verificando autenticação...</p>
      </div>
    </div>

   <RegistrationScreen 
  v-else-if="!usuarioLogado" 
  :escolas="escolas" 
  @login-sucesso="onLoginSucesso" 
/>

    <template v-else>
      <transition name="page" mode="out-in">
        
        <StorySlideshow 
          v-if="exibindoIntro" 
          @close-intro="exibindoIntro = false" 
          key="slideshow" 
        />

       
        <Ranking 
          v-else-if="exibindoRanking" 
          :usuarioDados="usuarioDados" 
          :aba-inicial="abaInicialRanking" @go-back="voltarMenu"
          key="ranking" 
         />


<StartScreen 
  v-else-if="!jogoIniciado" 
  :usuarioDados="usuarioDados" 
  @start-game="startGame" 
  @open-intro="abrirIntro" 
  @ver-ranking="abrirRanking"
  @sair="sairDaConta"  key="start" 
/>

  <GameBoard 
  v-else 
  :imagens="imagens" 
  :dificuldade="dificuldade" 
  :usuarioDados="usuarioDados" 
  @go-back="voltarMenu" 
  @vitoria="atualizarDadosUsuario"
  @ver-ranking="abaInicialRanking = $event; exibindoRanking = true; jogoIniciado = false;"
  key="game" 
/>

      </transition>
    </template>
  </div>
</template>

<script>
import Ranking from './components/Ranking.vue';
import StartScreen from './components/StartScreen.vue';
import GameBoard from './components/GameBoard.vue';
import StorySlideshow from './components/StorySlideshow.vue';
import RegistrationScreen from './components/RegistrationScreen.vue';
import { auth, db } from './firebase.js'; 
import { doc, getDoc } from 'firebase/firestore';
import { analytics } from './firebase.js'; 
import { logEvent } from "firebase/analytics";

export default {
  components: { 
    StartScreen, 
    GameBoard, 
    StorySlideshow, 
    RegistrationScreen, 
    Ranking 
  },
  data() {
    return {
      carregando: true,
      usuarioLogado: false,
      exibindoIntro: false,
      jogoIniciado: false,
      exibindoRanking: false,
      abaInicialRanking: 'geral',
      telaAtual: 'menu',
      dificuldade: 'facil',
      usuarioDados: {
        nome: '',
        escola: '',
        recordes: { facil: 0, medio: 0, dificil: 0 }, // Garantindo que comece com recordes
        participarRanking: false 
      },
      imagens: [
        "/img/ElasTI/1.png", "/img/ElasTI/2.png", "/img/ElasTI/3.png", "/img/ElasTI/4.png",
        "/img/ElasTI/5.png", "/img/ElasTI/6.png", "/img/ElasTI/7.png", "/img/ElasTI/8.png",
        "/img/ElasTI/9.png", "/img/ElasTI/10.png", "/img/ElasTI/11.png", "/img/ElasTI/12.png",
        "/img/ElasTI/13.png", "/img/ElasTI/14.png", "/img/ElasTI/15.png", "/img/ElasTI/16.png",
        "/img/ElasTI/17.png", "/img/ElasTI/18.png", "/img/ElasTI/19.png", "/img/ElasTI/20.png",
      ],
      escolas: ['Escola A', 'Escola B', 'Escola C', 'Escola D', 'Escola E']
    }
  },
async created() {
    this.carregando = true;
    
    // O onAuthStateChanged fica vigiando se o usuário está logado ou não
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "jogadores", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            // Se o usuário existe no banco, carrega os dados e entra
            this.usuarioDados = docSnap.data();
            this.usuarioLogado = true; 
          } else {
            // Se o usuário existe no login mas não tem dados no banco, desloga
            await auth.signOut();
            this.usuarioLogado = false;
          }
        } catch (error) {
          console.error("Erro ao buscar dados no Firestore:", error);
          this.usuarioLogado = false;
        }
      } else {
        // Se não tem ninguém logado, manda para a tela de registro
        this.usuarioLogado = false;
      }
      // Avisa que terminou de checar o banco
      this.carregando = false; 
    });
  },
methods: {
  // ESSA É A FUNÇÃO QUE ESTÁ FALTANDO:
    onLoginSucesso(dados) {
      // Cria um objeto limpo espalhando os dados recebidos do cadastro
      this.usuarioDados = { ...dados };
      this.usuarioLogado = true;
      
      console.log("=== APP.VUE: ENVIANDO PARA START SCREEN ===", this.usuarioDados);
      
      // Aproveite para avisar ao Google que alguém logou/cadastrou!
      logEvent(analytics, 'login_sucesso');
    },
    // 1. Rastreia quando o jogo começa
    startGame(level) {
      this.dificuldade = level;
      this.jogoIniciado = true;
      logEvent(analytics, 'start_game', { difficulty: level });
    },

    // 2. ADICIONE ESTA FUNÇÃO para rastrear o interesse pedagógico
    abrirIntro() {
      this.exibindoIntro = true;
      logEvent(analytics, 'click_conhecer_mulheres');
    },

    voltarMenu() {
      this.jogoIniciado = false;
      this.exibindoRanking = false;
      this.exibindoIntro = false;
      this.abaInicialRanking = 'geral';
    },

    abrirRanking() {
      this.exibindoRanking = true;
      this.jogoIniciado = false;
      logEvent(analytics, 'ver_ranking'); // Rastreia quem olha o ranking
    },

    // 3. Quando o usuário vence (recebe o evento do GameBoard)
    // 3. Quando o usuário vence (recebe o evento do GameBoard)
    async atualizarDadosUsuario(novosDados) {
      console.log("App.vue atualizando recordes:", novosDados.recordes);
      this.usuarioDados = { ...novosDados }; 
      
      logEvent(analytics, 'vitoria_confirmada');

      // 🌟 TRAVA DO CHECKBOX AQUI: Só envia para a coleção "ranking" se o usuário aceitou!
      if (this.usuarioDados.participarRanking === true) {
        try {
          // Nota: Você já deve ter uma lógica de addDoc ou setDoc importada do firebase.
          // Certifique-se de que ela use esses campos para salvar os pontos de forma correta:
          console.log("🚀 Enviando pontuação para o ranking público pois o checkbox está ATIVO.");
          
          /* 
          A sua função que salva no Firebase (se estiver aqui dentro ou no GameBoard) 
          deve seguir essa estrutura para respeitar o seu botão:
          
          await addDoc(collection(db, "ranking"), {
            nome: this.usuarioDados.nome,
            pontuacao: novosDados.ultimaPontuacao, // ou a variável de pontos que você usa
            dificuldade: this.dificuldade,
            escola: this.usuarioDados.escola,
            codigoTurmaVinculado: this.usuarioDados.codigoTurmaVinculado,
            nomeTurma: this.usuarioDados.nomeTurma
          });
          */

        } catch (error) {
          console.error("Erro ao salvar no ranking:", error);
        }
      } else {
        console.log("🛑 Pontuação NÃO enviada para o ranking. O usuário escolheu não participar.");
      }
    },

   async sairDaConta() {
      await auth.signOut();
      this.usuarioLogado = false;
      
      // Reinicializa o usuário mantendo a estrutura dos recordes intacta e zerada!
      this.usuarioDados = { 
        nome: '', 
        escola: '', 
        participarRanking: false,
        recordes: { 
          facil: 0, 
          medio: 0, 
          dificil: 0 
   } 
      };
    }
  } 
};
</script>

<style>
/* ===== Importando a fonte Evogria ===== */
@font-face {
  font-family: 'Evogria';
  src: url('/img/Evogria.otf') format('opentype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

body, #app {
  font-family: 'Evogria', sans-serif;
  margin: 0;
  padding: 0;
}

/* Transições de página */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>





