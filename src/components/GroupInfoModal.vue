<script setup>
import { ref } from 'vue'
import { useAppStore } from '../store/app'

const appStore = useAppStore()
const currentUser = appStore.getUser()
const node = ref(null)
const group = ref(null);

let modalRef = null

/**
 * Shows the modal
 */
const show = (groupInfo) => {
  console.log('group', groupInfo);
  group.value = groupInfo;
  // eslint-disable-next-line no-undef
  modalRef = new bootstrap.Modal(node.value)
  modalRef.show()
}

defineExpose({ show })
</script>

<template>
  <div class="modal" tabindex="-1" ref="node">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title text-body no-text-selection">
            Informações do Grupo
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body text-body">
            <div class="f-5">
                <span class="fw-bold">Nome:</span> {{ group?.name }}
            </div>
            <div class="f-5">
                <span class="fw-bold">Descrição:</span> {{ group?.description.length ? group?.description : "Não informado" }}
            </div>
            <div class="f-5">
                <span class="fw-bold">Criado por:</span> {{ group?.owner.name }} em {{ group?.createdAt }}
            </div>
            <div class="f-5">
                <span class="fw-bold">Participantes:</span>
            </div>
            <ul>
                <li v-for="participant in group?.participants" :key="participant.uuid">
                    {{ participant.name }} {{ participant.uuid == currentUser.uuid ? "(Você)" : "" }}
                </li>
            </ul>

        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            Fechar <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
