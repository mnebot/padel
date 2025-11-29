# User App - Aplicació d'Usuari per Gestió de Reserves de Pàdel

Aplicació web frontend per als usuaris finals del sistema de gestió de reserves de pàdel. Permet als usuaris (socis i no socis) gestionar les seves reserves i sol·licituds de pistes.

## 📋 Taula de Continguts

- [Característiques](#característiques)
- [Requisits Previs](#requisits-previs)
- [Instal·lació](#installació)
- [Configuració](#configuració)
- [Scripts Disponibles](#scripts-disponibles)
- [Estructura del Projecte](#estructura-del-projecte)
- [Tecnologies Utilitzades](#tecnologies-utilitzades)
- [Desenvolupament](#desenvolupament)
- [Testing](#testing)
- [Build i Desplegament](#build-i-desplegament)

## ✨ Característiques

- **Autenticació d'Usuaris**: Inici de sessió segur amb JWT
- **Dashboard Personalitzat**: Vista general de reserves i sol·licituds
- **Visualització de Disponibilitat**: Calendari interactiu per veure pistes disponibles
- **Reserves Directes**: Creació de reserves amb menys de 2 dies d'antelació
- **Sol·licituds de Reserva**: Participació en sortejos per reserves amb més antelació
- **Gestió de Reserves**: Visualització i cancel·lació de reserves existents
- **Historial**: Consulta de reserves passades i estadístiques personals
- **Responsive Design**: Interfície adaptada a mòbils, tablets i escriptori

## 📦 Requisits Previs

Abans de començar, assegura't de tenir instal·lat:

- **Node.js**: versió 18.x o superior
- **npm**: versió 9.x o superior (inclòs amb Node.js)
- **Backend API**: El servidor backend ha d'estar en execució (per defecte a `http://localhost:3000`)

## 🚀 Instal·lació

1. **Clona el repositori** (si encara no ho has fet):
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. **Navega al directori de l'aplicació**:
   ```bash
   cd user-app
   ```

3. **Instal·la les dependències**:
   ```bash
   npm install
   ```

## ⚙️ Configuració

### Variables d'Entorn

1. **Crea el fitxer `.env`** copiant l'exemple:
   ```bash
   cp .env.example .env
   ```

2. **Configura les variables** al fitxer `.env`:
   ```env
   # URL base de l'API backend
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

### Configuració de l'API

Per defecte, l'aplicació està configurada per connectar-se a:
- **Desenvolupament**: `http://localhost:3000/api`
- **Port de desenvolupament**: `5173`
- **Proxy**: Les peticions a `/api` es redireccionen automàticament al backend

## 📜 Scripts Disponibles

### Desenvolupament

```bash
npm run dev
```
Inicia el servidor de desenvolupament amb hot-reload.
- URL: `http://localhost:5173`
- Els canvis es reflecteixen automàticament al navegador

### Build de Producció

```bash
npm run build
```
Compila l'aplicació per a producció:
- Executa la verificació de tipus de TypeScript
- Genera els fitxers optimitzats a la carpeta `dist/`
- Aplica minificació i optimitzacions

### Preview de Build

```bash
npm run preview
```
Serveix la versió de producció localment per provar-la abans del desplegament.
- URL: `http://localhost:4173`

### Linting

```bash
npm run lint
```
Executa ESLint per verificar la qualitat del codi i detectar problemes.

### Testing

```bash
# Executar tots els tests una vegada
npm test

# Executar tests en mode watch (desenvolupament)
npm run test:watch

# Executar tests amb cobertura de codi
npm run test:coverage
```

## 📁 Estructura del Projecte

```
user-app/
├── public/                      # Fitxers estàtics
│   └── vite.svg
├── src/
│   ├── components/              # Components React
│   │   ├── ui/                  # Components base (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   └── ...
│   │   ├── layout/              # Components de layout
│   │   │   ├── Header.tsx       # Capçalera amb navegació
│   │   │   ├── Footer.tsx       # Peu de pàgina
│   │   │   ├── Sidebar.tsx      # Menú lateral
│   │   │   └── MainLayout.tsx   # Layout principal
│   │   ├── auth/                # Components d'autenticació
│   │   │   ├── LoginForm.tsx    # Formulari de login
│   │   │   └── ProtectedRoute.tsx # Protecció de rutes
│   │   ├── booking/             # Components de reserves
│   │   │   ├── BookingCalendar.tsx    # Calendari de disponibilitat
│   │   │   ├── BookingForm.tsx        # Formulari de reserva
│   │   │   ├── BookingCard.tsx        # Targeta de reserva
│   │   │   ├── BookingList.tsx        # Llista de reserves
│   │   │   └── TimeSlotSelector.tsx   # Selector d'horaris
│   │   ├── dashboard/           # Components del dashboard
│   │   │   ├── DashboardStats.tsx     # Estadístiques d'usuari
│   │   │   ├── UpcomingBookings.tsx   # Reserves properes
│   │   │   └── PendingRequests.tsx    # Sol·licituds pendents
│   │   └── common/              # Components comuns
│   │       ├── LoadingSpinner.tsx     # Indicador de càrrega
│   │       ├── ErrorMessage.tsx       # Missatges d'error
│   │       └── ConfirmDialog.tsx      # Diàleg de confirmació
│   ├── pages/                   # Pàgines de l'aplicació
│   │   ├── LoginPage.tsx        # Pàgina d'inici de sessió
│   │   ├── DashboardPage.tsx    # Dashboard principal
│   │   ├── BookingsPage.tsx     # Gestió de reserves
│   │   ├── NewBookingPage.tsx   # Crear nova reserva
│   │   ├── HistoryPage.tsx      # Historial de reserves
│   │   └── NotFoundPage.tsx     # Pàgina 404
│   ├── services/                # Capa de serveis
│   │   ├── api.ts               # Client HTTP (Axios)
│   │   ├── authService.ts       # Servei d'autenticació
│   │   ├── bookingService.ts    # Servei de reserves
│   │   ├── bookingRequestService.ts # Servei de sol·licituds
│   │   └── userService.ts       # Servei d'usuaris
│   ├── hooks/                   # Custom React Hooks
│   │   ├── useAuth.ts           # Hook d'autenticació
│   │   ├── useBookings.ts       # Hook de reserves
│   │   ├── useBookingRequests.ts # Hook de sol·licituds
│   │   ├── useAvailability.ts   # Hook de disponibilitat
│   │   └── index.ts
│   ├── context/                 # Context API
│   │   ├── AuthContext.tsx      # Context d'autenticació
│   │   └── ToastContext.tsx     # Context de notificacions
│   ├── types/                   # Definicions de tipus TypeScript
│   │   ├── api.ts               # Tipus d'API
│   │   ├── booking.ts           # Tipus de reserves
│   │   ├── user.ts              # Tipus d'usuaris
│   │   ├── court.ts             # Tipus de pistes
│   │   ├── timeSlot.ts          # Tipus de franges horàries
│   │   └── index.ts
│   ├── utils/                   # Utilitats
│   │   ├── dateUtils.ts         # Funcions de dates
│   │   ├── validationSchemas.ts # Schemas de validació (Zod)
│   │   ├── constants.ts         # Constants de l'aplicació
│   │   └── index.ts
│   ├── test/                    # Configuració de tests
│   │   ├── setup.ts             # Setup de Vitest
│   │   ├── arbitraries.ts       # Generadors per property-based testing
│   │   └── README.md
│   ├── App.tsx                  # Component principal
│   ├── main.tsx                 # Punt d'entrada
│   ├── router.tsx               # Configuració de rutes
│   └── index.css                # Estils globals
├── .env.example                 # Exemple de variables d'entorn
├── .gitignore                   # Fitxers ignorats per Git
├── components.json              # Configuració de shadcn/ui
├── eslint.config.js             # Configuració d'ESLint
├── index.html                   # HTML principal
├── package.json                 # Dependències i scripts
├── postcss.config.js            # Configuració de PostCSS
├── tailwind.config.js           # Configuració de Tailwind CSS
├── tsconfig.json                # Configuració de TypeScript
├── vite.config.ts               # Configuració de Vite
├── vitest.config.ts             # Configuració de Vitest
└── README.md                    # Aquest fitxer
```

## 🛠️ Tecnologies Utilitzades

### Core
- **React 19**: Biblioteca per construir interfícies d'usuari
- **TypeScript**: Superset de JavaScript amb tipat estàtic
- **Vite**: Build tool ràpid i modern

### Routing i State
- **React Router v6**: Gestió de rutes i navegació
- **React Context API**: Gestió d'estat global
- **Custom Hooks**: Encapsulació de lògica reutilitzable

### UI i Estils
- **Tailwind CSS**: Framework CSS utility-first
- **shadcn/ui**: Components UI accessibles i personalitzables
- **Lucide React**: Icones modernes
- **Radix UI**: Primitives UI accessibles

### Formularis i Validació
- **React Hook Form**: Gestió de formularis eficient
- **Zod**: Validació de schemas TypeScript-first

### HTTP i Dates
- **Axios**: Client HTTP amb interceptors
- **date-fns**: Manipulació de dates moderna

### Testing
- **Vitest**: Framework de testing ràpid
- **React Testing Library**: Testing de components React
- **fast-check**: Property-based testing
- **jsdom**: Entorn DOM per tests

## 💻 Desenvolupament

### Flux de Treball

1. **Inicia el backend**: Assegura't que l'API està en execució
   ```bash
   # Des del directori arrel del projecte
   npm run dev
   ```

2. **Inicia l'aplicació frontend**:
   ```bash
   cd user-app
   npm run dev
   ```

3. **Accedeix a l'aplicació**: Obre `http://localhost:5173` al navegador

### Credencials de Prova

Per provar l'aplicació, utilitza les credencials creades al backend:
- Consulta el fitxer `CREDENTIALS.md` al directori arrel del projecte

### Hot Module Replacement (HMR)

Vite proporciona HMR automàtic:
- Els canvis als components es reflecteixen instantàniament
- L'estat de l'aplicació es preserva quan és possible
- Els errors es mostren a la consola del navegador

### Estructura de Components

L'aplicació segueix el patró **Container/Presentational**:
- **Pages**: Components contenidors amb lògica de negoci
- **Components**: Components de presentació reutilitzables

### Gestió d'Estat

- **AuthContext**: Gestió de l'autenticació i usuari actual
- **ToastContext**: Gestió de notificacions
- **Custom Hooks**: Encapsulació de lògica de dades (useBookings, useAvailability, etc.)

## 🧪 Testing

### Executar Tests

```bash
# Tests unitaris i de components
npm test

# Mode watch per desenvolupament
npm run test:watch

# Amb cobertura de codi
npm run test:coverage
```

### Tipus de Tests

1. **Unit Tests**: Tests de funcions i utilitats
2. **Component Tests**: Tests de components React amb React Testing Library
3. **Property-Based Tests**: Tests amb fast-check per validació de propietats

### Cobertura de Tests

Els tests cobreixen:
- Components comuns (LoadingSpinner, ErrorMessage, ConfirmDialog)
- Lògica de validació
- Utilitats de dates
- Generadors de dades per testing (arbitraries)

## 🏗️ Build i Desplegament

### Build de Producció

```bash
npm run build
```

Això genera:
- Fitxers optimitzats a `dist/`
- Chunks separats per vendors (React, UI libraries)
- Assets amb hash per cache busting
- Minificació de JavaScript i CSS

### Preview Local

```bash
npm run preview
```

Serveix els fitxers de `dist/` localment per verificar el build.

### Desplegament

Els fitxers de `dist/` es poden desplegar a qualsevol servei d'hosting estàtic:

- **Vercel**: `vercel deploy`
- **Netlify**: Arrossega la carpeta `dist/` o connecta el repositori
- **AWS S3 + CloudFront**: Puja els fitxers a S3 i configura CloudFront
- **Nginx**: Serveix els fitxers estàtics amb Nginx

### Variables d'Entorn en Producció

Assegura't de configurar `VITE_API_BASE_URL` amb la URL de producció de l'API:

```env
VITE_API_BASE_URL=https://api.teu-domini.com/api
```

## 🔧 Resolució de Problemes

### L'aplicació no es connecta a l'API

- Verifica que el backend està en execució
- Comprova la variable `VITE_API_BASE_URL` al fitxer `.env`
- Revisa la configuració del proxy a `vite.config.ts`

### Errors de TypeScript

```bash
# Neteja i reinstal·la dependències
rm -rf node_modules package-lock.json
npm install

# Verifica la configuració de TypeScript
npx tsc --noEmit
```

### Errors de Build

```bash
# Neteja la carpeta dist
rm -rf dist

# Torna a fer el build
npm run build
```

### Tests que fallen

```bash
# Neteja la cache de Vitest
npm run test -- --clearCache

# Executa tests en mode verbose
npm run test -- --reporter=verbose
```

## 📝 Convencions de Codi

- **Noms de fitxers**: PascalCase per components (`BookingCard.tsx`), camelCase per utilitats (`dateUtils.ts`)
- **Components**: Utilitza functional components amb hooks
- **Tipus**: Defineix interfícies explícites per props i estat
- **Estils**: Utilitza Tailwind CSS classes, evita CSS inline
- **Imports**: Utilitza l'alias `@/` per imports absoluts

## 📄 Llicència

Aquest projecte és privat i propietat de [Nom de l'Organització].

## 👥 Suport

Per problemes o preguntes:
- Obre un issue al repositori
- Contacta amb l'equip de desenvolupament

---

**Nota**: Aquest README assumeix que el backend està configurat i en execució. Consulta la documentació del backend per més informació sobre la seva configuració i desplegament.
