<script setup lang="ts">
const { teams, loading, error } = useTeams()

const searchQuery = ref('')

const filteredTeams = computed(() => {
  if (!searchQuery.value) return teams.value
  const query = searchQuery.value.toLowerCase()
  return teams.value.filter(team => 
    team.displayName.toLowerCase().includes(query) ||
    team.location.toLowerCase().includes(query) ||
    team.abbreviation.toLowerCase().includes(query)
  )
})

// Group teams by first letter
const groupedTeams = computed(() => {
  const groups: Record<string, typeof teams.value> = {}
  filteredTeams.value.forEach(team => {
    const letter = team.location[0].toUpperCase()
    if (!groups[letter]) groups[letter] = []
    groups[letter].push(team)
  })
  return groups
})
</script>

<template>
  <div class="min-h-screen p-4 md:p-8">
    <HeaderNav />

    <!-- Search -->
    <div class="max-w-md mx-auto mb-8">
      <div class="relative">
        <input 
          v-model="searchQuery"
          type="text"
          placeholder="Search teams..."
          class="w-full px-5 py-3 pl-12 bg-puck-light/50 border border-ice-900/30 rounded-xl text-white placeholder-gray-500 font-mono text-sm focus:outline-none focus:border-ice-500/50 focus:ring-2 focus:ring-ice-500/20 transition-all"
        />
        <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span v-if="searchQuery" class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-mono">
          {{ filteredTeams.length }} found
        </span>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <div class="relative w-20 h-20">
        <div class="absolute inset-0 rounded-full border-4 border-ice-500/20"></div>
        <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-ice-500 animate-spin"></div>
        <span class="absolute inset-0 flex items-center justify-center text-2xl">🏟️</span>
      </div>
      <p class="mt-4 font-mono text-ice-400 text-sm animate-pulse">Loading teams...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="max-w-md mx-auto">
      <div class="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
        <p class="text-red-400 font-mono text-sm">{{ error }}</p>
      </div>
    </div>

    <!-- Teams Grid -->
    <div v-else class="max-w-7xl mx-auto">
      <!-- Quick stats -->
      <div class="flex justify-center gap-4 mb-8">
        <div class="px-4 py-2 bg-puck-light/50 rounded-xl border border-ice-900/30">
          <span class="font-orbitron font-bold text-ice-400">{{ teams.length }}</span>
          <span class="text-gray-500 font-mono text-sm ml-2">Teams</span>
        </div>
      </div>

      <!-- Teams by letter -->
      <div v-for="(groupTeams, letter) in groupedTeams" :key="letter" class="mb-10">
        <div class="flex items-center gap-3 mb-4">
          <span class="w-10 h-10 bg-ice-600/20 rounded-xl flex items-center justify-center font-orbitron font-bold text-ice-400 text-xl">
            {{ letter }}
          </span>
          <div class="flex-1 h-px bg-gradient-to-r from-ice-500/30 to-transparent"></div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div 
            v-for="team in groupTeams" 
            :key="team.id"
            class="group relative bg-gradient-to-br from-puck-light/80 to-puck/80 backdrop-blur-sm rounded-2xl border border-ice-900/30 overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:border-ice-500/50"
          >
            <!-- Team color accent -->
            <div 
              class="absolute top-0 left-0 right-0 h-1 transition-all duration-300"
              :style="{ backgroundColor: `#${team.color}` }"
            />

            <div class="p-5">
              <div class="flex items-center gap-4">
                <!-- Logo -->
                <div 
                  class="w-16 h-16 rounded-xl flex items-center justify-center p-2 transition-transform duration-300 group-hover:scale-110"
                  :style="{ backgroundColor: `#${team.color}20` }"
                >
                  <img 
                    :src="team.logo" 
                    :alt="team.displayName"
                    class="w-full h-full object-contain"
                  />
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <h3 class="font-orbitron font-bold text-white text-lg truncate group-hover:text-ice-300 transition-colors">
                    {{ team.location }}
                  </h3>
                  <p class="text-gray-400 font-mono text-sm">{{ team.name }}</p>
                  <p class="text-gray-600 font-mono text-xs">{{ team.abbreviation }}</p>
                </div>
              </div>

              <!-- Links -->
              <div class="flex flex-wrap gap-2 mt-4 pt-4 border-t border-ice-900/20">
                <a 
                  v-if="team.links.clubhouse"
                  :href="team.links.clubhouse"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="px-3 py-1.5 text-xs font-mono bg-ice-600/10 hover:bg-ice-600/20 text-ice-400 rounded-lg transition-colors flex items-center gap-1"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Home
                </a>
                <a 
                  v-if="team.links.roster"
                  :href="team.links.roster"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="px-3 py-1.5 text-xs font-mono bg-ice-600/10 hover:bg-ice-600/20 text-ice-400 rounded-lg transition-colors flex items-center gap-1"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Roster
                </a>
                <a 
                  v-if="team.links.stats"
                  :href="team.links.stats"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="px-3 py-1.5 text-xs font-mono bg-ice-600/10 hover:bg-ice-600/20 text-ice-400 rounded-lg transition-colors flex items-center gap-1"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Stats
                </a>
                <NuxtLink 
                  :to="`/team/${team.id}/schedule`"
                  class="px-3 py-1.5 text-xs font-mono bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-lg transition-colors flex items-center gap-1"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Schedule
                </NuxtLink>
              </div>
            </div>

            <!-- Hover glow effect -->
            <div 
              class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              :style="{ background: `radial-gradient(circle at center, #${team.color}10 0%, transparent 70%)` }"
            />
          </div>
        </div>
      </div>

      <!-- No results -->
      <div v-if="!filteredTeams.length && searchQuery" class="text-center py-20">
        <div class="text-6xl mb-4">🔍</div>
        <h2 class="font-orbitron text-2xl text-gray-400 mb-2">No Teams Found</h2>
        <p class="text-gray-500 font-mono text-sm">Try a different search term</p>
      </div>
    </div>

    <!-- Footer -->
    <footer class="mt-20 text-center">
      <p class="text-gray-600 font-mono text-xs">
        NHL Live Scoreboard © 2026
      </p>
    </footer>
  </div>
</template>
