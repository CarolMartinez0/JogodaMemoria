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
        {{ nivel === 'facil' ? 'Fácil' : (nivel === 'medio' ? 'Médio' : 'Difícil') }}
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
          :class="{
            'top3': index < 3,
            'meu-perfil': ehUsuarioAtual(item)
          }"
        >
          <td>{{ index + 1 }}º</td>
          <td class="nome-jogador">{{ item.nome }}</td>
          <td>
            {{ item.anoEscolar || (item.tipoUsuario === 'responsavel' ? 'Responsável' : 'Não informado') }}
          </td>
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
      carregando: false,
      unsubscribe: null
    };
  },
  computed: {
    rankingExibido() {
      // Filtra e ordena reativamente pela dificuldade selecionada
      return [...this.listaRanking]
        .map(item => ({
          ...item,
          pontuacao: item.recordes?.[this.dificuldadeSelecionada] ?? 0
        }))
        .filter(item => item.pontuacao > 0) // Exibe apenas quem jogou e pontuou nesta dificuldade
        .sort((a, b) => b.pontuacao - a.pontuacao)
        .slice(0, 50);
    }
  },
  methods: {
    difficultySelected(nivel) {
      return this.dificuldadeSelecionada === nivel;
    },
    ehUsuarioAtual(item) {
      if (!this.usuarioDados || !this.usuarioDados.uid) return false;
      return item.id === this.usuarioDados.uid || item.uid === this.usuarioDados.uid;
    },
    iniciarEscutaRanking() {
      this.carregando = true;

      // Escuta a coleção 'jogadores' em tempo real apenas UMA vez no mounted
      const q = query(
        collection(db, "jogadores"),
        where("participarRanking", "==", true)
      );

      this.unsubscribe = onSnapshot(q, (snapshot) => {
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
  mounted() {
    this.iniciarEscutaRanking();
  },
  unmounted() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
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

/* 🌟 DESTAQUE COM LUZ NAS BORDAS (Sem alterar a cor de fundo original da linha) */
.meu-perfil {
  position: relative;
  z-index: 2;
  /* Cria uma aura suave rosa em volta da linha */
  box-shadow: 0 0 10px rgba(255, 105, 180, 0.6), inset 0 0 4px rgba(255, 105, 180, 0.3);
}

.meu-perfil td {
  /* Bordas iluminadas topo e base */
  border-top: 2px solid #ff69b4;
  border-bottom: 2px solid #ff69b4;
}

/* Garante o contorno de brilho nas pontas da tabela */
.meu-perfil td:first-child {
  border-left: 2px solid #ff69b4;
}

.meu-perfil td:last-child {
  border-right: 2px solid #ff69b4;
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