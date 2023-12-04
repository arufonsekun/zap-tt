<script setup>
import { ref } from 'vue'
import { useAppStore } from '../store/app'
import { acknowledgeJoinGroup } from '../services/paho';

const appStore = useAppStore()
const node = ref(null)
const joinGroupRequest = ref('')
let modalRef = null

/**
 * Listen when a user is requesting to start a
 * new conversation. When it happends this
 * modal is opened asking user for
 * acceptance.
 */
appStore.$onAction(({name, store, args, after, onError}) => {
    after(() => {
        const isJoinGroupRequest = name === 'addNewJoinGroupRequest';
        if (!isJoinGroupRequest) {
            return;
        }

        console.log('JoinGroupRequest: new join group request', store.joinGroupRequests);
        joinGroupRequest.value = store.joinGroupRequests.slice(-1)[0];
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
    const requestingUser = joinGroupRequest.value.user;
    const group = joinGroupRequest.value.group;
    acknowledgeJoinGroup(appStore, group, requestingUser, true);
    modalRef.hide()
}

const declineRequest = () => {
    console.log('JoinGroupRequest: user declined new conversation');
    const requestingUser = joinGroupRequest.value.user;
    const group = joinGroupRequest.value.group;
    acknowledgeJoinGroup(appStore, group, requestingUser, false);
    modalRef.hide()
}

defineExpose({ show })
</script>

<template>
  <div class="modal" tabindex="-1" ref="node">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header border-0">
          <h5 class="modal-title text-body no-text-selection">
            {{ joinGroupRequest.user?.name }} gostaria de entrar no grupo:
             <strong> {{ joinGroupRequest.group?.name }}</strong>
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
