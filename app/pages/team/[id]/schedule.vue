<script setup lang="ts">
import { useFavorites } from '~/composables/useFavorites'

const route = useRoute()
const teamId = route.params.id as string
const { games, team, loading, error, upcomingGames, completedGames } = useTeamSchedule(teamId)
const { initFavorites } = useFavorites()

const activeTab = ref<'all' | 'upcoming' | 'completed'>('all')

let unsubscribe: (() => void) | undefined
onMounted(() => {
  unsubscribe = initFavorites()
})
onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

const favoriteTeamData = computed(() => {
  if (!team.value) return null
  return {
    id: Number(teamId),
    name: team.value.displayName,
    abbrev: team.value.abbreviation || team.value.displayName.slice(0, 3).toUpperCase(),
    logo: team.value.logo
  }
})

const displayedGames = computed(() => {
  switch (activeTab.value) {
    case 'upcoming': return upcomingGames.value
    case 'completed': return completedGames.value
    default: return games.value
  }
})

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

const getResultColor = (winner: boolean | undefined) => {
  if (winner === true) return 'text-green-400 bg-green-500/20'
  if (winner === false) return 'text-red-400 bg-red-500/20'
  return 'text-gray-400 bg-gray-500/20'
}

const getResultText = (winner: boolean | undefined) => {
  if (winner === true) return 'W'
  if (winner === false) return 'L'
  return '-'
}
</script>

<template>
  <div class="min-h-screen p-4 md:p-8">
    <HeaderNav />
    <!-- Loading state -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <div class="relative w-20 h-20">
        <div class="absolute inset-0 rounded-full border-4 border-ice-500/20"></div>
        <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-ice-500 animate-spin"></div>
        <span class="absolute inset-0 flex items-center justify-center text-2xl">📅</span>
      </div>
      <p class="mt-4 font-mono text-ice-400 text-sm animate-pulse">Loading schedule...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="max-w-md mx-auto">
      <div class="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
        <p class="text-red-400 font-mono text-sm">{{ error }}</p>
      </div>
    </div>

    <!-- Schedule Content -->
    <div v-else-if="team" class="max-w-5xl mx-auto">
      <!-- Back to teams -->
      <NuxtLink to="/teams"
        class="inline-flex items-center gap-2 text-ice-400 hover:text-ice-300 font-mono text-sm mb-6 transition-colors group">
        <svg class="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor"
          viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Teams
      </NuxtLink>
      <!-- Team Header -->
      <div
        class="relative bg-gradient-to-br from-puck-light/90 to-puck/90 backdrop-blur-sm rounded-3xl border border-ice-900/30 overflow-hidden mb-8">
        <!-- Team color accent -->
        <div class="absolute top-0 left-0 right-0 h-2" :style="{ backgroundColor: `#${team.color}` }" />

        <div class="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          <img :src="team.logo" :alt="team.displayName" class="w-24 h-24 md:w-32 md:h-32 object-contain" />
          <div class="text-center md:text-left flex-1">
            <div class="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h1 class="font-orbitron text-3xl md:text-4xl font-black text-white">
                {{ team.displayName }}
              </h1>
              <ClientOnly>
                <FavoriteButton v-if="favoriteTeamData" type="team" :team="favoriteTeamData" />
              </ClientOnly>
            </div>
            <p class="text-gray-400 font-mono text-sm mb-2">{{ team.standing }}</p>
            <p class="text-ice-400 font-orbitron font-bold text-xl">{{ team.record }}</p>
          </div>
          <div class="text-center">
            <p class="text-gray-500 font-mono text-xs mb-1">SCHEDULE</p>
            <p class="font-orbitron text-2xl text-white font-bold">{{ games.length }}</p>
            <p class="text-gray-500 font-mono text-xs">Games</p>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex justify-center gap-2 mb-8">
        <button @click="activeTab = 'all'"
          class="px-5 py-2.5 rounded-xl font-orbitron font-bold text-sm transition-all duration-300" :class="activeTab === 'all'
            ? 'bg-ice-600 text-white shadow-lg shadow-ice-600/30'
            : 'bg-puck-light/50 text-gray-400 hover:bg-puck-light hover:text-white'">
          All ({{ games.length }})
        </button>
        <button @click="activeTab = 'upcoming'"
          class="px-5 py-2.5 rounded-xl font-orbitron font-bold text-sm transition-all duration-300" :class="activeTab === 'upcoming'
            ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-600/30'
            : 'bg-puck-light/50 text-gray-400 hover:bg-puck-light hover:text-white'">
          Upcoming ({{ upcomingGames.length }})
        </button>
        <button @click="activeTab = 'completed'"
          class="px-5 py-2.5 rounded-xl font-orbitron font-bold text-sm transition-all duration-300" :class="activeTab === 'completed'
            ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
            : 'bg-puck-light/50 text-gray-400 hover:bg-puck-light hover:text-white'">
          Completed ({{ completedGames.length }})
        </button>
      </div>

      <!-- Games List -->
      <div class="space-y-3">
        <NuxtLink v-for="game in displayedGames" :key="game.id" :to="`/game/${game.id}`" class="block group">
          <div
            class="bg-gradient-to-br from-puck-light/80 to-puck/80 backdrop-blur-sm rounded-xl border border-ice-900/30 overflow-hidden transition-all duration-300 hover:border-ice-500/50 hover:scale-[1.01]">
            <div class="flex items-center p-4 gap-4">
              <!-- Date -->
              <div class="text-center min-w-[70px]">
                <p class="text-gray-500 font-mono text-xs uppercase">{{ formatDate(game.date) }}</p>
                <p v-if="!game.status.completed" class="text-yellow-400 font-mono text-sm font-bold">
                  {{ formatTime(game.date) }}
                </p>
              </div>

              <!-- Home/Away indicator -->
              <div class="text-center min-w-[40px]">
                <span class="px-2 py-1 rounded text-xs font-mono font-bold"
                  :class="game.homeAway === 'home' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'">
                  {{ game.homeAway === 'home' ? 'HOME' : 'AWAY' }}
                </span>
              </div>

              <!-- Opponent -->
              <div class="flex items-center gap-3 flex-1">
                <img :src="game.opponent.logo" :alt="game.opponent.name" class="w-10 h-10 object-contain" />
                <div>
                  <p class="font-orbitron font-bold text-white group-hover:text-ice-300 transition-colors">
                    {{ game.homeAway === 'home' ? 'vs' : '@' }} {{ game.opponent.displayName }}
                  </p>
                  <p class="text-gray-500 font-mono text-xs">{{ game.venue }}</p>
                </div>
              </div>

              <!-- Result or Status -->
              <div class="text-right min-w-[80px]">
                <div v-if="game.result" class="flex items-center justify-end gap-2">
                  <span class="px-2 py-1 rounded text-sm font-orbitron font-bold"
                    :class="getResultColor(game.result.winner)">
                    {{ getResultText(game.result.winner) }}
                  </span>
                  <span class="font-orbitron font-bold text-white text-lg">
                    {{ game.result.teamScore }} - {{ game.result.opponentScore }}
                  </span>
                </div>
                <div v-else>
                  <span class="text-gray-400 font-mono text-sm">{{ game.status.shortDetail }}</span>
                </div>
              </div>

              <!-- Broadcasts -->
              <div v-if="game.broadcasts?.length && !game.status.completed"
                class="hidden md:block text-right min-w-[80px]">
                <span class="text-gray-500 font-mono text-xs">📺 {{ game.broadcasts[0] }}</span>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- No games message -->
      <div v-if="!displayedGames.length" class="text-center py-12">
        <div class="text-4xl mb-4">📅</div>
        <p class="text-gray-400 font-mono">No games in this category</p>
      </div>
    </div>
  </div>
</template>
