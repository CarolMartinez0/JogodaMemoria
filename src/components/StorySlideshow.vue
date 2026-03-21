<template>
  <div class="slideshow">
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progress + '%' }"></div>
    </div>
    <transition name="slide-fade" mode="out-in">
      <div class="slide" :key="currentIndex">
        <img :src="currentSlide.foto" :alt="'Foto de ' + currentSlide.nome" class="slide-image" @load="imageLoaded" @error="imageError">
        <div class="slide-text" v-if="!loading">
          <h2>{{ currentSlide.nome }}</h2>
          <p class="historia">{{ currentSlide.historia }}</p>
          <p class="importancia">{{ currentSlide.importancia }}</p>
        </div>
        <div v-else class="spinner">Carregando...</div>
      </div>
    </transition>
    <div class="buttons">
      <button @click="previous" :disabled="currentIndex === 0" class="btn" aria-label="Slide anterior">Anterior</button>
      <button @click="next" :disabled="currentIndex === slides.length - 1" class="btn" aria-label="Próximo slide">Próximo</button>
      <button @click="skip" class="btn skip" aria-label="Pular introdução">Pular</button>
    </div>
  </div>
</template>

<script>
import women from '../data/women.json'

export default {
  name: 'StorySlideshow',
  data() {
    return {
      currentIndex: 0,
      slides: women,
      loading: true
    }
  },
  computed: {
    currentSlide() {
      return this.slides[this.currentIndex]
    },
    progress() {
      return ((this.currentIndex + 1) / this.slides.length) * 100
    }
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeydown)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeydown)
  },
  methods: {
    handleKeydown(e) {
      if (e.key === 'ArrowLeft') {
        this.previous()
      } else if (e.key === 'ArrowRight') {
        this.next()
      } else if (e.key === 'Escape') {
        this.skip()
      }
    },
    imageLoaded() {
      this.loading = false
    },
    imageError() {
      this.loading = false
    },
    previous() {
      if (this.currentIndex > 0) {
        this.loading = true
        this.currentIndex--
      }
    },
    next() {
      if (this.currentIndex < this.slides.length - 1) {
        this.loading = true
        this.currentIndex++
      }
    },
    skip() {
      this.$emit('close-intro')
    }
  }
}
</script>

<style scoped>
.slideshow {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-image: linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url('/img/menu-fundo.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  font-family: 'Evogria', sans-serif;
  color: white;
  padding: 20px;
  box-sizing: border-box;
}

/* Responsividade para o container */
@media (max-width: 768px) {
  .slideshow {
    padding: 10px;
  }
}

.progress-bar {
  width: 100%;
  max-width: 600px;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  margin-bottom: 20px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: white;
  transition: width 0.3s ease;
}

.spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
  color: white;
}

.slide {
  display: flex;
  align-items: center;
  max-width: 800px;
  margin-bottom: 20px;
  flex-direction: row;
}

.slide-image {
  width: 250px;
  height: 250px;
  object-fit: contain;
  border-radius: 50px;
  margin-right: 20px;
  margin-bottom: 0;
}

.slide-text {
  flex: 1;
}

.slide-text h2 {
  margin-top: 0;
  font-size: 2em;
}

.slide-text p {
  font-size: 1.2em;
  line-height: 1.5;
}

/* Responsividade */
@media (max-width: 768px) {
  .slide {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .slide-image {
    margin-right: 0;
    margin-bottom: 20px;
    width: 180px;
    height: 180px;
  }

  .slide-text h2 {
    font-size: 1.5em;
  }

  .slide-text p {
    font-size: 1.1em;
  }
}

.buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

/* Responsividade para botões */
@media (max-width: 768px) {
  .buttons {
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }

  .btn {
    width: 200px;
  }
}

.btn {
  padding: 10px 20px;
  font-size: 1em;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: #ff69b4;
  color: white;
  transition: background-color 0.25s;
}

.btn:hover:not(:disabled) {
  background-color: #ff1493;
}

.btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.skip {
  background-color: #be356e;
}

.skip:hover {
  background-color: #ff91a4;
}

/* Transições suaves para os slides */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.5s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
}
</style>
