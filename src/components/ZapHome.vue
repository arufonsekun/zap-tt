<script setup>
import { useUserStore } from '../store/user';
import { defineEmits } from 'vue'

const emit = defineEmits(['logout']);
const userStore = useUserStore();

const currentUser = userStore.getUser();

const logout = () => {
  emit('logout');
}
</script>

<template>
  <div class="row home">
    <div class="col-4 py-3">
      <div class="conversation-list rounded h-100">
        <div class="container-fluid">
          <div class="row">
            <div class="col-10">
              <div class="px-2">
                <div class="input-group my-3">
                  <input
                    type="text"
                    class="form-control no-text-selection"
                    placeholder="Pesquisar conversa"
                    aria-label="Pesquisar conversa"
                    aria-describedby="basic-addon2"
                  />
                  <span class="input-group-text" id="basic-addon2">
                    <i class="bi bi-search"></i>
                  </span>
                </div>
              </div>
            </div>
            <div class="col-2 ps-0">
              <div class="pe-2">
                <button type="button" class="btn btn-secondary my-3 w-100" @click="logout()">
                  Sair <i class="bi bi-box-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-8">
      <div class="d-flex h-100 welcome-container">
        <div class="fs-1 text-success text-center no-text-selection">
          Bem-vindo ao zap-tt, <span class="dotted-border"> {{ currentUser.name }} </span> <i class="bi bi-chat-dots-fill"></i>
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
    border-bottom: 5px dotted var(--bs-success)
}
</style>
