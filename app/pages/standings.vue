<script setup lang="ts">
const { conferences, loading, error } = useStandings()

const activeConference = ref<string | null>(null)

// Set first conference as active when data loads
watch(conferences, (newConferences) => {
  if (newConferences.length && !activeConference.value) {
    activeConference.value = newConferences[0].id
  }
}, { immediate: true })

const currentConference = computed(() => {
  return conferences.value.find(c => c.id === activeConference.value)
})

const getStreakColor = (streak: string) => {
  if (!streak) return 'text-gray-400'
  if (streak.startsWith('W')) return 'text-green-400'
  if (streak.startsWith('L')) return 'text-red-400'
  return 'text-yellow-400'
}

const getDiffColor = (diff: number) => {
  if (diff > 0) return 'text-green-400'
  if (diff < 0) return 'text-red-400'
  return 'text-gray-400'
}
</script>

<template>
  <div class="min-h-screen p-4 md:p-8">
    <HeaderNav />

    <!-- Header -->
    <header class="text-center mb-8">
      <div class="inline-flex items-center gap-4 mb-4">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-ice-400 to-ice-600 flex items-center justify-center shadow-lg shadow-ice-500/30">
          <span class="text-3xl">🏆</span>
        </div>
        <div class="text-left">
          <h1 class="font-orbitron text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-ice-300 via-ice-100 to-ice-300">
            STANDINGS
          </h1>
          <p class="font-mono text-ice-500 text-sm tracking-widest">2025-26 SEASON</p>
        </div>
      </div>
    </header>

    <!-- Loading state -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <div class="relative w-20 h-20">
        <div class="absolute inset-0 rounded-full border-4 border-ice-500/20"></div>
        <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-ice-500 animate-spin"></div>
        <span class="absolute inset-0 flex items-center justify-center text-2xl">🏆</span>
      </div>
      <p class="mt-4 font-mono text-ice-400 text-sm animate-pulse">Loading standings...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="max-w-md mx-auto">
      <div class="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
        <p class="text-red-400 font-mono text-sm">{{ error }}</p>
      </div>
    </div>

    <!-- Standings -->
    <div v-else class="max-w-7xl mx-auto">
      <!-- Conference Tabs -->
      <div class="flex justify-center gap-2 mb-8">
        <button
          v-for="conf in conferences"
          :key="conf.id"
          @click="activeConference = conf.id"
          class="px-6 py-3 rounded-xl font-orbitron font-bold text-sm transition-all duration-300"
          :class="activeConference === conf.id 
            ? 'bg-ice-600 text-white shadow-lg shadow-ice-600/30' 
            : 'bg-puck-light/50 text-gray-400 hover:bg-puck-light hover:text-white'"
        >
          {{ conf.name }}
        </button>
      </div>

      <!-- Divisions -->
      <div v-if="currentConference" class="space-y-8">
        <div 
          v-for="division in currentConference.divisions" 
          :key="division.id"
          class="bg-gradient-to-br from-puck-light/80 to-puck/80 backdrop-blur-sm rounded-2xl border border-ice-900/30 overflow-hidden"
        >
          <!-- Division Header -->
          <div class="p-4 md:p-6 border-b border-ice-900/30 bg-black/20">
            <h3 class="font-orbitron text-xl text-ice-400 font-bold">
              {{ division.name }}
            </h3>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full min-w-[800px]">
              <thead>
                <tr class="text-gray-500 font-mono text-xs uppercase tracking-wider border-b border-ice-900/20">
                  <th class="text-left py-3 px-4 w-8">#</th>
                  <th class="text-left py-3 px-4">Team</th>
                  <th class="text-center py-3 px-4">GP</th>
                  <th class="text-center py-3 px-4">W</th>
                  <th class="text-center py-3 px-4">L</th>
                  <th class="text-center py-3 px-4">OTL</th>
                  <th class="text-center py-3 px-4 bg-ice-600/10">PTS</th>
                  <th class="text-center py-3 px-4">GF</th>
                  <th class="text-center py-3 px-4">GA</th>
                  <th class="text-center py-3 px-4">DIFF</th>
                  <th class="text-center py-3 px-4">HOME</th>
                  <th class="text-center py-3 px-4">AWAY</th>
                  <th class="text-center py-3 px-4">L10</th>
                  <th class="text-center py-3 px-4">STRK</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="(team, index) in division.teams" 
                  :key="team.id"
                  class="border-b border-ice-900/10 hover:bg-ice-600/5 transition-colors"
                  :class="{ 'bg-ice-600/5': index < 3 }"
                >
                  <td class="py-3 px-4">
                    <span 
                      class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      :class="index < 3 ? 'bg-ice-600/30 text-ice-300' : 'text-gray-500'"
                    >
                      {{ team.rank }}
                    </span>
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-3">
                      <img :src="team.logo" :alt="team.name" class="w-8 h-8 object-contain" />
                      <div>
                        <span class="font-orbitron font-bold text-white hidden md:inline">{{ team.displayName }}</span>
                        <span class="font-orbitron font-bold text-white md:hidden">{{ team.abbreviation }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="text-center py-3 px-4 font-mono text-gray-400">{{ team.gamesPlayed }}</td>
                  <td class="text-center py-3 px-4 font-mono text-green-400">{{ team.wins }}</td>
                  <td class="text-center py-3 px-4 font-mono text-red-400">{{ team.losses }}</td>
                  <td class="text-center py-3 px-4 font-mono text-yellow-400">{{ team.otLosses }}</td>
                  <td class="text-center py-3 px-4 font-orbitron font-bold text-ice-300 bg-ice-600/10">{{ team.points }}</td>
                  <td class="text-center py-3 px-4 font-mono text-gray-300">{{ team.goalsFor }}</td>
                  <td class="text-center py-3 px-4 font-mono text-gray-300">{{ team.goalsAgainst }}</td>
                  <td class="text-center py-3 px-4 font-mono" :class="getDiffColor(team.goalDiff)">
                    {{ team.goalDiff > 0 ? '+' : '' }}{{ team.goalDiff }}
                  </td>
                  <td class="text-center py-3 px-4 font-mono text-gray-400 text-sm">{{ team.homeRecord }}</td>
                  <td class="text-center py-3 px-4 font-mono text-gray-400 text-sm">{{ team.awayRecord }}</td>
                  <td class="text-center py-3 px-4 font-mono text-gray-400 text-sm">{{ team.last10 }}</td>
                  <td class="text-center py-3 px-4">
                    <span class="font-mono text-sm font-bold" :class="getStreakColor(team.streak)">
                      {{ team.streak }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Legend -->
          <div class="p-4 border-t border-ice-900/20 bg-black/10">
            <div class="flex flex-wrap gap-4 text-xs text-gray-500 font-mono">
              <span class="flex items-center gap-1">
                <span class="w-3 h-3 rounded-full bg-ice-600/30"></span>
                Playoff Position
              </span>
              <span>GP: Games Played</span>
              <span>W: Wins</span>
              <span>L: Losses</span>
              <span>OTL: Overtime Losses</span>
              <span>PTS: Points</span>
              <span>DIFF: Goal Differential</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
