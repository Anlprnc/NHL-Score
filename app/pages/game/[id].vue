<script setup lang="ts">
const route = useRoute()
const gameId = route.params.id as string
const { game, loading, error } = useGameDetails(gameId)

const formatGameDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusColor = (state: string) => {
  switch (state) {
    case 'in': return 'text-red-400'
    case 'post': return 'text-ice-400'
    case 'pre': return 'text-gray-400'
    default: return 'text-gray-400'
  }
}

const getStatusBg = (state: string) => {
  switch (state) {
    case 'in': return 'bg-red-500/20 border-red-500/50'
    case 'post': return 'bg-ice-500/20 border-ice-500/30'
    case 'pre': return 'bg-gray-500/20 border-gray-500/30'
    default: return 'bg-gray-500/20 border-gray-500/30'
  }
}

const isLive = computed(() => game.value?.status.state === 'in')

// Group scoring plays by period
const scoringByPeriod = computed(() => {
  if (!game.value?.scoringPlays.length) return {}

  return game.value.scoringPlays.reduce((acc, play) => {
    const period = play.periodDisplayValue || `Period ${play.period}`
    if (!acc[period]) acc[period] = []
    acc[period].push(play)
    return acc
  }, {} as Record<string, typeof game.value.scoringPlays>)
})
</script>

<template>
  <div class="min-h-screen p-4 md:p-8">
    <HeaderNav />
    <!-- Loading state -->
    <div v-if="loading && !game" class="flex flex-col items-center justify-center py-20">
      <div class="relative w-20 h-20">
        <div class="absolute inset-0 rounded-full border-4 border-ice-500/20"></div>
        <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-ice-500 animate-spin"></div>
        <span class="absolute inset-0 flex items-center justify-center text-2xl">🏒</span>
      </div>
      <p class="mt-4 font-mono text-ice-400 text-sm animate-pulse">Loading game details...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="max-w-md mx-auto">
      <div class="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
        <p class="text-red-400 font-mono text-sm">{{ error }}</p>
        <NuxtLink to="/"
          class="mt-4 inline-block px-4 py-2 bg-ice-600/20 hover:bg-ice-600/30 border border-ice-500/30 rounded-lg text-ice-400 text-sm font-mono transition-all duration-300">
          Back to Scoreboard
        </NuxtLink>
      </div>
    </div>

    <!-- Game Details -->
    <div v-else-if="game" class="max-w-5xl mx-auto">
      <!-- Back button -->
      <NuxtLink to="/"
        class="inline-flex items-center gap-2 text-ice-400 hover:text-ice-300 font-mono text-sm mb-6 transition-colors group">
        <svg class="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor"
          viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Scoreboard
      </NuxtLink>
      <!-- Main Score Card -->
      <div
        class="relative bg-gradient-to-br from-puck-light/90 to-puck/90 backdrop-blur-sm rounded-3xl border border-ice-900/30 overflow-hidden mb-8"
        :class="{ 'animate-glow': isLive }">
        <!-- Live indicator -->
        <div v-if="isLive"
          class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse" />

        <div class="p-6 md:p-10">
          <!-- Status badge -->
          <div class="flex justify-center mb-6">
            <span :class="[getStatusBg(game.status.state), getStatusColor(game.status.state)]"
              class="px-4 py-2 rounded-full text-sm font-mono font-bold uppercase tracking-wider border flex items-center gap-2">
              <span v-if="isLive" class="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {{ game.status.shortDetail || game.status.detail }}
            </span>
          </div>

          <!-- Teams and Score -->
          <div class="flex items-center justify-center gap-8 md:gap-16">
            <!-- Away Team -->
            <div class="flex flex-col items-center text-center">
              <img :src="game.awayTeam.logo" :alt="game.awayTeam.name"
                class="w-24 h-24 md:w-32 md:h-32 object-contain mb-4" />
              <h2 class="font-orbitron font-bold text-xl md:text-2xl"
                :class="game.awayTeam.winner ? 'text-ice-300' : 'text-white'">
                {{ game.awayTeam.displayName }}
              </h2>
              <p class="text-gray-500 font-mono text-sm">{{ game.awayTeam.record }}</p>
              <div class="font-orbitron text-5xl md:text-7xl font-black mt-4 tabular-nums"
                :class="game.awayTeam.winner ? 'text-ice-300' : 'text-white/80'">
                {{ game.awayTeam.score }}
              </div>
            </div>

            <!-- VS Divider -->
            <div class="flex flex-col items-center">
              <span class="text-gray-600 font-orbitron text-2xl font-bold">@</span>
            </div>

            <!-- Home Team -->
            <div class="flex flex-col items-center text-center">
              <img :src="game.homeTeam.logo" :alt="game.homeTeam.name"
                class="w-24 h-24 md:w-32 md:h-32 object-contain mb-4" />
              <h2 class="font-orbitron font-bold text-xl md:text-2xl"
                :class="game.homeTeam.winner ? 'text-ice-300' : 'text-white'">
                {{ game.homeTeam.displayName }}
              </h2>
              <p class="text-gray-500 font-mono text-sm">{{ game.homeTeam.record }}</p>
              <div class="font-orbitron text-5xl md:text-7xl font-black mt-4 tabular-nums"
                :class="game.homeTeam.winner ? 'text-ice-300' : 'text-white/80'">
                {{ game.homeTeam.score }}
              </div>
            </div>
          </div>

          <!-- Game Info -->
          <div class="flex flex-wrap items-center justify-center gap-4 mt-8 text-sm text-gray-400 font-mono">
            <span v-if="game.venue" class="flex items-center gap-1">📍 {{ game.venue }}</span>
            <span v-if="game.attendance" class="flex items-center gap-1">👥 {{ game.attendance }}</span>
            <span class="flex items-center gap-1">📅 {{ formatGameDate(game.date) }}</span>
          </div>
        </div>

        <!-- Period Scores -->
        <div v-if="game.periodScores.length" class="border-t border-ice-900/30 bg-black/20">
          <div class="p-4 md:p-6 overflow-x-auto">
            <table class="w-full min-w-[300px]">
              <thead>
                <tr class="text-gray-500 font-mono text-xs uppercase tracking-wider">
                  <th class="text-left py-2 px-3">Team</th>
                  <th v-for="period in game.periodScores" :key="period.period"
                    class="text-center py-2 px-3 min-w-[40px]">
                    {{ period.displayValue }}
                  </th>
                  <th class="text-center py-2 px-3 min-w-[50px] border-l border-ice-900/30">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr class="text-white">
                  <td class="py-2 px-3">
                    <div class="flex items-center gap-2">
                      <img :src="game.awayTeam.logo" class="w-6 h-6 object-contain" />
                      <span class="font-orbitron font-bold">{{ game.awayTeam.abbreviation }}</span>
                    </div>
                  </td>
                  <td v-for="period in game.periodScores" :key="`away-${period.period}`"
                    class="text-center py-2 px-3 font-mono">
                    {{ period.awayScore }}
                  </td>
                  <td class="text-center py-2 px-3 font-orbitron font-bold border-l border-ice-900/30"
                    :class="game.awayTeam.winner ? 'text-ice-300' : ''">
                    {{ game.awayTeam.score }}
                  </td>
                </tr>
                <tr class="text-white">
                  <td class="py-2 px-3">
                    <div class="flex items-center gap-2">
                      <img :src="game.homeTeam.logo" class="w-6 h-6 object-contain" />
                      <span class="font-orbitron font-bold">{{ game.homeTeam.abbreviation }}</span>
                    </div>
                  </td>
                  <td v-for="period in game.periodScores" :key="`home-${period.period}`"
                    class="text-center py-2 px-3 font-mono">
                    {{ period.homeScore }}
                  </td>
                  <td class="text-center py-2 px-3 font-orbitron font-bold border-l border-ice-900/30"
                    :class="game.homeTeam.winner ? 'text-ice-300' : ''">
                    {{ game.homeTeam.score }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Scoring Summary -->
      <div v-if="Object.keys(scoringByPeriod).length"
        class="bg-gradient-to-br from-puck-light/80 to-puck/80 backdrop-blur-sm rounded-2xl border border-ice-900/30 overflow-hidden mb-8">
        <div class="p-6 border-b border-ice-900/30">
          <h3 class="font-orbitron text-xl text-ice-400 font-bold flex items-center gap-3">
            <span class="text-2xl">🥅</span>
            Scoring Summary
          </h3>
        </div>

        <div class="divide-y divide-ice-900/20">
          <div v-for="(plays, period) in scoringByPeriod" :key="period" class="p-4 md:p-6">
            <h4 class="font-orbitron text-lg text-white font-bold mb-4 flex items-center gap-2">
              <span class="w-8 h-8 bg-ice-600/20 rounded-lg flex items-center justify-center text-ice-400 text-sm">
                {{ period.replace('Period ', 'P').replace('1st', 'P1').replace('2nd', 'P2').replace('3rd', 'P3') }}
              </span>
              {{ period }}
            </h4>

            <div class="space-y-4">
              <div v-for="play in plays" :key="play.id"
                class="flex items-start gap-4 p-4 bg-black/20 rounded-xl hover:bg-black/30 transition-colors">
                <img :src="play.team.logo" :alt="play.team.name" class="w-10 h-10 object-contain flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-orbitron font-bold text-white">{{ play.goalScorer.name }}</span>
                    <span class="text-xs px-2 py-0.5 bg-ice-600/20 text-ice-400 rounded-full font-mono">
                      {{ play.scoringType }}
                    </span>
                  </div>
                  <p v-if="play.assists.length" class="text-gray-400 text-sm mt-1 font-mono">
                    Assists: {{play.assists.map(a => a.name).join(', ')}}
                  </p>
                  <p v-else class="text-gray-500 text-sm mt-1 font-mono italic">
                    Unassisted
                  </p>
                </div>
                <div class="text-right flex-shrink-0">
                  <div class="font-mono text-sm text-gray-400">{{ play.clock }}</div>
                  <div class="font-orbitron font-bold text-white mt-1">
                    {{ play.awayScore }} - {{ play.homeScore }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Scoring -->
      <div v-else-if="game.status.state !== 'pre'"
        class="bg-gradient-to-br from-puck-light/80 to-puck/80 backdrop-blur-sm rounded-2xl border border-ice-900/30 p-8 text-center mb-8">
        <span class="text-4xl mb-4 block">🥅</span>
        <p class="text-gray-400 font-mono">No goals scored yet</p>
      </div>

      <!-- Team Stats -->
      <div v-if="game.teamStats.home.length || game.teamStats.away.length"
        class="bg-gradient-to-br from-puck-light/80 to-puck/80 backdrop-blur-sm rounded-2xl border border-ice-900/30 overflow-hidden">
        <div class="p-6 border-b border-ice-900/30">
          <h3 class="font-orbitron text-xl text-ice-400 font-bold flex items-center gap-3">
            <span class="text-2xl">📊</span>
            Team Statistics
          </h3>
        </div>

        <div class="p-4 md:p-6">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6 px-4">
            <div class="flex items-center gap-2">
              <img :src="game.awayTeam.logo" class="w-8 h-8 object-contain" />
              <span class="font-orbitron font-bold text-white">{{ game.awayTeam.abbreviation }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="font-orbitron font-bold text-white">{{ game.homeTeam.abbreviation }}</span>
              <img :src="game.homeTeam.logo" class="w-8 h-8 object-contain" />
            </div>
          </div>

          <!-- Stats rows -->
          <div class="space-y-3">
            <div v-for="(stat, index) in game.teamStats.home" :key="stat.name"
              class="flex items-center justify-between p-3 bg-black/20 rounded-lg">
              <span class="font-mono text-white w-16 text-left">{{ game.teamStats.away[index]?.value || '-' }}</span>
              <span class="text-gray-400 text-sm font-mono flex-1 text-center">{{ stat.name }}</span>
              <span class="font-mono text-white w-16 text-right">{{ stat.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
