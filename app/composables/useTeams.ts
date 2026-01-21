export interface Team {
  id: string
  slug: string
  abbreviation: string
  displayName: string
  shortDisplayName: string
  name: string
  nickname: string
  location: string
  color: string
  alternateColor: string
  logo: string
  logoDark: string
  links: {
    clubhouse?: string
    roster?: string
    stats?: string
    schedule?: string
  }
}

export const useTeams = () => {
  const teams = ref<Team[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchTeams = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(
        'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams'
      )

      if (!response.ok) {
        throw new Error('Failed to fetch teams')
      }

      const data = await response.json()

      const teamsData = data.sports?.[0]?.leagues?.[0]?.teams || []

      teams.value = teamsData.map((item: any) => {
        const team = item.team
        const logos = team.logos || []
        
        // Get links
        const links = team.links || []
        const getLink = (rel: string) => links.find((l: any) => l.rel?.includes(rel))?.href

        return {
          id: team.id || '',
          slug: team.slug || '',
          abbreviation: team.abbreviation || '',
          displayName: team.displayName || '',
          shortDisplayName: team.shortDisplayName || '',
          name: team.name || '',
          nickname: team.nickname || '',
          location: team.location || '',
          color: team.color || '000000',
          alternateColor: team.alternateColor || 'ffffff',
          logo: logos.find((l: any) => l.rel?.includes('default'))?.href || logos[0]?.href || '',
          logoDark: logos.find((l: any) => l.rel?.includes('dark'))?.href || logos[0]?.href || '',
          links: {
            clubhouse: getLink('clubhouse'),
            roster: getLink('roster'),
            stats: getLink('stats'),
            schedule: getLink('schedule')
          }
        }
      }).sort((a: Team, b: Team) => a.displayName.localeCompare(b.displayName))

    } catch (e: any) {
      error.value = e.message || 'An error occurred'
      console.error('Error fetching teams:', e)
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchTeams()
  })

  return {
    teams,
    loading,
    error,
    fetchTeams
  }
}
