import PAYLOAD from '../constants/payloads';
import TOPICS from '../constants/topics';
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

const handleGroupControlMessage = (appStore, payload) => {
    console.log('handleGroupControlMessage', payload);
    const currentUser = appStore.getUser();
    const isCurrentUserGroupOwner = payload.group.owner.uuid == currentUser.uuid;
    console.log('isCurrentUserGroupOwner', isCurrentUserGroupOwner);
    
    const isJoinGroupAck = payload.content === PAYLOAD.JOIN_GROUP_ACK;
    const isJoinGroupRequest = payload.content === PAYLOAD.JOIN_GROUP;

    console.log('isJoinGroupAck', isJoinGroupAck);
    if (isJoinGroupAck) {
        const groups = appStore.getZapTTGroups();
        const ackGroup = groups.find(g => g.uuid == payload.group.uuid);
        if (!ackGroup) {
            return;
        }
        ackGroup.hasStartedConversation = payload.ack;
        appStore.addNewGroupTopic(payload.group.uuid);
        subscribeTopic(appStore, payload.group.uuid);
        /**
         * Open group if ack = true
         */
        if (payload.ack) {
            appStore.setCurrentChat(ackGroup);
        }
        return;
    }

    if (!isJoinGroupRequest) {
        /**
         * If current user has created group, it means
         * hasStartedConversation is true, then there's
         * no need to request to start the conversation.
        */
       payload.group.hasStartedConversation = isCurrentUserGroupOwner;
       payload.group.chatTopic = payload.group.uuid;
       appStore.addNewZapTTGroup(payload.group);
       console.log('MessageService: new group was created', payload);
       return;
    }

    if (!isCurrentUserGroupOwner) {
        return;
    }

    /**
     * Group join requests must be handled
     * only by group owner.
     */
    appStore.addNewJoinGroupRequest(payload);
}

const handleGroupMessage = (appStore, message) => {
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
    handleGroupControlMessage,
    handleGroupMessage,
}