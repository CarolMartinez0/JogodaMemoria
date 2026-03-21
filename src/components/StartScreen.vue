<template>
  <div class="start-screen">
     <h1 class="titulo-texto">Jogo da Memória</h1>
    <!-- Título como imagem -->
    <div class="titulo-container">
      <img src="/img/logo-titulo.png" alt="Logo da StoryGirl" class="titulo-img" />
    </div>

    <div class="intro-section">
      <button @click="openIntro" class="intro-button">CONHEÇA AS MULHERES NA COMPUTAÇÃO</button>
    </div>

    <p>Escolha a dificuldade:</p>

    <div class="buttons">

      <button @click="start('facil')">Fácil (4 pares)</button>
      <button @click="start('medio')">Médio (6 pares)</button>
      <button @click="start('dificil')">Difícil (8 pares)</button>
    </div>

    <div class="records">
      <h3>Recordes</h3>
      <p>Fácil: {{ highscoreFacil }} pontos</p>
      <p>Médio: {{ highscoreMedio }} pontos</p>
      <p>Difícil: {{ highscoreDificil }} pontos</p>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    highscoreFacil() {
      return localStorage.getItem('highscore-facil') || 0;
    },
    highscoreMedio() {
      return localStorage.getItem('highscore-medio') || 0;
    },
    highscoreDificil() {
      return localStorage.getItem('highscore-dificil') || 0;
    }
  },
  methods: {
    openIntro() {
      this.$emit('open-intro');
    },
    start(level) {
      this.$emit('start-game', level);
    }
  }
};
</script>

<style>
/* Container principal do menu */
.start-screen {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  text-align: center;
  background-image: linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url('/img/menu-fundo.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding-top: 50px;
  box-sizing: border-box;
  font-family: 'Evogria', sans-serif;
}

/* Container do título */
.titulo-container {
  width: 100%;
  display: flex;
  justify-content: center;
}

/* Texto do título */
.titulo-texto {
  color: white;
  font-size: 2rem;
  margin-bottom: 20px;
}

/* Imagem do título responsiva */
.titulo-img {
  max-width: 40%;
  width: auto;
  height: auto;
  min-width: 200px;
  object-fit: contain;
  display: block;
}

/* Texto do menu */
.start-screen p {
  color: white;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

/* Botões */
.buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.buttons button {
  margin: 10px;
  padding: 14px 28px;
  font-size: 1.3rem;
  cursor: pointer;
  border: none;
  border-radius: 10px;
  background-color: #ff69b4;
  color: white;
  transition: all 0.2s;
  font-family: 'Evogria', sans-serif;
}

.buttons button:hover {
  background-color: #ff1493;
  transform: scale(1.05);
}

/* Seção de introdução */
.intro-section {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.intro-button {
  padding: 16px 32px;
  font-size: 1.4rem;
  font-weight: bold;
  cursor: pointer;
  border: 2px solid white;
  border-radius: 12px;
  background-color: rgba(255, 105, 180, 0.8); /* Fundo rosa claro */
  color: white;
  transition: all 0.3s;
  font-family: 'Evogria', sans-serif;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.intro-button:hover {
  background-color: rgba(255, 105, 180, 1);
  transform: scale(1.1);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

/* Estilo específico para o botão de introdução */
.intro-button {
  font-size: 1.5rem;
  padding: 18px 36px;
  border: 2px solid white;
  box-shadow: 0 0 15px rgba(255,255,255,0.7);
  background-color: rgba(255,255,255,0.9);
  color: #333;
  font-family: 'Evogria', sans-serif;
}

.intro-button:hover {
  background-color: white;
  box-shadow: 0 0 20px rgba(255,255,255,0.9);
  transform: scale(1.1);
}

/* Seção de recordes */
.records {
  margin-top: 30px;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  font-family: 'Evogria', sans-serif;
  color: #646363;
}

.records h3 {
  margin-top: 0;
  font-size: 1.5rem;
  color: #ff69b4;
}

.records p {
  margin: 5px 0;
  font-size: 1.1rem;
  color: #ff69b4;
}
</style>










