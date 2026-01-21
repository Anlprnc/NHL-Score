<script setup lang="ts">
const route = useRoute()

const navItems = [
  { to: '/', label: 'Scores', icon: '🏒' },
  { to: '/standings', label: 'Standings', icon: '🏆' },
  { to: '/news', label: 'News', icon: '📰' },
  { to: '/teams', label: 'Teams', icon: '🏟️' }
]

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>

<template>
  <div class="mb-8">
    <!-- Logo and title -->
    <div class="flex justify-center mb-6">
      <NuxtLink to="/" class="inline-flex items-center gap-4 hover:opacity-90 transition-opacity">
        <div class="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-ice-400 to-ice-600 flex items-center justify-center shadow-lg shadow-ice-500/30">
          <span class="text-2xl md:text-3xl">🏒</span>
        </div>
        <div class="text-left">
          <h1 class="font-orbitron text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-ice-300 via-ice-100 to-ice-300">
            NHL LIVE
          </h1>
          <p class="font-mono text-ice-500 text-xs md:text-sm tracking-widest">SCOREBOARD</p>
        </div>
      </NuxtLink>
    </div>
    
    <!-- Navigation -->
    <nav class="flex flex-wrap justify-center gap-2">
      <NuxtLink 
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :class="[
          'px-4 md:px-5 py-2 md:py-2.5 rounded-xl font-orbitron font-bold text-xs md:text-sm transition-all duration-300',
          isActive(item.to)
            ? 'bg-ice-600 text-white shadow-lg shadow-ice-600/30'
            : 'bg-puck-light/50 text-gray-400 hover:bg-puck-light hover:text-white'
        ]"
      >
        {{ item.icon }} {{ item.label }}
      </NuxtLink>
    </nav>
  </div>
</template>
