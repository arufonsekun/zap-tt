import pahoMqtt from 'paho-mqtt';
import TOPICS from '../constants/topics';
import USER_STATUS from '../constants/user-status';
import PAYLOAD from '../constants/payloads';
import { handleUsersControlMessage } from './MessageService';

const USER_STATS_REGEX = /USERS\/STATS\/([a-zA-Z0-9_-]+)/;

/**
 * Sends a MQTT message to a topic.
 * 
 * @param {*} appStore Where paho-mqtt client is stored
 * @param {*} userMessage Message payload
 * @param {*} topic Which topic the message should be sent
 * @param {*} retained Wheter the new message should be send to future subscribers
 *
 * @returns {void}
 */
const sendMessage = (appStore, userMessage, topic) => {
    const client = appStore.getMqttClient();

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
 * @param {*} appStore Where paho-mqtt client is stored
 * @param {*} topic Which topic user will be subscribed
 * 
 * @returns {void}
 */
const subscribeTopic = (appStore, topic) => {
    const client = appStore.getMqttClient();
    console.log("SUBSCRIB TOPIC", topic);
    client.subscribe(topic, { qos: 2 });
};

/**
 * Unsubscribes a user from a topic
 *
 * @param {*} appStore Where paho-mqtt client is stored
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
const handleNewMessage = (appStore, message) => {    
    const { topic } = message;
    const { payloadString } = message;
    const payload = JSON.parse(payloadString);
    const currentUser = appStore.getUser();

    console.log("TOPIC", topic);
    
    const isMessageFromUsersControlTopic = topic === `${TOPICS.USERS_CONTROL}/${currentUser.name.toLocaleUpperCase()}`;
    const isMessageFromUserStatusTopic = topic.match(USER_STATS_REGEX);
    
    if (isMessageFromUsersControlTopic) {
        handleUsersControlMessage(appStore, payload);
        return;
    }

    // if (subscribedTopics.includes(topic)) {
    //     // Mensagens sensuais
    //     // TODO: adicionar mensagem na lista de mensagem 
    //     return;
    // }

    console.log('isMessageFromUserStatusTopic', isMessageFromUserStatusTopic);
    if (isMessageFromUserStatusTopic) {
        console.log("GET INTO USERS STATS TOPIC", payload);
        // TODO: refactor user to a map or set @arufonsekun
        const zapTTUsers = appStore.getZapTTUsers();
        console.log('zapTTUsers', zapTTUsers);
        const userIndex = zapTTUsers.findIndex((user) => {
            return user.uuid === payload.uuid;
        });

        const isNewUser = userIndex === -1;
        if (isNewUser) {
            const newUser = payload;
            newUser.hasStartedConversation = false;
            appStore.addNewZapTTUser(newUser);

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
            const client = appStore.getMqttClient();
            unsubscribeTopic(client, TOPICS.USERS_STATS);

            client.disconnect();
        }

        // Updates existing user
        zapTTUsers[userIndex] = payload;
        return;
    }

    if (topic === TOPICS.GROUPS) {
        console.log('Um novo grupo foi criado', payload);

        const currentUser = appStore.getUser();
        const isCurrentUserInGroup = payload.participants.some((participant) => {
            return participant.uuid === currentUser.uuid
        });
        console.log('isCurrentUserInGroup', isCurrentUserInGroup);

        if (!isCurrentUserInGroup) {
            return;
        }

        appStore.addNewZapTTGroup(payload);
        return;
    }
}

const createZapTTClient = (appStore) => {

    const currentUser = appStore.getUser();
    const client = new pahoMqtt.Client("127.0.0.1", 9001, "/mqtt", currentUser.name);

    const onConnectionLost = (responseObject) => {
        if (responseObject.errorCode !== 0) {
            console.log("onConnectionLost:" + responseObject.errorMessage);
        }
    }

    const subscribeUserToGroupsTopic = () => {
        subscribeTopic(appStore, TOPICS.GROUPS);
    }

    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = (message) => {
        handleNewMessage(appStore, message);
    };
    client.connect({
        onSuccess: () => {
            setupUser(appStore);
            // subscribeUserToGroupsTopic();
        }
    });

    appStore.setMqttClient(client);
}

/**
 * TODO
 * 
 * @param {*} appStore Where Mqtt client is stored
 */
const setupUser = (appStore) => {
    const currentUser = appStore.getUser();
    subscribeTopic(appStore, `${TOPICS.USERS_CONTROL}/${currentUser.name.toLocaleUpperCase()}`);
    subscribeTopic(appStore, TOPICS.USERS_STATS);

    const data = {
        ...currentUser,
        status: USER_STATUS.ONLINE,
    };
    sendMessage(appStore, data, TOPICS.USERS_STATS.replace("#", currentUser.name));

    console.log(currentUser, "END SETUP USER");
}

/**
 * Disconnects current user from Mqtt broker.
 * Sends a message on USERS_ONLINE_TOPIC telling
 * he's going bye bye.
 * 
 * @param {*} appStore Where Mqtt client is stored
 */
const disconnectClient = (appStore) => {
    const currentUser = appStore.getUser();
    const data = {
        ...currentUser,
        status: USER_STATUS.OFFLINE,
    };

    console.log("Disconnect client");
    sendMessage(appStore, data, TOPICS.USERS_STATS.replace("#", currentUser.name));
}

/**
 * Creates a new conversation, 1p1 or group.
 *
 * @param {*} appStore VueJS store that holds global data
 * @param {*} data Converesation data
 * @param {*} isGroup If the conversation is a group or not
 *
 * @returns void
 */
const createConversation = (appStore, data, isGroup) => {
    if (isGroup) {
        createGroup(appStore, data);
        return;
    }

    createChat1p1(appStore, data);
}

const createGroup = (appStore, group) => {
    sendMessage(appStore, group, TOPICS.GROUPS);
}

/**
 * Creates a 1p1 chat between current user and given user.
 *
 * @param {*} appStore VueJS store that holds global data
 * @param {*} user The user that intents to chat with
 */
const createChat1p1 = (appStore, user) => {
    const userControlTopic = `${TOPICS.USERS_CONTROL}/${user.name.toLocaleUpperCase()}`;
    const currentUser = appStore.getUser();

    // TODO: Assinantes no topico de controle devem somente mandar mensagem e não receber atualizações do controle de outrém

    const payload = {
        content: PAYLOAD.NEW_CHAT,
        uuid: currentUser.uuid,
        name: currentUser.name,
    };

    sendMessage(appStore, payload, userControlTopic);
}

/**
 * 
 * @param {*} appStore Store that contains global data
 * @param {*} user The user that was requested to start a conversation
 * @param {*} ack Whether or not user has accepted to start a conversation
 * @returns 
 */
const acknowledgeChat = (appStore, user, ack) => {
    const currentUser = appStore.getUser();
    const ackTopic = `${user.name}_${currentUser.name.toLocaleUpperCase()}_${Date.now()}`;
    const userControl = `${TOPICS.USERS_CONTROL}/${user.name.toLocaleUpperCase()}`;
    const payload = {
        ack: ack,
        topic: ack ? ackTopic : null,
        name: currentUser.name,
        uuid: currentUser.uuid,
    };

    sendMessage(appStore, payload, userControl);

    if (!ack) {
        return;
    }

    subscribeTopic(appStore, ackTopic);
}

export {
    createZapTTClient,
    disconnectClient,
    createGroup,
    createConversation,
    acknowledgeChat,
    subscribeTopic,
};