AINTEGRED — IA INDEPENDIENTE LISTA PARA INTERNET

RECOMENDADO: Render

1. Crea una cuenta en Render: https://render.com/
2. Crea un repositorio en GitHub y sube TODO el contenido de esta carpeta.
3. En Render: New -> Web Service.
4. Conecta tu repositorio de GitHub.
5. Render detectará Node.js. Si te pide los comandos:
   Build Command: npm install
   Start Command: npm start
6. En Environment Variables agrega:
   OPENAI_API_KEY = TU_CLAVE_DE_OPENAI
   OPENAI_MODEL = gpt-5.6
7. Pulsa Create Web Service.
8. Espera el deploy y abre la URL *.onrender.com.

IMPORTANTE:
- NO pongas tu API key dentro de index.html, app.js ni ningún archivo que se descargue al navegador.
- La clave debe estar únicamente como variable de entorno OPENAI_API_KEY en Render.
- El sitio y el backend están en el mismo servidor, así que el navegador usa /api/chat automáticamente.
- /api/health permite comprobar si el servidor está funcionando.

PARA GITHUB:
- Sube archivos y carpetas, incluyendo package.json, server.js, index.html, scripts/ y styles/.
- NO subas un archivo .env real con tu API key.

Si usas el archivo render.yaml, Render puede tomar automáticamente el comando de instalación/arranque y la variable OPENAI_MODEL. OPENAI_API_KEY se debe introducir como secreto en el panel de Render.
