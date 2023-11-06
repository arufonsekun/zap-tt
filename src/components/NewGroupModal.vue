<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../store/user'
import { storeToRefs } from 'pinia'
import { createGroup } from '../services/paho'
import { v4 as uuidv4 } from 'uuid';

const userStore = useUserStore()
const { zapTTUsers } = storeToRefs(userStore)
const currentUser = userStore.getUser()
const node = ref(null)
const name = ref('')
const description = ref('')

let modalRef = null;

const zapUsers = computed(() => {
  return zapTTUsers.value.filter((user) => {
    return user.uuid !== currentUser.uuid
  })
})

/**
 * Shows the modal
 */
const show = () => {
  // eslint-disable-next-line no-undef
  modalRef = new bootstrap.Modal(node.value)
  modalRef.show()
}

const createZapTTGroup = () => {
  const participantsCheckbox = [
    ...document.querySelectorAll('input[type=checkbox]')
  ];
  const selectedParticipants = participantsCheckbox.filter(participant => participant.checked);
  const participantsUuids = selectedParticipants.map(participant => participant.value);

  const participants = zapTTUsers.value.filter(participant => {
    return participantsUuids.includes(participant.uuid);
  })

  console.log('createGroup participants', participants);
  if (!participants.length) {
    return;
  }

  if (!name.value) {
    return;
  }

  participants.push(currentUser);
  const groupData = {
    uuid: uuidv4(),
    name: name.value,
    description: description.value,
    owner: currentUser,
    participants,
    isGroup: true,
    createdAt: new Date().toLocaleDateString(),
  };

  createGroup(userStore, groupData)

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
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body text-body">
          <div class="input-group mb-3">
            <input
              type="text"
              class="group-name form-control no-text-selection"
              placeholder="Nome do grupo"
              aria-label="Nome"
              aria-describedby="button-addon2"
              v-model="name"
            />
          </div>
          <div class="form-floating no-text-selection">
            <textarea
              class="form-control"
              placeholder="Descrição do grupo"
              id="description"
              style="height: 100px"
              v-model="description"
            ></textarea>
            <label for="description">Descrição</label>
          </div>
          <div class="row">
            <div class="col-12">
              <div class="fs-5 p-2 no-text-selection text-body">Participantes</div>
            </div>
            <div class="col-6" v-for="user in zapUsers" :key="user.uuid">
              <div class="form-check px-5">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :value="user.uuid"
                  :id="user.uuid"
                />
                <label
                  class="form-check-label w-100 text-truncate no-text-selection"
                  :title="user.name"
                  :for="user.uuid"
                >
                  {{ user.name }}
                </label>
              </div>
            </div>
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
