import { defineStore } from "pinia";
import USER_STATUS from '../constants/user-status';

export const useUserStore = defineStore('user', {
    state: () => {
        return {
            currentUser: {
                name: "",
                uuid: "",
                status: USER_STATUS.ONLINE,
            },
            activeUsers: [],
            mqttClient: {},
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
    },
});