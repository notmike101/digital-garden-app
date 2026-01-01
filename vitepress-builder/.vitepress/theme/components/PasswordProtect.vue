<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

/** @type {import("vue").Ref<HTMLDialogElement | null>} */
const passwordModal = ref(null);
const passwordInput = ref('');

const emits = defineEmits({
    submit: (payload) => payload,
});

const openModal = () => {
    passwordModal.value?.showModal();
};

const closeModal = () => {
    passwordModal.value?.close();
}

onMounted(() => {
    openModal();
});

onBeforeUnmount(() => {
    closeModal();
});

defineExpose({
    openModal,
    closeModal,
});
</script>

<template>
    <dialog ref="passwordModal">
        <h2 class="modal-header">Enter password to view content</h2>
        <div class="modal-content">
            <form method="dialog">
                <input type="password" v-model="passwordInput" @keydown.enter="emits('submit', passwordInput)"></input>
                <button type="button" @click="emits('submit', passwordInput)">Submit</button>
            </form>
        </div>
    </dialog>
</template>

<style lang="css" scoped>
::backdrop {
  background-color: #000000;
  opacity: 0.75;
}

dialog {
    background-color: var(--vp-c-bg);
    border-radius: 2px;
    border: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;

    & .modal-header {
        font-size: var(--vp-custom-block-font-size);
    }

    & .modal-content {
        display: flex;
        flex-direction: row;
        gap: 8px;
    }

    & button {
        padding: 4px 8px;
        border-radius: 4px;
        border-color: var(--vp-button-alt-border);
        color: var(--vp-button-alt-text);
        background-color: var(--vp-button-alt-bg);

        &:hover {
            border-color: var(--vp-button-alt-hover-border);
            color: var(--vp-button-alt-hover-text);
            background-color: var(--vp-button-alt-hover-bg);
        }
    }

    & input {
        background-color: var(--vp-input-bg-color);
        border-radius: 4px;
        border: 1px solid var(--vp-input-border-color);
        padding: 4px 8px;
    }
}
</style>