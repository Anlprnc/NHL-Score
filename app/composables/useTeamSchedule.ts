export interface ScheduleGame {
  id: string
  date: string
  name: string
  shortName: string
  homeAway: 'home' | 'away'
  opponent: {
    id: string
    name: string
    abbreviation: string
    displayName: string
    logo: string
  }
  venue: string
  result?: {
    teamScore: number
    opponentScore: number
    winner: boolean
  }
  status: {
    state: string
    detail: string
    shortDetail: string
    completed: boolean
  }
  tickets?: {
    summary: string
    link: string
  }
  broadcasts?: string[]
}

export interface TeamScheduleInfo {
  id: string
  name: string
  displayName: string
  abbreviation: string
  logo: string
  color: string
  record: string
  standing: string
}

export const useTeamSchedule = (teamId: string) => {
  const games = ref<ScheduleGame[]>([])
  const team = ref<TeamScheduleInfo | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchSchedule = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams/${teamId}/schedule`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch schedule')
      }

      const data = await response.json()
      
      console.log('Team Schedule API response:', data)

      // Parse team info
      if (data.team) {
        team.value = {
          id: data.team.id || '',
          name: data.team.name || '',
          displayName: data.team.displayName || '',
          abbreviation: data.team.abbreviation || '',
          logo: data.team.logo || '',
          color: data.team.color || '000000',
          record: data.team.recordSummary || '',
          standing: data.team.standingSummary || ''
        }
      }

      // Parse games
      games.value = data.events?.map((event: any) => {
        const competition = event.competitions?.[0]
        const competitors = competition?.competitors || []
        
        // Find team and opponent
        const teamCompetitor = competitors.find((c: any) => c.team?.id === teamId)
        const opponentCompetitor = competitors.find((c: any) => c.team?.id !== teamId)
        
        const homeAway = teamCompetitor?.homeAway || 'home'
        const opponent = opponentCompetitor?.team || {}
        
        // Get result if game is completed
        let result = undefined
        if (competition?.status?.type?.completed) {
          const teamScore = parseFloat(teamCompetitor?.score?.value || teamCompetitor?.score?.displayValue || '0')
          const opponentScore = parseFloat(opponentCompetitor?.score?.value || opponentCompetitor?.score?.displayValue || '0')
          result = {
            teamScore,
            opponentScore,
            winner: teamCompetitor?.winner || false
          }
        }

        // Get tickets
        let tickets = undefined
        const ticketInfo = competition?.tickets?.[0]
        if (ticketInfo) {
          tickets = {
            summary: ticketInfo.summary || '',
            link: ticketInfo.links?.find((l: any) => l.rel?.includes('event'))?.href || ''
          }
        }

        // Get broadcasts
        const broadcasts = competition?.broadcasts?.map((b: any) => b.media?.shortName).filter(Boolean) || []

        return {
          id: event.id,
          date: event.date,
          name: event.name,
          shortName: event.shortName,
          homeAway,
          opponent: {
            id: opponent.id || '',
            name: opponent.name || opponent.nickname || '',
            abbreviation: opponent.abbreviation || '',
            displayName: opponent.displayName || '',
            logo: opponent.logos?.[0]?.href || opponent.logo || ''
          },
          venue: competition?.venue?.fullName || '',
          result,
          status: {
            state: competition?.status?.type?.state || 'pre',
            detail: competition?.status?.type?.detail || '',
            shortDetail: competition?.status?.type?.shortDetail || '',
            completed: competition?.status?.type?.completed || false
          },
          tickets,
          broadcasts
        }
      }) || []

    } catch (e: any) {
      error.value = e.message || 'An error occurred'
      console.error('Error fetching team schedule:', e)
    } finally {
      loading.value = false
    }
  }

  // Computed properties for filtering
  const upcomingGames = computed(() => 
    games.value.filter(g => g.status.state === 'pre')
  )
  
  const completedGames = computed(() => 
    games.value.filter(g => g.status.completed).reverse()
  )

  const nextGame = computed(() => upcomingGames.value[0] || null)

  const record = computed(() => {
    const wins = completedGames.value.filter(g => g.result?.winner).length
    const losses = completedGames.value.filter(g => g.result && !g.result.winner).length
    return { wins, losses }
  })

  onMounted(() => {
    fetchSchedule()
  })

  return {
    games,
    team,
    loading,
    error,
    upcomingGames,
    completedGames,
    nextGame,
    record,
    fetchSchedule
  }
}
