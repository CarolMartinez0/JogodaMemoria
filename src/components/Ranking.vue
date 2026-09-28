<template>
  <div class="ranking-container">
    
    <div class="topo-alternador" v-if="codigoTurmaAtual">
      <button class="btn-alternar" @click="alternarTipoRanking">
        <span v-if="abaAtual === 'turma'">🏫 Ver Ranking das Turmas</span>
        <span v-else>👥 Ver Ranking da Minha Sala</span>
      </button>
    </div>

    <h2 class="titulo-ranking" v-if="abaAtual === 'turma'">🏆 Ranking da Sala: {{ nomeTurmaAtual || codigoTurmaAtual }}</h2>
    <h2 class="titulo-ranking" v-else>🏆 Campeonato entre Turmas </h2>

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

    <div v-if="carregando" class="loading">Carregando pontuações...</div>

    <div v-else-if="rankingExibido.length === 0" class="no-data">
      Nenhum dado registrado neste nível para esta seleção.
    </div>

    <table v-else-if="abaAtual === 'turma'" class="ranking-table">
      <thead>
        <tr>
          <th>Posição</th>
          <th>Jogador</th>
          <th>Pontos</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in rankingExibido" :key="item.id" :class="{'top3': index < 3}">
          <td>{{ index + 1 }}º</td>
          <td>{{ item.nome }}</td>
          <td>{{ item.pontuacao }}</td>
        </tr>
      </tbody>
    </table>

    <table v-else class="ranking-table">
      <thead>
        <tr>
          <th>Posição</th>
          <th>Nome da Turma</th>
          <th>Escola</th> <th>Média de Pontos</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(turma, index) in rankingExibido" :key="turma.codigo" :class="{'top3': index < 3}">
          <td>{{ index + 1 }}º</td>
          <td style="font-weight: bold; color: #ff1493;">{{ turma.nomeReal }}</td>
          <td>{{ turoEscola(turma.escola) }}</td>
          <td>{{ turma.media.toFixed(1) }} pts</td>
        </tr>
      </tbody>
    </table>

    <div class="acoes">
      <button class="btn-voltar" @click="$emit('go-back')">Voltar ao Menu</button>
    </div>
  </div>
</template>

<script>
import { collection, query, orderBy, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from "../firebase";

export default {
  name: 'Ranking',
  props: {
    usuarioDados: {
      type: Object,
      required: true
    },
    abaInicial: {
      type: String,
      default: 'turma'
    }
  },
  data() {
    return {
      abaAtual: 'turma',               
      dificuldadeSelecionada: 'facil',
      listaRankingGeral: [], 
      mapaNomesTurmas: {}, // 🌟 Dicionário na memória para traduzir códigos em nomes reais
      codigoTurmaAtual: '',  
      nomeTurmaAtual: '',          
      carregando: false
    };
  },
  computed: {
    rankingExibido() {
      if (this.abaAtual === 'turma') {
        return this.listaRankingGeral
          .filter(item => item.codigoTurmaVinculado === this.codigoTurmaAtual)
          .sort((a, b) => b.pontuacao - a.pontuacao);
      }

      if (this.abaAtual === 'geral') {
        const grupos = {};

        this.listaRankingGeral.forEach(item => {
          const codigo = item.codigoTurmaVinculado || item.codigo_turma || item.turma;
          if (!codigo) return; 

          if (!grupos[codigo]) {
            // Busca o nome real no mapa de tradução. Se não achar, usa provisoriamente o código
            const dadosTraduzidos = this.mapaNomesTurmas[codigo] || { nomeTurma: codigo, escola: item.escola || '---' };
            
            grupos[codigo] = { 
              codigo: codigo,
              nomeReal: dadosTraduzidos.nomeTurma, 
              escola: dadosTraduzidos.escola,
              somaPontos: 0, 
              totalAlunos: 0 
            };
          }

          grupos[codigo].somaPontos += item.pontuacao;
          grupos[codigo].totalAlunos += 1;
        });

        return Object.values(grupos)
          .map(t => ({
            codigo: t.codigo,
            nomeReal: t.nomeReal,
            escola: t.escola,
            media: t.somaPontos / t.totalAlunos
          }))
          .sort((a, b) => b.media - a.media);
      }

      return [];
    }
  },
  methods: {
    turoEscola(escola) {
      return escola || '---';
    },
    difficultySelected(nivel) {
      return this.dificuldadeSelecionada === nivel;
    },
    alternarTipoRanking() {
      this.abaAtual = this.abaAtual === 'turma' ? 'geral' : 'turma';
    },
    // 🌟 NOVA FUNÇÃO: Carrega todos os perfis de professores para criar a tabela de tradução
    async carregarDicionarioTurmas() {
      try {
        const professoresSnap = await getDocs(collection(db, "jogadores"));
        const dicionario = {};
        
        professoresSnap.forEach(doc => {
          const dados = doc.data();
          // Se for um cadastro de professor e tiver código de turma
          if (dados.tipoUsuario === 'professor' && dados.codigoTurma) {
            dicionario[dados.codigoTurma] = {
              nomeTurma: dados.nomeTurma, // Nome bonito criado (ex: 9anob-tarde)
              escola: dados.escola        // Escola do professor
            };
          }
        });
        
        this.mapaNomesTurmas = dicionario;
      } catch (error) {
        console.error("Erro ao montar dicionário de turmas:", error);
      }
    },
    buscarRanking(nivel) {
      this.carregando = true;
      
      const q = query(
        collection(db, "ranking"),
        where("dificuldade", "==", nivel)
      );

      onSnapshot(q, (snapshot) => {
        this.listaRankingGeral = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        this.carregando = false;
      }, (error) => {
        console.error("Erro ao puxar dados do ranking:", error);
        this.carregando = false;
      });
    }
  },
  watch: {
    dificuldadeSelecionada(novoNivel) {
      this.buscarRanking(novoNivel);
    }
  },
  async mounted() {
    this.codigoTurmaAtual = this.usuarioDados?.codigoTurmaVinculado || localStorage.getItem('codigo_turma') || '';
    this.nomeTurmaAtual = this.usuarioDados?.nomeTurma || '';

    // 1. Carrega primeiro o dicionário mapeando os códigos aos nomes reais das professoras
    await this.carregarDicionarioTurmas();

    if (this.codigoTurmaAtual) {
      this.abaAtual = this.abaInicial;
    } else {
      this.abaAtual = 'geral'; 
    }

    // 2. Depois puxa os pontos e monta a tabela já traduzida
    this.buscarRanking(this.dificuldadeSelecionada);
  }
};
</script>

<style scoped>
/* Seu CSS original mantido perfeitamente... */
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
.topo-alternador {
  width: 100%;
  max-width: 800px;
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}
.btn-alternar {
  padding: 12px 30px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1.1rem;
  font-family: 'Evogria', sans-serif;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: 0.2s ease;
}
.btn-alternar:hover {
  background-color: #43a047;
  transform: scale(1.05);
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
.acoes {
  padding: 20px 20px 40px 20px;
  border-radius: 0 0 20px 20px;
  display: flex;
  justify-content: center;
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
}
td {
  padding: 15px;
  color: #ff69b4;
  border-bottom: 1px solid #ffecf5;
  text-align: left;
}
.top3 {
  background: rgba(255, 105, 180, 0.1);
  font-weight: bold;
}
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
.loading, .no-data {
  padding: 40px;
  color: #ff69b4;
  text-align: center;
}
</style>