<template>
  <div class="game-board">
    <div v-if="!venceu">
      <button class="voltar" @click="$emit('go-back')">Voltar</button>
      
      <div class="info">
        <p>Jogadas: {{ moves }}</p>
      </div>

      <div class="grid" :class="dificuldade">
        <Card
          v-for="c in cartas"
          :key="c.id"
          :carta="c"
          @click="virarCarta(c)"
        />
      </div>
    </div>

    <div v-else class="victory">
      <h2>🎉 Parabéns! Você venceu!</h2>
      <p>Jogadas: {{ moves }}</p>
      <p>Pontuação: {{ pontuacao }}</p>

      <hr>
      <div class="ranking-form">
        <button class="voltar" @click="$emit('ver-ranking')">
          Ver Ranking Global
        </button>
      </div>

      <hr>
      <button class="voltar" @click="startGame">Jogar novamente</button>
      <button class="voltar" @click="$emit('go-back')">Sair</button>
    </div>
  </div>
</template>

<script>
import Card from "./Card.vue";
import women from '../data/women.json'
import { db } from '../firebase'; 
import { analytics } from '../firebase.js'; // Cuidado com o caminho (../)
import { logEvent } from "firebase/analytics";
import { collection,doc, setDoc,updateDoc } from 'firebase/firestore';
export default {
  components: { Card },
  // Adicionamos "usuarioDados" aqui para receber o nome e a escola do App.vue
  props: ["imagens", "dificuldade", "usuarioDados"],

 data() {
  return {
    cartas: [],
    selecionadas: [],
    moves: 0,
    venceu: false,
    pontuacao: 0,
    travado: false // <-- impede cliques rápidos
  };
},

  created() {
    console.log("📡 GameBoard Criado! Dados recebidos do App.vue:", this.usuarioDados);
    this.startGame();
  },

  methods: {
    startGame() {
      this.moves = 0;
      this.venceu = false;
      this.pontuacao = 0;
      this.selecionadas = [];

      let numPares = 4;
      if (this.dificuldade === "medio") numPares = 6;
      if (this.dificuldade === "dificil") numPares = 8;

      // Criar pares corretos: [pessoa, texto]
      const todosPares = [];
      for (let i = 0; i < this.imagens.length; i += 2) {
        todosPares.push([this.imagens[i], this.imagens[i + 1]]);
      }

      // Verificar se tem pares suficientes
      if (todosPares.length < numPares) {
        alert("Não há pares suficientes!");
        return;
      }

      // Escolher pares aleatórios
      const paresComIndices = todosPares.map((par, idx) => ({ par, idx }));
      const paresEscolhidos = paresComIndices
        .sort(() => Math.random() - 0.5)
        .slice(0, numPares);

      // Criar cartas
      let cartas = [];
      let valor = 1;

      paresEscolhidos.forEach(item => {
        const { par, idx } = item;
        const woman = women[idx];
        const [pessoa, texto] = par;

        cartas.push({
          id: cartas.length,
          imagem: pessoa,
          virada: false,
          encontrada: false,
          valor,
          name: '',
          importance: ''
        });

        cartas.push({
          id: cartas.length,
          imagem: texto,
          virada: false,
          encontrada: false,
          valor,
          name: woman.nome,
          importance: woman.importancia
        });

        valor++;
      });

      // Embaralhar cartas
      this.cartas = cartas.sort(() => Math.random() - 0.5);
    },

 virarCarta(carta) {
  if (this.travado) return;              // 🔒 evita cliques enquanto espera
  if (carta.virada || carta.encontrada) return;
  if (this.selecionadas.length === 2) return;

  carta.virada = true;
  this.selecionadas.push(carta);

  if (this.selecionadas.length === 2) {
    this.moves++; 
    this.travado = true;                 // 🔒 trava o jogo
    setTimeout(() => this.verificarPar(), 900); // Delay maior p/ celular
  }
},


   verificarPar() {
      const [c1, c2] = this.selecionadas;

      if (c1.valor === c2.valor) {
        c1.encontrada = true;
        c2.encontrada = true;
      } else {
        c1.virada = false;
        c2.virada = false;
      }

      this.selecionadas = [];
      this.travado = false; 

      if (this.cartas.every(c => c.encontrada)) {
        this.vitoria();
      }
    },
async vitoria() {
  logEvent(analytics, 'vitoria_jogo', {
    dificuldade: this.dificuldade, // Qual nível ela venceu
    pontuacao: this.pontuacao,     // Quantos pontos fez
    projeto: "Mulheres na TI"
  });
      console.log("🚀 A função vitoria começou!");
      this.venceu = true;
      this.pontuacao = Math.max(1000 - this.moves * 20, 0);

      if (this.usuarioDados && this.usuarioDados.uid) {
        try {
          // 1. Ranking Global
          const rankingId = `${this.usuarioDados.uid}_${this.dificuldade}`;
          await setDoc(doc(db, "ranking", rankingId), {
            nome: this.usuarioDados.nome,
            pontuacao: this.pontuacao,
            escola: this.usuarioDados.escola,
            dificuldade: this.dificuldade,
            data: new Date()
          }, { merge: true });
          console.log("✅ Ranking Global OK");

          // 2. Recorde Pessoal
          const jogadorRef = doc(db, "jogadores", this.usuarioDados.uid);
          const recordeAtual = Number(this.usuarioDados.recordes?.[this.dificuldade] || 0);

          if (this.pontuacao > recordeAtual) {
            await updateDoc(jogadorRef, {
              [`recordes.${this.dificuldade}`]: this.pontuacao
            });
            
            // Atualização local reativa (IMPORTANTE)
            this.usuarioDados.recordes = {
              ...this.usuarioDados.recordes,
              [this.dificuldade]: this.pontuacao
            };
            console.log("Novo valor local:", this.usuarioDados.recordes[this.dificuldade]);
            console.log("✅ Recorde Pessoal Salvo!");
            this.$emit('vitoria', this.usuarioDados);
          } else {
            console.log("ℹ️ Pontuação não superou recorde.");
          }
        } catch (error) {
          console.error("❌ Erro no Firebase:", error);
        }
      } else {
        console.error("⛔ Usuário não identificado para salvar recorde.");
      }
    }
  } // fecha methods
}; // fecha export default
</script>

<style>
.game-board {
  width: 100%;
  /* 1. Mudamos para garantir que o fundo acompanhe o crescimento das cartas */
  min-height: 100vh; 
  height: auto; 

  background-image: 
    linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)),
    url('/img/menu-fundo.jpg');
  
  /* 2. O SEGREDO: Faz a imagem ficar fixa enquanto as cartas deslizam */
  background-attachment: fixed; 
  
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  
  padding: 20px;
  margin: 0 auto;
  font-family: 'Evogria', sans-serif;
  
  /* 3. SEGURANÇA: Adicione uma cor de fundo parecida com a sua imagem */
  background-color: #050125; 
}

/* Informações */
.info {
  font-size: 1.5rem;
  margin: 10px;
  color: white;
  text-align: center;
  font-family: 'Evogria', sans-serif;
}

/* CELULAR — cartas pequenas */
.grid {
  display: grid;
  justify-content: space-evenly; /* Centraliza o bloco de cartas na tela */
  align-content: center;
 grid-template-columns: repeat(auto-fit, minmax(70px, 160px));
  width: 95%; 
  max-width: 1000px;
  column-gap: 30px; /* Mantém a distância lateral que você gostou */
  row-gap: 40px; /* <--- AQUI: Aumente ou diminua este valor para afastar as cartas */
  padding: 20px;
  margin: 0 auto;
  border-radius: 8px;
}

/* TELAS MÉDIAS (tablets) */
@media (min-width: 600px) {
  .grid {
    column-gap: 70px; /* Mantém a distância lateral que você gostou */
  row-gap: 40px;
  }
} 

/* COMPUTADOR — cartas maiores */
@media (min-width: 1000px) {
  .grid {
   column-gap: 70px; /* Mantém a distância lateral que você gostou */
  row-gap: 40px;
  }
}

/* Tela de vitória */
.victory {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 30px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 0 20px rgba(0,0,0,0.4);
  font-family: 'Evogria', sans-serif;
  color: #050125;
}

/* Botão voltar */
.voltar {
  margin: 10px;
  padding: 12px 24px;
  font-size: 1.2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background-color: rgba(255,255,255,0.85);
  transition: all 0.2s;
  font-family: 'Evogria';
  color:#050125;
}

.voltar:hover {
  background-color: rgba(255,255,255,1);
  transform: scale(1.05);
}
</style>










