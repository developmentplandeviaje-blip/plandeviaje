# Lista de Endpoints - Servicio WhatsApp (plandeviaje)

## Base URL
*(Reemplaza con tu URL local o el dominio de producción, ej: http://localhost:3000 o tu URL de Railway)*

---

## Endpoints Principales

### 1. Vincular Dispositivo / Generar Código de Emparejamiento
* **Archivo origen:** `whatsapp-service\index.js` (Línea 162)
* **Ruta:** `/pair`
* **Método HTTP:** `POST`
* **Descripción:** Inicia el proceso de vinculación de una cuenta de WhatsApp (generalmente mediante código de emparejamiento o QR).
* **Parámetros requeridos (Body - JSON):**
    ```json
    {
      "phone": "string" 
    }
    ```

### 2. Verificar Estado de la Conexión
* **Archivo origen:** `whatsapp-service\index.js` (Línea 195)
* **Ruta:** `/status`
* **Método HTTP:** `GET`
* **Descripción:** Devuelve el estado actual de la sesión de WhatsApp (si está conectado, desconectado o esperando vinculación).
* **Parámetros requeridos:** Ninguno (No requiere parámetros de consulta ni cuerpo).

### 3. Enviar Mensaje de WhatsApp
* **Archivo origen:** `whatsapp-service\index.js` (Línea 199)
* **Ruta:** `/send`
* **Método HTTP:** `POST`
* **Descripción:** Envía un mensaje de texto automatizado a un número de teléfono específico.
* **Parámetros requeridos (Body - JSON):**
    ```json
    {
      "to": "string",
      "message": "string"
    }
    ```