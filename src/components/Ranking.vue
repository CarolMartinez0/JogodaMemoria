<template>
  <div class="ranking-container">
    <h2 class="titulo-ranking">🏆 Ranking Global</h2>

    <div class="filtros">
      <button 
        v-for="nivel in ['facil', 'medio', 'dificil']" 
        :key="nivel"
        @click="dificuldadeSelecionada = nivel"
        :class="{ active: dificuldadeSelecionada === nivel }"
      >
        {{ nivel.charAt(0).toUpperCase() + nivel.slice(1) }}
      </button>
    </div>

    <div v-if="carregando" class="loading">Carregando pontuações...</div>

    <div v-else-if="listaRanking.length === 0" class="no-data">
      Nenhuma pontuação registrada neste nível ainda.
    </div>

    <table v-else class="ranking-table">
      <thead>
        <tr>
          <th>Posição</th>
          <th>Jogador</th>
          <th>Escola</th>
          <th>Pontos</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in listaRanking" :key="item.id" :class="{'top3': index < 3}">
          <td>{{ index + 1 }}º</td>
          <td>{{ item.nome }}</td>
          <td>{{ item.escola || '- - - - -' }}</td>
          <td>{{ item.pontuacao }}</td>
        </tr>
      </tbody>
    </table>

    <div class="acoes">
      <button class="btn-voltar" @click="$emit('go-back')">Voltar ao Menu</button>
    </div>
  </div>
</template>

<script>
import { collection, query, orderBy, getDocs,where,onSnapshot, limit } from 'firebase/firestore';
import { db } from "../firebase"; // Verifique se o caminho do seu arquivo firebase está correto

export default {
  name: 'Ranking',
  data() {
    return {
      // 1. Padronizamos o nome aqui
      dificuldadeSelecionada: 'facil', 
      listaRanking: [],
      carregando: true
    };
  },

  // O watch observa quando o usuário clica em outra dificuldade
  watch: {
    dificuldadeSelecionada(novoNivel) {
      console.log("Trocando para o nível:", novoNivel);
      this.buscarRanking(novoNivel);
    }
  },

  mounted() {
    // Busca o ranking inicial (facil) assim que abre a tela
    this.buscarRanking(this.dificuldadeSelecionada);
  },

  methods: {
    // 2. Certifique-se de que a função buscarRanking está aqui dentro
    buscarRanking(nivel) {
      this.carregando = true;
      
      const q = query(
        collection(db, "ranking"),
        where("dificuldade", "==", nivel),
        orderBy("pontuacao", "desc")
      );

      onSnapshot(q, (snapshot) => {
        this.listaRanking = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        this.carregando = false;
      }, (error) => {
        console.error("Erro ao buscar ranking:", error);
        this.carregando = false;
      });
    }
  }
};

</script>

<style scoped>
/* 1. A TELA INTEIRA (Fundo de Estrelas) */
.ranking-container {
  width: 100vw;
  min-height: 100vh;
  margin: 0;
  padding: 40px 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  /* Imagem de fundo idêntica à StartScreen */
  background-image: linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url('/img/menu-fundo.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

/* 2. O QUADRADO BRANCO (Aplicando o fundo branco em todos os blocos internos) */
/* Agrupamos os elementos para que eles formem um bloco visual único */
.titulo-ranking, 
.filtros, 
.loading, 
.no-data, 
.ranking-table, 
.acoes {
  background-color: rgba(255, 255, 255, 0.95); /* Branco quase sólido */
  width: 100%;
  max-width: 800px;
  box-sizing: border-box;
}

/* 3. ARREDONDANDO AS BORDAS DO QUADRADO (Apenas nas extremidades) */
.titulo-ranking {
  margin: 0;
  padding: 30px 20px 10px 20px;
  border-radius: 20px 20px 0 0; /* Arredonda só o topo */
  color: #ff69b4; /* Rosa Hot Pink */
  font-family: 'Evogria', sans-serif;
  text-align: center;
}

.acoes {
  padding: 20px 20px 40px 20px;
  border-radius: 0 0 20px 20px; /* Arredonda só a base */
  display: flex;
  justify-content: center;
}

/* 4. PALAVRAS ROSAS E TABELA */
.ranking-table {
  border-collapse: collapse;
  padding: 0 20px;
}

th {
  color: #ff1493; /* Rosa mais forte para contraste */
  padding: 15px;
  border-bottom: 2px solid #ffecf5;
  font-family: 'Evogria', sans-serif;
  text-transform: uppercase;
}

td {
  padding: 15px;
  color: #ff69b4; /* Texto Rosa */
  border-bottom: 1px solid #ffecf5;
  text-align: left;
}

.top3 {
  background: rgba(255, 105, 180, 0.1);
  font-weight: bold;
}

/* 5. BOTÕES E FILTROS */
.filtros {
  padding: 10px 20px;
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

/* Estilo para avisos quando não há dados */
.loading, .no-data {
  padding: 40px;
  color: #ff69b4;
  text-align: center;
}
</style>