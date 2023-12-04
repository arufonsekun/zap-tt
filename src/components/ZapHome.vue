<script setup>
import { ref, defineEmits, computed, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppStore } from '../store/app'
import USER_STATUS from '../constants/user-status'
import NewGroupModal from './NewGroupModal.vue'
import GroupInfoModal from './GroupInfoModal.vue'
import NewChatRequest from './NewChatRequest.vue'
import JoinGroupRequest from './JoinGroupRequest.vue'
import {
  createConversation,
  sendMessage,
  requestToJoinGroup,
} from '../services/paho';

const emit = defineEmits(['logout'])
const appStore = useAppStore()

const currentUser = appStore.getUser()
const {
  zapTTUsers, zapTTGroups, messages, currentChat
} = storeToRefs(appStore)
const filter = ref('')
const newGroupModal = ref(null)
const groupInfoModal = ref(null);
const messageContent = ref("");
const messageContainer = ref(null);

const logout = () => {
  emit('logout')
}

/**
 * Computed property responsible to filter
 * zap-tt conversations (group and users).
 * 
 * TODO: improve this name.
 */
const zapConversations = computed(() => {
  const conversations = zapTTUsers.value.concat(zapTTGroups.value)
  return conversations.filter((user) => {
    if (filter.value) {
      return (
        user.name.toLocaleLowerCase().includes(filter.value.toLocaleLowerCase()) &&
        user.uuid !== currentUser.uuid
      )
    }
    return user.uuid !== currentUser.uuid
  })
})

const newGroup = () => {
  newGroupModal.value.show()
}

const openGroupInfo = (group) => {
  groupInfoModal.value.show(group);
}

const initConversation = (data) => {
  if (data.isGroup) {
    /**
     * Sends a join group request
     */
    requestToJoinGroup(appStore, data);
    return;
  }
  /**
   * Creates a conversation between two users
   */
  createConversation(appStore, data);
}

const openConversation = (conversation) => {
  if (!conversation.hasStartedConversation) {
    console.warn("openConversation: Two parts has not started conversation yet");
    return;
  }
  messages.value = [];
  currentChat.value = conversation;
}

const newMessage = () => {
  console.log('newMessage', currentChat.value);
  const msg = {
    chatTopic: currentChat.value.chatTopic,
    content: messageContent.value,
    createdAt: new Date().toLocaleString(),
    createdBy: currentUser,
    isFromCurrentUser: true
  };
  messages.value.push(msg);
  messageContent.value = '';
  nextTick(() => {
    /**
     * Scroll to bottom right after a message is sent
     */
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  });

  console.log('newMessage', messageContent.value);
  sendMessage(appStore, msg, msg.chatTopic);
}
</script>

<template>
  <div class="row home">
    <!-- zap-tt left menu, with user list and filter and logout button -->
    <div class="col-4 py-3">
      <div class="conversation-list rounded h-100">
        <div class="container-fluid">
          <div class="row pt-3">
            <div class="col-12">
              <div class="px-2">
                <div class="d-flex px-1 text-light justify-content-between">
                  <div class="user-avatar fs-1 mt-2 d-flex">
                    <i class="bi bi-person-circle"></i>
                    <span class="online rounded-circle"></span>
                    <span class="fs-3 no-text-selection">
                      {{ `Olá, ${currentUser.name}` }}
                    </span>
                  </div>
                  <div
                    class="new-group cursor-pointer d-flex mx-3 my-auto"
                    title="Criar grupo"
                    @click="newGroup()"
                  >
                    <div class="fs-4">
                      <svg
                        viewBox="0 0 24 24"
                        height="40"
                        width="40"
                        preserveAspectRatio="xMidYMid meet"
                        fill="none"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M5.16667 3.75C3.69391 3.75 2.5 4.94391 2.5 6.41667V17.5833C2.5 19.0561 3.69391 20.25 5.16667 20.25H18.8333C20.3061 20.25 21.5 19.0561 21.5 17.5833V8.75L23.7458 5.29499C24.1782 4.62974 23.7008 3.75 22.9073 3.75H5.16667ZM14.9672 12.9911H12.9914V14.9671C12.9914 15.3999 12.7366 15.8175 12.3238 15.9488C11.6391 16.1661 11.009 15.6613 11.009 15.009V12.9911H9.03279C8.59949 12.9911 8.1819 12.7358 8.05099 12.3226C7.83412 11.6381 8.33942 11.0089 8.99134 11.0089H11.009V9.03332C11.009 8.60007 11.2639 8.18252 11.6767 8.05119C12.3609 7.83391 12.9914 8.33872 12.9914 8.991V11.0089H15.0091C15.6606 11.0089 16.1659 11.6381 15.949 12.3226C15.8185 12.7358 15.4005 12.9911 14.9672 12.9911Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-10">
              <div class="px-2">
                <div class="input-group input-group-lg my-3">
                  <input
                    type="text"
                    class="form-control no-text-selection"
                    placeholder="Pesquisar conversa"
                    aria-label="Pesquisar conversa"
                    aria-describedby="basic-addon2"
                    v-model="filter"
                  />
                  <span class="input-group-text" id="basic-addon2">
                    <i class="bi bi-search"></i>
                  </span>
                </div>
              </div>
            </div>
            <div class="col-2 ps-0">
              <div class="pe-2">
                <button
                  type="button"
                  class="btn btn-lg btn-secondary my-3 w-100"
                  @click="logout()"
                  title="Sair"
                >
                  <i class="bi bi-box-arrow-right"></i>
                </button>
              </div>
            </div>
            <div class="user-list px-3">
              <div class="container-fluid">
                <div class="row">
                  <div
                    v-for="conversation in zapConversations"
                    class="col-12 p-0 mb-3 cursor-pointer"
                    :title="`Conversar com ${conversation.name}`"
                    :key="conversation.uuid"
                    @click="openConversation(conversation)"
                  >
                    <div class="d-flex justify-content-between px-3 text-body rounded" :class="{'bg-info': currentChat?.uuid == conversation.uuid, 'bg-light': !(currentChat?.uuid == conversation.uuid)}">
                      <div class="user-avatar d-flex fs-1" v-if="conversation.isGroup">
                        <i class="bi bi-people-fill"></i>
                        <div class="user-name d-flex mx-3 my-auto">
                          <div class="fs-4 no-text-selection">
                            {{
                              conversation.uuid === currentUser.uuid ? 'Você' : conversation.name
                            }}
                          </div>
                        </div>
                      </div>
                      <div class="user-avatar d-flex fs-1" v-else>
                        <i class="bi bi-person-circle"></i>
                        <span
                          class="rounded-circle"
                          :class="{
                            online: conversation.status === USER_STATUS.ONLINE,
                            offline: conversation.status === USER_STATUS.OFFLINE
                          }"
                        ></span>
                        <div class="user-name d-flex mx-3 my-auto">
                          <div class="fs-4 no-text-selection">
                            {{
                              conversation.uuid === currentUser.uuid ? 'Você' : conversation.name
                            }}
                          </div>
                        </div>
                      </div>
                      <div class="d-flex">
                        <div
                          class="text-secondary d-flex fs-4 my-auto"
                          title="Ver informações do Grupo"
                          v-if="conversation.isGroup"
                        >
                          <div class="p-1" @click="openGroupInfo(conversation)">
                            <i class="bi bi-info-circle-fill"></i>
                          </div>
                        </div>
                        <button class="btn" :title="conversation.isGroup ? 'Pedir para entrar no grupo' : 'Iniciar conversa'" @click="initConversation(conversation)" v-if="!conversation.hasStartedConversation">
                          <svg viewBox="0 0 24 24" height="24" width="24" preserveAspectRatio="xMidYMid meet" class="" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M18.8333 3.75C20.3061 3.75 21.5 4.94391 21.5 6.41667V17.5833C21.5 19.0561 20.3061 20.25 18.8333 20.25H5.16667C3.69391 20.25 2.5 19.0561 2.5 17.5833V8.75L0.254242 5.29499C-0.178171 4.62974 0.299248 3.75 1.09269 3.75H18.8333ZM9.03279 12.9911H11.0086V14.9671C11.0086 15.3999 11.2634 15.8175 11.6762 15.9488C12.3609 16.1661 12.991 15.6613 12.991 15.009V12.9911H14.9672C15.4005 12.9911 15.8181 12.7358 15.949 12.3226C16.1659 11.6381 15.6606 11.0089 15.0087 11.0089H12.991V9.03332C12.991 8.60007 12.7361 8.18252 12.3233 8.05119C11.6391 7.83391 11.0086 8.33872 11.0086 8.991V11.0089H8.9909C8.33943 11.0089 7.83413 11.6381 8.05099 12.3226C8.18146 12.7358 8.59949 12.9911 9.03279 12.9911Z" fill="currentColor"></path></svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div v-if="!zapConversations.length" class="col-12 p-0 mb-3">
                    <div class="d-flex text-light">
                      <div class="user-name d-flex mx-3 my-auto">
                        <div class="fs-5 no-text-selection">
                          Nenhuma conversa encontrada <i class="bi bi-emoji-frown-fill"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- zap-tt welcome user screen -->
    <div class="col-8 py-3">
      <div class="bg-light rounded h-100" v-if="currentChat">
        <div class="py-2" style="height: calc(100% - 37px);">
          <div class="d-flex h-100">
            <div class="w-100 messages-container overflow-auto" style="height: 90vh;" ref="messageContainer">
              <div class="d-flex message text-dark mb-2" v-for="(message, i) of messages" :key="i" :class="{'justify-content-end': message.isFromCurrentUser, 'justify-content-start': !message.isFromCurrentUser}">
                <div class="text-end p-2 mx-2 text-light rounded" :class="{'bg-success': message.isFromCurrentUser, 'bg-info': !message.isFromCurrentUser}">
                  {{ message.content }}
                </div>
              </div>
            </div>
          </div>
          <div class="input-group px-2">
            <input type="text" class="form-control" placeholder="Digite sua mensagem" aria-label="Username" aria-describedby="basic-addon1" @keydown.enter="newMessage" v-model="messageContent">
            <button class="btn btn-success" type="button" id="button-addon2" @click="newMessage">
              <i class="bi bi-send-fill"></i>
            </button>
          </div>
        </div>
      </div>
      <div class="d-flex h-100 welcome-container" v-else>
        <div class="fs-1 text-success text-center no-text-selection">
          Bem-vindo ao zap-tt, <span class="dotted-border"> {{ currentUser.name }} </span> <i class="bi bi-chat-dots-fill"></i>
        </div>
      </div>
    </div>
  </div>

  <NewGroupModal ref="newGroupModal" />
  <GroupInfoModal ref="groupInfoModal" />
  <NewChatRequest />
  <JoinGroupRequest />
</template>

<style scoped>
.home {
  min-height: 100vh;
}

.conversation-list {
  background-color: var(--bs-dark);
}

.welcome-container {
  place-content: center;
  flex-wrap: wrap;
}

.dotted-border {
  border-bottom: 5px dotted var(--bs-success);
}

.cursor-pointer {
  cursor: pointer;
}
.online,
.offline {
  width: 15px;
  height: 15px;
  display: inline-block;
  position: relative;
  left: -12px;
  top: 35px;
}
.online {
  background-color: #13a05e;
}

.offline {
  background-color: #e14554;
}

/* width */
.messages-container::-webkit-scrollbar {
  width: 10px;
}

/* Track */
.messages-container::-webkit-scrollbar-track {
  border-radius: 10px;
}

/* Handle */
.messages-container::-webkit-scrollbar-thumb {
  background: #9b9999;
  border-radius: 10px;
}

/* Handle on hover */
.messages-container::-webkit-scrollbar-thumb:hover {
  background: #9b9999;
}
</style>
