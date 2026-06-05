# Plan de Viaje - Plataforma Integral y CRM Turístico

Este repositorio contiene el código fuente completo de la plataforma web corporativa de **Plan de Viaje**. El sistema se divide en tres partes funcionales: un frontend moderno enfocado en conversiones turísticas, un backend robusto basado en API REST, y un microservicio para integración de mensajería instantánea.

## Arquitectura del Proyecto

El proyecto está dividido en tres directorios principales (que representan tres servicios):

| Directorio | Tecnología | Descripción |
|------------|------------|-------------|
| **`pdv-api`** | Laravel (PHP), MySQL | Backend, API REST y base de datos relacional. Maneja autenticación (Sanctum), modelos, validaciones y conexión con el microservicio. |
| **`pdv-front`** | React, Vite, Tailwind CSS | Frontend (SPA) de la página pública (promociones turísticas) y el Panel Administrativo (gestor de contenido y CRM). |
| **`microservicio`** | Node.js, Baileys | Microservicio independiente en el puerto 3001. Enlaza cuentas de WhatsApp vía *Pairing Code* y envía mensajes automatizados/webhooks a la API. |

---

## Requisitos de Instalación (Entorno Local/Producción)

Antes de levantar el proyecto, asegúrate de tener instalados los siguientes componentes:
- **PHP** >= 8.1 (Recomendado Laragon o XAMPP)
- **Composer**
- **Node.js** >= 18.x y NPM
- **MySQL** o MariaDB

---

## Configuración y Despliegue Local

### 1. Configuración del Backend (`pdv-api`)
El motor principal del proyecto.
```bash
cd pdv-api
# Instalar dependencias de PHP
composer install

# Copiar el archivo de entorno y generar la clave
cp .env.example .env
php artisan key:generate

# Configurar en tu .env los datos de tu Base de Datos MySQL:
# DB_DATABASE=plandeviaje
# DB_USERNAME=root
# DB_PASSWORD=

# Ejecutar las migraciones
php artisan migrate

# Levantar el servidor de Laravel (generalmente localhost:8000)
php artisan serve
```

### 2. Configuración del Frontend (`pdv-front`)
La interfaz de usuario web. Todo componente y ruta del administrador se maneja en este segmento.
```bash
cd pdv-front
# Instalar dependencias de Javascript
npm install

# Copiar configuración de entorno
cp .env.example .env

# Asegurarse de que el VITE_API_URL apunte al localhost:8000 del API en el .env:
# VITE_API_URL=http://localhost:8000/api
# VITE_WS_URL=http://localhost:3001

# Iniciar servidor de desarrollo de Vite
npm run dev
```

### 3. Configuración del Microservicio (WhatsApp Node)
El microservicio independiente que levanta las sesiones de WhatsApp.
```bash
cd whatsapp-service
# Instalar dependencias
npm install

# Copiar configuracion de entorno
cp .env.example .env

# Iniciar el servicio (por defecto en el puerto 3001)
npm start
```

---

## Estructura del Base de Datos (Strict Mode)

Este proyecto está construido respetando *Eloquent Strict Mode*.
Los submodelos comerciales (`Flight`, `Accommodation`, `Package`) se relacionan a un modelo transversal llamado `Post`, de esta manera toda galería multimedia (`images`, `thumbnail`, `banner`) centraliza su lógica en una sola tabla, reduciendo la redundancia de archivos multimedia.

### Autenticación y Seguridad
La plataforma usa `Laravel Sanctum` para autenticación (Tokens). Las sesiones para el back-office (Panel Admin) expiran si el token local es borrado o revocado.

---


### Integrar los nuevos cambios al Backend (`pdv-api`) remoto

```bash
# Comando para guardar los cambios y subirlos a el backend
cd .\pdv-front\
npm run build

```
#Cambiar dominio por remoto

http://66.228.40.133  por http://localhost:8000

#Archivos del front

Contacto
FormCard
ImagenH
Index
Vendor-http
Vendor-react

```bash
# Restablecer el nginx
docker compose restart nginx

# Permisos de escritura para el usuario de PHP en Docker

chown -R www-data:www-data ~/plan-de-viaje/pdv-api/storage
chmod -R 775 ~/plan-de-viaje/pdv-api/storage

# Aplicar los cambios en Docker

cd ~/plan-de-viaje
docker compose up -d --force-recreate nginx laravel_api

```
---
