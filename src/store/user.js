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
            zapTTUsers: [],
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
        /**
         * Gets users that joined zat-tt sometime,
         * it includes online and offline ones.
         *
         * @returns {array} Users that joined zat-tt sometime.
         */
        getZapTTUsers() {
            return this.zapTTUsers;
        },
        addNewZapTTUser(user) {
            this.zapTTUsers.push(user);
        }
    },
});