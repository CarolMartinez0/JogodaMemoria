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

    <div v-if="mostrarModalCodigo" class="modal-overlay">
      <div class="victory-modal">
        <h2>🎉 Bem-vinda, Professora!</h2>
        <p>Seu cadastro foi realizado com sucesso.</p>
        
        <div class="code-box">
          <p>O código da sua turma é:</p>
          <span class="generated-code">{{ codigoTurma }}</span>
          <p class="instruction">Compartilhe esse código com seus alunos para que eles entrem na sua sala.</p>
        </div>

        <button class="btn-confirm" @click="mostrarModalCodigo = false">Começar</button>
      </div>
    </div>
  </div> 
</template>

<script>
export default {
  props: ['usuarioDados'], 

  data() {
    return {
      // Variáveis para controlar a exibição do aviso
      mostrarModalCodigo: false,
      codigoTurma: ""
    };
  },

  computed: {
    highscoreFacil() {
      return this.usuarioDados?.recordes?.facil || 0;
    },
    highscoreMedio() {
      return this.usuarioDados?.recordes?.medio || 0;
    },
    highscoreDificil() {
      return this.usuarioDados?.recordes?.dificil || 0;
    }
  },

mounted() {
    // 🔍 ADICIONE ESTE LOG AQUI:
    console.log("=== TESTE START SCREEN MOUNTED ===");
    console.log("O que tem dentro de usuarioDados?", this.usuarioDados);

    if (this.usuarioDados && this.usuarioDados.tipoUsuario === 'professor' && this.usuarioDados.codigoTurma) {
      this.codigoTurma = this.usuarioDados.codigoTurma;
      this.mostrarModalCodigo = true;
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
  position: relative;
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
  
  padding-top: 80px;
  padding-bottom: 50px;
  box-sizing: border-box;
  font-family: 'Evogria', sans-serif;
}

/* POSICIONAMENTO DO BOTÃO */
.header-actions {
  position: absolute; 
  top: 20px;          
  right: 20px;        
  z-index: 100;
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

/* ==========================================
   CSS DO AVISO ADICIONADO PARA A PROFESSORA
   ========================================== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  z-index: 9999;
}

.victory-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.6);
  font-family: 'Evogria', sans-serif;
  color: #050125;
  width: min(460px, 90%);
}

.victory-modal h2 {
  font-size: 1.8rem;
  margin-bottom: 15px;
  color: #ff1493;
}

.victory-modal p {
  color: #333;
  font-family: sans-serif;
  margin-bottom: 20px;
}

.code-box {
  background: #f1f3f9;
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 20px;
  border: 2px dashed #ff69b4;
}

.generated-code {
  font-size: 2rem;
  font-weight: bold;
  color: #1f1a3a;
  display: block;
  letter-spacing: 2px;
  margin: 10px 0;
}

.instruction {
  font-size: 0.85rem;
  color: #666 !important;
  margin-bottom: 0 !important;
}

.btn-confirm {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #ff69b4, #ff1493);
  color: white;
  border-radius: 12px;
  border: none;
  font-family: 'Evogria', sans-serif;
  font-size: 1.1rem;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(255, 20, 147, 0.3);
}

.btn-confirm:hover {
  transform: translateY(-2px);
}
</style>










