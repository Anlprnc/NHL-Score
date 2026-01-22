<template>
    <Teleport to="body">
        <Transition name="modal">
            <div v-if="authModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4"
                @click.self="closeAuthModal">
                <!-- Backdrop -->
                <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

                <!-- Modal -->
                <div class="relative bg-puck-dark border border-ice-500/20 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                    <!-- Close button -->
                    <button @click="closeAuthModal"
                        class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <!-- Tabs -->
                    <div class="flex gap-4 mb-6">
                        <button @click="activeTab = 'login'" :class="[
                            'text-lg font-semibold pb-2 border-b-2 transition-colors',
                            activeTab === 'login' ? 'text-ice-400 border-ice-400' : 'text-gray-400 border-transparent hover:text-gray-300'
                        ]">
                            Login
                        </button>
                        <button @click="activeTab = 'register'" :class="[
                            'text-lg font-semibold pb-2 border-b-2 transition-colors',
                            activeTab === 'register' ? 'text-ice-400 border-ice-400' : 'text-gray-400 border-transparent hover:text-gray-300'
                        ]">
                            Register
                        </button>
                    </div>

                    <!-- Error message -->
                    <div v-if="error"
                        class="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                        {{ error }}
                    </div>

                    <!-- Login Form -->
                    <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="space-y-4">
                        <div>
                            <label class="block text-sm text-gray-400 mb-1">Email</label>
                            <input v-model="loginForm.email" type="email" required
                                class="w-full px-4 py-3 bg-puck-darker border border-ice-500/20 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-ice-400 transition-colors"
                                placeholder="your@email.com" />
                        </div>
                        <div>
                            <label class="block text-sm text-gray-400 mb-1">Password</label>
                            <input v-model="loginForm.password" type="password" required
                                class="w-full px-4 py-3 bg-puck-darker border border-ice-500/20 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-ice-400 transition-colors"
                                placeholder="••••••••" />
                        </div>
                        <button type="submit" :disabled="isLoading"
                            class="w-full py-3 bg-ice-500 hover:bg-ice-600 disabled:bg-ice-500/50 text-white font-semibold rounded-lg transition-colors">
                            {{ isLoading ? 'Loading...' : 'Login' }}
                        </button>
                    </form>

                    <!-- Register Form -->
                    <form v-if="activeTab === 'register'" @submit.prevent="handleRegister" class="space-y-4">
                        <div>
                            <label class="block text-sm text-gray-400 mb-1">Name</label>
                            <input v-model="registerForm.name" type="text" required
                                class="w-full px-4 py-3 bg-puck-darker border border-ice-500/20 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-ice-400 transition-colors"
                                placeholder="John Doe" />
                        </div>
                        <div>
                            <label class="block text-sm text-gray-400 mb-1">Email</label>
                            <input v-model="registerForm.email" type="email" required
                                class="w-full px-4 py-3 bg-puck-darker border border-ice-500/20 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-ice-400 transition-colors"
                                placeholder="your@email.com" />
                        </div>
                        <div>
                            <label class="block text-sm text-gray-400 mb-1">Password</label>
                            <input v-model="registerForm.password" type="password" required minlength="6"
                                class="w-full px-4 py-3 bg-puck-darker border border-ice-500/20 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-ice-400 transition-colors"
                                placeholder="••••••••" />
                        </div>
                        <div>
                            <label class="block text-sm text-gray-400 mb-1">Confirm Password</label>
                            <input v-model="registerForm.confirmPassword" type="password" required minlength="6"
                                class="w-full px-4 py-3 bg-puck-darker border border-ice-500/20 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-ice-400 transition-colors"
                                placeholder="••••••••" />
                        </div>
                        <button type="submit" :disabled="isLoading"
                            class="w-full py-3 bg-ice-500 hover:bg-ice-600 disabled:bg-ice-500/50 text-white font-semibold rounded-lg transition-colors">
                            {{ isLoading ? 'Loading...' : 'Create Account' }}
                        </button>
                    </form>

                    <!-- Divider -->
                    <div class="flex items-center gap-4 my-6">
                        <div class="flex-1 h-px bg-ice-500/20"></div>
                        <span class="text-gray-500 text-sm">or</span>
                        <div class="flex-1 h-px bg-ice-500/20"></div>
                    </div>

                    <!-- Google Sign In -->
                    <button @click="handleGoogleSignIn" :disabled="isLoading"
                        class="w-full flex items-center justify-center gap-3 py-3 bg-white hover:bg-gray-100 disabled:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors">
                        <svg class="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

const { authModalOpen, closeAuthModal, signInWithGoogle, loginWithEmail, registerWithEmail } = useAuth()

const activeTab = ref<'login' | 'register'>('login')
const isLoading = ref(false)
const error = ref('')

const loginForm = reactive({
    email: '',
    password: ''
})

const registerForm = reactive({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
})

const handleLogin = async () => {
    error.value = ''
    isLoading.value = true
    try {
        await loginWithEmail(loginForm.email, loginForm.password)
        closeAuthModal()
    } catch (e: any) {
        error.value = getErrorMessage(e.code)
    } finally {
        isLoading.value = false
    }
}

const handleRegister = async () => {
    error.value = ''

    // Password confirmation check
    if (registerForm.password !== registerForm.confirmPassword) {
        error.value = 'Passwords do not match'
        return
    }

    isLoading.value = true
    try {
        await registerWithEmail(registerForm.email, registerForm.password, registerForm.name)
        closeAuthModal()
    } catch (e: any) {
        error.value = getErrorMessage(e.code)
    } finally {
        isLoading.value = false
    }
}

const handleGoogleSignIn = async () => {
    error.value = ''
    isLoading.value = true
    try {
        await signInWithGoogle()
        closeAuthModal()
    } catch (e: any) {
        error.value = getErrorMessage(e.code)
    } finally {
        isLoading.value = false
    }
}

const getErrorMessage = (code: string): string => {
    const messages: Record<string, string> = {
        'auth/email-already-in-use': 'This email is already registered',
        'auth/invalid-email': 'Invalid email address',
        'auth/weak-password': 'Password should be at least 6 characters',
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/invalid-credential': 'Invalid email or password',
        'auth/too-many-requests': 'Too many attempts. Please try again later',
        'auth/popup-closed-by-user': 'Sign in was cancelled'
    }
    return messages[code] || 'An error occurred. Please try again.'
}

// Reset forms when tab changes
watch(activeTab, () => {
    error.value = ''
    loginForm.email = ''
    loginForm.password = ''
    registerForm.name = ''
    registerForm.email = ''
    registerForm.password = ''
    registerForm.confirmPassword = ''
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
    transform: scale(0.95) translateY(-20px);
}
</style>
