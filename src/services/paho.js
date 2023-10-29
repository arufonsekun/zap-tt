import pahoMqtt from 'paho-mqtt';
import TOPICS from '../constants/topics';
import USER_STATUS from '../constants/user-status';

/**
 * Sends a MQTT message to a topic.
 * 
 * @param {*} userStore Where paho-mqtt client is stored
 * @param {*} userMessage Message payload
 * @param {*} topic Which topic the message should be sent
 * @param {*} retained Wheter the new message should be send to future subscribers
 *
 * @returns {void}
 */
const sendMessage = (userStore, userMessage, topic) => {
    const client = userStore.getMqttClient();

    /**
     * The Quality of Service used to deliver the message.
     * 0 Best effort (default).
     * 1 At least once.
     * 2 Exactly once.
     */
    const QoS = 2;

    const payload = JSON.stringify(userMessage);
    const retained = true;

    client.send(topic, payload, QoS, retained);
}

/**
 * Subscribes a user to a topic
 *
 * @param {*} userStore Where paho-mqtt client is stored
 * @param {*} topic Which topic user will be subscribed
 * 
 * @returns {void}
 */
const subscribeTopic = (userStore, topic) => {
    const client = userStore.getMqttClient();
    client.subscribe(topic, { qos: 2 });
};

/**
 * Unsubscribes a user from a topic
 *
 * @param {*} userStore Where paho-mqtt client is stored
 * @param {*} topic Which topic user will be unsubscribed
 *
 * @returns {void}
 */
const unsubscribeTopic = (client, topic) => {
    client.unsubscribe(topic);
}

/**
 * Handles incoming message accordingly to
 * which topic that message was sent.
 * 
 * @param {*} message Paho Mqtt message.
 */
const handleNewMessage = (userStore, message) => {
    const { topic } = message;
    
    if (topic === TOPICS.USERS_ONLINE_TOPIC) {
        console.debug("New message from USERS_ONLINE_TOPIC", message);
        
        const { payloadString } = message;
        const payload = JSON.parse(payloadString);
        
        const zapTTUsers = userStore.getZapTTUsers();
        console.log('zapTTUsers', zapTTUsers);
        const userIndex = zapTTUsers.findIndex((user) => {
            return user.uuid === payload.uuid;
        });

        const isNewUser = userIndex === -1;
        if (isNewUser) {
            const newUser = payload;
            userStore.addNewZapTTUser(newUser);

            const tellsNewUserIamOnline = () => {
                const currentUser = userStore.getUser();
                const data = {
                    ...currentUser,
                    status: USER_STATUS.ONLINE,
                };

                sendMessage(userStore, data, TOPICS.USERS_ONLINE_TOPIC);
            }

            tellsNewUserIamOnline();
            return;
        }

        const currentUser = userStore.getUser();
        const isCurrentUser = payload.uuid === currentUser.uuid;
        const isDisconnected = payload.status === USER_STATUS.OFFLINE
        if (isCurrentUser && isDisconnected) {
            /**
             * Unsubscribes current user from USER_ONLINE topic,
             * meaning current user has no interest in knowing
             * whom is online, once current user intent is to logout.
             */
            const client = userStore.getMqttClient();
            unsubscribeTopic(client, TOPICS.USERS_ONLINE_TOPIC);

            client.disconnect();
        }

        // Updates existing user
        zapTTUsers[userIndex] =  payload;
        return;
    }
}

const createZapTTClient = (userStore) => {

    const currentUser = userStore.getUser();
    const client = new pahoMqtt.Client("127.0.0.1", 9001, "/mqtt", currentUser.uuid);
    console.log('client', client);

    const onConnectionLost = (responseObject) => {
        if (responseObject.errorCode !== 0) {
            console.log("onConnectionLost:" + responseObject.errorMessage);
        }
    }

    const tellCurrentUserIsOnline = () => {
        const data = {
            ...currentUser,
            status: USER_STATUS.ONLINE,
        };

        subscribeTopic(userStore, TOPICS.USERS_ONLINE_TOPIC);
        sendMessage(userStore, data, TOPICS.USERS_ONLINE_TOPIC);
    }

    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = (message) => {
        handleNewMessage(userStore, message);
    };
    client.connect({ onSuccess: tellCurrentUserIsOnline });

    userStore.setMqttClient(client);
}

/**
 * Disconnects current user from Mqtt broker.
 * Sends a message on USERS_ONLINE_TOPIC telling
 * he's going bye bye.
 * 
 * @param {*} userStore Where Mqtt client is stored
 */
const disconnectClient = (userStore) => {
    const currentUser = userStore.getUser();
    const data = {
        ...currentUser,
        status: USER_STATUS.OFFLINE,
    };

    console.log('Chamou o disconnect');

    sendMessage(userStore, data, TOPICS.USERS_ONLINE_TOPIC);
}

export {
    createZapTTClient,
    disconnectClient,
    // sendMessage,
    // subscribeTopic,
    // unsubscribeTopic,
};