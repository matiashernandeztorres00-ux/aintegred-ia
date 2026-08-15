AINTEGRED - IA INDEPENDIENTE

Esta versión ya no usa PluginsSystem de Site123 para las respuestas de texto.
El navegador habla con TU servidor mediante POST /api/chat y el servidor habla con el proveedor de IA.

IMPORTANTE
- La API key NUNCA se coloca en index.html, app.js ni local-ai.js.
- Esta versión usa la Responses API de OpenAI desde el backend.
- Esto elimina la dependencia de los créditos de IA de Site123, pero el proveedor de IA puede cobrar por su API.
- Si quieres una IA 100% local/sin proveedor externo, se puede cambiar el backend por Ollama u otro modelo local.

INSTALAR EN TU PC
1. Instala Node.js.
2. Abre una terminal dentro de esta carpeta.
3. Ejecuta: npm install
4. Copia .env.example a .env
5. Abre .env y coloca tu OPENAI_API_KEY.
6. Ejecuta: npm start
7. Abre: http://localhost:3000
8. Comprueba: http://localhost:3000/api/health

Si /api/health muestra ai_configured:true, el backend está configurado.

PUBLICARLO
Site123 no ejecuta este backend de Node. Si quieres que tu web siga alojada en Site123, debes alojar este backend en un servicio que ejecute Node.js y cambiar scripts/ai-config.js:

window.AI_API_URL = 'https://TU-BACKEND.example.com';

También configura CORS_ORIGIN en el backend con el dominio exacto de tu web.

SEGURIDAD
- No publiques .env.
- No compartas tu OPENAI_API_KEY.
- El servidor incluye un límite básico de solicitudes por IP para evitar abusos accidentales.
