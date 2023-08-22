// @ts-check

export async function getReleases(perPage = 100) {
  const apiUrl = `https://api.github.com/repos/vercel/next.js/releases?per_page=${perPage}`
  try {
    const response = await fetch(apiUrl)
    const data = await response.json()
    return data.map((release) => release.tag_name).reverse()
  } catch (error) {
    console.error(`Error fetching releases: ${error.message}`)
    return []
  }
}
