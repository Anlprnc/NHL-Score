<template>
    <button @click="handleClick" :disabled="loading || !user" :class="[
        'p-2 rounded-lg transition-all duration-200',
        isFavorite
            ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
            : 'bg-ice-500/10 text-gray-400 hover:bg-ice-500/20 hover:text-ice-400',
        !user && 'opacity-50 cursor-not-allowed'
    ]" :title="!user ? 'Login to add favorites' : (isFavorite ? 'Remove from favorites' : 'Add to favorites')">
        <svg v-if="loading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
        </svg>
        <svg v-else class="w-5 h-5" :fill="isFavorite ? 'currentColor' : 'none'" stroke="currentColor"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
    </button>

    <!-- Permission Modal -->
    <Teleport to="body">
        <Transition name="modal">
            <div v-if="showPermissionModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4"
                @click.self="showPermissionModal = false">
                <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
                <div class="relative bg-puck-dark border border-ice-500/20 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                    <div class="text-center">
                        <div class="w-16 h-16 mx-auto mb-4 bg-ice-500/20 rounded-full flex items-center justify-center">
                            <svg class="w-8 h-8 text-ice-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold text-white mb-2">Enable Notifications?</h3>
                        <p class="text-gray-400 text-sm mb-6">
                            Get notified when your favorite games are about to start!
                        </p>
                        <div class="flex gap-3">
                            <button @click="showPermissionModal = false"
                                class="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                                Not Now
                            </button>
                            <button @click="handleEnableNotifications"
                                class="flex-1 py-2 bg-ice-500 hover:bg-ice-600 text-white rounded-lg transition-colors">
                                Enable
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { useFavorites, type FavoriteTeam, type FavoriteGame } from '~/composables/useFavorites'
import { useNotifications } from '~/composables/useNotifications'

const props = defineProps<{
    type: 'team' | 'game'
    team?: Omit<FavoriteTeam, 'addedAt'>
    game?: Omit<FavoriteGame, 'addedAt' | 'notified'>
}>()

const { user, openAuthModal } = useAuth()
const { isTeamFavorite, isGameFavorite, toggleFavoriteTeam, toggleFavoriteGame } = useFavorites()
const { hasPermission, requestPermission, checkSupport } = useNotifications()

const loading = ref(false)
const showPermissionModal = ref(false)

onMounted(() => {
    checkSupport()
})

const isFavorite = computed(() => {
    if (props.type === 'team' && props.team) {
        return isTeamFavorite(props.team.id)
    }
    if (props.type === 'game' && props.game) {
        return isGameFavorite(props.game.id)
    }
    return false
})

const handleClick = async () => {
    if (!user.value) {
        openAuthModal()
        return
    }

    if (props.type === 'game' && props.game && !isFavorite.value) {
        if (!hasPermission()) {
            showPermissionModal.value = true
            return
        }
    }

    await toggleFavorite()
}

const handleEnableNotifications = async () => {
    const granted = await requestPermission()
    showPermissionModal.value = false

    if (granted) {
        await toggleFavorite()
    }
}

const toggleFavorite = async () => {
    loading.value = true
    try {
        if (props.type === 'team' && props.team) {
            await toggleFavoriteTeam(props.team)
        } else if (props.type === 'game' && props.game) {
            await toggleFavoriteGame(props.game)
        }
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}
</style>
