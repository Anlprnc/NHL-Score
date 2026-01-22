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

let authInitialized = false

export const useAuth = () => {
  const user = useState<User | null>('firebase-user', () => null)
  const loading = useState('auth-loading', () => true)
  const authModalOpen = useState('auth-modal-open', () => false)

  const { $auth } = useNuxtApp()

  const initAuth = () => {
    if (!$auth || authInitialized) return
    authInitialized = true

    if ($auth.currentUser) {
      user.value = $auth.currentUser
      loading.value = false
    }

    onAuthStateChanged($auth, (firebaseUser) => {
      user.value = firebaseUser
      loading.value = false
    })
  }

  const signInWithGoogle = async () => {
    if (!$auth) return

    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup($auth, provider)
      authModalOpen.value = false
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
      authModalOpen.value = false
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
      authModalOpen.value = false
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
      user.value = null
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  const openAuthModal = () => {
    authModalOpen.value = true
  }

  const closeAuthModal = () => {
    authModalOpen.value = false
  }

  return {
    user,
    loading,
    authModalOpen,
    initAuth,
    signInWithGoogle,
    registerWithEmail,
    loginWithEmail,
    logout,
    openAuthModal,
    closeAuthModal
  }
}
