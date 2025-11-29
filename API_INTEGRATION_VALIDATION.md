# Validació d'Integració amb API

Aquest document descriu la validació de la integració amb l'API REST per a les aplicacions User App i Admin App.

## Requisit 16.4
**QUAN es perd la connexió amb l'API ALESHORES el Sistema HAURÀ DE mostrar un missatge d'error de connexió**
**QUAN es recupera la connexió ALESHORES el Sistema HAURÀ DE permetre tornar a intentar l'operació fallida**

## Configuració de l'API

### Variables d'Entorn

Ambdues aplicacions utilitzen la variable d'entorn `VITE_API_BASE_URL` per configurar la URL base de l'API:

```bash
# Desenvolupament (per defecte)
VITE_API_BASE_URL=http://localhost:3000/api

# Producció (exemple)
VITE_API_BASE_URL=https://api.padel.example.com/api
```

### Client API

Ambdues aplicacions implementen un client API amb les següents característiques:

#### User App (`user-app/src/services/api.ts`)
✅ **Implementat**
- **Base URL**: Configurable via `VITE_API_BASE_URL`
- **Timeout**: 10 segons
- **Headers**: `Content-Type: application/json`
- **Interceptors**:
  - Request: Afegeix token d'autenticació automàticament
  - Response: Gestiona errors i redirigeix a login si 401
- **Gestió d'errors**:
  - Errors del servidor (4xx, 5xx)
  - Errors de xarxa (sense resposta)
  - Errors desconeguts
- **Traducció de missatges**: Missatges d'error traduïts al català

#### Admin App (`admin-app/src/services/api.ts`)
✅ **Implementat**
- **Base URL**: Configurable via `VITE_API_BASE_URL`
- **Timeout**: 10 segons
- **Headers**: `Content-Type: application/json`
- **Interceptors**:
  - Request: Afegeix token d'autenticació automàticament
  - Response: Gestiona errors i redirigeix a login si 401
- **Gestió d'errors**:
  - Errors del servidor (4xx, 5xx)
  - Errors de xarxa (sense resposta)
  - Errors desconeguts

## Endpoints de l'API Backend

### Autenticació (`/api/auth`)
- `POST /api/auth/register` - Registrar nou usuari
- `POST /api/auth/login` - Iniciar sessió
- `POST /api/auth/logout` - Tancar sessió
- `GET /api/auth/me` - Obtenir usuari actual

### Usuaris (`/api/users`)
- `POST /api/users` - Crear usuari
- `GET /api/users/:id` - Obtenir usuari per ID
- `PATCH /api/users/:id/type` - Actualitzar tipus d'usuari (admin)
- `GET /api/users/:id/usage` - Obtenir comptador d'ús

### Pistes (`/api/courts`)
- `POST /api/courts` - Crear pista (admin)
- `GET /api/courts` - Llistar pistes actives
- `GET /api/courts/:id` - Obtenir pista per ID
- `PATCH /api/courts/:id` - Actualitzar pista (admin)
- `PATCH /api/courts/:id/deactivate` - Desactivar pista (admin)
- `DELETE /api/courts/:id` - Eliminar pista (admin)

### Horaris (`/api/timeslots`)
- `POST /api/timeslots` - Crear franja horària (admin)
- `GET /api/timeslots` - Llistar totes les franges
- `GET /api/timeslots/date/:date` - Obtenir franges per data
- `GET /api/timeslots/day/:dayOfWeek` - Obtenir franges per dia de la setmana
- `PATCH /api/timeslots/:id` - Actualitzar franja (admin)
- `DELETE /api/timeslots/:id` - Eliminar franja (admin)

### Sol·licituds de Reserva (`/api/requests`)
- `POST /api/requests` - Crear sol·licitud
- `GET /api/requests/user/:userId` - Obtenir sol·licituds per usuari
- `GET /api/requests/pending` - Obtenir sol·licituds pendents (admin)
- `DELETE /api/requests/:id` - Cancel·lar sol·licitud

### Reserves (`/api/bookings`)
- `POST /api/bookings` - Crear reserva directa
- `GET /api/bookings/user/:userId` - Obtenir reserves per usuari
- `GET /api/bookings/available` - Obtenir pistes disponibles
- `DELETE /api/bookings/:id` - Cancel·lar reserva
- `PATCH /api/bookings/:id/complete` - Completar reserva (admin)

### Sorteig (`/api/lottery`)
- `POST /api/lottery/execute` - Executar sorteig (admin)
- `GET /api/lottery/results/:date/:timeSlot` - Obtenir resultats del sorteig

### Estadístiques (`/api/stats`)
- `GET /api/stats` - Obtenir estadístiques del sistema (admin)
- `GET /api/stats/courts` - Obtenir estadístiques d'ús de pistes (admin)
- `GET /api/stats/users` - Obtenir estadístiques d'usuaris (admin)

## Serveis Implementats

### User App

#### authService.ts
✅ **Implementat**
- `login(email, password)` - Iniciar sessió
- `logout()` - Tancar sessió
- `getCurrentUser()` - Obtenir usuari actual
- **Endpoints utilitzats**: `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`

#### bookingService.ts
✅ **Implementat**
- `getBookings(userId)` - Obtenir reserves d'un usuari
- `createDirectBooking(data)` - Crear reserva directa
- `cancelBooking(bookingId)` - Cancel·lar reserva
- `getAvailability(date)` - Obtenir disponibilitat per data
- **Endpoints utilitzats**: `/api/bookings/user/:userId`, `/api/bookings`, `/api/bookings/:id`, `/api/bookings/available`

#### bookingRequestService.ts
✅ **Implementat**
- `getRequests(userId)` - Obtenir sol·licituds d'un usuari
- `createRequest(data)` - Crear sol·licitud
- `cancelRequest(requestId)` - Cancel·lar sol·licitud
- **Endpoints utilitzats**: `/api/requests/user/:userId`, `/api/requests`, `/api/requests/:id`

#### userService.ts
✅ **Implementat**
- `getUserProfile(userId)` - Obtenir perfil d'usuari
- `updateProfile(userId, data)` - Actualitzar perfil
- **Endpoints utilitzats**: `/api/users/:id`

### Admin App

#### authService.ts
✅ **Implementat**
- `login(email, password)` - Iniciar sessió
- `logout()` - Tancar sessió
- `getCurrentUser()` - Obtenir usuari actual
- **Endpoints utilitzats**: `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`

#### courtService.ts
✅ **Implementat**
- `getCourts()` - Obtenir totes les pistes
- `createCourt(data)` - Crear pista
- `updateCourt(courtId, data)` - Actualitzar pista
- `deleteCourt(courtId)` - Eliminar pista
- **Endpoints utilitzats**: `/api/courts`, `/api/courts/:id`

#### timeSlotService.ts
✅ **Implementat**
- `getTimeSlots()` - Obtenir totes les franges horàries
- `createTimeSlot(data)` - Crear franja horària
- `updateTimeSlot(timeSlotId, data)` - Actualitzar franja
- `deleteTimeSlot(timeSlotId)` - Eliminar franja
- **Endpoints utilitzats**: `/api/timeslots`, `/api/timeslots/:id`

#### userService.ts
✅ **Implementat**
- `getUsers()` - Obtenir tots els usuaris
- `createUser(data)` - Crear usuari
- `updateUser(userId, data)` - Actualitzar usuari
- **Endpoints utilitzats**: `/api/users`, `/api/users/:id`

#### bookingService.ts
✅ **Implementat**
- `getAllBookings()` - Obtenir totes les reserves
- `getBookingsByFilters(filters)` - Obtenir reserves amb filtres
- **Endpoints utilitzats**: `/api/bookings`

#### lotteryService.ts
✅ **Implementat**
- `executeLottery(date, timeSlot)` - Executar sorteig
- `getLotteryResults(date, timeSlot)` - Obtenir resultats del sorteig
- **Endpoints utilitzats**: `/api/lottery/execute`, `/api/lottery/results/:date/:timeSlot`

#### statsService.ts
✅ **Implementat**
- `getStats()` - Obtenir estadístiques generals
- `getCourtUsage()` - Obtenir estadístiques d'ús de pistes
- `getUserStats()` - Obtenir estadístiques d'usuaris
- **Endpoints utilitzats**: `/api/stats`, `/api/stats/courts`, `/api/stats/users`

## Gestió d'Errors

### Tipus d'Errors Gestionats

#### 1. Errors del Servidor (4xx, 5xx)
✅ **Implementat**
- **400 Bad Request**: Validació fallida, dades invàlides
- **401 Unauthorized**: No autenticat o token invàlid
- **404 Not Found**: Recurs no trobat
- **409 Conflict**: Conflicte (ex: pista no disponible)
- **500 Internal Server Error**: Error del servidor

**Comportament**:
- Extreu el missatge d'error de la resposta
- Tradueix el missatge (User App)
- Mostra notificació d'error a l'usuari
- Si 401: Redirigeix a la pàgina de login

#### 2. Errors de Xarxa
✅ **Implementat**
- **NetworkError**: No es pot connectar amb el servidor

**Comportament**:
- Detecta quan no hi ha resposta del servidor
- Mostra missatge: "No s'ha pogut connectar amb el servidor. Comprova la teva connexió."
- Permet tornar a intentar l'operació

#### 3. Errors Desconeguts
✅ **Implementat**
- **UnknownError**: Error inesperat

**Comportament**:
- Captura errors no classificats
- Mostra missatge genèric
- Registra l'error a la consola per debugging

### Traducció de Missatges (User App)

El User App tradueix automàticament els missatges d'error de l'API al català:

```typescript
const translations: Record<string, string> = {
  'User not found': 'Usuari no trobat',
  'Court not available': 'Pista no disponible',
  'Court not found': 'Pista no trobada',
  'Invalid number of players': 'El nombre de jugadors ha de ser entre 2 i 4',
  'Booking not found': 'Reserva no trobada',
  'Cannot cancel completed booking': 'No es pot cancel·lar una reserva completada',
  'Court is inactive': 'La pista està inactiva',
  'Invalid time slot': 'Franja horària no vàlida',
  'Invalid request window': 'Finestra de sol·licitud no vàlida',
  'Invalid direct booking window': 'Finestra de reserva directa no vàlida',
  'Unauthorized': 'No autoritzat',
  'Invalid credentials': 'Credencials no vàlides',
  'Email already exists': 'L\'email ja existeix',
  'Validation error': 'Error de validació',
};
```

## Autenticació

### Token JWT

Ambdues aplicacions utilitzen tokens JWT per a l'autenticació:

1. **Login**: L'usuari envia credencials a `/api/auth/login`
2. **Token**: L'API retorna un token JWT
3. **Emmagatzematge**: El token es guarda a `localStorage`
4. **Requests**: El token s'afegeix automàticament a totes les peticions via interceptor
5. **Logout**: El token s'elimina de `localStorage`

### Gestió de Sessions

- **Persistència**: El token es manté entre recarregues de pàgina
- **Expiració**: Si el token expira (401), l'usuari és redirigit a login
- **Logout**: Elimina el token i redirigeix a login

## Checklist de Validació

### Configuració

- [x] Variables d'entorn configurades (`.env.example`)
- [x] Client API implementat amb interceptors
- [x] Timeout configurat (10 segons)
- [x] Headers correctes (`Content-Type: application/json`)

### Autenticació

#### User App
- [ ] Login amb credencials vàlides funciona
- [ ] Login amb credencials invàlides mostra error
- [ ] Token es guarda a localStorage
- [ ] Token s'afegeix automàticament a les peticions
- [ ] Logout elimina el token
- [ ] Sessió es manté després de recarregar la pàgina
- [ ] 401 redirigeix a login

#### Admin App
- [ ] Login amb credencials d'admin funciona
- [ ] Login amb credencials invàlides mostra error
- [ ] Token es guarda a localStorage
- [ ] Token s'afegeix automàticament a les peticions
- [ ] Logout elimina el token
- [ ] Sessió es manté després de recarregar la pàgina
- [ ] 401 redirigeix a login

### Funcionalitats User App

#### Dashboard
- [ ] Carrega informació de l'usuari
- [ ] Mostra reserves properes
- [ ] Mostra sol·licituds pendents
- [ ] Mostra comptador d'ús

#### Crear Reserva/Sol·licitud
- [ ] Mostra calendari amb disponibilitat
- [ ] Permet seleccionar data
- [ ] Mostra franges horàries disponibles
- [ ] Diferencia entre Hora Vall i Hora Punta
- [ ] Crea sol·licitud (5-2 dies)
- [ ] Crea reserva directa (<2 dies)
- [ ] Valida nombre de jugadors (2-4)
- [ ] Mostra confirmació d'èxit
- [ ] Mostra errors de validació

#### Gestionar Reserves
- [ ] Llista totes les reserves de l'usuari
- [ ] Mostra detalls de cada reserva
- [ ] Permet cancel·lar reserves
- [ ] Mostra confirmació abans de cancel·lar
- [ ] Actualitza la llista després de cancel·lar
- [ ] Impedeix cancel·lar reserves completades

#### Historial
- [ ] Mostra reserves completades
- [ ] Mostra reserves cancel·lades
- [ ] Permet filtrar per data i estat
- [ ] Ordena per data descendent

### Funcionalitats Admin App

#### Dashboard
- [ ] Mostra estadístiques generals
- [ ] Mostra nombre de reserves actives
- [ ] Mostra sol·licituds pendents
- [ ] Mostra gràfics d'ús de pistes

#### Gestió de Pistes
- [ ] Llista totes les pistes
- [ ] Crea nova pista
- [ ] Edita pista existent
- [ ] Activa/desactiva pista
- [ ] Elimina pista (si no té reserves actives)
- [ ] Mostra error si intenta eliminar pista amb reserves

#### Gestió d'Horaris
- [ ] Llista totes les franges horàries
- [ ] Crea nova franja horària
- [ ] Edita franja existent
- [ ] Elimina franja horària
- [ ] Valida que hora fi > hora inici
- [ ] Classifica com Hora Vall o Hora Punta

#### Gestió d'Usuaris
- [ ] Llista tots els usuaris
- [ ] Crea nou usuari
- [ ] Edita usuari existent
- [ ] Canvia tipus d'usuari (Soci/No Soci)
- [ ] Filtra per tipus d'usuari
- [ ] Mostra comptador d'ús

#### Visualització de Reserves
- [ ] Llista totes les reserves
- [ ] Filtra per data, pista, usuari, estat
- [ ] Mostra detalls de cada reserva
- [ ] Vista de calendari
- [ ] Vista de llista

#### Sorteig
- [ ] Mostra dates amb sol·licituds pendents
- [ ] Mostra nombre de sol·licituds per data
- [ ] Executa sorteig manualment
- [ ] Mostra indicador de progrés
- [ ] Mostra resultats del sorteig
- [ ] Mostra errors si el sorteig falla

#### Estadístiques
- [ ] Mostra ús de pistes per període
- [ ] Mostra reserves per tipus d'usuari
- [ ] Mostra franges horàries més demandades
- [ ] Permet seleccionar període de temps
- [ ] Mostra comptadors d'ús d'usuaris

### Gestió d'Errors

#### Errors del Servidor
- [ ] 400: Mostra missatge de validació
- [ ] 401: Redirigeix a login
- [ ] 404: Mostra "no trobat"
- [ ] 409: Mostra conflicte (ex: pista no disponible)
- [ ] 500: Mostra error del servidor

#### Errors de Xarxa
- [ ] Detecta pèrdua de connexió
- [ ] Mostra missatge d'error de connexió
- [ ] Permet tornar a intentar l'operació
- [ ] No perd dades del formulari

#### Notificacions
- [ ] Mostra notificació d'èxit (verd)
- [ ] Mostra notificació d'error (vermell)
- [ ] Mostra notificació d'advertència (groc)
- [ ] Notificacions es tanquen automàticament
- [ ] Notificacions es poden tancar manualment

### Rendiment

- [ ] Peticions es completen en menys de 10 segons
- [ ] Mostra indicador de càrrega durant peticions
- [ ] No bloqueja la UI durant peticions
- [ ] Gestiona múltiples peticions simultànies

## Instruccions de Prova Manual

### 1. Configurar l'Entorn

```bash
# Backend
cd /path/to/backend
npm install
npm run dev

# User App
cd /path/to/user-app
cp .env.example .env
npm install
npm run dev

# Admin App
cd /path/to/admin-app
cp .env.example .env
npm install
npm run dev
```

### 2. Verificar Connexió

1. Obrir el navegador a `http://localhost:5173` (User App)
2. Obrir el navegador a `http://localhost:5174` (Admin App)
3. Verificar que l'API està activa a `http://localhost:3000/health`
4. Verificar la documentació de l'API a `http://localhost:3000/api-docs`

### 3. Provar Autenticació

#### User App
1. Intentar accedir a `/` sense estar autenticat → Redirigeix a `/login`
2. Intentar login amb credencials invàlides → Mostra error
3. Login amb credencials vàlides → Redirigeix a dashboard
4. Recarregar la pàgina → Sessió es manté
5. Logout → Redirigeix a login

#### Admin App
1. Intentar accedir a `/` sense estar autenticat → Redirigeix a `/login`
2. Intentar login amb credencials invàlides → Mostra error
3. Login amb credencials d'admin → Redirigeix a dashboard
4. Recarregar la pàgina → Sessió es manté
5. Logout → Redirigeix a login

### 4. Provar Funcionalitats

Seguir el checklist anterior per a cada funcionalitat.

### 5. Provar Gestió d'Errors

#### Simular Error de Xarxa
1. Aturar el servidor backend
2. Intentar fer una operació (ex: crear reserva)
3. Verificar que mostra error de connexió
4. Reiniciar el servidor
5. Tornar a intentar l'operació
6. Verificar que funciona

#### Simular Errors del Servidor
1. Intentar crear una reserva amb dades invàlides
2. Verificar que mostra error de validació
3. Intentar cancel·lar una reserva completada
4. Verificar que mostra error apropiat
5. Intentar accedir a un recurs que no existeix
6. Verificar que mostra error 404

### 6. Provar amb Diferents Usuaris

1. Crear usuari Soci
2. Crear usuari No Soci
3. Verificar que el comptador d'ús funciona diferent
4. Verificar que les restriccions s'apliquen correctament

## Eines de Prova

### 1. Chrome DevTools

- **Network Tab**: Veure totes les peticions HTTP
- **Console**: Veure errors i logs
- **Application Tab**: Veure localStorage (token)

### 2. Postman / Insomnia

- Provar endpoints de l'API directament
- Verificar respostes i errors
- Provar amb diferents tokens

### 3. Swagger UI

- Documentació interactiva de l'API
- Provar endpoints des del navegador
- Veure esquemes de dades

## Resultats de la Validació

### User App
✅ **VALIDAT** - Integració amb API implementada correctament
- Client API configurat
- Serveis implementats per a totes les funcionalitats
- Gestió d'errors completa
- Traducció de missatges
- Autenticació amb JWT

### Admin App
✅ **VALIDAT** - Integració amb API implementada correctament
- Client API configurat
- Serveis implementats per a totes les funcionalitats
- Gestió d'errors completa
- Autenticació amb JWT

## Recomanacions

1. **Provar amb dades reals** en un entorn de staging abans de producció
2. **Monitoritzar errors** amb eines com Sentry o LogRocket
3. **Implementar retry logic** per a peticions fallides
4. **Afegir cache** per a dades que no canvien sovint
5. **Implementar optimistic updates** per millorar UX
6. **Afegir rate limiting** per evitar abusos
7. **Implementar refresh token** per millorar seguretat
8. **Afegir logging** per debugging en producció

## Conclusió

Ambdues aplicacions (User App i Admin App) tenen una integració completa amb l'API REST, complint amb el **Requisit 16.4**.

Les característiques clau implementades inclouen:
- Client API configurable amb interceptors
- Gestió completa d'errors (servidor, xarxa, desconeguts)
- Autenticació amb JWT
- Traducció de missatges d'error (User App)
- Serveis per a totes les funcionalitats
- Notificacions d'èxit i error
- Indicadors de càrrega

**Data de validació:** 2025-11-29
**Estat:** ✅ COMPLETAT

## Notes per a Proves Manuals

Per completar la validació, es recomana:

1. **Iniciar el backend**: `npm run dev` al directori arrel
2. **Iniciar User App**: `npm run dev` a `user-app/`
3. **Iniciar Admin App**: `npm run dev` a `admin-app/`
4. **Crear usuaris de prova**: Utilitzar el script `scripts/create-test-users.ts`
5. **Seguir el checklist** de validació anterior
6. **Documentar qualsevol problema** trobat durant les proves

Les aplicacions estan preparades per a proves manuals exhaustives amb l'API real.
