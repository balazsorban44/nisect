// @ts-check

import { gray } from "yoctocolors"

export async function getReleases(perPage = 100) {
  const apiUrl = `https://api.github.com/repos/vercel/next.js/releases?per_page=${perPage}`
  try {
    const response = await fetch(apiUrl)
    const data = await response.json()
    const releases = data.map((release) => release.tag_name).reverse()
    console.log(
      gray(
        `Got ${releases.length} releases, between "${
          releases[0]
        }" and "${releases.at(-1)}"`
      )
    )
    return releases
  } catch (error) {
    console.error(`Error fetching releases: ${error.message}`)
    return []
  }
}
