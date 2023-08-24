#!/usr/bin/env node
// @ts-check

import readline from "node:readline"
import { execaCommand, execa } from "execa"
import { Command } from "commander"

import { getReleases } from "./versions.js"
import { bold, gray } from "yoctocolors"
import { red } from "yoctocolors"

/** @type {import("execa").ExecaChildProcess<string> | null} */
let runningChildProcess = null
let version = null

const rl = readline
  .createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  .on("SIGINT", () => {
    if (runningChildProcess) {
      // Kill the child process if the user presses Ctrl+C
      runningChildProcess?.kill("SIGINT")
      runningChildProcess = null
    } else {
      process.exit(0)
    }
  })

async function search(versions, start, end, onSuccess, command) {
  if (start > end) {
    onSuccess(version)
    return rl.close()
  }

  const mid = Math.floor((start + end) / 2)
  console.log(
    gray(
      `Max remaining iterations: ${bold(Math.ceil(Math.log2(mid)).toString())}`
    )
  )
  version = versions[mid]

  try {
    await installUpdate(version)

    if (command === "dev") {
      console.log("🏃 Running `next dev`...\n")
      runningChildProcess = execaCommand("pnpm next dev", { stdio: "inherit" })
      await runningChildProcess
    } else {
      console.log(
        "🏗️ Building with `next build` and start with `next start`...\n"
      )

      runningChildProcess = execaCommand("pnpm next build", {
        stdio: "inherit",
      })
      await runningChildProcess.catch((e) => {
        console.error(red(`Build failed: ${e.message}`))
      })
      runningChildProcess = execaCommand("pnpm next start", {
        stdio: "inherit",
      })
      await runningChildProcess.catch((e) => {
        console.error(red(`Start failed: ${e.message}`))
      })
    }
  } catch (error) {
    if (error.killed) {
      rl.question(
        `\n❓ Did version "${version}" work? (${bold("y")}/n): `,
        (answer) => {
          if (!answer || answer.toLowerCase() === "n") {
            return search(versions, start, mid - 1, onSuccess, command)
          }
          return search(versions, mid + 1, end, onSuccess, command)
        }
      )
    } else {
      throw error
    }
  }
}

const opts = new Command("nisect")
  .option("-D, --dev", "run 'next dev'", true)
  .option("-P, --production", "run 'next build && next start'")
  .option("--per-page <number>", "number of last releases to search in", "100")
  .parse(process.argv)
  .opts()

console.log("🔎 Searching for the first broken version of Next.js")
const releases = await getReleases(opts.perPage)

await search(
  releases,
  0,
  releases.length - 1,
  function onSuccess(foundVersion) {
    if (foundVersion !== null) {
      console.log(
        `🎉 Success! Check the release notes: https://github.com/vercel/next.js/releases/tag/${foundVersion}`
      )
    } else {
      console.log("❌ No matching version found.")
    }
  },
  opts.production ? "prod" : "dev"
)
async function installUpdate(version) {
  console.log(gray(`\n♻ Updating \`next\` to version "${version}"...\n`))
  await execa("pnpm", ["i", `next@${version}`], { stdio: "inherit" })
  console.log(gray(`\n\`next\` updated to version "${version}"\n`))
}
