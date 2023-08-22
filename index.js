#!/usr/bin/env node
// @ts-check

import readline from "node:readline"
import { execaCommand, execa } from "execa"
import { Command } from "commander"

import { getReleases } from "./versions.js"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

async function update(version) {
  const dependencyName = "next"
  try {
    await execa("pnpm", ["i", `${dependencyName}@${version}`], {
      stdio: "inherit",
    })
    console.log(`Dependency ${dependencyName} updated to version ${version}`)
  } catch (error) {
    console.error(`Error updating or installing packages: ${error.message}`)
  }
}

let version = null

/** @type {import("execa").ExecaChildProcess<string> | null} */
let runningChildProcess = null

async function search(versions, start, end, onSuccess, command) {
  if (start > end) {
    onSuccess(version)
    return rl.close()
  }

  const mid = Math.floor((start + end) / 2)
  const currentVersion = versions[mid]
  version = currentVersion

  await update(currentVersion)

  runningChildProcess = execaCommand(command, { stdio: "inherit" })

  try {
    await runningChildProcess
  } catch (error) {
    if (error.killed) {
      rl.question(`Does version ${currentVersion} work? (y/n): `, (answer) => {
        if (answer.toLowerCase() === "y") {
          search(versions, mid + 1, end, onSuccess, command)
        } else {
          search(versions, start, mid - 1, onSuccess, command)
        }
      })
    } else {
      throw error
    }
  }
}

rl.on("SIGINT", () => {
  if (runningChildProcess) {
    runningChildProcess?.kill("SIGINT")
    runningChildProcess = null
  } else {
    process.exit(0)
  }
})

const opts = new Command("nisect")
  .option(
    "-C, --command <command>",
    "command to run between version bumps",
    "pnpm next dev"
  )
  .option("--per-page <number>", "number of last releases to search in", "100")
  .parse(process.argv)
  .opts()

const releases = await getReleases(opts.perPage)

console.log(
  [
    "Let's find the first broken release.",
    `Searching in ${releases.length} releases, between ${releases.at(
      0
    )} and ${releases.at(-1)}`,
  ].join("\n")
)

await search(
  releases,
  0,
  releases.length - 1,
  function onSuccess(foundVersion) {
    if (foundVersion !== null) {
      console.log(`Success! Found the version: ${foundVersion}`)
    } else {
      console.log("No matching version found.")
    }
  },
  opts.command
)
