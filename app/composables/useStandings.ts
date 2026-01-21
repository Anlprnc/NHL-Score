export interface TeamStanding {
  id: string
  name: string
  abbreviation: string
  displayName: string
  logo: string
  rank: number
  wins: number
  losses: number
  otLosses: number
  points: number
  gamesPlayed: number
  goalsFor: number
  goalsAgainst: number
  goalDiff: number
  streak: string
  homeRecord: string
  awayRecord: string
  last10: string
  pointsPercentage: string
}

export interface Division {
  id: string
  name: string
  teams: TeamStanding[]
}

export interface Conference {
  id: string
  name: string
  divisions: Division[]
}

export const useStandings = () => {
  const conferences = ref<Conference[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchStandings = async () => {
    loading.value = true
    error.value = null

    try {
      // API requires these parameters to return data properly
      const response = await fetch(
        'https://site.api.espn.com/apis/v2/sports/hockey/nhl/standings?region=us&lang=en&contentorigin=espn&type=0&level=3&sort=playoffseed:asc,points:desc,wins:desc'
      )

      if (!response.ok) {
        throw new Error('Failed to fetch standings')
      }

      const data = await response.json()
      
      console.log('Standings API response:', data) // Debug log

      // Parse standings by conference and division
      const children = data.children || []
      
      if (children.length === 0) {
        // Try alternative data structure
        const standings = data.standings || data
        if (standings.entries) {
          // Flat standings structure - group by division
          const entries = standings.entries || []
          const divisionsMap = new Map<string, any[]>()
          
          entries.forEach((entry: any) => {
            const divName = entry.team?.standingSummary?.split(' - ')[0] || 'Division'
            if (!divisionsMap.has(divName)) {
              divisionsMap.set(divName, [])
            }
            divisionsMap.get(divName)!.push(entry)
          })

          // Create a single conference with divisions
          const divisions = Array.from(divisionsMap.entries()).map(([name, teams]) => ({
            id: name,
            name: name,
            teams: teams.map((entry: any, index: number) => parseTeamEntry(entry, index))
          }))

          conferences.value = [{
            id: 'nhl',
            name: 'NHL',
            divisions
          }]
          return
        }
      }
      
      conferences.value = children.map((conf: any) => {
        const divisions = conf.children?.map((div: any) => {
          const entries = div.standings?.entries || []
          const teams = entries.map((entry: any, index: number) => parseTeamEntry(entry, index))

          return {
            id: div.id || div.uid || '',
            name: div.name || div.shortName || '',
            teams
          }
        }) || []

        return {
          id: conf.id || conf.uid || '',
          name: conf.name || conf.shortName || '',
          divisions
        }
      })

    } catch (e: any) {
      error.value = e.message || 'An error occurred'
      console.error('Error fetching standings:', e)
    } finally {
      loading.value = false
    }
  }

  const parseTeamEntry = (entry: any, index: number): TeamStanding => {
    const stats = entry.stats || []
    
    const getStat = (name: string, abbr?: string) => {
      const stat = stats.find((s: any) => 
        s.name === name || 
        s.abbreviation === name || 
        s.abbreviation === abbr ||
        s.shortDisplayName === name ||
        s.shortDisplayName === abbr
      )
      return stat?.value ?? stat?.displayValue ?? 0
    }

    const getStatDisplay = (name: string, abbr?: string) => {
      const stat = stats.find((s: any) => 
        s.name === name || 
        s.abbreviation === name || 
        s.abbreviation === abbr ||
        s.shortDisplayName === name ||
        s.shortDisplayName === abbr
      )
      return stat?.displayValue ?? stat?.value?.toString() ?? '-'
    }

    // Parse numeric stats
    const wins = Number(getStat('wins', 'W')) || 0
    const losses = Number(getStat('losses', 'L')) || 0
    const otLosses = Number(getStat('otLosses', 'OTL')) || Number(getStat('OTL')) || 0
    const points = Number(getStat('points', 'PTS')) || Number(getStat('PTS')) || 0
    const gamesPlayed = Number(getStat('gamesPlayed', 'GP')) || Number(getStat('GP')) || 0
    const goalsFor = Number(getStat('pointsFor', 'GF')) || Number(getStat('GF')) || 0
    const goalsAgainst = Number(getStat('pointsAgainst', 'GA')) || Number(getStat('GA')) || 0
    const goalDiff = Number(getStat('pointDifferential', 'DIFF')) || Number(getStat('differential')) || (goalsFor - goalsAgainst)

    return {
      id: entry.team?.id || '',
      name: entry.team?.name || '',
      abbreviation: entry.team?.abbreviation || '',
      displayName: entry.team?.displayName || entry.team?.name || '',
      logo: entry.team?.logos?.[0]?.href || entry.team?.logo || '',
      rank: index + 1,
      wins,
      losses,
      otLosses,
      points,
      gamesPlayed,
      goalsFor,
      goalsAgainst,
      goalDiff,
      streak: getStatDisplay('streak', 'STRK'),
      homeRecord: getStatDisplay('Home', 'HOME') || getStatDisplay('homeRecord'),
      awayRecord: getStatDisplay('Away', 'AWAY') || getStatDisplay('awayRecord'),
      last10: getStatDisplay('L10') || getStatDisplay('Last Ten Games'),
      pointsPercentage: getStatDisplay('pointsPercentage', 'P%')
    }
  }

  onMounted(() => {
    fetchStandings()
  })

  return {
    conferences,
    loading,
    error,
    fetchStandings
  }
}
