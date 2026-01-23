import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  type User 
} from 'firebase/auth'
import { ref, type Ref } from 'vue'

const globalUser: Ref<User | null> = ref(null)
const globalLoading = ref(true)
const globalAuthModalOpen = ref(false)
let authInitialized = false

export const useAuth = () => {
  const { $auth } = useNuxtApp()

  const updateUser = (newUser: User | null) => {
    globalUser.value = newUser
    globalLoading.value = false
  }

  const initAuth = () => {
    if (!$auth) return
    
    if (authInitialized) {
      if ($auth.currentUser && !globalUser.value) {
        updateUser($auth.currentUser)
      }
      return
    }
    
    authInitialized = true

    if ($auth.currentUser) {
      updateUser($auth.currentUser)
    }

    onAuthStateChanged($auth, (firebaseUser) => {
      updateUser(firebaseUser)
    })
  }

  const signInWithGoogle = async () => {
    if (!$auth) return

    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup($auth, provider)
      updateUser(result.user)
      globalAuthModalOpen.value = false
      return result.user
    } catch (error) {
      console.error('Firebase sign in error:', error)
      throw error
    }
  }

  const registerWithEmail = async (email: string, password: string, displayName: string) => {
    if (!$auth) return

    try {
      const result = await createUserWithEmailAndPassword($auth, email, password)
      await updateProfile(result.user, { displayName })
      await result.user.reload()
      updateUser($auth.currentUser)
      globalAuthModalOpen.value = false
      return result.user
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const loginWithEmail = async (email: string, password: string) => {
    if (!$auth) return

    try {
      const result = await signInWithEmailAndPassword($auth, email, password)
      updateUser(result.user)
      globalAuthModalOpen.value = false
      return result.user
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = async () => {
    if (!$auth) return

    try {
      await signOut($auth)
      updateUser(null)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  const openAuthModal = () => {
    globalAuthModalOpen.value = true
  }

  const closeAuthModal = () => {
    globalAuthModalOpen.value = false
  }

  return {
    user: globalUser,
    loading: globalLoading,
    authModalOpen: globalAuthModalOpen,
    initAuth,
    signInWithGoogle,
    registerWithEmail,
    loginWithEmail,
    logout,
    openAuthModal,
    closeAuthModal
  }
}
