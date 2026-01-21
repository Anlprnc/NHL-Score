export interface ScoringPlay {
  id: string
  period: number
  periodDisplayValue: string
  clock: string
  team: {
    id: string
    name: string
    abbreviation: string
    logo: string
  }
  scoringType: string
  goalScorer: {
    name: string
    id: string
    headshot?: string
  }
  assists: {
    name: string
    id: string
  }[]
  awayScore: number
  homeScore: number
}

export interface PeriodScore {
  period: number
  displayValue: string
  homeScore: string
  awayScore: string
}

export interface TeamStats {
  name: string
  value: string
}

export interface GameDetails {
  id: string
  name: string
  shortName: string
  date: string
  venue: string
  attendance?: string
  status: {
    type: string
    state: string
    detail: string
    shortDetail: string
    completed: boolean
    period: number
    clock: string
  }
  homeTeam: {
    id: string
    name: string
    abbreviation: string
    displayName: string
    logo: string
    score: string
    winner: boolean
    record?: string
    color?: string
  }
  awayTeam: {
    id: string
    name: string
    abbreviation: string
    displayName: string
    logo: string
    score: string
    winner: boolean
    record?: string
    color?: string
  }
  scoringPlays: ScoringPlay[]
  periodScores: PeriodScore[]
  teamStats: {
    home: TeamStats[]
    away: TeamStats[]
  }
}

export const useGameDetails = (gameId: string) => {
  const game = ref<GameDetails | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchGameDetails = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/summary?event=${gameId}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch game details')
      }

      const data = await response.json()
      
      const competition = data.header?.competitions?.[0]
      const homeCompetitor = competition?.competitors?.find((c: any) => c.homeAway === 'home')
      const awayCompetitor = competition?.competitors?.find((c: any) => c.homeAway === 'away')

      // Parse scoring plays
      const scoringPlays: ScoringPlay[] = data.scoringPlays?.map((play: any) => ({
        id: play.id,
        period: play.period?.number || 0,
        periodDisplayValue: play.period?.displayValue || '',
        clock: play.clock?.displayValue || '',
        team: {
          id: play.team?.id || '',
          name: play.team?.displayName || play.team?.name || '',
          abbreviation: play.team?.abbreviation || '',
          logo: play.team?.logo || ''
        },
        scoringType: play.scoringType?.displayName || play.type?.text || 'Goal',
        goalScorer: {
          name: play.athletesInvolved?.[0]?.displayName || 'Unknown',
          id: play.athletesInvolved?.[0]?.id || '',
          headshot: play.athletesInvolved?.[0]?.headshot?.href
        },
        assists: play.athletesInvolved?.slice(1).map((a: any) => ({
          name: a.displayName || '',
          id: a.id || ''
        })) || [],
        awayScore: play.awayScore || 0,
        homeScore: play.homeScore || 0
      })) || []

      // Parse period scores from linescores
      const periodScores: PeriodScore[] = []
      const homeLinescores = homeCompetitor?.linescores || []
      const awayLinescores = awayCompetitor?.linescores || []
      
      for (let i = 0; i < Math.max(homeLinescores.length, awayLinescores.length); i++) {
        periodScores.push({
          period: i + 1,
          displayValue: i < 3 ? `P${i + 1}` : (i === 3 ? 'OT' : `OT${i - 2}`),
          homeScore: homeLinescores[i]?.displayValue || '-',
          awayScore: awayLinescores[i]?.displayValue || '-'
        })
      }

      // Parse team stats
      const boxscoreTeams = data.boxscore?.teams || []
      const homeStats = boxscoreTeams.find((t: any) => t.team?.id === homeCompetitor?.team?.id)?.statistics || []
      const awayStats = boxscoreTeams.find((t: any) => t.team?.id === awayCompetitor?.team?.id)?.statistics || []

      game.value = {
        id: gameId,
        name: data.header?.gameNote || `${awayCompetitor?.team?.displayName} @ ${homeCompetitor?.team?.displayName}`,
        shortName: `${awayCompetitor?.team?.abbreviation} @ ${homeCompetitor?.team?.abbreviation}`,
        date: competition?.date || '',
        venue: data.gameInfo?.venue?.fullName || '',
        attendance: data.gameInfo?.attendance?.toLocaleString(),
        status: {
          type: competition?.status?.type?.name || '',
          state: competition?.status?.type?.state || '',
          detail: competition?.status?.type?.detail || '',
          shortDetail: competition?.status?.type?.shortDetail || '',
          completed: competition?.status?.type?.completed || false,
          period: competition?.status?.period || 0,
          clock: competition?.status?.displayClock || '0:00'
        },
        homeTeam: {
          id: homeCompetitor?.team?.id || '',
          name: homeCompetitor?.team?.name || '',
          abbreviation: homeCompetitor?.team?.abbreviation || '',
          displayName: homeCompetitor?.team?.displayName || '',
          logo: homeCompetitor?.team?.logos?.[0]?.href || homeCompetitor?.team?.logo || '',
          score: homeCompetitor?.score || '0',
          winner: homeCompetitor?.winner || false,
          record: homeCompetitor?.record?.[0]?.displayValue,
          color: homeCompetitor?.team?.color
        },
        awayTeam: {
          id: awayCompetitor?.team?.id || '',
          name: awayCompetitor?.team?.name || '',
          abbreviation: awayCompetitor?.team?.abbreviation || '',
          displayName: awayCompetitor?.team?.displayName || '',
          logo: awayCompetitor?.team?.logos?.[0]?.href || awayCompetitor?.team?.logo || '',
          score: awayCompetitor?.score || '0',
          winner: awayCompetitor?.winner || false,
          record: awayCompetitor?.record?.[0]?.displayValue,
          color: awayCompetitor?.team?.color
        },
        scoringPlays,
        periodScores,
        teamStats: {
          home: homeStats.map((s: any) => ({ name: s.label || s.name, value: s.displayValue })),
          away: awayStats.map((s: any) => ({ name: s.label || s.name, value: s.displayValue }))
        }
      }
    } catch (e: any) {
      error.value = e.message || 'An error occurred'
      console.error('Error fetching game details:', e)
    } finally {
      loading.value = false
    }
  }

  // Auto-refresh for live games
  let refreshInterval: NodeJS.Timeout | null = null

  const startAutoRefresh = () => {
    if (refreshInterval) return
    refreshInterval = setInterval(() => {
      if (game.value?.status.state === 'in') {
        fetchGameDetails()
      }
    }, 15000) // Refresh every 15 seconds for live games
  }

  const stopAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval)
      refreshInterval = null
    }
  }

  onMounted(() => {
    fetchGameDetails()
    startAutoRefresh()
  })

  onUnmounted(() => {
    stopAutoRefresh()
  })

  return {
    game,
    loading,
    error,
    fetchGameDetails
  }
}
