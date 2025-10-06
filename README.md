## Escáner de Códigos de Barras

Aplicación React + Vite para escanear códigos de barras (UPC/EAN, CODE128, etc.), consultar datos y exportar a CSV.

### Requisitos para usar la cámara en móviles

Los navegadores móviles (especialmente Safari en iOS) exigen que el sitio se sirva bajo HTTPS (o en `localhost`) para permitir acceso a la cámara.

1. En desarrollo: funciona en `http://localhost:5173` sin problema.
2. En producción: despliega en Vercel, Netlify, GitHub Pages (con HTTPS) u otro hosting seguro.
3. Si abres el archivo `index.html` directamente (file://) o usas HTTP en una IP, la cámara puede fallar.

### Selección de cámara

El componente ahora:
* Lista todas las cámaras disponibles (`Html5Qrcode.getCameras()`).
* Intenta seleccionar automáticamente la cámara trasera (buscando palabras back / rear / environment).
* Permite refrescar la lista con el botón 🔄.
* Soporta modo de escaneo continuo (no se detiene tras el primer código).

### Linterna y vibración

Cuando el dispositivo y el navegador lo permiten:
* Botón para encender / apagar la linterna (usa `MediaTrackConstraints` con `torch`).
* Vibración corta (60ms) al detectar un código (si `navigator.vibrate` está disponible).
* La linterna se apaga automáticamente al detener el escaneo.

### Filtro de duplicados

En modo de escaneo continuo se ignoran códigos repetidos escaneados dentro de una ventana de 3 segundos para evitar múltiples inserciones accidentales del mismo producto. La vibración es más corta (20ms) si el código se considera duplicado.

### Formatos soportados
Se activaron formatos comunes:
* EAN_13 / EAN_8
* UPC_A / UPC_E
* CODE_128 / CODE_39

### Desarrollo

Instalar dependencias:
```
npm install
```

Levantar en modo desarrollo:
```
npm run dev
```

Chequeo de tipos:
```
npm run typecheck
```

Build de producción:
```
npm run build
```

Preview del build:
```
npm run preview
```

### Notas

Si la cámara no aparece:
* Verifica que aceptaste los permisos del navegador.
* Refresca la lista con 🔄.
* Cierra otras apps que estén usando la cámara.
* En iOS, asegúrate de estar en HTTPS.

### Licencia

Uso interno / demo.
