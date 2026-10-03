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

@sair="sairDaConta" key="start"

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
import { auth, db, analytics } from './firebase.js'; 
import { doc, getDoc } from 'firebase/firestore';
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
        uid: '',
        nome: '',
        escola: '',
        pontuacaoMaxima: 0,
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
            // 🔧 CORREÇÃO 1: Injeta explicitamente o user.uid junto aos dados vindos do banco
            this.usuarioDados = {
              uid: user.uid,
              ...docSnap.data()
            };
            this.usuarioLogado = true; 
          } else {
            await auth.signOut();
            this.usuarioLogado = false;
          }
        } catch (error) {
          console.error("Erro ao buscar dados no Firestore:", error);
          this.usuarioLogado = false;
        }
      } else {
        this.usuarioLogado = false;
      }
      this.carregando = false; 
    });
  },
  methods: {
    onLoginSucesso(dados) {
      // 🔧 CORREÇÃO 2: Garante que o objeto mantido na memória inclua o uid
      const uid = dados.uid || auth.currentUser?.uid || '';
      
      this.usuarioDados = {
        uid: uid,
        ...dados
      };
      this.usuarioLogado = true;
      
      console.log("=== APP.VUE: ENVIANDO PARA START SCREEN ===", this.usuarioDados);
      
      logEvent(analytics, 'login_sucesso');
    },

    startGame(level) {
      this.dificuldade = level;
      this.jogoIniciado = true;
      logEvent(analytics, 'start_game', { difficulty: level });
    },

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
      logEvent(analytics, 'ver_ranking');
    },

    async atualizarDadosUsuario(novosDados) {
      console.log("App.vue recebendo atualização do GameBoard:", novosDados);
      
      // 🔧 CORREÇÃO 3: Preserva o UID caso novosDados venham sem ele
      const uidAtual = novosDados.uid || this.usuarioDados.uid || auth.currentUser?.uid;

      this.usuarioDados = {
        ...this.usuarioDados,
        ...novosDados,
        uid: uidAtual
      }; 
      
      logEvent(analytics, 'vitoria_confirmada');
    },

    async sairDaConta() {
      await auth.signOut();
      this.usuarioLogado = false;
      
      this.usuarioDados = { 
        uid: '',
        nome: '', 
        escola: '', 
        participarRanking: false,
        pontuacaoMaxima: 0
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





