# 🚨 Emergencias Map - Backend Aggregator (NestJS)

Este es el servidor backend (API) diseñado para **Emergencias Map Chile**, construido sobre [NestJS](https://nestjs.com/). Actúa como un **Agregador de APIs y Scraper** encargado de recolectar, centralizar y normalizar datos en tiempo real de las principales entidades de emergencia de Chile. 

Dado que muchas instituciones chilenas no cuentan con APIs JSON públicas, abiertas y con CORS habilitado, este backend funciona como un proxy y un unificador de formatos para nutrir al frontend de información constante.

---

## 🏛️ Arquitectura y Entidades Integradas

El servidor realiza tareas automáticas (Cron Jobs) en segundo plano para procesar información de distintas fuentes, y expone un único endpoint estandarizado: `/api/v1/incidents`.

Actualmente, incluye integración con los siguientes módulos:

1. **SENAPRED (Ex ONEMI):** Parsea el feed RSS oficial cada 5 minutos para extraer Alertas Tempranas y Alertas Rojas.
2. **Dirección Meteorológica de Chile (DMC):** Consulta avisos meteorológicos (olas de calor, tormentas, nevadas) mediante la API abierta.
3. **Bomberos de Chile:** Escucha despachos a través de la API oficial de Twitter/X (usando un Bearer Token) y geolocaliza las emergencias (como rescates o incendios estructurales).
4. **Superintendencia de Electricidad y Combustibles (SEC):** Actúa como proxy para interceptar y obtener el registro de cortes de luz vigentes a nivel de comunas.
5. **Corporación Nacional Forestal (CONAF):** Consume las capas públicas REST (FeatureServers de ESRI) para listar incendios forestales "En Combate".

*Nota: Para mantener el sistema funcionando sin requerir tokens de desarrollo activos en la etapa inicial, el backend está configurado con **Fallbacks locales (Mock Data)**. Si falla la obtención real de un dato, el servidor responderá automáticamente con reportes simulados para que el Frontend nunca falle.*

---

## 📚 Documentación de API (Swagger)

El backend cuenta con documentación **Swagger OpenAPI** completamente funcional y profesional.

Una vez que el servidor esté corriendo, puedes acceder a la interfaz interactiva de Swagger ingresando a:
👉 **http://localhost:3000/api/docs**

Allí encontrarás la estructura exacta del DTO de Incidentes, los enumeradores permitidos para la severidad (`low`, `medium`, `high`, `critical`) y la descripción de todos los endpoints.

---

## 🛠️ Tecnologías

- **Framework:** NestJS / TypeScript
- **HTTP/Proxy:** `@nestjs/axios`
- **Documentación API:** `@nestjs/swagger` y `swagger-ui-express`
- **Tareas Programadas (Cron):** `@nestjs/schedule`
- **Parseo de Feeds:** `rss-parser`
- **Integración de Redes:** `twitter-api-v2`

---

## 🚀 Instalación y Uso Local

### 1. Requisitos previos
- Node.js (v18 o superior recomendado)
- NPM

### 2. Instalar dependencias
Ubicado en la carpeta `emergencias-backend`:

```bash
npm install
```

### 3. Ejecutar el servidor

Para desarrollo (con recarga automática/Watch Mode):
```bash
npm run start:dev
```

Para producción:
```bash
npm run build
npm run start:prod
```

### 4. Variables de Entorno (Opcional)
Puedes agregar un archivo `.env` en la raíz de `emergencias-backend` para configurar puertos y tokens:
```env
PORT=3000
FRONTEND_URL=http://localhost:5173
TWITTER_BEARER_TOKEN="tu_bearer_token_de_x_api"
```

---

## 📡 Endpoints

### `GET /api/v1/incidents`
Devuelve un array normalizado unificando todas las emergencias activas de las diferentes instituciones.

**Ejemplo de respuesta:**
```json
[
  {
    "id": "senapred-mock-1",
    "title": "Alerta Temprana Preventiva",
    "description": "Alerta por tormentas eléctricas",
    "type": "alert",
    "severity": "medium",
    "coordinates": [-70.6693, -33.4489],
    "timestamp": "2026-07-19T00:51:36.381Z",
    "details": {
      "status": "En curso",
      "reportedBy": "SENAPRED",
      "unitsDispatched": 0,
      "affectedArea": "Región Metropolitana",
      "lastUpdate": "2026-07-19T00:51:36.381Z"
    }
  }
]
```

---

## 🤝 Conexión con el Frontend

El proyecto de Frontend ya está configurado para consumir este servicio. Simplemente asegúrate de tener el backend corriendo (usualmente en el puerto 3000) y el frontend en tu puerto local. La conexión está facilitada por CORS dinámico (`process.env.FRONTEND_URL || '*'`).
