import pahoMqtt from 'paho-mqtt';
let client;

const createZapTTClient = (clientId) => {
    client = new pahoMqtt.Client("127.0.0.1", 9001, "/mqtt", clientId);
    console.log(client);

    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    client.connect({ onSuccess: onConnect });

    function onConnect() {
        console.log("onConnect");
        subscribeTopic("Lobby");
        sendMessage("Hello", "Lobby")
    }

    function onConnectionLost(responseObject) {
        if (responseObject.errorCode !== 0) {
            console.log("onConnectionLost:" + responseObject.errorMessage);
        }
    }

    function onMessageArrived(message) {
        console.log("onMessageArrived:" + message.payloadString);
    }
}

// const disconnect = () => client.disconnect();

const sendMessage = (userMessage, topic) => {
    const message = new pahoMqtt.Message(userMessage);
    message.destinationName = topic;
    client.send(message);
}

const subscribeTopic = (topic) => client.subscribe(topic);

// const unsubscribeTopic = (topic) => client.unsubscribe(topic);

export {
    createZapTTClient,
    // sendMessage,
    // subscribeTopic,
    // unsubscribeTopic,
}