# 🚀 AppsBuilder - Startup & Control

## Iniciar Todo

```bash
npm start
```

O con PowerShell directo:
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/start.ps1
```

### Qué Hace
1. ✓ Verifica Node.js y pnpm
2. ✓ Instala dependencias si faltan
3. ✓ Comprueba MongoDB (sin esperar si no responde)
4. ✓ Levanta los 3 servicios en paralelo:
   - **Form** (builder-ui) → http://localhost:3001
   - **Admin** (web-admin) → http://localhost:3002
   - **Backend** → http://localhost:4000
5. ✓ Abre el navegador en 3001

### Terminal Bloqueada
- La terminal **BLOQUEA** mientras pnpm dev corre (es lo correcto)
- Cierra con **Ctrl+C** (mata automáticamente todos los procesos)
- Al cerrar la ventana, también se cierran los procesos

---

## Detener Todo

### Opción 1: Ctrl+C en la Terminal
```
(terminal bloqueada en pnpm dev)
^C
```
✓ Se mata automáticamente todo

### Opción 2: Script stop
```bash
npm stop
```

O con PowerShell:
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/stop.ps1
```

---

## Ports

| Puerto | Servicio        | URL                      |
|--------|-----------------|--------------------------|
| 3001   | builder-ui      | http://localhost:3001    |
| 3002   | web-admin       | http://localhost:3002    |
| 4000   | backend         | http://localhost:4000    |
| 27017  | MongoDB (opt.)  | Configurar en .env       |

---

## Troubleshooting

### "Puerto 3001 ya está ocupado"
```powershell
npm stop
# Espera 2 segundos
npm start
```

### Ver qué está en los puertos
```powershell
netstat -ano | grep -E "3001|3002|4000"
```

### Matar manualmente todos los procesos
```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process pnpm -ErrorAction SilentlyContinue | Stop-Process -Force
```

---

## Logs

Los logs se imprimen directamente en la terminal mientras corre `npm start`.

Si necesitás guardar logs:
```bash
npm start > logs.txt 2>&1
```

---

**TL;DR:**
- `npm start` → Terminal bloqueada, Ctrl+C para cerrar
- `npm stop` → Mata procesos (si corren en background)
- Mejor práctica: **Siempre usar Ctrl+C en la terminal principal**
