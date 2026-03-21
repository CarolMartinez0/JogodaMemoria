<template>
  <div id="app">
    <transition name="page" mode="out-in">
      <StorySlideshow v-if="exibindoIntro" @close-intro="exibindoIntro = false" key="slideshow" />
      <StartScreen v-else-if="!jogoIniciado" @start-game="startGame" @open-intro="exibindoIntro = true" key="start" />
      <GameBoard v-else :imagens="imagens" :dificuldade="dificuldade" @go-back="voltarMenu" key="game" />
    </transition>
  </div>
</template>

<script>
import StartScreen from './components/StartScreen.vue';
import GameBoard from './components/GameBoard.vue';
import StorySlideshow from './components/StorySlideshow.vue';

export default {
  components: { StartScreen, GameBoard, StorySlideshow },
  data() {
    return {
      exibindoIntro: false,
      jogoIniciado: false,
      dificuldade: 'facil',
      imagens: [
        "/img/ElasTI/1.png",
        "/img/ElasTI/2.png",
        "/img/ElasTI/3.png",
        "/img/ElasTI/4.png",
        "/img/ElasTI/5.png",
        "/img/ElasTI/6.png",
        "/img/ElasTI/7.png",
        "/img/ElasTI/8.png",
        "/img/ElasTI/9.png",
        "/img/ElasTI/10.png",
        "/img/ElasTI/11.png",
        "/img/ElasTI/12.png",
        "/img/ElasTI/13.png",
        "/img/ElasTI/14.png",
        "/img/ElasTI/15.png",
        "/img/ElasTI/16.png",
        "/img/ElasTI/17.png",
        "/img/ElasTI/18.png",
        "/img/ElasTI/19.png",
        "/img/ElasTI/20.png",
      ]
    }
  },
  methods: {
    startGame(level) {
      this.dificuldade = level;
      this.jogoIniciado = true;
    },
    voltarMenu() {
      this.jogoIniciado = false;
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
/* Aplicar a fonte globalmente */
body, #app {
  font-family: var(--font-evogria);
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






