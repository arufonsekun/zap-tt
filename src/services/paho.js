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

    console.log("SEND MESSAGE", topic, payload);
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
    console.log("SUBSCRIB TOPIC", topic);
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
    const { payloadString } = message;
    const payload = JSON.parse(payloadString);
    const currentUser = userStore.getUser();

    console.log("TOPIC", topic);
    // TODO: refact this IF into a function!


    if (topic == `${TOPICS.USERS_CONTROL}/${currentUser.name}`) {
        if (payload == PAYLOAD.NEW_CHAT) {
            // ABRIR DIALOG
        } else if (payload.ack) {
            subscribeTopic(payload.topic);
            subscribedTopics.add(payload.topic);
        }

        return;
    }

    if (subscribedTopics.includes(topic)) {
        // Mensagens sensuais
        // TODO: adicionar mensagem na lista de mensagem 
        return;
    }

    const regex = /USERS\/STATS\/([a-zA-Z0-9_-]+)/;
    if (topic.match(regex)) {
        console.log("GET INTO USERS STATS TOPIC", payload);
        // TODO: refactor user to a map or set @arufonsekun
        const zapTTUsers = userStore.getZapTTUsers();
        console.log('zapTTUsers', zapTTUsers);
        const userIndex = zapTTUsers.findIndex((user) => {
            return user.uuid === payload.uuid;
        });

        const isNewUser = userIndex === -1;
        if (isNewUser) {
            const newUser = payload;
            userStore.addNewZapTTUser(newUser);

            return;
        }

        const isCurrentUser = payload.uuid === currentUser.uuid;
        const isDisconnected = payload.status === USER_STATUS.OFFLINE
        if (isCurrentUser && isDisconnected) {
            /**
             * Unsubscribes current user from USER_ONLINE topic,
             * meaning current user has no interest in knowing
             * whom is online, once current user intent is to logout.
             */
            const client = userStore.getMqttClient();
            unsubscribeTopic(client, TOPICS.USERS_STATS);

            client.disconnect();
        }

        // Updates existing user
        zapTTUsers[userIndex] = payload;
        return;
    }

    if (topic === TOPICS.GROUPS) {
        console.log('Um novo grupo foi criado', payload);

        const currentUser = userStore.getUser();
        const isCurrentUserInGroup = payload.participants.some((participant) => {
            return participant.uuid === currentUser.uuid
        });
        console.log('isCurrentUserInGroup', isCurrentUserInGroup);

        if (!isCurrentUserInGroup) {
            return;
        }

        userStore.addNewZapTTGroup(payload);
        return;
    }
}

const createZapTTClient = (userStore) => {

    const currentUser = userStore.getUser();
    const client = new pahoMqtt.Client("127.0.0.1", 9001, "/mqtt", currentUser.name);

    const onConnectionLost = (responseObject) => {
        if (responseObject.errorCode !== 0) {
            console.log("onConnectionLost:" + responseObject.errorMessage);
        }
    }

    const subscribeUserToGroupsTopic = () => {
        subscribeTopic(userStore, TOPICS.GROUPS);
    }

    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = (message) => {
        handleNewMessage(userStore, message);
    };
    client.connect({
        onSuccess: () => {
            setupUser(userStore);
            // subscribeUserToGroupsTopic();
        }
    });

    userStore.setMqttClient(client);
}

/**
 * TODO
 * 
 * @param {*} userStore Where Mqtt client is stored
 */
const setupUser = (userStore) => {
    const currentUser = userStore.getUser();
    console.log(currentUser, "SETUP USER");
    subscribeTopic(userStore, `${TOPICS.USERS_CONTROL}/${currentUser.name}`);
    subscribeTopic(userStore, TOPICS.USERS_STATS);

    const data = {
        ...currentUser,
        status: USER_STATUS.ONLINE,
    };
    sendMessage(userStore, data, TOPICS.USERS_STATS.replace("#", currentUser.name));

    console.log(currentUser, "END SETUP USER");
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

    console.log("CALLED DISCONNECT");
    sendMessage(userStore, data, TOPICS.USERS_STATS.replace("#", currentUser.name));
}

const createGroup = (userStore, group) => {
    sendMessage(userStore, group, TOPICS.GROUPS);
}

const createChat = (userStore, user) => {
    const userControl = `${TOPICS.USERS_CONTROL}/${user.name}`;
    // TODO: Assinantes no topico de controle devem somente mandar mensagem e não receber atualizações do controle de outrém
    // subscribeTopic(userStore, userControl);
    sendMessage(userStore, PAYLOADS.NEW_CHAT, userControl);
}

const acknowledgeChat = (userStore, user, ack) => {
    const currentUser = userStore.getUser();
    const ackTopic = `${user.name}_${currentUser.name}_${Date.now()}`;
    const userControl = `${TOPICS.USERS_CONTROL}/${user.name}`;
    const payload = {
        ack: ack,
        topic: ack ? ackTopic : null
    };

    // subscribeTopic(userStore, userControl);
    sendMessage(userStore, payload, userControl);

    if (!ack) return;
    subscribeTopic(userStore, ackTopic);
}

export {
    createZapTTClient,
    disconnectClient,
    createGroup,
    // sendMessage,
    // subscribeTopic,
    // unsubscribeTopic,
};