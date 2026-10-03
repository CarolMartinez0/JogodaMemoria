<template>
  <div class="game-board">
    
    <!-- 🌟 POP-UP DE AVISO (APARECE APENAS NO MÉDIO E DIFÍCIL) -->
    <div v-if="exibirAviso" class="modal-overlay">
      <div class="modal-content">
        <h3>💡 Dica de Jogo</h3>
        <p>
          Nos níveis com história, as cartas trazem informações sobre a trajetória de grandes mulheres da computação.
        </p>
        <p>
          Para ajudar nas partidas, você pode voltar à tela inicial e clicar em <strong>"CONHEÇA AS MULHERES NA COMPUTAÇÃO"</strong> para ler os perfis antes de jogar!
        </p>
        <button class="voltar" @click="fecharAviso">Entendi, vamos jogar!</button>
      </div>
    </div>

    <!-- TELA DE JOGO -->
    <div v-if="!venceu">
      <button class="voltar" @click="$emit('go-back')">Voltar</button>
      
      <div class="info">
        <p>Jogadas: {{ moves }}</p>
      </div>

      <div class="grid" :class="dificuldade">
        <div v-for="c in cartas" :key="c.id" class="card-wrapper">
          <Card
            :carta="c"
            @click="virarCarta(c)"
          />
        </div> 
      </div> 
    </div> 

    <!-- TELA DE VITÓRIA -->
    <div v-else class="victory">
      <h2>🎉 Parabéns! Você venceu!</h2>
      <p>Jogadas: {{ moves }}</p>
      <p>Pontuação: {{ pontuacao }}</p>

      <hr>
      <div class="ranking-form">
        <button class="voltar" @click="$emit('ver-ranking')">
          🏆 Ver Ranking Geral
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
import women from '../data/women.json';
import { db, auth, analytics } from '../firebase.js'; // 🔧 'auth' importado corretamente
import { logEvent } from "firebase/analytics";
import { doc, updateDoc } from 'firebase/firestore';
import confetti from 'canvas-confetti';

export default {
  components: { Card },
  props: ["imagens", "dificuldade", "usuarioDados"],

  data() {
    return {
      cartas: [],
      selecionadas: [],
      moves: 0,
      venceu: false,
      pontuacao: 0,
      travado: false,
      exibirAviso: false
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

      // Exibe o aviso apenas se for o modo completo (médio ou difícil) e o jogador ainda não leu nesta sessão
      const jaViuAviso = sessionStorage.getItem('avisoSaberMaisVisto');
      if ((this.dificuldade === "medio" || this.dificuldade === "dificil") && !jaViuAviso) {
        this.exibirAviso = true;
      } else {
        this.exibirAviso = false;
      }

      let numPares = 4;
      if (this.dificuldade === "medio") numPares = 6;
      if (this.dificuldade === "dificil") numPares = 8;

      // Criar pares originais: [pessoa, texto]
      const todosPares = [];
      for (let i = 0; i < this.imagens.length; i += 2) {
        todosPares.push([this.imagens[i], this.imagens[i + 1]]);
      }

      if (todosPares.length < numPares) {
        alert("Não há pares suficientes!");
        return;
      }

      // Escolher pares aleatórios
      const paresComIndices = todosPares.map((par, idx) => ({ par, idx }));
      const paresEscolhidos = paresComIndices
        .sort(() => Math.random() - 0.5)
        .slice(0, numPares);

      let cartas = [];
      let valor = 1;

      paresEscolhidos.forEach(item => {
        const { par, idx } = item;
        const woman = women[idx];
        const [pessoa, texto] = par;

        // Fase fácil (apenas imagens): 2 cartas da foto da pessoa
        if (this.dificuldade === "facil") {
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
            imagem: pessoa,
            virada: false,
            encontrada: false,
            valor,
            name: '',
            importance: ''
          });
        } else {
          // Demais fases (médio e difícil): Par de [imagem + texto]
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
        }

        valor++;
      });

      // Embaralhar cartas
      this.cartas = cartas.sort(() => Math.random() - 0.5);
    },

    fecharAviso() {
      this.exibirAviso = false;
      sessionStorage.setItem('avisoSaberMaisVisto', 'true');
    },

    virarCarta(carta) {
      if (this.travado) return;
      if (carta.virada || carta.encontrada) return;
      if (this.selecionadas.length === 2) return;

      carta.virada = true;
      this.selecionadas.push(carta);

      if (this.selecionadas.length === 2) {
        this.moves++; 
        this.travado = true;
        setTimeout(() => this.verificarPar(), 900);
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
  this.pontuacao = Math.max(1000 - this.moves * 20, 0);
  
  confetti({
    particleCount: 150,
    spread: 80,
    origin: { y: 0.6 }
  });

  logEvent(analytics, 'vitoria_jogo', {
    dificuldade: this.dificuldade,
    pontuacao: this.pontuacao,
    projeto: "Mulheres na TI"
  });
  
  console.log("🚀 A função vitoria começou!");
  this.venceu = true;

  // 1. Pega o usuário logado no Firebase Auth ou props
  const currentUser = auth.currentUser;
  const uid = this.usuarioDados?.uid || currentUser?.uid;

  // 2. Se for Visitante ou optou por não participar do ranking, interrompe o salvamento no Firestore
  if (this.usuarioDados?.modoAcesso === 'visitante' || this.usuarioDados?.participarRanking === false) {
    console.log("ℹ️ Jogador em modo Visitante ou sem opção de ranking ativada. Pontuação não enviada ao banco.");
    return;
  }

  if (!uid) {
    console.error("⛔ Usuário não identificado para salvar recorde.");
    return;
  }

  try {
    const jogadorRef = doc(db, "jogadores", uid);
    
    const pontuacaoAtualGeral = Number(this.usuarioDados?.pontuacaoMaxima || 0);
    const novaPontuacaoMaxima = Math.max(pontuacaoAtualGeral, this.pontuacao);

    // Busca o recorde atual específico desta dificuldade (ex: 'facil')
    const pontuacaoAtualDificuldade = Number(this.usuarioDados?.recordes?.[this.dificuldade] || 0);
    const novoRecordeDificuldade = Math.max(pontuacaoAtualDificuldade, this.pontuacao);

    // Salva no Firestore apenas se superou o recorde anterior nesta dificuldade
    if (this.pontuacao > pontuacaoAtualDificuldade) {
      await updateDoc(jogadorRef, {
        pontuacaoMaxima: novaPontuacaoMaxima,
        [`recordes.${this.dificuldade}`]: novoRecordeDificuldade
      });
      console.log(`✅ Novo recorde na dificuldade [${this.dificuldade}] salvo no Firestore!`);
    } else {
      console.log("ℹ️ Pontuação não superou a pontuação máxima desta dificuldade.");
    }

    // Prepara e emite os dados atualizados para o App.vue em memória
    const novosDadosUsuario = {
      ...this.usuarioDados,
      uid: uid,
      pontuacaoMaxima: novaPontuacaoMaxima,
      recordes: {
        ...this.usuarioDados?.recordes,
        [this.dificuldade]: novoRecordeDificuldade
      }
    };

    this.$emit('vitoria', novosDadosUsuario);

  } catch (error) {
    console.error("❌ Erro no Firebase ao salvar recorde:", error);
  }
}
  }
};
</script>

<style scoped>
.game-board {
  width: 100%;
  min-height: 100vh; 
  height: auto; 

  background-image: 
    linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)),
    url('/img/menu-fundo.jpg');
  
  background-attachment: fixed; 
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  
  padding: 20px;
  margin: 0 auto;
  font-family: 'Evogria', sans-serif;
  background-color: #050125; 
}

/* Modal / Pop-up de Aviso */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  box-sizing: border-box;
}

.modal-content {
  background: #ffffff;
  color: #050125;
  padding: 25px 30px;
  border-radius: 15px;
  max-width: 480px;
  width: 90%;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  animation: popIn 0.3s ease-out;
}

.modal-content h3 {
  margin-top: 0;
  font-size: 1.6rem;
  color: #ff1493;
}

.modal-content p {
  font-size: 1rem;
  line-height: 1.5;
  margin: 15px 0;
}

@keyframes popIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Informações */
.info {
  font-size: 1.5rem;
  margin: 10px;
  color: white;
  text-align: center;
  font-family: 'Evogria', sans-serif;
}

/* Grid das Cartas */
.grid {
  display: grid;
  justify-content: space-evenly;
  align-content: center;
  grid-template-columns: repeat(auto-fit, minmax(70px, 160px));
  width: 95%; 
  max-width: 1000px;
  column-gap: 30px;
  row-gap: 40px;
  padding: 20px;
  margin: 0 auto;
  border-radius: 8px;
}

/* Responsividade Celular */
@media (max-width: 600px) {
  .grid {
    grid-template-columns: repeat(2, 1fr); 
    justify-content: center;
    width: 100%;
    max-width: 360px; 
    margin: 0 auto; 
    padding: 10px;
    column-gap: 20px; 
    row-gap: 30px; 
  }

  .card-wrapper {
    width: 100%;
    max-width: 130px;
    aspect-ratio: 2 / 3;
    margin: 0 auto;
    position: relative;
  }

  .card-wrapper :deep(img),
  .card-wrapper :deep(.card),
  .card-wrapper > * {
    width: 100% !important;
    height: 100% !important;
    max-width: 100% !important;
    max-height: 100% !important;
    object-fit: contain !important; 
  }
}

/* Responsividade Computador */
@media (min-width: 1000px) {
  .grid {
    column-gap: 70px;
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

/* Botões */
.voltar {
  margin: 10px;
  padding: 12px 24px;
  font-size: 1.2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background-color: rgba(255,255,255,0.85);
  transition: all 0.2s;
  font-family: 'Evogria', sans-serif;
  color: #050125;
}

.voltar:hover {
  background-color: rgba(255,255,255,1);
  transform: scale(1.05);
}
</style>

  