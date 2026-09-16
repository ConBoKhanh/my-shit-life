import { defineConfig, type PluginOption, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function jsonDatabasePlugin(): PluginOption {
  return {
    name: 'json-database-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const urlObj = new URL(req.url || '', 'http://localhost');
        const pathname = urlObj.pathname;

        const dataPath = path.resolve(__dirname, 'src/data/initialData.json');

        const readDbFile = () => {
          try {
            if (fs.existsSync(dataPath)) {
              const content = fs.readFileSync(dataPath, 'utf-8');
              return JSON.parse(content);
            }
          } catch {}
          return { users: {}, defaultStages: [] };
        };

        const writeDbFile = (data: any) => {
          fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
        };

        // 1. GET /api/users or GET /api/db (Full database)
        if ((pathname === '/api/users' || pathname === '/api/db') && req.method === 'GET') {
          try {
            const db = readDbFile();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(db));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: String(e) }));
          }
          return;
        }

        // 2. GET /api/users/:username
        if (pathname.startsWith('/api/users/') && req.method === 'GET') {
          try {
            const rawUsername = pathname.replace('/api/users/', '').trim();
            const username = decodeURIComponent(rawUsername).toLowerCase();
            const db = readDbFile();
            const user = db.users?.[username];
            if (user) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, user }));
            } else {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, message: `User '${username}' not found` }));
            }
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: String(e) }));
          }
          return;
        }

        // 3. POST /api/users (Create or update single user)
        if (pathname === '/api/users' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body);
              const user = payload.user || payload;
              if (!user || !user.username) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Missing user or username' }));
                return;
              }
              const db = readDbFile();
              if (!db.users) db.users = {};
              db.users[user.username] = user;
              writeDbFile(db);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, user }));
            } catch (e) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: String(e) }));
            }
          });
          return;
        }

        // 4. PUT /api/users/:username (Update single user)
        if (pathname.startsWith('/api/users/') && (req.method === 'PUT' || req.method === 'POST')) {
          const rawUsername = pathname.replace('/api/users/', '').trim();
          const username = decodeURIComponent(rawUsername).toLowerCase();
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body);
              const userUpdate = payload.user || payload;
              const db = readDbFile();
              if (!db.users) db.users = {};
              const existingUser = db.users[username] || {};
              const mergedUser = { ...existingUser, ...userUpdate, username };
              db.users[username] = mergedUser;
              writeDbFile(db);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, user: mergedUser }));
            } catch (e) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: String(e) }));
            }
          });
          return;
        }

        // 5. POST /api/db (Full db sync)
        if (pathname === '/api/db' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              writeDbFile(parsed);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (e) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: String(e) }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig((): UserConfig => {
  return {
    plugins: [react(), jsonDatabasePlugin()],
    server: {
      host: true,
      port: 8888,
      strictPort: false,
      watch: {
        ignored: ['**/src/data/initialData.json'],
      },
    },
    preview: {
      host: true,
      port: 8888,
    },
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'vendor-react';
            }
            if (
              id.includes('node_modules/framer-motion') ||
              id.includes('node_modules/lucide-react') ||
              id.includes('node_modules/sonner')
            ) {
              return 'vendor-ui';
            }
            if (id.includes('node_modules/three') || id.includes('node_modules/@react-three')) {
              return 'vendor-three';
            }
          },
        },
      },
    },
  };
});

