import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  onSnapshot
} from 'firebase/firestore'

export interface FavoriteTeam {
  id: number
  name: string
  abbrev: string
  logo: string
  addedAt: number
}

export interface FavoriteGame {
  id: number
  homeTeam: {
    id: number
    name: string
    abbrev: string
    logo: string
    score?: number
  }
  awayTeam: {
    id: number
    name: string
    abbrev: string
    logo: string
    score?: number
  }
  startTime: string
  gameState: string
  addedAt: number
  notified?: boolean
}

export const useFavorites = () => {
  const { $firestore } = useNuxtApp()
  const { user } = useAuth()
  
  const favoriteTeams = useState<FavoriteTeam[]>('favorite-teams', () => [])
  const favoriteGames = useState<FavoriteGame[]>('favorite-games', () => [])
  const loading = useState('favorites-loading', () => false)

  // Get user's favorites document reference
  const getUserDocRef = () => {
    if (!user.value || !$firestore) return null
    return doc($firestore, 'users', user.value.uid)
  }

  // Initialize favorites listener
  const initFavorites = () => {
    const docRef = getUserDocRef()
    if (!docRef) {
      favoriteTeams.value = []
      favoriteGames.value = []
      return
    }

    loading.value = true

    // Real-time listener
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data()
        favoriteTeams.value = data.favoriteTeams || []
        favoriteGames.value = data.favoriteGames || []
        
        // Clean up finished games
        cleanupFinishedGames()
      } else {
        favoriteTeams.value = []
        favoriteGames.value = []
      }
      loading.value = false
    }, (error) => {
      console.error('Favorites listener error:', error)
      loading.value = false
    })

    // Return unsubscribe function for cleanup
    return unsubscribe
  }

  // Add team to favorites
  const addFavoriteTeam = async (team: Omit<FavoriteTeam, 'addedAt'>) => {
    const docRef = getUserDocRef()
    if (!docRef) return false

    const favoriteTeam: FavoriteTeam = {
      ...team,
      addedAt: Date.now()
    }

    try {
      const snapshot = await getDoc(docRef)
      if (snapshot.exists()) {
        await updateDoc(docRef, {
          favoriteTeams: arrayUnion(favoriteTeam)
        })
      } else {
        await setDoc(docRef, {
          favoriteTeams: [favoriteTeam],
          favoriteGames: []
        })
      }
      return true
    } catch (error) {
      console.error('Error adding favorite team:', error)
      return false
    }
  }

  // Remove team from favorites
  const removeFavoriteTeam = async (teamId: number) => {
    const docRef = getUserDocRef()
    if (!docRef) return false

    const teamToRemove = favoriteTeams.value.find(t => t.id === teamId)
    if (!teamToRemove) return false

    try {
      await updateDoc(docRef, {
        favoriteTeams: arrayRemove(teamToRemove)
      })
      return true
    } catch (error) {
      console.error('Error removing favorite team:', error)
      return false
    }
  }

  // Check if team is favorite
  const isTeamFavorite = (teamId: number) => {
    return favoriteTeams.value.some(t => t.id === teamId)
  }

  // Toggle team favorite
  const toggleFavoriteTeam = async (team: Omit<FavoriteTeam, 'addedAt'>) => {
    if (isTeamFavorite(team.id)) {
      return await removeFavoriteTeam(team.id)
    } else {
      return await addFavoriteTeam(team)
    }
  }

  // Add game to favorites
  const addFavoriteGame = async (game: Omit<FavoriteGame, 'addedAt' | 'notified'>) => {
    const docRef = getUserDocRef()
    if (!docRef) return false

    const favoriteGame: FavoriteGame = {
      ...game,
      addedAt: Date.now(),
      notified: false
    }

    try {
      const snapshot = await getDoc(docRef)
      if (snapshot.exists()) {
        await updateDoc(docRef, {
          favoriteGames: arrayUnion(favoriteGame)
        })
      } else {
        await setDoc(docRef, {
          favoriteTeams: [],
          favoriteGames: [favoriteGame]
        })
      }
      return true
    } catch (error) {
      console.error('Error adding favorite game:', error)
      return false
    }
  }

  // Remove game from favorites
  const removeFavoriteGame = async (gameId: number) => {
    const docRef = getUserDocRef()
    if (!docRef) return false

    const gameToRemove = favoriteGames.value.find(g => g.id === gameId)
    if (!gameToRemove) return false

    try {
      await updateDoc(docRef, {
        favoriteGames: arrayRemove(gameToRemove)
      })
      return true
    } catch (error) {
      console.error('Error removing favorite game:', error)
      return false
    }
  }

  // Check if game is favorite
  const isGameFavorite = (gameId: number) => {
    return favoriteGames.value.some(g => g.id === gameId)
  }

  // Toggle game favorite
  const toggleFavoriteGame = async (game: Omit<FavoriteGame, 'addedAt' | 'notified'>) => {
    if (isGameFavorite(game.id)) {
      return await removeFavoriteGame(game.id)
    } else {
      return await addFavoriteGame(game)
    }
  }

  // Clean up finished games
  const cleanupFinishedGames = async () => {
    const docRef = getUserDocRef()
    if (!docRef) return

    const finishedGames = favoriteGames.value.filter(g => 
      g.gameState === 'OFF' || g.gameState === 'FINAL'
    )

    if (finishedGames.length === 0) return

    try {
      for (const game of finishedGames) {
        await updateDoc(docRef, {
          favoriteGames: arrayRemove(game)
        })
      }
    } catch (error) {
      console.error('Error cleaning up finished games:', error)
    }
  }

  // Mark game as notified
  const markGameNotified = async (gameId: number) => {
    const docRef = getUserDocRef()
    if (!docRef) return

    const gameIndex = favoriteGames.value.findIndex(g => g.id === gameId)
    if (gameIndex === -1) return

    const updatedGames = [...favoriteGames.value]
    const oldGame = updatedGames[gameIndex]
    updatedGames[gameIndex] = { ...oldGame, notified: true }

    try {
      await updateDoc(docRef, {
        favoriteGames: updatedGames
      })
    } catch (error) {
      console.error('Error marking game notified:', error)
    }
  }

  // Get upcoming games that need notification
  const getGamesNeedingNotification = () => {
    const now = Date.now()
    const fiveMinutes = 5 * 60 * 1000

    return favoriteGames.value.filter(game => {
      if (game.notified) return false
      if (game.gameState !== 'FUT' && game.gameState !== 'PRE') return false
      
      const gameTime = new Date(game.startTime).getTime()
      const timeDiff = gameTime - now
      
      // Notify if game starts within 5 minutes
      return timeDiff > 0 && timeDiff <= fiveMinutes
    })
  }

  return {
    favoriteTeams,
    favoriteGames,
    loading,
    initFavorites,
    addFavoriteTeam,
    removeFavoriteTeam,
    isTeamFavorite,
    toggleFavoriteTeam,
    addFavoriteGame,
    removeFavoriteGame,
    isGameFavorite,
    toggleFavoriteGame,
    cleanupFinishedGames,
    markGameNotified,
    getGamesNeedingNotification
  }
}
