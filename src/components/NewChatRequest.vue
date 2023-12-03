<script setup>
import { ref } from 'vue'
import { useAppStore } from '../store/app'
import { acknowledgeChat } from '../services/paho';

const appStore = useAppStore()
const node = ref(null)
const requestingUser = ref('')
let modalRef = null

/**
 * Listen when a user is requesting to start a
 * new conversation. When it happends this
 * modal is opened asking user for
 * acceptance.
 */
appStore.$onAction(({name, store, args, after, onError}) => {
    after(() => {
        const isNewChatRequest = name === 'addNewChatRequest';
        if (!isNewChatRequest) {
            return;
        }

        console.log('NewChatRequest: new conversation request', store.getNewChatRequests());
        requestingUser.value = store.getNewChatRequests().slice(-1)[0];
        show();
    });
});

/**
 * Shows the modal
 */
const show = () => {
  // eslint-disable-next-line no-undef
  modalRef = new bootstrap.Modal(node.value)
  modalRef.show()
}

const acceptRequest = () => {
    console.log('NewChatRequest: user accept new conversation');
    acknowledgeChat(appStore, requestingUser.value, true);
}

const declineRequest = () => {
    console.log('NewChatRequest: user declined new conversation');
    acknowledgeChat(appStore, requestingUser.value, false);
}

defineExpose({ show })
</script>

<template>
  <div class="modal" tabindex="-1" ref="node">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header border-0">
          <h5 class="modal-title text-body no-text-selection">
            {{ requestingUser.name }} gostaria de se conectar
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-footer justify-content-center border-0">
          <button type="button" class="btn btn-success" @click="acceptRequest" data-bs-dismiss="modal">
            Aceitar <i class="bi bi-check"></i>
          </button>
          <button type="button" class="btn btn-danger" @click="declineRequest" data-bs-dismiss="modal">
            Recusar <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
