<template>
  <div class="ranking-container">
    
    <h2 class="titulo-ranking">🏆 Ranking Geral do Jogo</h2>

    <!-- Filtro por Dificuldade -->
    <div class="filtros">
      <button 
        v-for="nivel in ['facil', 'medio', 'dificil']" 
        :key="nivel"
        @click="dificuldadeSelecionada = nivel"
        :class="{ active: difficultySelected(nivel) }"
      >
        {{ nivel.charAt(0).toUpperCase() + nivel.slice(1) }}
      </button>
    </div>

    <!-- Indicador de Carregamento -->
    <div v-if="carregando" class="loading">Carregando pontuações...</div>

    <!-- Mensagem se não houver dados -->
    <div v-else-if="rankingExibido.length === 0" class="no-data">
      Nenhuma pontuação registrada neste nível ainda. Seja o primeiro!
    </div>

    <!-- Tabela Única de Ranking -->
    <table v-else class="ranking-table">
      <thead>
        <tr>
          <th>Posição</th>
          <th>Jogador</th>
          <th>Ano Escolar</th>
          <th>Pontos</th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="(item, index) in rankingExibido" 
          :key="item.id" 
          :class="{'top3': index < 3}"
        >
          <td>{{ index + 1 }}º</td>
          <td class="nome-jogador">{{ item.nome }}</td>
          <td>{{ item.anoEscolar || 'Visitante' }}</td>
          <td class="pontuacao">{{ item.pontuacao }} pts</td>
        </tr>
      </tbody>
    </table>

    <div class="acoes">
      <button class="btn-voltar" @click="$emit('go-back')">Voltar ao Menu</button>
    </div>
  </div>
</template>

<script>
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from "../firebase";

export default {
  name: 'Ranking',
  props: {
    usuarioDados: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      dificuldadeSelecionada: 'facil',
      listaRanking: [], 
      carregando: false
    };
  },
  computed: {
    rankingExibido() {
      // Ordena por pontuação do maior para o menor e pega os top 50
      return [...this.listaRanking]
        .sort((a, b) => b.pontuacao - a.pontuacao)
        .slice(0, 50);
    }
  },
  methods: {
    difficultySelected(nivel) {
      return this.dificuldadeSelecionada === nivel;
    },
    buscarRanking(nivel) {
      this.carregando = true;
      
      const q = query(
        collection(db, "ranking"),
        where("dificuldade", "==", nivel)
      );

      onSnapshot(q, (snapshot) => {
        this.listaRanking = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        this.carregando = false;
      }, (error) => {
        console.error("Erro ao carregar o ranking:", error);
        this.carregando = false;
      });
    }
  },
  watch: {
    dificuldadeSelecionada(novoNivel) {
      this.buscarRanking(novoNivel);
    }
  },
  mounted() {
    this.buscarRanking(this.dificuldadeSelecionada);
  }
};
</script>

<style scoped>
.ranking-container {
  width: 100vw;
  min-height: 100vh;
  margin: 0;
  padding: 40px 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-image: linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url('/img/menu-fundo.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

.titulo-ranking, .filtros, .loading, .no-data, .ranking-table, .acoes {
  background-color: rgba(255, 255, 255, 0.95);
  width: 100%;
  max-width: 800px;
  box-sizing: border-box;
}

.titulo-ranking {
  margin: 0;
  padding: 30px 20px 10px 20px;
  border-radius: 20px 20px 0 0;
  color: #ff69b4;
  font-family: 'Evogria', sans-serif;
  text-align: center;
}

.filtros {
  padding: 10px 20px 20px 20px;
  display: flex;
  justify-content: center;
  gap: 15px;
}

.filtros button {
  padding: 8px 20px;
  border: 2px solid #ff69b4;
  background: transparent;
  color: #ff69b4;
  border-radius: 10px;
  font-family: 'Evogria', sans-serif;
  cursor: pointer;
  transition: 0.3s;
}

.filtros button.active {
  background: #ff69b4;
  color: white;
}

.ranking-table {
  border-collapse: collapse;
  padding: 0 20px;
}

th {
  color: #ff1493;
  padding: 15px;
  border-bottom: 2px solid #ffecf5;
  font-family: 'Evogria', sans-serif;
  text-transform: uppercase;
  text-align: left;
}

td {
  padding: 15px;
  color: #444;
  border-bottom: 1px solid #ffecf5;
  text-align: left;
}

.nome-jogador {
  font-weight: bold;
  color: #ff1493;
}

.pontuacao {
  font-weight: bold;
  color: #ff69b4;
}

.top3 {
  background: rgba(255, 105, 180, 0.12);
}

.acoes {
  padding: 20px 20px 40px 20px;
  border-radius: 0 0 20px 20px;
  display: flex;
  justify-content: center;
}

.btn-voltar {
  padding: 15px 40px;
  background-color: #ff69b4;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1.2rem;
  font-family: 'Evogria', sans-serif;
  transition: 0.2s;
}

.btn-voltar:hover {
  background-color: #ff1493;
  transform: scale(1.05);
}

.loading, .no-data {
  padding: 40px;
  color: #ff69b4;
  text-align: center;
}
</style>