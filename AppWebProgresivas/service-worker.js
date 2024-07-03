const nombreCache = 'recetas-cache-v1';
const activosEstaticos = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/pouchdb-9.0.0.min.js',
    '/Icono.png',
    '/manifest.json',
    'https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css'
];

self.addEventListener('install', async evento => {
    const cache = await caches.open(nombreCache);
    await cache.addAll(activosEstaticos);
    self.skipWaiting();
});

self.addEventListener('activate', evento => {
    self.clients.claim();
});

self.addEventListener('fetch', evento => {
    const req = evento.request;

    if (req.url.startsWith('https://img.spoonacular.com')) {
        evento.respondWith(primerRedImagen(req));
    } else {
        evento.respondWith(primerRed(req));
    }
});

async function primerRed(req) {
    const cache = await caches.open(nombreCache);
    try {
        const fresco = await fetch(req);
        cache.put(req, fresco.clone());
        return fresco;
    } catch (e) {
        const respuestaEnCache = await cache.match(req);
       
        return respuestaEnCache || new Response('No tienes conexión a Internet.');
    }
}

async function primerRedImagen(req) {
    const cache = await caches.open(nombreCache);
    try {
        const fresco = await fetch(req);
        if (fresco.ok) {
            cache.put(req, fresco.clone());
        }
        return fresco;
    } catch (e) {
        const respuestaEnCache = await cache.match(req);
       
        return respuestaEnCache || new Response('No tienes conexión a Internet.');
    }
}
