// @ts-check

import { gray } from "yoctocolors"

export async function getReleases(perPage = 100, start, last) {
  const apiUrl = `https://api.github.com/repos/vercel/next.js/releases?per_page=${perPage}`
  try {
    const response = await fetch(apiUrl)
    const data = await response.json()
    /** @type {string[]} */
    const releases = data.map((release) => release.tag_name).reverse()
    if (start) {
      const startIndex = releases.indexOf(start)
      // TODO: recursively fetch more releases if the start version is not found
      if (startIndex === -1)
        throw new Error(`Start version "${start}" not found`)
      releases.splice(0, startIndex)
    }
    if (last) {
      const endIndex = releases.indexOf(last)
      if (endIndex === -1) throw new Error(`Last version "${last}" not found`)
      releases.splice(endIndex + 1)
    }

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
