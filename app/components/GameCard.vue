<script setup lang="ts">
import type { Game } from '~/composables/useNhlScores'
import { useFavorites } from '~/composables/useFavorites'

const props = defineProps<{
  game: Game
}>()

const { isGameFavorite } = useFavorites()

const favoriteGameData = computed(() => ({
  id: Number(props.game.id),
  homeTeam: {
    id: Number(props.game.homeTeam.id),
    name: props.game.homeTeam.name,
    abbrev: props.game.homeTeam.abbreviation,
    logo: props.game.homeTeam.logo,
    score: Number(props.game.homeTeam.score) || 0
  },
  awayTeam: {
    id: Number(props.game.awayTeam.id),
    name: props.game.awayTeam.name,
    abbrev: props.game.awayTeam.abbreviation,
    logo: props.game.awayTeam.logo,
    score: Number(props.game.awayTeam.score) || 0
  },
  startTime: props.game.date,
  gameState: props.game.status.state === 'in' ? 'LIVE' : props.game.status.state === 'pre' ? 'FUT' : 'OFF'
}))

const getStatusColor = (state: string) => {
  switch (state) {
    case 'in': return 'text-red-400'
    case 'post': return 'text-ice-400'
    case 'pre': return 'text-yellow-400'
    default: return 'text-gray-400'
  }
}

const getStatusBg = (state: string) => {
  switch (state) {
    case 'in': return 'bg-red-500/20 border-red-500/50'
    case 'post': return 'bg-ice-500/20 border-ice-500/30'
    case 'pre': return 'bg-yellow-500/20 border-yellow-500/30'
    default: return 'bg-gray-500/20 border-gray-500/30'
  }
}

const isLive = (state: string) => state === 'in'
const isUpcoming = (state: string) => state === 'pre'

const formatStartTime = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

const getStatusDisplay = computed(() => {
  if (isUpcoming(props.game.status.state)) {
    return formatStartTime(props.game.date)
  }
  return props.game.status.shortDetail || props.game.status.detail
})

const formatOdds = (odds: string | number | undefined) => {
  if (!odds || odds === '-') return '-'
  const num = Number(odds)
  if (isNaN(num)) return odds
  return num > 0 ? `+${num}` : num.toString()
}
</script>

<template>
  <NuxtLink :to="`/game/${game.id}`"
    class="block group relative bg-gradient-to-br from-puck-light/80 to-puck/80 backdrop-blur-sm rounded-2xl border border-ice-900/30 overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:border-ice-500/50 cursor-pointer"
    :class="{ 'animate-glow': isLive(game.status.state) }">
    <!-- Live indicator -->
    <div v-if="isLive(game.status.state)"
      class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse" />

    <!-- Status badge and favorite -->
    <div class="flex items-center justify-between pt-4 pb-2 px-4">
      <div class="w-9"></div>
      <span :class="[getStatusBg(game.status.state), getStatusColor(game.status.state)]"
        class="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border flex items-center gap-2">
        <span v-if="isLive(game.status.state)" class="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        <span v-if="isUpcoming(game.status.state)" class="text-base">🕐</span>
        {{ getStatusDisplay }}
      </span>
      <div @click.prevent.stop>
        <ClientOnly>
          <FavoriteButton type="game" :game="favoriteGameData" />
        </ClientOnly>
      </div>
    </div>

    <!-- Teams -->
    <div class="px-6 py-4">
      <!-- Away Team -->
      <div class="flex items-center justify-between mb-4 group/team">
        <div class="flex items-center gap-3 flex-1">
          <div class="relative">
            <img :src="game.awayTeam.logo" :alt="game.awayTeam.name"
              class="w-12 h-12 object-contain transition-transform duration-300 group-hover/team:scale-110" />
            <div v-if="game.awayTeam.winner && !isUpcoming(game.status.state)"
              class="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
              <span class="text-[8px]">👑</span>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-orbitron font-bold text-white truncate transition-colors"
              :class="{ 'text-ice-300': game.awayTeam.winner }">
              {{ game.awayTeam.shortDisplayName || game.awayTeam.name }}
            </p>
            <p class="text-xs text-gray-500 font-mono">{{ game.awayTeam.record }}</p>
          </div>
        </div>
        <!-- Score or VS for upcoming -->
        <div v-if="!isUpcoming(game.status.state)" class="font-orbitron text-3xl font-black tabular-nums"
          :class="game.awayTeam.winner ? 'text-ice-300' : 'text-white/80'">
          {{ game.awayTeam.score }}
        </div>
      </div>

      <!-- Divider -->
      <div class="relative h-px bg-gradient-to-r from-transparent via-ice-500/30 to-transparent my-3">
        <span v-if="isUpcoming(game.status.state)"
          class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-puck px-3 py-1 text-sm text-yellow-400 font-orbitron font-bold">VS</span>
        <span v-else
          class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-puck px-2 text-xs text-gray-500 font-mono">vs</span>
      </div>

      <!-- Home Team -->
      <div class="flex items-center justify-between mt-4 group/team">
        <div class="flex items-center gap-3 flex-1">
          <div class="relative">
            <img :src="game.homeTeam.logo" :alt="game.homeTeam.name"
              class="w-12 h-12 object-contain transition-transform duration-300 group-hover/team:scale-110" />
            <div v-if="game.homeTeam.winner && !isUpcoming(game.status.state)"
              class="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
              <span class="text-[8px]">👑</span>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-orbitron font-bold text-white truncate transition-colors"
              :class="{ 'text-ice-300': game.homeTeam.winner && !isUpcoming(game.status.state) }">
              {{ game.homeTeam.shortDisplayName || game.homeTeam.name }}
            </p>
            <p class="text-xs text-gray-500 font-mono">{{ game.homeTeam.record }}</p>
          </div>
        </div>
        <!-- Score or nothing for upcoming -->
        <div v-if="!isUpcoming(game.status.state)" class="font-orbitron text-3xl font-black tabular-nums"
          :class="game.homeTeam.winner ? 'text-ice-300' : 'text-white/80'">
          {{ game.homeTeam.score }}
        </div>
      </div>
    </div>

    <!-- Odds Section -->
    <div v-if="game.odds && isUpcoming(game.status.state)"
      class="px-6 py-3 bg-green-500/5 border-t border-green-500/20">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-green-400 text-xs">💰</span>
          <span class="text-green-400/70 text-[10px] font-mono uppercase">{{ game.odds.provider }}</span>
        </div>
        <div class="flex items-center gap-4 text-xs font-mono">
          <div class="text-center">
            <span class="text-gray-500 text-[10px] block">{{ game.awayTeam.abbreviation }}</span>
            <span class="text-green-400 font-bold">{{ formatOdds(game.odds.awayOdds) }}</span>
          </div>
          <div v-if="game.odds.overUnder" class="text-center border-l border-r border-green-500/20 px-3">
            <span class="text-gray-500 text-[10px] block">O/U</span>
            <span class="text-yellow-400 font-bold">{{ game.odds.overUnder }}</span>
          </div>
          <div class="text-center">
            <span class="text-gray-500 text-[10px] block">{{ game.homeTeam.abbreviation }}</span>
            <span class="text-green-400 font-bold">{{ formatOdds(game.odds.homeOdds) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="px-6 py-3 bg-black/20 border-t border-ice-900/20">
      <div class="flex items-center justify-between text-xs text-gray-500">
        <span v-if="game.venue" class="font-mono truncate flex-1">📍 {{ game.venue }}</span>
        <span v-if="game.broadcasts?.length" class="font-mono ml-2">📺 {{ game.broadcasts[0] }}</span>
      </div>
    </div>

    <!-- Hover glow effect -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-ice-500/0 via-ice-500/0 to-ice-500/0 group-hover:from-ice-500/5 group-hover:via-ice-400/5 group-hover:to-ice-300/5 transition-all duration-500 pointer-events-none" />
  </NuxtLink>
</template>
