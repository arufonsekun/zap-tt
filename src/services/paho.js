import pahoMqtt from 'paho-mqtt';
import TOPICS from '../constants/topics';
import USER_STATUS from '../constants/user-status';

const sendMessage = (userStore, userMessage, topic) => {
    const client = userStore.getMqttClient();

    const message = new pahoMqtt.Message(JSON.stringify(userMessage));
    message.destinationName = topic;
    client.send(message);
}

const subscribeTopic = (userStore, topic) => {
    const client = userStore.getMqttClient();
    client.subscribe(topic)
};

const createZapTTClient = (userStore) => {

    const currentUser = userStore.getUser();
    const client = new pahoMqtt.Client("127.0.0.1", 9001, "/mqtt", currentUser.uuid);

    const onConnectionLost = (responseObject) => {
        if (responseObject.errorCode !== 0) {
            console.log("onConnectionLost:" + responseObject.errorMessage);
        }
    }

    const onMessageArrived = (message) => {
        console.log("onMessageArrived:" + message.payloadString);
    }

    const tellCurrentUserIsOnline = () => {
        const data = {
            ...currentUser,
            topic: TOPICS.USERS_ONLINE_TOPIC,
            status: USER_STATUS.ONLINE,
        };
        subscribeTopic(userStore, TOPICS.USERS_ONLINE_TOPIC);
        sendMessage(userStore, data, TOPICS.USERS_ONLINE_TOPIC)
    }

    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;
    client.connect({ onSuccess: tellCurrentUserIsOnline });

    userStore.setMqttClient(client);
}

// const disconnect = () => client.disconnect();

// const unsubscribeTopic = (topic) => client.unsubscribe(topic);

export {
    createZapTTClient,
    // sendMessage,
    // subscribeTopic,
    // unsubscribeTopic,
};