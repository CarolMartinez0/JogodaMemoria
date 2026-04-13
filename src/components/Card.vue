<template>
  <div class="card" :class="{ flipped: carta.virada || carta.encontrada }" @click="$emit('click')">
    <div class="front" :class="{ 'text-card': isTextCard }">
      <img v-if="!isTextCard" :src="carta.imagem" alt="Foto da mulher" />
      <div v-else class="text">
        <div class="name">{{ carta.name }}</div>
        <div class="importance">{{ carta.importance }}</div>
      </div>
    </div>
    <div class="back"></div>
  </div>
</template>

<script>
export default {
  props: ["carta"],
  computed: {
    isTextCard() {
      const textCards = ['2.png', '4.png', '6.png', '8.png', '10.png', '12.png', '14.png', '16.png', '18.png', '20.png'];
      return textCards.some(png => this.carta.imagem.includes(png));
    }
  }
};
</script>

<style scoped>
.card {
  width: 100%;
  aspect-ratio: 3/4;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;

  perspective: 800px; /* Aumentei – melhora animação no celular */
}

.card .front, 
.card .back {
  width: 100%;
  height: 100%;
  position: absolute;

  backface-visibility: hidden;
  -webkit-backface-visibility: hidden; /* NECESSÁRIO para Android/iPhone */

  transform-style: preserve-3d; /* Melhora consistência */
  will-change: transform; /* Otimiza para celular */

  transition: transform 0.6s ease;  /* Aumentei o tempo da virada */
  
  display: flex;
  justify-content: center;
  align-items: center;
}

.card .front {
  transform: rotateY(180deg);
}

.card .front.text-card {
  background: #fe47ac; /* light pink */
  color: white;
  padding: 5px;
  box-sizing: border-box;
  font-family: 'Evogria', sans-serif;
  font-size: 0.8rem;
  text-align: center;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.card .front.text-card .name {
  font-weight: bold;
  margin-bottom: 2px;
}

.card .front.text-card .importance {
  font-size: 0.7rem;
}

.card .back {
  background: #050125;
}

.card.flipped .front {
  transform: rotateY(0);
}

.card.flipped .back {
  transform: rotateY(180deg);
}

.card img {
  width: 100%;
  height: 100%;
  object-fit: cover;

  will-change: transform; /* Suaviza animação de imagem */
}

/* Ajustes para telas maiores */
@media (min-width: 600px) {
  .card .front.text-card {
    font-size: 1rem;
    padding: 8px;
  }
  .card .front.text-card .importance {
    font-size: 0.9rem;
  }
}

@media (min-width: 1000px) {
  .card .front.text-card {
    font-size: 1.2rem;
    padding: 10px;
  }
  .card .front.text-card .importance {
    font-size: 1.1rem;
  }
}
</style>













