<template>
    <div class="flex items-center gap-3">
        <!-- Logged in state -->
        <template v-if="user">
            <NuxtLink to="/profile" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <img v-if="user.photoURL" :src="user.photoURL" :alt="user.displayName || 'User'"
                    class="w-9 h-9 rounded-full border-2 border-ice-400" />
                <div v-else
                    class="w-9 h-9 rounded-full border-2 border-ice-400 bg-ice-500/20 flex items-center justify-center">
                    <span class="text-sm font-bold text-ice-400">
                        {{ user.displayName?.charAt(0) || user.email?.charAt(0) || '?' }}
                    </span>
                </div>
                <span class="text-white text-sm hidden sm:block">{{ user.displayName || 'Profile' }}</span>
            </NuxtLink>
        </template>

        <!-- Logged out state -->
        <template v-else>
            <button @click="openAuthModal"
                class="flex items-center gap-2 px-4 py-2 bg-ice-500 hover:bg-ice-600 text-white font-medium rounded-lg shadow-md transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Login
            </button>
        </template>
    </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

const { user, openAuthModal } = useAuth()
</script>