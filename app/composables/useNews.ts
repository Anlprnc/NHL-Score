export interface NewsArticle {
  id: string
  headline: string
  description: string
  published: string
  image?: string
  link?: string
  type: string
  premium: boolean
}

export const useNews = () => {
  const articles = ref<NewsArticle[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchNews = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(
        'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/news'
      )

      if (!response.ok) {
        throw new Error('Failed to fetch news')
      }

      const data = await response.json()

      articles.value = data.articles?.map((article: any) => ({
        id: article.id || article.dataSourceIdentifier,
        headline: article.headline || '',
        description: article.description || '',
        published: article.published || '',
        image: article.images?.[0]?.url || null,
        link: article.links?.web?.href || article.links?.web?.self?.href || null,
        type: article.type || 'Story',
        premium: article.premium || false
      })) || []

    } catch (e: any) {
      error.value = e.message || 'An error occurred'
      console.error('Error fetching news:', e)
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchNews()
  })

  return {
    articles,
    loading,
    error,
    fetchNews
  }
}
