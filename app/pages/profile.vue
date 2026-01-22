<template>
    <div class="min-h-screen py-8 px-4">
        <div class="max-w-2xl mx-auto">
            <!-- Back button -->
            <NuxtLink to="/"
                class="inline-flex items-center gap-2 text-ice-400 hover:text-ice-300 mb-8 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Home
            </NuxtLink>

            <!-- Loading state -->
            <div v-if="loading" class="flex justify-center py-20">
                <div class="w-8 h-8 border-2 border-ice-400 border-t-transparent rounded-full animate-spin"></div>
            </div>

            <!-- Not logged in -->
            <div v-else-if="!user" class="text-center py-20">
                <div class="w-20 h-20 mx-auto mb-6 bg-ice-500/20 rounded-full flex items-center justify-center">
                    <svg class="w-10 h-10 text-ice-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <h2 class="text-2xl font-bold text-white mb-2">Not Logged In</h2>
                <p class="text-gray-400 mb-6">Please login to view your profile</p>
                <button @click="openAuthModal"
                    class="px-6 py-3 bg-ice-500 hover:bg-ice-600 text-white font-semibold rounded-lg transition-colors">
                    Login / Register
                </button>
            </div>

            <!-- Profile content -->
            <div v-else class="space-y-6">
                <!-- Profile header -->
                <div class="bg-puck-darker border border-ice-500/20 rounded-2xl p-6">
                    <div class="flex items-center gap-6">
                        <!-- Avatar -->
                        <div class="relative">
                            <img v-if="user.photoURL" :src="user.photoURL" :alt="user.displayName || 'User'"
                                class="w-24 h-24 rounded-full border-4 border-ice-400" />
                            <div v-else
                                class="w-24 h-24 rounded-full border-4 border-ice-400 bg-ice-500/20 flex items-center justify-center">
                                <span class="text-3xl font-bold text-ice-400">
                                    {{ user.displayName?.charAt(0) || user.email?.charAt(0) || '?' }}
                                </span>
                            </div>
                        </div>

                        <!-- User info -->
                        <div class="flex-1">
                            <h1 class="text-2xl font-bold text-white mb-1">
                                {{ user.displayName || 'User' }}
                            </h1>
                            <p class="text-gray-400">{{ user.email }}</p>
                            <div class="flex items-center gap-2 mt-2">
                                <span v-if="user.emailVerified"
                                    class="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    Verified
                                </span>
                                <span v-else
                                    class="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                                    Not verified
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Favorite Teams -->
                <div class="bg-puck-darker border border-ice-500/20 rounded-2xl p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-lg font-semibold text-white flex items-center gap-2">
                            <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                                <path
                                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            Favorite Teams
                        </h2>
                        <span class="text-sm text-gray-400">{{ favoriteTeams.length }} teams</span>
                    </div>

                    <div v-if="favoriteTeams.length === 0" class="text-center py-8">
                        <p class="text-gray-400">No favorite teams yet</p>
                        <NuxtLink to="/teams"
                            class="inline-block mt-2 text-ice-400 hover:text-ice-300 text-sm transition-colors">
                            Browse teams →
                        </NuxtLink>
                    </div>

                    <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <NuxtLink v-for="team in favoriteTeams" :key="team.id" :to="`/team/${team.id}/schedule`"
                            class="flex items-center gap-3 p-3 bg-puck-dark rounded-xl hover:bg-ice-500/10 transition-colors group">
                            <img :src="team.logo" :alt="team.name" class="w-10 h-10 object-contain" />
                            <div class="min-w-0">
                                <p
                                    class="text-white font-medium text-sm truncate group-hover:text-ice-400 transition-colors">
                                    {{ team.abbrev }}
                                </p>
                            </div>
                        </NuxtLink>
                    </div>
                </div>

                <!-- Favorite Games -->
                <div class="bg-puck-darker border border-ice-500/20 rounded-2xl p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-lg font-semibold text-white flex items-center gap-2">
                            <svg class="w-5 h-5 text-ice-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            Favorite Games
                        </h2>
                        <span class="text-sm text-gray-400">{{ favoriteGames.length }} games</span>
                    </div>

                    <div v-if="favoriteGames.length === 0" class="text-center py-8">
                        <p class="text-gray-400">No favorite games yet</p>
                        <p class="text-gray-500 text-sm mt-1">Add games to get notified when they start!</p>
                    </div>

                    <div v-else class="space-y-3">
                        <NuxtLink v-for="game in favoriteGames" :key="game.id" :to="`/game/${game.id}`"
                            class="flex items-center justify-between p-4 bg-puck-dark rounded-xl hover:bg-ice-500/10 transition-colors">
                            <div class="flex items-center gap-4">
                                <div class="flex items-center gap-2">
                                    <img :src="game.awayTeam.logo" :alt="game.awayTeam.name"
                                        class="w-8 h-8 object-contain" />
                                    <span class="text-white font-medium">{{ game.awayTeam.abbrev }}</span>
                                </div>
                                <span class="text-gray-500">@</span>
                                <div class="flex items-center gap-2">
                                    <img :src="game.homeTeam.logo" :alt="game.homeTeam.name"
                                        class="w-8 h-8 object-contain" />
                                    <span class="text-white font-medium">{{ game.homeTeam.abbrev }}</span>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="text-sm" :class="getGameStateClass(game.gameState)">
                                    {{ getGameStateText(game) }}
                                </p>
                                <p class="text-xs text-gray-500">{{ formatGameTime(game.startTime) }}</p>
                            </div>
                        </NuxtLink>
                    </div>
                </div>

                <!-- Account details -->
                <div class="bg-puck-darker border border-ice-500/20 rounded-2xl p-6">
                    <h2 class="text-lg font-semibold text-white mb-4">Account Details</h2>
                    <div class="space-y-4">
                        <div class="flex justify-between items-center py-3 border-b border-ice-500/10">
                            <span class="text-gray-400">User ID</span>
                            <span class="text-white font-mono text-sm">{{ user.uid.slice(0, 20) }}...</span>
                        </div>
                        <div class="flex justify-between items-center py-3 border-b border-ice-500/10">
                            <span class="text-gray-400">Account Created</span>
                            <span class="text-white">{{ formatDate(user.metadata.creationTime) }}</span>
                        </div>
                        <div class="flex justify-between items-center py-3">
                            <span class="text-gray-400">Last Sign In</span>
                            <span class="text-white">{{ formatDate(user.metadata.lastSignInTime) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="bg-puck-darker border border-ice-500/20 rounded-2xl p-6">
                    <h2 class="text-lg font-semibold text-white mb-4">Actions</h2>
                    <div class="space-y-3">
                        <button @click="handleLogout"
                            class="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium rounded-lg transition-colors">
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { useFavorites, type FavoriteGame } from '~/composables/useFavorites'

const { user, loading, logout, openAuthModal, initAuth } = useAuth()
const { favoriteTeams, favoriteGames, initFavorites } = useFavorites()

let unsubscribe: (() => void) | undefined

onMounted(() => {
    initAuth()
    unsubscribe = initFavorites()
})

onUnmounted(() => {
    if (unsubscribe) unsubscribe()
})

watch(user, () => {
    if (unsubscribe) unsubscribe()
    unsubscribe = initFavorites()
})

const handleLogout = async () => {
    await logout()
    navigateTo('/')
}

const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const formatGameTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    })
}

const getGameStateClass = (state: string) => {
    switch (state) {
        case 'LIVE':
        case 'CRIT':
            return 'text-green-400'
        case 'FUT':
        case 'PRE':
            return 'text-ice-400'
        default:
            return 'text-gray-400'
    }
}

const getGameStateText = (game: FavoriteGame) => {
    switch (game.gameState) {
        case 'LIVE':
        case 'CRIT':
            return `LIVE ${game.awayTeam.score ?? 0} - ${game.homeTeam.score ?? 0}`
        case 'FUT':
        case 'PRE':
            return 'Upcoming'
        case 'OFF':
        case 'FINAL':
            return 'Final'
        default:
            return game.gameState
    }
}
</script>
