import { defineStore } from "pinia";
import USER_STATUS from '../constants/user-status';

export const useAppStore = defineStore('user', {
    state: () => {
        return {
            currentUser: {
                name: "",
                uuid: "",
                status: USER_STATUS.ONLINE,
            },
            zapTTGroups:[],
            zapTTUsers: [],
            mqttClient: {},
            newChatRequests: [],
            messages: [],
            conversationTopics: [],
        }
    },
    actions: {
        setUser(user) {
            this.currentUser = user;
        },
        getUser() {
            return this.currentUser;
        },
        setMqttClient(client) {
            this.mqttClient = client;
        },
        getMqttClient() {
            return this.mqttClient;
        },
        getZapTTUsers() {
            return this.zapTTUsers;
        },
        addNewZapTTUser(user) {
            this.zapTTUsers.push(user);
        },
        getZapTTGroups() {
            return this.zapTTGroups;
        },
        addNewZapTTGroup(group) {
            this.zapTTGroups.push(group);
        },
        addNewChatRequest(newChatRequest) {
            this.newChatRequests.push(newChatRequest);
        },
        getNewChatRequests() {
            return this.newChatRequests;
        },
        addConversationTopic(topic) {
            this.conversationTopics.push(topic);
        }
    },
});