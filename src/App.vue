<script setup>
import { ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';

import { createZapTTClient, disconnectClient } from './services/paho';
import { useUserStore } from './store/user';

import ZapHome from './components/ZapHome.vue';
// sudo lsof -i :1883
// ifconfig | grep "inet " | grep - v 127.0.0.1

const userStore = useUserStore();
const username = ref("");
const isOnline = ref(false);

const enterOnZapTT = () => {
    if (!username.value) {
        return;
    }

    isOnline.value = true;
    const user = {
        uuid: uuidv4(),
        name: username.value,
    };

    userStore.setUser(user);

    createZapTTClient(userStore);
    username.value = "";
}

const disconnect = () => {
    disconnectClient(userStore);
    isOnline.value = false;
}

</script>

<template>
    <div class="row" v-if="!isOnline">
        <div class="col-12">
            <div class="welcome fs-1 py-5 text-success text-center">
                Bem-vindo ao <strong> zap-tt </strong>
            </div>
        </div>
        <div class="col-12">
            <div class="w-25 mx-auto">
                <div class="input-group mb-3">
                    <input
                        type="text" class="username form-control" v-model="username"
                        placeholder="Informe seu nome" aria-label="Nome"
                        aria-describedby="button-addon2"
                        @keydown.enter="enterOnZapTT()"
                    >
                        <button class="btn btn-success" @click="enterOnZapTT()" type="submit" id="button-addon2">
                            <i class="bi bi-box-arrow-in-right"></i> 
                            Entrar
                        </button>
                </div>
            </div>
        </div>
    </div>
    <ZapHome v-else @logout="disconnect"/>
</template>

<style scoped>
.welcome, .username {
    user-select: none;
}
</style>
