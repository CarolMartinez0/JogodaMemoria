<template>
  <div class="start-screen">
    <div class="header-actions">
      <button @click="$emit('sair')" class="btn-finalizar-topo">
        FECHAR JOGO
      </button>
    </div>
    
    <h1 class="titulo-texto">Jogo da Memória</h1>
    
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
  // Certifique-se de que o usuarioDados está chegando aqui (via props ou vindo do App.vue)
  props: ['usuarioDados'], 

  computed: {
    highscoreFacil() {
      // Tenta pegar do objeto do Firebase, se não existir, mostra 0
      return this.usuarioDados?.recordes?.facil || 0;
    },
    highscoreMedio() {
      return this.usuarioDados?.recordes?.medio || 0;
    },
    highscoreDificil() {
      return this.usuarioDados?.recordes?.dificil || 0;
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

<style scoped>
/* UNIFICADO: Container principal */
.start-screen {
  position: relative; /* ESSENCIAL para o botão absolute funcionar */
  width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  text-align: center;
  
  background-image: linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url('/img/menu-fundo.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  
  padding-top: 80px; /* Aumentado para o título não bater no botão */
  padding-bottom: 50px;
  box-sizing: border-box;
  font-family: 'Evogria', sans-serif;
}

/* POSICIONAMENTO DO BOTÃO */
.header-actions {
  position: absolute; 
  top: 20px;          
  right: 20px;        
  z-index: 100; /* Garante que fique acima de tudo */
}

.btn-finalizar-topo {
  background-color: #e74c3c;
  color: white;
  border: 2px solid white;
  padding: 10px 18px;
  font-family: 'Evogria', sans-serif;
  font-size: 0.9rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

.btn-finalizar-topo:hover {
  background-color: #c0392b;
  transform: scale(1.1);
}

/* RESTANTE DOS ESTILOS (Títulos, Recordes, etc) */
.titulo-texto { color: white; font-size: 2rem; margin-bottom: 20px; }
.titulo-img { max-width: 40%; min-width: 200px; object-fit: contain; }
.start-screen p { color: white; margin-bottom: 20px; font-size: 1.5rem; }

.buttons button {
  margin: 10px;
  padding: 14px 28px;
  font-size: 1.3rem;
  cursor: pointer;
  border: none;
  border-radius: 10px;
  background-color: #ff69b4;
  color: white;
  font-family: 'Evogria', sans-serif;
}

.intro-button {
  padding: 18px 36px;
  font-size: 1.5rem;
  border: 2px solid white;
  background-color: rgba(255,255,255,0.9);
  color: #333;
  font-family: 'Evogria', sans-serif;
  border-radius: 12px;
}
/* Seção de recordes atualizada */
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










