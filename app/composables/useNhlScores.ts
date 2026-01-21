export interface Team {
  id: string
  name: string
  abbreviation: string
  displayName: string
  shortDisplayName: string
  logo: string
  score: string
  winner: boolean
  record?: string
}

export interface Odds {
  provider: string
  homeOdds: string
  awayOdds: string
  spread?: string
  overUnder?: string
}

export interface Game {
  id: string
  name: string
  shortName: string
  date: string
  status: {
    type: string
    state: string
    detail: string
    shortDetail: string
    completed: boolean
    period: number
    clock: string
  }
  homeTeam: Team
  awayTeam: Team
  venue?: string
  broadcasts?: string[]
  odds?: Odds
}

export type DateFilter = 'today' | 'tomorrow' | 'yesterday'

export const useNhlScores = () => {
  const games = ref<Game[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)
  const selectedDate = ref<DateFilter>('today')

  // Format date to YYYYMMDD
  const formatDateParam = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}${month}${day}`
  }

  // Get date based on filter
  const getDateForFilter = (filter: DateFilter): Date => {
    const date = new Date()
    switch (filter) {
      case 'yesterday':
        date.setDate(date.getDate() - 1)
        break
      case 'tomorrow':
        date.setDate(date.getDate() + 1)
        break
      default:
        // today - no change needed
        break
    }
    return date
  }

  // Get formatted date string for display
  const getDisplayDate = (filter: DateFilter): string => {
    const date = getDateForFilter(filter)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short', 
      day: 'numeric'
    })
  }

  const fetchScores = async (dateFilter?: DateFilter) => {
    if (dateFilter) {
      selectedDate.value = dateFilter
    }
    
    loading.value = true
    error.value = null

    try {
      const date = getDateForFilter(selectedDate.value)
      const dateParam = formatDateParam(date)
      
      console.log('Fetching scores for date:', dateParam, `(${selectedDate.value})`)
      
      const response = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard?dates=${dateParam}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch scores')
      }

      const data = await response.json()
      
      console.log('Scoreboard API response:', data)
      
      games.value = data.events?.map((event: any) => {
        const competition = event.competitions?.[0]
        const homeCompetitor = competition?.competitors?.find((c: any) => c.homeAway === 'home')
        const awayCompetitor = competition?.competitors?.find((c: any) => c.homeAway === 'away')

        // Parse odds
        let oddsData: Odds | undefined = undefined
        const oddsInfo = competition?.odds?.[0]
        if (oddsInfo) {
          oddsData = {
            provider: oddsInfo.provider?.name || 'Unknown',
            homeOdds: oddsInfo.homeTeamOdds?.moneyLine?.toString() || '-',
            awayOdds: oddsInfo.awayTeamOdds?.moneyLine?.toString() || '-',
            spread: oddsInfo.spread?.toString() || oddsInfo.details,
            overUnder: oddsInfo.overUnder?.toString()
          }
        }

        return {
          id: event.id,
          name: event.name,
          shortName: event.shortName,
          date: event.date,
          status: {
            type: event.status?.type?.name || '',
            state: event.status?.type?.state || '',
            detail: event.status?.type?.detail || '',
            shortDetail: event.status?.type?.shortDetail || '',
            completed: event.status?.type?.completed || false,
            period: event.status?.period || 0,
            clock: event.status?.displayClock || '0:00'
          },
          homeTeam: {
            id: homeCompetitor?.team?.id || '',
            name: homeCompetitor?.team?.name || '',
            abbreviation: homeCompetitor?.team?.abbreviation || '',
            displayName: homeCompetitor?.team?.displayName || '',
            shortDisplayName: homeCompetitor?.team?.shortDisplayName || '',
            logo: homeCompetitor?.team?.logo || '',
            score: homeCompetitor?.score || '0',
            winner: homeCompetitor?.winner || false,
            record: homeCompetitor?.records?.[0]?.summary
          },
          awayTeam: {
            id: awayCompetitor?.team?.id || '',
            name: awayCompetitor?.team?.name || '',
            abbreviation: awayCompetitor?.team?.abbreviation || '',
            displayName: awayCompetitor?.team?.displayName || '',
            shortDisplayName: awayCompetitor?.team?.shortDisplayName || '',
            logo: awayCompetitor?.team?.logo || '',
            score: awayCompetitor?.score || '0',
            winner: awayCompetitor?.winner || false,
            record: awayCompetitor?.records?.[0]?.summary
          },
          venue: competition?.venue?.fullName,
          broadcasts: competition?.broadcasts?.map((b: any) => b.names?.join(', ')).filter(Boolean),
          odds: oddsData
        }
      }) || []

      lastUpdated.value = new Date()
    } catch (e: any) {
      error.value = e.message || 'An error occurred'
      console.error('Error fetching NHL scores:', e)
    } finally {
      loading.value = false
    }
  }

  // Auto-refresh every 30 seconds
  let refreshInterval: NodeJS.Timeout | null = null

  const startAutoRefresh = () => {
    if (refreshInterval) return
    refreshInterval = setInterval(fetchScores, 30000)
  }

  const stopAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval)
      refreshInterval = null
    }
  }

  onMounted(() => {
    fetchScores()
    startAutoRefresh()
  })

  onUnmounted(() => {
    stopAutoRefresh()
  })

  return {
    games,
    loading,
    error,
    lastUpdated,
    selectedDate,
    fetchScores,
    getDisplayDate,
    startAutoRefresh,
    stopAutoRefresh
  }
}
