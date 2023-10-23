<script setup>
import { onMounted, ref } from 'vue';
import Welcome from './components/Welcome.vue';

// sudo lsof -i :1883
// ifconfig | grep "inet " | grep - v 127.0.0.1

</script>

<template>
    <main>
        <div class="wrapper">
            <Welcome msg="Insira seu usuário:" />
        </div>
    </main>
</template>

<style scoped>
header {
    line-height: 1.5;
}


@media (min-width: 1024px) {
    header {
        display: flex;
        place-items: center;
        padding-right: calc(var(--section-gap) / 2);
    }

    header .wrapper {
        display: flex;
        place-items: flex-start;
        flex-wrap: wrap;
    }
}
</style>
