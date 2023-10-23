<script setup>
import { onMounted, ref } from 'vue';
import { createZapTTClient } from '../service/paho-service.js';

const userMessage = ref("");

const initPaho = () => createZapTTClient(userMessage.value);

defineProps({
  msg: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="greetings">
    <h1 class="green">{{ msg }}</h1>
    <h3>
      <input type="text" placeholder="Usuário:" v-model="userMessage">
      <button type="button" v-on:click="initPaho()">Send</button>
    </h3>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {

  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
