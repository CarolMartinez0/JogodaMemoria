<template>
  <div class="registration-screen">
    <div class="card">
      <h1>Cadastro de usuário</h1>
      <img class="card-logo" src="/img/ElasTI/logo.png" alt="Logo" />

      <form @submit.prevent="submitForm">
        <label>
          Primeiro nome
          <input class="field-control" type="text" v-model="nome" placeholder="Digite seu primeiro nome" required />
        </label>

        <label>
          Tipo de usuário
          <select class="field-control" v-model="tipoUsuario" required>
            <option value="aluno">Aluno</option>
            <option value="responsavel">Responsável</option>
          </select>
        </label>

        <label v-if="tipoUsuario === 'aluno'">
          Escola
          <select class="field-control" v-model="escola" required>
            <option disabled value="">Selecione uma escola</option>
            <option v-for="escolaItem in escolas" :key="escolaItem" :value="escolaItem">
              {{ escolaItem }}
            </option>
          </select>
        </label>

        <label v-if="tipoUsuario === 'aluno'">
          Ano letivo
          <input class="field-control small-input" type="text" v-model="anoLetivo" placeholder="Ex: 6º ano" required />
        </label>

        <label class="checkbox-label">
          <input type="checkbox" v-model="participarRanking" />
          Quero participar do ranking
        </label>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Enviando...' : 'Finalizar cadastro' }}
        </button>
      </form>

      <p class="error" v-if="error">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import { registerUser } from "../firebase";

export default {
  emits: ["registered"],
  props: {
    escolas: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      nome: "",
      tipoUsuario: "aluno",
      escola: "",
      anoLetivo: "",
      pontuacaoMaxima: 0,
      participarRanking: true,
      loading: false,
      error: ""
    };
  },
  methods: {
    async submitForm() {
      if (!this.nome) {
        this.error = "Por favor, informe o primeiro nome.";
        return;
      }

      if (this.tipoUsuario === 'aluno' && (!this.escola || !this.anoLetivo)) {
        this.error = "Por favor, preencha escola e ano letivo.";
        return;
      }

      this.error = "";
      this.loading = true;

      try {
        const user = await registerUser({
          nome: this.nome,
          tipoUsuario: this.tipoUsuario,
          escola: this.tipoUsuario === 'aluno' ? this.escola : "",
          anoLetivo: this.tipoUsuario === 'aluno' ? this.anoLetivo : "",
          pontuacaoMaxima: this.pontuacaoMaxima,
          participarRanking: this.participarRanking
        });
        this.$emit("registered", user);
      } catch (err) {
        console.error(err);
        this.error = "Não foi possível concluir o cadastro. Verifique a conexão ou a configuração do Firebase.";
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

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
</style>
