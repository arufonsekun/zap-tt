<script setup>
import { onMounted, ref } from 'vue';
import HelloWorld from './components/HelloWorld.vue';
import TheWelcome from './components/TheWelcome.vue';

import pahoMqtt from 'paho-mqtt';

const userMessage = ref("");
let client;

const createZapTTClient = () => {
    client = new pahoMqtt.Client("localhost", 1883, "arufonsekun");
    console.log(pahoMqtt);
    // Create a client instance

    // set callback handlers
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    // connect the client
    client.connect({ onSuccess: onConnect });

    // called when the client connects
    function onConnect() {
        // Once a connection has been made, make a subscription and send a message.
        console.log("onConnect");
        client.subscribe("World");
        const message = new pahoMqtt.Message("Hello");
        message.destinationName = "World";
        client.send(message);
    }

    // called when the client loses its connection
    function onConnectionLost(responseObject) {
        if (responseObject.errorCode !== 0) {
            console.log("onConnectionLost:" + responseObject.errorMessage);
        }
    }

    // called when a message arrives
    function onMessageArrived(message) {
        console.log("onMessageArrived:" + message.payloadString);
    }
}

function sendMessage() {
    const message = new pahoMqtt.Message(userMessage.value);
    message.destinationName = "World";
    client.send(message);
}


onMounted(() => {
    createZapTTClient();
})
</script>

<template>
    <header>
        <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />

        <div class="wrapper">
            <HelloWorld msg="You did it!" />
        </div>
    </header>

    <main>
        <TheWelcome />
        <input type="text" placeholder="Write here" v-model="userMessage">
        <button type="button" v-on:click=sendMessage>Send</button>

    </main>
</template>

<style scoped>
header {
    line-height: 1.5;
}

.logo {
    display: block;
    margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
    header {
        display: flex;
        place-items: center;
        padding-right: calc(var(--section-gap) / 2);
    }

    .logo {
        margin: 0 2rem 0 0;
    }

    header .wrapper {
        display: flex;
        place-items: flex-start;
        flex-wrap: wrap;
    }
}
</style>
