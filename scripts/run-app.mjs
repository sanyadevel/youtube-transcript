import { spawn } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectDir = fileURLToPath(new URL('../', import.meta.url))
const mode = process.argv[2]

function resolvePython() {
  if (process.env.PYTHON) {
    return { command: process.env.PYTHON, prefixArgs: [] }
  }

  if (process.platform === 'win32') {
    const installDir = process.env.LOCALAPPDATA
      ? join(process.env.LOCALAPPDATA, 'Programs', 'Python')
      : ''

    if (installDir && existsSync(installDir)) {
      const installs = readdirSync(installDir)
        .filter((name) => /^Python\d+(?:\.\d+)?$/i.test(name))
        .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))

      for (const install of installs) {
        const executable = join(installDir, install, 'python.exe')
        if (existsSync(executable)) return { command: executable, prefixArgs: [] }
      }
    }

    return { command: 'python', prefixArgs: [] }
  }

  return { command: 'python3', prefixArgs: [] }
}

if (!['dev', 'production'].includes(mode)) {
  console.error('Usage: node scripts/run-app.mjs <dev|production>')
  process.exit(1)
}

const python = resolvePython()
const pythonPort = mode === 'dev' ? '8765' : '3000'
const children = []
let stopping = false

function stopChildren(exitCode = 0) {
  if (stopping) return
  stopping = true
  for (const child of children) {
    if (child.exitCode === null && !child.killed) child.kill()
  }
  process.exitCode = exitCode
}

function start(command, args, label) {
  const child = spawn(command, args, { cwd: projectDir, stdio: 'inherit' })
  children.push(child)
  child.on('error', (error) => {
    console.error(`${label} failed to start: ${error.message}`)
    stopChildren(1)
  })
  child.on('exit', (code, signal) => {
    if (stopping) return
    if (code !== 0) {
      console.error(`${label} exited${signal ? ` after ${signal}` : ` with code ${code}`}.`)
      stopChildren(code ?? 1)
    } else if (mode === 'production' || label === 'Vite') {
      stopChildren(0)
    }
  })
  return child
}

process.on('SIGINT', () => stopChildren(0))
process.on('SIGTERM', () => stopChildren(0))

console.log(`Starting Python API on port ${pythonPort}...`)
start(python.command, [...python.prefixArgs, 'server.py', '--port', pythonPort], 'Python API')

if (mode === 'dev') {
  console.log('Starting Vite on port 3000...')
  start(process.execPath, [join(projectDir, 'node_modules', 'vite', 'bin', 'vite.js')], 'Vite')
} else {
  console.log('Production app will be available at http://localhost:3000')
}
