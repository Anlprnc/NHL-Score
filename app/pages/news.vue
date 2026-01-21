<script setup lang="ts">
const { articles, loading, error } = useNews()

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

const getTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'story': return 'bg-ice-600/20 text-ice-400 border-ice-500/30'
    case 'video': return 'bg-red-600/20 text-red-400 border-red-500/30'
    case 'headlinenews': return 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30'
    default: return 'bg-gray-600/20 text-gray-400 border-gray-500/30'
  }
}

const getTypeLabel = (type: string) => {
  switch (type.toLowerCase()) {
    case 'story': return 'Article'
    case 'video': return 'Video'
    case 'headlinenews': return 'Breaking'
    default: return type
  }
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
        <span class="absolute inset-0 flex items-center justify-center text-2xl">📰</span>
      </div>
      <p class="mt-4 font-mono text-ice-400 text-sm animate-pulse">Loading news...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="max-w-md mx-auto">
      <div class="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
        <p class="text-red-400 font-mono text-sm">{{ error }}</p>
      </div>
    </div>

    <!-- News Grid -->
    <div v-else class="max-w-6xl mx-auto">
      <!-- Featured Article (First one) -->
      <a 
        v-if="articles[0]"
        :href="articles[0].link"
        target="_blank"
        rel="noopener noreferrer"
        class="block mb-8 group"
      >
        <article class="relative bg-gradient-to-br from-puck-light/90 to-puck/90 backdrop-blur-sm rounded-3xl border border-ice-900/30 overflow-hidden transition-all duration-500 hover:border-ice-500/50 hover:scale-[1.01]">
          <div class="md:flex">
            <!-- Image -->
            <div class="md:w-1/2 relative overflow-hidden">
              <div class="aspect-video md:aspect-auto md:h-full">
                <img 
                  v-if="articles[0].image"
                  :src="articles[0].image" 
                  :alt="articles[0].headline"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div v-else class="w-full h-full bg-puck-light flex items-center justify-center">
                  <span class="text-6xl opacity-30">🏒</span>
                </div>
              </div>
              <div class="absolute inset-0 bg-gradient-to-t from-puck via-transparent to-transparent md:bg-gradient-to-r" />
            </div>
            
            <!-- Content -->
            <div class="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
              <div class="flex items-center gap-3 mb-4">
                <span :class="getTypeColor(articles[0].type)" class="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border">
                  {{ getTypeLabel(articles[0].type) }}
                </span>
                <span class="text-gray-500 text-sm font-mono">{{ formatDate(articles[0].published) }}</span>
              </div>
              <h2 class="font-orbitron text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-ice-300 transition-colors">
                {{ articles[0].headline }}
              </h2>
              <p class="text-gray-400 font-mono text-sm leading-relaxed line-clamp-3">
                {{ articles[0].description }}
              </p>
              <div class="mt-6 flex items-center gap-2 text-ice-400 font-mono text-sm group-hover:text-ice-300 transition-colors">
                Read more
                <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </article>
      </a>

      <!-- Other Articles Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a 
          v-for="article in articles.slice(1)"
          :key="article.id"
          :href="article.link"
          target="_blank"
          rel="noopener noreferrer"
          class="group"
        >
          <article class="h-full bg-gradient-to-br from-puck-light/80 to-puck/80 backdrop-blur-sm rounded-2xl border border-ice-900/30 overflow-hidden transition-all duration-500 hover:border-ice-500/50 hover:scale-[1.02] flex flex-col">
            <!-- Image -->
            <div class="relative overflow-hidden">
              <div class="aspect-video">
                <img 
                  v-if="article.image"
                  :src="article.image" 
                  :alt="article.headline"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div v-else class="w-full h-full bg-puck-light flex items-center justify-center">
                  <span class="text-4xl opacity-30">🏒</span>
                </div>
              </div>
              <!-- Video badge -->
              <div v-if="article.type.toLowerCase() === 'video'" class="absolute inset-0 flex items-center justify-center">
                <div class="w-14 h-14 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                  <svg class="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <!-- Content -->
            <div class="p-5 flex flex-col flex-1">
              <div class="flex items-center gap-2 mb-3">
                <span :class="getTypeColor(article.type)" class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border">
                  {{ getTypeLabel(article.type) }}
                </span>
                <span class="text-gray-500 text-xs font-mono">{{ formatDate(article.published) }}</span>
              </div>
              <h3 class="font-orbitron font-bold text-white text-lg mb-3 group-hover:text-ice-300 transition-colors line-clamp-2 flex-1">
                {{ article.headline }}
              </h3>
              <p class="text-gray-500 font-mono text-xs leading-relaxed line-clamp-2">
                {{ article.description }}
              </p>
            </div>
          </article>
        </a>
      </div>

      <!-- No articles -->
      <div v-if="!articles.length" class="text-center py-20">
        <div class="text-6xl mb-4">📰</div>
        <h2 class="font-orbitron text-2xl text-gray-400 mb-2">No News Available</h2>
        <p class="text-gray-500 font-mono text-sm">Check back later for updates</p>
      </div>
    </div>

    <!-- Footer -->
    <footer class="mt-20 text-center">
      <p class="text-gray-600 font-mono text-xs">
        News from ESPN • <a href="https://www.espn.com/nhl/" target="_blank" class="text-ice-500 hover:text-ice-400">espn.com/nhl</a>
      </p>
    </footer>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
