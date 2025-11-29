# Admin App - Aplicació d'Administració per Gestió de Reserves de Pàdel

Aplicació web frontend per als administradors del sistema de gestió de reserves de pàdel. Permet gestionar pistes, horaris, usuaris, reserves i executar sortejos d'assignació.

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

- **Autenticació d'Administradors**: Inici de sessió segur amb JWT
- **Dashboard d'Administració**: Vista general del sistema amb estadístiques
- **Gestió de Pistes**: Crear, editar, activar/desactivar i eliminar pistes
- **Gestió d'Horaris**: Configurar franges horàries (Hora Vall / Hora Punta)
- **Gestió d'Usuaris**: Administrar usuaris, tipus i comptadors d'ús
- **Visualització de Reserves**: Vista de calendari i llista amb filtres avançats
- **Execució de Sortejos**: Gestió manual del procés d'assignació de reserves
- **Estadístiques Detallades**: Anàlisi d'ús de pistes, demanda i usuaris
- **Responsive Design**: Interfície adaptada a diferents dispositius

## 📦 Requisits Previs

Abans de començar, assegura't de tenir instal·lat:

- **Node.js**: versió 18.x o superior
- **npm**: versió 9.x o superior (inclòs amb Node.js)
- **Backend API**: El servidor backend ha d'estar en execució (per defecte a `http://localhost:3000`)
- **Credencials d'Administrador**: Necessites un compte d'administrador al sistema

## 🚀 Instal·lació

1. **Clona el repositori** (si encara no ho has fet):
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. **Navega al directori de l'aplicació**:
   ```bash
   cd admin-app
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
- **Port de desenvolupament**: `5174` (diferent de User App per evitar conflictes)
- **Proxy**: Les peticions a `/api` es redireccionen automàticament al backend

### Credencials d'Administrador

Per accedir a l'aplicació necessites credencials d'administrador:
- Consulta el fitxer `CREDENTIALS.md` al directori arrel del projecte
- O crea un usuari administrador utilitzant els scripts del backend

## 📜 Scripts Disponibles

### Desenvolupament

```bash
npm run dev
```
Inicia el servidor de desenvolupament amb hot-reload.
- URL: `http://localhost:5174`
- Els canvis es reflecteixen automàticament al navegador

### Build de Producció

```bash
npm run build
```
Compila l'aplicació per a producció:
- Executa la verificació de tipus de TypeScript
- Genera els fitxers optimitzats a la carpeta `dist/`
- Aplica minificació i optimitzacions
- Separa vendors en chunks per millor caching

### Preview de Build

```bash
npm run preview
```
Serveix la versió de producció localment per provar-la abans del desplegament.
- URL: `http://localhost:4174`

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
admin-app/
├── public/                      # Fitxers estàtics
│   └── vite.svg
├── src/
│   ├── components/              # Components React
│   │   ├── ui/                  # Components base (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ...
│   │   ├── layout/              # Components de layout
│   │   │   ├── AdminHeader.tsx  # Capçalera d'administració
│   │   │   ├── AdminSidebar.tsx # Menú lateral d'administració
│   │   │   └── AdminLayout.tsx  # Layout principal
│   │   ├── auth/                # Components d'autenticació
│   │   │   ├── AdminLoginForm.tsx # Formulari de login admin
│   │   │   └── ProtectedRoute.tsx # Protecció de rutes
│   │   ├── courts/              # Components de pistes
│   │   │   ├── CourtList.tsx    # Llista de pistes
│   │   │   ├── CourtForm.tsx    # Formulari de pista
│   │   │   └── CourtCard.tsx    # Targeta de pista
│   │   ├── timeslots/           # Components d'horaris
│   │   │   ├── TimeSlotList.tsx # Llista de franges horàries
│   │   │   ├── TimeSlotForm.tsx # Formulari de franja
│   │   │   └── TimeSlotCard.tsx # Targeta de franja
│   │   ├── users/               # Components d'usuaris
│   │   │   ├── UserList.tsx     # Llista d'usuaris
│   │   │   ├── UserForm.tsx     # Formulari d'usuari
│   │   │   ├── UserCard.tsx     # Targeta d'usuari
│   │   │   └── UserFilters.tsx  # Filtres d'usuaris
│   │   ├── bookings/            # Components de reserves
│   │   │   ├── BookingCalendarView.tsx # Vista de calendari
│   │   │   ├── BookingListView.tsx     # Vista de llista
│   │   │   ├── BookingDetails.tsx      # Detalls de reserva
│   │   │   └── BookingFilters.tsx      # Filtres de reserves
│   │   ├── lottery/             # Components de sorteig
│   │   │   ├── LotteryDashboard.tsx    # Dashboard de sortejos
│   │   │   ├── LotteryExecutor.tsx     # Executor de sorteig
│   │   │   └── LotteryResults.tsx      # Resultats de sorteig
│   │   ├── stats/               # Components d'estadístiques
│   │   │   ├── StatsOverview.tsx       # Resum d'estadístiques
│   │   │   ├── UsageChart.tsx          # Gràfic d'ús de pistes
│   │   │   ├── UserStatsTable.tsx      # Taula d'estadístiques d'usuaris
│   │   │   ├── BookingsByTypeChart.tsx # Gràfic per tipus d'usuari
│   │   │   └── TimeSlotDemandChart.tsx # Gràfic de demanda per horari
│   │   └── common/              # Components comuns
│   │       ├── LoadingSpinner.tsx      # Indicador de càrrega
│   │       ├── ErrorMessage.tsx        # Missatges d'error
│   │       └── ConfirmDialog.tsx       # Diàleg de confirmació
│   ├── pages/                   # Pàgines de l'aplicació
│   │   ├── AdminLoginPage.tsx   # Pàgina d'inici de sessió
│   │   ├── AdminDashboardPage.tsx # Dashboard principal
│   │   ├── CourtsPage.tsx       # Gestió de pistes
│   │   ├── TimeSlotsPage.tsx    # Gestió d'horaris
│   │   ├── UsersPage.tsx        # Gestió d'usuaris
│   │   ├── BookingsPage.tsx     # Visualització de reserves
│   │   ├── LotteryPage.tsx      # Gestió de sortejos
│   │   ├── StatsPage.tsx        # Estadístiques detallades
│   │   └── NotFoundPage.tsx     # Pàgina 404
│   ├── services/                # Capa de serveis
│   │   ├── api.ts               # Client HTTP (Axios)
│   │   ├── authService.ts       # Servei d'autenticació
│   │   ├── courtService.ts      # Servei de pistes
│   │   ├── timeSlotService.ts   # Servei d'horaris
│   │   ├── userService.ts       # Servei d'usuaris
│   │   ├── bookingService.ts    # Servei de reserves
│   │   ├── lotteryService.ts    # Servei de sortejos
│   │   └── statsService.ts      # Servei d'estadístiques
│   ├── hooks/                   # Custom React Hooks
│   │   ├── useAuth.ts           # Hook d'autenticació
│   │   ├── useCourts.ts         # Hook de pistes
│   │   ├── useTimeSlots.ts      # Hook d'horaris
│   │   ├── useUsers.ts          # Hook d'usuaris
│   │   ├── useBookings.ts       # Hook de reserves
│   │   ├── useLottery.ts        # Hook de sortejos
│   │   ├── useStats.ts          # Hook d'estadístiques
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

2. **Inicia l'aplicació d'administració**:
   ```bash
   cd admin-app
   npm run dev
   ```

3. **Accedeix a l'aplicació**: Obre `http://localhost:5174` al navegador

### Credencials d'Administrador

Per accedir a l'aplicació d'administració:
- Consulta el fitxer `CREDENTIALS.md` al directori arrel del projecte
- Utilitza les credencials d'un usuari amb rol d'administrador

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

- **AuthContext**: Gestió de l'autenticació i administrador actual
- **ToastContext**: Gestió de notificacions
- **Custom Hooks**: Encapsulació de lògica de dades (useCourts, useUsers, useLottery, etc.)

### Funcionalitats Principals

#### 1. Gestió de Pistes
- Crear noves pistes amb nom i descripció
- Editar pistes existents
- Activar/desactivar pistes
- Eliminar pistes (només si no tenen reserves actives)

#### 2. Gestió d'Horaris
- Configurar franges horàries per dia de la setmana
- Classificar franges com Hora Vall o Hora Punta
- Validació de temps (hora fi > hora inici)
- Advertències de conflictes amb reserves existents

#### 3. Gestió d'Usuaris
- Llistar tots els usuaris del sistema
- Crear nous usuaris (Soci o No Soci)
- Editar informació d'usuaris
- Filtrar per tipus d'usuari
- Visualitzar comptadors d'ús

#### 4. Visualització de Reserves
- Vista de calendari amb reserves
- Vista de llista amb filtres avançats
- Filtrar per data, pista, usuari i estat
- Veure detalls complets de cada reserva

#### 5. Gestió de Sortejos
- Visualitzar dates amb sol·licituds pendents
- Executar sorteig manualment per una data
- Veure resultats d'assignació
- Indicador de progrés durant l'execució

#### 6. Estadístiques
- Ús de pistes per període de temps
- Reserves per tipus d'usuari (Soci vs No Soci)
- Franges horàries més demandades
- Comptadors d'ús de tots els usuaris
- Gràfics interactius amb dades en temps real

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
- Components de reserves (BookingCalendarView, BookingListView, etc.)
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
- Chunks separats per vendors (React, UI libraries, Charts)
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

### Consideracions de Seguretat

- **Autenticació**: Només usuaris amb rol d'administrador poden accedir
- **Tokens JWT**: Emmagatzemats de forma segura al localStorage
- **HTTPS**: Utilitza sempre HTTPS en producció
- **CORS**: Configura correctament les polítiques CORS al backend
- **Variables d'Entorn**: No commitejis fitxers `.env` amb credencials reals

## 🔧 Resolució de Problemes

### L'aplicació no es connecta a l'API

- Verifica que el backend està en execució
- Comprova la variable `VITE_API_BASE_URL` al fitxer `.env`
- Revisa la configuració del proxy a `vite.config.ts`
- Verifica que el port 5174 no està en ús

### Errors d'Autenticació

- Assegura't d'utilitzar credencials d'administrador vàlides
- Comprova que el token JWT no ha expirat
- Neteja el localStorage i torna a iniciar sessió

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

### Conflicte de Ports

Si el port 5174 està en ús:
```bash
# Modifica el port a vite.config.ts
server: {
  port: 5175, // O qualsevol altre port disponible
}
```

## 📝 Convencions de Codi

- **Noms de fitxers**: PascalCase per components (`CourtCard.tsx`), camelCase per utilitats (`dateUtils.ts`)
- **Components**: Utilitza functional components amb hooks
- **Tipus**: Defineix interfícies explícites per props i estat
- **Estils**: Utilitza Tailwind CSS classes, evita CSS inline
- **Imports**: Utilitza l'alias `@/` per imports absoluts
- **Comentaris**: Documenta funcions complexes i lògica de negoci

## 🔐 Permisos i Rols

Aquesta aplicació està dissenyada exclusivament per a **administradors**:
- Accés complet a totes les funcionalitats de gestió
- Capacitat de modificar dades del sistema
- Execució de processos crítics (sortejos)
- Visualització d'informació sensible d'usuaris

**Important**: No comparteixis credencials d'administrador amb usuaris finals.

## 📄 Llicència

Aquest projecte és privat i propietat de [Nom de l'Organització].

## 👥 Suport

Per problemes o preguntes:
- Obre un issue al repositori
- Contacta amb l'equip de desenvolupament
- Consulta la documentació del backend per problemes d'API

---

**Nota**: Aquest README assumeix que el backend està configurat i en execució. Consulta la documentació del backend per més informació sobre la seva configuració i desplegament.

## 📚 Recursos Addicionals

- **User App**: Consulta el README de `user-app/` per la documentació de l'aplicació d'usuari
- **Backend API**: Consulta la documentació del backend per endpoints i models de dades
- **Guia de Testing Manual**: Consulta `MANUAL_TESTING_GUIDE.md` al directori arrel
- **Validació d'API**: Consulta `API_INTEGRATION_VALIDATION.md` per verificar la integració
