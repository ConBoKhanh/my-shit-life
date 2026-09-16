import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function jsonDatabasePlugin(): Plugin {
  return {
    name: 'json-database-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/db' && req.method === 'GET') {
          try {
            const dataPath = path.resolve(__dirname, 'src/data/initialData.json')
            const content = fs.readFileSync(dataPath, 'utf-8')
            res.setHeader('Content-Type', 'application/json')
            res.end(content)
          } catch (e) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: String(e) }))
          }
          return
        }

        if (req.url === '/api/db' && req.method === 'POST') {
          let body = ''
          req.on('data', chunk => {
            body += chunk
          })
          req.on('end', () => {
            try {
              const dataPath = path.resolve(__dirname, 'src/data/initialData.json')
              const parsed = JSON.parse(body)
              fs.writeFileSync(dataPath, JSON.stringify(parsed, null, 2), 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true }))
            } catch (e) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: String(e) }))
            }
          })
          return
        }

        next()
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), jsonDatabasePlugin()],
})

