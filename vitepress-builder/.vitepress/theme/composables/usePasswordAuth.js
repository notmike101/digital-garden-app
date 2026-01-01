import { ref, watch, onMounted, readonly, onUnmounted } from 'vue';
import { useRoute } from 'vitepress';

/**
 * Composable for per-page password authentication.
 *
 * @param {string | undefined} expectedPassword
 */
export const usePasswordAuth = (expectedPassword) => {
    const unlocked = ref(false);
    /** @type {import('vue').Ref<string | null>} */
    const error = ref(null);
    const route = useRoute();
    
    /**
     * Attempt to unlock the page
     * 
     * @param {string} input
     */
    const unlock = (input) => {
        if (!expectedPassword) {
            unlocked.value = true;

            return;
        }

        if (input === expectedPassword) {
            unlocked.value = true;
            error.value = false;
        } else {
            unlocked.value = false;
            error.value = 'Incorrect password provided';
        }
    };

    watch(() => route.path, () => {
        unlocked.value = false;
        error.value = null;
    }, { immediate: true });

    onMounted(() => {
        if (!expectedPassword) {
            unlocked.value = true;
        } else {
            unlocked.value = false;
        }
    });

    onUnmounted(() => {
        unlocked.value = true;
        error.value = null;
    });

    return {
        unlocked: readonly(unlocked),
        error,
        unlock,
        hasPassword: !!expectedPassword,
    };
};