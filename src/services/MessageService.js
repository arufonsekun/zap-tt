import PAYLOAD from '../constants/payloads';
import { subscribeTopic } from './paho';

/**
 * Handles message sent on USERS_CONTROL topic,
 * this kind of messages occur when a user
 * starts a new chat with another user, AND
 * when a user accepts or declines the
 * request to start the conversation.
 * 
 * @param {*} payload User control message payload
 */
const handleUsersControlMessage = (appStore, payload) => {
    const isNewUserRequestingToStartAConversation = payload.content === PAYLOAD.NEW_CHAT;
    if (isNewUserRequestingToStartAConversation) {
        
        /**
         * Check appStore.onAction on
         * NewChatRequest component
         */
        appStore.addNewChatRequest(payload);
        console.log('MessageService: someone wants to start a conversation', payload);
        return;
    }

    /**
     * The user has declined the request and has no intent to chat.
     */
    if (!payload.ack) {
        console.log('MessageService: user declined conversation request', payload);
        alert(`${payload.name} não aceitou sua solicitação de conversa`);
        return;
    }

    /**
     * The user has accepted the request and intents to chat.
     */
    console.log('MessageService: user accepted conversation request', payload);
    alert(`${payload.name} aceitou sua solicitação de conversa`);
    const users = appStore.getZapTTUsers();
    const ackUserIndex = users.findIndex(user => user.uuid == payload.uuid);

    if (ackUserIndex == -1) {
        return;
    }

    users[ackUserIndex].hasStartedConversation = true;
    users[ackUserIndex].chatTopic = payload.topic;
    appStore.addConversationTopic(payload.topic);
    subscribeTopic(appStore, payload.topic);
}

const handleMessageFromConversation = (appStore, message) => {
    const currentUser = appStore.getUser();
    const isMessageFromCurrentUser = currentUser.uuid == message.createdBy.uuid;

    if (isMessageFromCurrentUser) {
        return;
    }

    message.isFromCurrentUser = false;
    appStore.messages.push(message);
}

export {
    handleUsersControlMessage,
    handleMessageFromConversation,
}