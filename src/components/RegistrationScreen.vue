<template>
  <div class="registration-screen">
    <div class="card">
      <h1>Cadastro de usuário</h1>
      <img class="card-logo" src="/img/ElasTI/logo.png" alt="Logo" />

      <form @submit.prevent="submitForm">
        <label>
          Tipo de usuário
          <select class="field-control" v-model="tipoUsuario" @change="limparCampos" required>
            <option value="aluno">Aluno(a)</option>
            <option value="professor">Professor(a)</option>
          </select>
        </label>

        <label>
          {{ tipoUsuario === 'aluno' ? 'Nome de Usuário (Sorteado)' : 'Nome Completo' }}
          <div class="input-with-button">
            <input 
              class="field-control" 
              type="text" 
              v-model="nome" 
              :placeholder="tipoUsuario === 'aluno' ? 'Clique ao lado para gerar seu apelido' : 'Digite seu nome'" 
              :readonly="tipoUsuario === 'aluno'"
              required 
            />
            <button v-if="tipoUsuario === 'aluno'" type="button" class="btn-random" @click="sortearNome" title="Gerar nome aleatório">
              🔄 Sorteie para mim
            </button>
          </div>
          <span class="hint-text" v-if="nomeGerado && tipoUsuario === 'aluno'">
            Apelido gerado! Se não gostou, clique em sortear novamente.
          </span>
        </label>

        <template v-if="tipoUsuario === 'professor'">
          <label>
            Escola / Instituição
            <select class="field-control" v-model="escola" required>
              <option disabled value="">Selecione uma escola</option>
              <option v-for="escolaItem in escolas" :key="escolaItem" :value="escolaItem">
                {{ escolaItem }}
              </option>
            </select>
          </label>

          <label>
            Nome da Turma que deseja criar
            <input class="field-control" type="text" v-model="nomeTurma" placeholder="Ex: 5º Ano B - Tarde" required />
          </label>
        </template>

        <template v-if="tipoUsuario === 'aluno'">
          <label>
            Código da Turma (Peça para sua professora)
            <input 
              class="field-control" 
              type="text" 
              v-model="codigoTurmaInformado" 
              placeholder="Ex:ABC0" 
              @input="codigoTurmaInformado = codigoTurmaInformado.toUpperCase()"
              required 
            />
          </label>
        </template>

        <div class="checkbox-container">
          <label class="checkbox-label">
            <input type="checkbox" v-model="participarRanking" />
            Quero participar do ranking
          </label>
        </div>

        <button type="submit" :disabled="loading || !nome">
          {{ loading ? 'Enviando...' : 'Finalizar cadastro' }}
        </button>
      </form>

      <p class="error" v-if="error">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import { registerUser } from "../firebase";

const adjetivos = ["Super", "Veloz", "Curioso", "Gamer", "Mestre", "Rápido", "Lendário", "Esperto", "Criativo", "Legante"];
const substantivos = ["Capivara", "Panda", "Gato", "Raposa", "Unicórnio", "Borbolheta", "Dragão", "Pinguim", "Leão", "Lobo"];

export default {
  emits: ["login-sucesso"],
  props: {
    escolas: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      nome: "",
      nomeGerado: false,
      tipoUsuario: "aluno",
      escola: "",
      nomeTurma: "",
      codigoTurmaInformado: "",
      codigoTurmaGerado: "",
      participarRanking: true,
      loading: false,
      error: ""
    };
  },
  methods: {
    sortearNome() {
      const adj = adjetivos[Math.floor(Math.random() * adjetivos.length)];
      const sub = substantivos[Math.floor(Math.random() * substantivos.length)];
      const num = Math.floor(100 + Math.random() * 900);
      
      this.nome = `${sub}${adj}${num}`;
      this.nomeGerado = true;
    },
    limparCampos() {
      this.nome = "";
      this.nomeGerado = false;
      this.escola = "";
      this.nomeTurma = ""; // Corrigido de nomedataTurma para nomeTurma
      this.codigoTurmaInformado = "";
      this.error = "";
    },
    gerarCodigoTurmaUnico() {
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numeros = "0123456789";
  let resultado = "";

  // 1. Sorteia as 3 primeiras letras
  for (let i = 0; i < 3; i++) {
    resultado += letras.charAt(Math.floor(Math.random() * letras.length));
  }

  // 2. Sorteia o último dígito (sempre um número)
  resultado += numeros.charAt(Math.floor(Math.random() * numeros.length));

  return resultado;
},
    async submitForm() {
      if (!this.nome) {
        this.error = "Por favor, preencha o campo de nome.";
        return;
      }

      if (this.tipoUsuario === 'professor' && (!this.escola || !this.nomeTurma)) {
        this.error = "Por favor, preencha a escola e o nome da turma.";
        return;
      }

      if (this.tipoUsuario === 'aluno' && !this.codigoTurmaInformado) {
        this.error = "Por favor, digite o código da turma.";
        return;
      }

     this.error = "";
      this.loading = true;

      // 1. Gera o código se for professor
      if (this.tipoUsuario === 'professor') {
        this.codigoTurmaGerado = this.gerarCodigoTurmaUnico();
      }

      // 2. Monta o objeto exatamente com as propriedades que o banco espera
      let dadosCadastro = {
        nome: this.nome,
        tipoUsuario: this.tipoUsuario,
        participarRanking: this.participarRanking,
        pontuacaoMaxima: 0
      };

      if (this.tipoUsuario === 'professor') {
        dadosCadastro.escola = this.escola;
        dadosCadastro.nomeTurma = this.nomeTurma;
        dadosCadastro.codigoTurma = this.codigoTurmaGerado; // <-- ESSENCIAL: Garanta esta linha!
      } else if (this.tipoUsuario === 'aluno') {
        dadosCadastro.codigoTurmaVinculado = this.codigoTurmaInformado;
      }

      try {
        // 🔍 LOG DE TESTE: Vamos ver o que está indo para o Firebase
        console.log("=== ENVIANDO PARA O FIREBASE ===", dadosCadastro);

        this.usuarioRegistrado = await registerUser(dadosCadastro);
        
        // 🔍 LOG DE TESTE: Vamos ver o que o Firebase devolveu
        console.log("=== RETORNO DO FIREBASE ===", this.usuarioRegistrado);

        this.$emit("login-sucesso", this.usuarioRegistrado);
    } catch (err) {
     console.error("Erro no cadastro:", err);
  
     // 🌟 Captura o texto exato do erro ("Código de turma inválido...") 
     // que enviamos através do 'throw new Error' lá no registerUser
     this.error = err.message || "Não foi possível concluir o cadastro.";
  
     } finally {
       this.loading = false;
   }
    }
  }
};
</script>

<style scoped>
.input-with-button {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 420px;
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
</style>

<style>
/* SEUS ESTILOS GLOBAIS ORIGINAIS COMPLETOS */
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
  margin-bottom: 12px;
  font-size: 2rem;
  color: #ffe7ff;
}

.card p {
  margin-bottom: 24px;
  color: rgba(255, 255, 255, 0.85);
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
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 14px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.96);
  color: #111;
  font-family: inherit;
  outline: none;
}

select {
  color: #111;
}

.field-control {
  width: 420px;
  max-width: 100%;
}

.small-input {
  width: 420px;
  max-width: 100%;
}

select option {
  color: #111;
  background: #fff;
}

input:focus,
select:focus {
  border-color: #ff8bda;
  box-shadow: 0 0 0 4px rgba(255, 139, 218, 0.16);
}

.small-input {
  max-width: 320px;
}

.checkbox-label {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 14px;
}

input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: #ff69b4;
}

button {
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
}

button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.error {
  color: #ffd6e8;
  background: rgba(255, 105, 180, 0.14);
  padding: 12px 14px;
  border-radius: 12px;
}

.field-control, .small-input {
  width: 100%; 
  max-width: 420px; 
}
</style>