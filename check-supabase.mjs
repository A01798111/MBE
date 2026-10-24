import { loadEnv } from 'vite';

const env = loadEnv('development', process.cwd(), 'VITE_');
const supabaseUrl = env.VITE_SUPABASE_URL;
const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !publishableKey) {
  console.error(
    'Faltan VITE_SUPABASE_URL o VITE_SUPABASE_PUBLISHABLE_KEY. Configúralas en .env.local.'
  );
  process.exit(1);
}

let projectUrl;
try {
  projectUrl = new URL(supabaseUrl);
} catch {
  console.error('VITE_SUPABASE_URL no es una URL válida.');
  process.exit(1);
}

const isLocalhost = ['localhost', '127.0.0.1', '[::1]'].includes(projectUrl.hostname);
if (projectUrl.protocol !== 'https:' && !(isLocalhost && projectUrl.protocol === 'http:')) {
  console.error('La URL de Supabase debe usar HTTPS.');
  process.exit(1);
}

projectUrl.pathname = '/auth/v1/settings';
projectUrl.search = '';
projectUrl.hash = '';

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 10000);

try {
  const response = await fetch(projectUrl, {
    headers: { apikey: publishableKey },
    signal: controller.signal
  });

  if (!response.ok) {
    console.error(`Supabase respondió con HTTP ${response.status}. Revisa URL y clave.`);
    process.exitCode = 1;
  } else {
    console.log('Conexión correcta: el endpoint de Auth de Supabase respondió correctamente.');
    console.log('Esta prueba no consulta ni modifica tablas o datos.');
  }
} catch (error) {
  if (error.name === 'AbortError') {
    console.error('La conexión excedió el límite de 10 segundos.');
  } else {
    console.error(`No se pudo conectar con Supabase: ${error.message}`);
  }
  process.exitCode = 1;
} finally {
  clearTimeout(timeout);
}
