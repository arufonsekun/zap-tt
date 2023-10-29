<script setup>
import { storeToRefs } from 'pinia'
import { useUserStore } from '../store/user'
import USER_STATUS from '../constants/user-status'
import { ref, defineEmits, computed } from 'vue'

const emit = defineEmits(['logout'])
const userStore = useUserStore()

const currentUser = userStore.getUser()
const { zapTTUsers } = storeToRefs(userStore)
const filter = ref('')

const logout = () => {
  emit('logout')
}

/**
 * Computed property responsible to filter
 * zap-tt users.
 */
const zapUsers = computed(() => {
  return zapTTUsers.value.filter((user) => {
    if (filter.value) {
      return user.name.includes(filter.value) && user.uuid !== currentUser.uuid
    }
    return user.uuid !== currentUser.uuid
  })
})
</script>

<template>
  <div class="row home">
    <!-- zap-tt left menu, with user list and filterm and logout button -->
    <div class="col-4 py-3">
      <div class="conversation-list rounded h-100">
        <div class="container-fluid">
          <div class="row">
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
                <button type="button" class="btn btn-lg btn-secondary my-3 w-100" @click="logout()" title="Sair">
                  <i class="bi bi-box-arrow-right"></i>
                </button>
              </div>
            </div>
            <div class="user-list px-3">
              <div class="container-fluid">
                <div class="row">
                  <div
                    v-for="user in zapUsers"
                    class="col-12 p-0 mb-3 cursor-pointer"
                    :title="`Conversar com ${user.name}`"
                    :key="user.uuid"
                  >
                    <div class="d-flex px-3 bg-light text-body rounded">
                      <div class="user-avatar fs-1">
                        <i class="bi bi-person-circle"></i>
                        <span
                          class="rounded-circle"
                          :class="{
                            online: user.status === USER_STATUS.ONLINE,
                            offline: user.status === USER_STATUS.OFFLINE
                          }"
                        ></span>
                      </div>
                      <div class="user-name d-flex mx-3 my-auto">
                        <div class="fs-4 no-text-selection">
                          {{ user.uuid === currentUser.uuid ? 'Você' : user.name }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-if="!zapUsers.length" class="col-12 p-0 mb-3 cursor-pointer">
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
    <div class="col-8">
      <div class="d-flex h-100 welcome-container">
        <div class="fs-1 text-success text-center no-text-selection">
          Bem-vindo ao zap-tt, <span class="dotted-border"> {{ currentUser.name }} </span>
          <i class="bi bi-chat-dots-fill"></i>
        </div>
      </div>
    </div>
  </div>
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

.no-text-selection {
  user-select: none;
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
  top: 4px;
}
.online {
  background-color: #13a05e;
}

.offline {
  background-color: #e14554;
}
</style>
