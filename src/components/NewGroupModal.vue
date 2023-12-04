<script setup>
import { ref } from 'vue'
import { useAppStore } from '../store/app'
import { createGroup } from '../services/paho'
import { v4 as uuidv4 } from 'uuid';

const appStore = useAppStore()
const currentUser = appStore.getUser()
const node = ref(null)
const name = ref('')
const description = ref('')

let modalRef = null;

/**
 * Shows the modal
 */
const show = () => {
  // eslint-disable-next-line no-undef
  modalRef = new bootstrap.Modal(node.value)
  modalRef.show()
}

const createZapTTGroup = () => {

  if (!name.value) {
    return;
  }

  const groupData = {
    uuid: uuidv4(),
    name: name.value,
    description: description.value,
    owner: currentUser,
    isGroup: true,
    createdAt: new Date().toLocaleDateString(),
  };

  createGroup(appStore, groupData)

  modalRef.hide();
}

defineExpose({ show })
</script>

<template>
  <div class="modal" tabindex="-1" ref="node">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title text-body no-text-selection">Novo grupo</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body text-body">
          <div class="input-group mb-3">
            <input type="text" class="group-name form-control no-text-selection" placeholder="Nome do grupo"
              aria-label="Nome" aria-describedby="button-addon2" v-model="name" />
          </div>
          <div class="form-floating no-text-selection">
            <textarea class="form-control" placeholder="Descrição do grupo" id="description" style="height: 100px"
              v-model="description"></textarea>
            <label for="description">Descrição</label>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            Cancelar <i class="bi bi-x-lg"></i>
          </button>
          <button type="button" class="btn btn-primary" @click="createZapTTGroup()">
            Criar <i class="bi bi-plus-lg"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
