<script setup lang="ts">
import type { DateFilter } from '~/composables/useNhlScores'

const { games, loading, error, lastUpdated, selectedDate, fetchScores, getDisplayDate } = useNhlScores()

const formatTime = (date: Date | null) => {
  if (!date) return ''
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const liveGames = computed(() => games.value.filter(g => g.status.state === 'in'))
const upcomingGames = computed(() => games.value.filter(g => g.status.state === 'pre'))
const completedGames = computed(() => games.value.filter(g => g.status.state === 'post'))

const dateOptions: { value: DateFilter; label: string }[] = [
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' }
]

const changeDate = async (filter: DateFilter) => {
  await fetchScores(filter)
}
</script>

<template>
  <div class="min-h-screen p-4 md:p-8">
    <HeaderNav />

    <!-- Header -->
    <header class="text-center mb-8">      
      <!-- Date Selector -->
      <div class="flex flex-col items-center gap-3 mb-6">
        <div class="flex items-center gap-1 bg-puck-light/50 rounded-2xl p-1">
          <button
            v-for="option in dateOptions"
            :key="option.value"
            @click="changeDate(option.value)"
            :class="[
              'px-4 py-2 rounded-xl font-orbitron font-bold text-sm transition-all duration-300',
              selectedDate === option.value
                ? 'bg-ice-600 text-white shadow-lg shadow-ice-600/30'
                : 'text-gray-400 hover:text-white hover:bg-puck-light'
            ]"
          >
            {{ option.label }}
          </button>
        </div>
        <p class="text-ice-400 font-mono text-sm">
          📅 {{ getDisplayDate(selectedDate) }}
        </p>
      </div>

      <!-- Stats Summary -->
      <div v-if="games.length" class="flex flex-wrap justify-center gap-2 md:gap-3">
        <!-- Live -->
        <div class="flex items-center gap-1 px-2 py-1 bg-red-500/10 border border-red-500/30 rounded-lg">
          <span class="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
          <span class="font-orbitron font-bold text-red-400 text-base">{{ liveGames.length }}</span>
          <span class="text-red-400/70 text-xs font-mono">Live</span>
        </div>
        <!-- Upcoming -->
        <div class="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <span class="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
          <span class="font-orbitron font-bold text-yellow-400 text-base">{{ upcomingGames.length }}</span>
          <span class="text-yellow-400/70 text-xs font-mono">Upcoming</span>
        </div>
        <!-- Final -->
        <div class="flex items-center gap-1 px-2 py-1 bg-ice-500/10 border border-ice-500/30 rounded-lg">
          <span class="w-1.5 h-1.5 bg-ice-500 rounded-full"></span>
          <span class="font-orbitron font-bold text-ice-400 text-base">{{ completedGames.length }}</span>
          <span class="text-ice-400/70 text-xs font-mono">Final</span>
        </div>
        <!-- Total -->
        <div class="flex items-center gap-1 px-2 py-1 bg-gray-500/10 border border-gray-500/30 rounded-lg">
          <span class="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
          <span class="font-orbitron font-bold text-gray-400 text-base">{{ games.length }}</span>
          <span class="text-gray-400/70 text-xs font-mono">Total</span>
        </div>
      </div>
    </header>

    <!-- Error state -->
    <div v-if="error" class="max-w-md mx-auto mb-8">
      <div class="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
        <p class="text-red-400 font-mono text-sm">{{ error }}</p>
        <p class="text-gray-500 font-mono text-xs mt-2">Auto-retry in 30 seconds...</p>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading && !games.length" class="flex flex-col items-center justify-center py-20">
      <div class="relative w-20 h-20">
        <div class="absolute inset-0 rounded-full border-4 border-ice-500/20"></div>
        <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-ice-500 animate-spin"></div>
        <span class="absolute inset-0 flex items-center justify-center text-2xl">🏒</span>
      </div>
      <p class="mt-4 font-mono text-ice-400 text-sm animate-pulse">Loading scores...</p>
    </div>

    <!-- No games -->
    <div v-else-if="!loading && !games.length" class="text-center py-20">
      <div class="text-6xl mb-4">🏒</div>
      <h2 class="font-orbitron text-2xl text-gray-400 mb-2">No Games</h2>
      <p class="text-gray-500 font-mono text-sm">
        No games scheduled for {{ getDisplayDate(selectedDate) }}
      </p>
    </div>

    <!-- Games grid -->
    <div v-else class="max-w-7xl mx-auto space-y-12">
      <!-- Live Games -->
      <section v-if="liveGames.length">
        <div class="flex items-center gap-3 mb-6">
          <span class="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          <h2 class="font-orbitron text-xl text-red-400 font-bold tracking-wider">LIVE GAMES</h2>
          <span class="px-2 py-0.5 bg-red-500/20 rounded-full text-red-400 text-xs font-mono">{{ liveGames.length }}</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GameCard v-for="game in liveGames" :key="game.id" :game="game" />
        </div>
      </section>

      <!-- Upcoming Games -->
      <section v-if="upcomingGames.length">
        <div class="flex items-center gap-3 mb-6">
          <span class="w-3 h-3 bg-yellow-500 rounded-full"></span>
          <h2 class="font-orbitron text-xl text-yellow-400 font-bold tracking-wider">UPCOMING</h2>
          <span class="px-2 py-0.5 bg-yellow-500/20 rounded-full text-yellow-400 text-xs font-mono">{{ upcomingGames.length }}</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GameCard v-for="game in upcomingGames" :key="game.id" :game="game" />
        </div>
      </section>

      <!-- Completed Games -->
      <section v-if="completedGames.length">
        <div class="flex items-center gap-3 mb-6">
          <span class="w-3 h-3 bg-ice-500 rounded-full"></span>
          <h2 class="font-orbitron text-xl text-ice-400 font-bold tracking-wider">FINAL</h2>
          <span class="px-2 py-0.5 bg-ice-500/20 rounded-full text-ice-400 text-xs font-mono">{{ completedGames.length }}</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GameCard v-for="game in completedGames" :key="game.id" :game="game" />
        </div>
      </section>
    </div>

    <!-- Footer -->
    <footer class="mt-20 text-center">
      <p class="text-gray-700 font-mono text-xs mt-1">
        NHL Live Scoreboard © 2026
      </p>
    </footer>
  </div>
</template>
