<template>
  <div class="registration-screen">
    <div class="card">
      <h1>Acesso ao Jogo</h1>
      <img class="card-logo" src="/img/ElasTI/logo.png" alt="Logo" />

      <!-- PASSO 1: BOTOES DE ESCOLHA INICIAL -->
      <div class="mode-selector" v-if="!modoAcesso">
        <p class="instruction-text">Escolha uma opção para começar.</p>

        <button 
          type="button" 
          class="btn-mode btn-cadastro" 
          @click="selecionarModo('cadastro')"
          :disabled="loading"
        >
          Fazer Cadastro
        </button>

        <button 
          type="button" 
          class="btn-mode btn-visitante" 
          @click="entrarDiretoComoVisitante"
          :disabled="loading"
        >
          {{ loading ? 'Entrando...' : 'Entrar como Visitante' }}
        </button>
      </div>

      <!-- PASSO 2: FORMULARIO EXIBIDO APENAS SE ESCOLHER "CADASTRO" -->
      <form v-else @submit.prevent="submitForm">
        
        <div class="form-header">
          <h2>Cadastro</h2>
          <button type="button" class="btn-change-mode" @click="resetarModo">
            ← Trocar opção
          </button>
        </div>

        <label>
          Tipo de Cadastro
          <select class="field-control" v-model="tipoUsuario" @change="limparSubCampos" required>
            <option value="aluno">Aluno(a)</option>
            <option value="responsavel">Responsável</option>
          </select>
        </label>

        <!-- CAMPO DE ANO ESCOLAR COMO TEXTO LIVRE -->
        <label v-if="tipoUsuario === 'aluno'">
          Ano Escolar
          <input 
            class="field-control" 
            type="text" 
            v-model="anoEscolar" 
            placeholder="Ex: 7º Ano, 3º Ano do Ensino Médio..." 
            required 
          />
        </label>

        <!-- NOME SEMPRE SORTEADO -->
        <label>
          Seu Nome de Usuário (Sorteado)
          <div class="input-with-button">
            <input 
              class="field-control" 
              type="text" 
              v-model="nome" 
              placeholder="Clique ao lado para gerar seu apelido" 
              readonly
              required 
            />
            <button 
              type="button" 
              class="btn-random" 
              @click="sortearNome" 
              title="Gerar outro nome aleatório"
            >
              🔄 Sorteie para mim
            </button>
          </div>
          <span class="hint-text" v-if="nomeGerado">
            Apelido gerado! Se não gostou, clique em sortear novamente.
          </span>
        </label>

        <div class="checkbox-container">
          <label class="checkbox-label">
            <input type="checkbox" v-model="participarRanking" />
            Quero participar do ranking
          </label>
        </div>

        <button type="submit" class="btn-submit" :disabled="loading || !nome">
          {{ loading ? 'Enviando...' : 'Finalizar cadastro' }}
        </button>
      </form>

      <p class="error" v-if="error">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import { registerUser } from "../firebase";

const adjetivos = ["Super", "Veloz", "Curioso", "Gamer", "Mestre", "Rápido", "Lendário", "Esperto", "Criativo", "Elegante"];
const substantivos = ["Capivara", "Panda", "Gato", "Raposa", "Unicórnio", "Borboleta", "Dragão", "Pinguim", "Leão", "Lobo"];

export default {
  emits: ["login-sucesso"],
  data() {
    return {
      modoAcesso: "", // '' (nenhum selecionado) ou 'cadastro'
      tipoUsuario: "aluno", // 'aluno' ou 'responsavel'
      nome: "",
      nomeGerado: false,
      anoEscolar: "",
      participarRanking: true,
      loading: false,
      error: ""
    };
  },
  methods: {
    selecionarModo(modo) {
      this.modoAcesso = modo;
      this.error = "";
      this.anoEscolar = "";
      this.sortearNome();
    },
    resetarModo() {
      this.modoAcesso = "";
      this.error = "";
      this.nome = "";
      this.nomeGerado = false;
    },
    sortearNome() {
      const adj = adjetivos[Math.floor(Math.random() * adjetivos.length)];
      const sub = substantivos[Math.floor(Math.random() * substantivos.length)];
      const num = Math.floor(100 + Math.random() * 900);
      
      this.nome = `${sub}${adj}${num}`;
      this.nomeGerado = true;
    },
    limparSubCampos() {
      this.anoEscolar = "";
      this.error = "";
      this.sortearNome();
    },
    // Método direto para visitantes
    async entrarDiretoComoVisitante() {
      this.error = "";
      this.loading = true;

      const dadosVisitante = {
        nome: "Visitante",
        modoAcesso: "visitante",
        tipoUsuario: "visitante",
        participarRanking: false, // 🚫 Nunca participa do ranking
        pontuacaoMaxima: 0,
        recordes: {
          facil: 0,
          medio: 0,
          dificil: 0
        }
      };

      try {
        console.log("=== ENTRANDO COMO VISITANTE ===", dadosVisitante);
        const usuarioRegistrado = await registerUser(dadosVisitante);
        this.$emit("login-sucesso", usuarioRegistrado);
      } catch (err) {
        console.error("Erro no acesso como visitante:", err);
        this.error = err.message || "Não foi possível entrar como visitante.";
      } finally {
        this.loading = false;
      }
    },
    async submitForm() {
      if (!this.nome) {
        this.error = "Por favor, sorteie um nome de usuário.";
        return;
      }

      if (this.tipoUsuario === 'aluno' && !this.anoEscolar.trim()) {
        this.error = "Por favor, digite seu ano escolar.";
        return;
      }

      this.error = "";
      this.loading = true;

      let dadosCadastro = {
        nome: this.nome,
        modoAcesso: "cadastro",
        tipoUsuario: this.tipoUsuario,
        participarRanking: this.participarRanking,
        pontuacaoMaxima: 0
      };

      if (this.tipoUsuario === 'aluno') {
        dadosCadastro.anoEscolar = this.anoEscolar.trim();
      }

      try {
        console.log("=== ENVIANDO PARA O FIREBASE ===", dadosCadastro);

        const usuarioRegistrado = await registerUser(dadosCadastro);
        
        console.log("=== RETORNO DO FIREBASE ===", usuarioRegistrado);

        this.$emit("login-sucesso", usuarioRegistrado);
      } catch (err) {
        console.error("Erro no cadastro:", err);
        this.error = err.message || "Não foi possível concluir o acesso.";
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
/* Seletor de Modo Empilhado e Largo */
.mode-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  margin-bottom: 12px;
}

.instruction-text {
  font-size: 1.05rem;
  color: #ffb7e2;
  margin: 0 0 6px 0;
  font-family: inherit; 
}

.btn-mode {
  width: 100%;
  padding: 16px;
  font-size: 1.05rem;
  font-weight: 700;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  font-family: inherit;
}

/* Botão Cadastro: Rosa */
.btn-cadastro {
  background: linear-gradient(135deg, #ff69b4, #ff1493);
  border: none;
  color: white;
}

.btn-cadastro:hover {
  opacity: 0.95;
  transform: translateY(-1px);
}

/* Botão Visitante: Neutro */
.btn-visitante {
  background: rgba(255, 255, 255, 0.12);
  border: 2px solid rgba(255, 255, 255, 0.25);
  color: white;
}

.btn-visitante:hover {
  background: rgba(255, 255, 255, 0.22);
}

/* Cabeçalho do Formulário */
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.form-header h2 {
  font-size: 1.2rem;
  color: #ff8bda;
  margin: 0;
}

.btn-change-mode {
  background: transparent;
  border: none;
  color: #ffb7e2;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 4px 8px;
  width: auto;
  text-decoration: underline;
  font-family: inherit;
}

.btn-change-mode:hover {
  color: #ffffff;
}

.input-with-button {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

@media (min-width: 440px) {
  .input-with-button {
    flex-direction: row;
    align-items: center;
  }
}

.input-with-button .field-control {
  flex: 1;
}

.btn-random {
  padding: 14px 16px;
  background: linear-gradient(135deg, #4b3f72, #1f1a3a);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 14px;
  cursor: pointer;
  white-space: nowrap;
  font-size: 0.9rem;
  font-weight: bold;
  font-family: inherit;
  width: auto;
  transition: background 0.2s, transform 0.1s;
}

.btn-random:hover {
  background: linear-gradient(135deg, #5c4e8c, #2b244d);
  transform: scale(1.02);
}

.hint-text {
  font-size: 0.8rem;
  color: #ffb7e2;
  margin-top: 4px;
  font-family: sans-serif;
}

.btn-submit {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #ff69b4, #ff1493);
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
  font-family: inherit;
}

.btn-submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
}

.error {
  color: #ff6b6b;
  margin-top: 12px;
  font-size: 0.9rem;
}
</style>

<style>
.registration-screen {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  background-image: linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url('/img/menu-fundo.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  color: white;
  font-family: 'Evogria', sans-serif;
}

.card {
  width: min(540px, 100%);
  background: rgba(18, 10, 44, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 24px;
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.35);
  padding: 32px;
  backdrop-filter: blur(12px);
  position: relative;
}

.card-logo {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 84px;
  height: auto;
  opacity: 1;
  pointer-events: none;
}

.card h1 {
  margin-bottom: 18px;
  font-size: 2rem;
  color: #ffe7ff;
}

form {
  display: grid;
  gap: 18px;
}

label {
  display: grid;
  gap: 8px;
  font-size: 1rem;
  color: #f8f0ff;
}

input,
select {
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 14px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.96);
  color: #111;
  font-family: inherit;
  outline: none;
}

.field-control {
  width: 100%;
}
</style>