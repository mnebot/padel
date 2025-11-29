# Guia de Proves Manuals - Aplicacions Frontend

Aquesta guia proporciona instruccions detallades per provar manualment les aplicacions User App i Admin App.

## Prerequisits

### 1. Instal·lació

```bash
# Backend
cd /path/to/project
npm install

# User App
cd user-app
npm install

# Admin App
cd admin-app
npm install
```

### 2. Configuració

```bash
# User App
cd user-app
cp .env.example .env
# Editar .env si cal canviar la URL de l'API

# Admin App
cd admin-app
cp .env.example .env
# Editar .env si cal canviar la URL de l'API
```

### 3. Crear Usuaris de Prova

```bash
# Des del directori arrel
npx ts-node scripts/create-test-users.ts
```

Això crearà:
- Usuari Soci: `soci@test.com` / `password123`
- Usuari No Soci: `nosoci@test.com` / `password123`
- Administrador: `admin@test.com` / `admin123`

### 4. Iniciar Aplicacions

```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: User App
cd user-app
npm run dev

# Terminal 3: Admin App
cd admin-app
npm run dev
```

**URLs:**
- Backend: http://localhost:3000
- API Docs: http://localhost:3000/api-docs
- User App: http://localhost:5173
- Admin App: http://localhost:5174

## Proves de Responsive Design

### Configurar Chrome DevTools

1. Obrir Chrome
2. Navegar a l'aplicació (User App o Admin App)
3. Obrir DevTools (F12)
4. Clicar la icona "Toggle device toolbar" (Ctrl+Shift+M)
5. Seleccionar un dispositiu del menú desplegable

### Dispositius a Provar

#### 1. iPhone SE (375x667) - Mòbil Petit
**User App:**
- [ ] Header mostra només logo i icona de sortir
- [ ] Botó de menú flotant visible a la cantonada inferior dreta
- [ ] Clicar el botó obre el menú amb animació suau
- [ ] Overlay fosc apareix quan el menú està obert
- [ ] Clicar l'overlay tanca el menú
- [ ] Clicar un enllaç del menú tanca el menú i navega
- [ ] Dashboard mostra 1 columna per a reserves
- [ ] Accions ràpides en 1 columna
- [ ] Botons tenen ample complet
- [ ] Text és llegible sense zoom

**Admin App:**
- [ ] Header mostra només logo i icona de sortir
- [ ] Subtítol del header ocult
- [ ] Botó de menú flotant visible
- [ ] Menú s'obre amb animació suau
- [ ] Dashboard mostra 1 columna per a gràfics
- [ ] Accions ràpides en 1 columna

#### 2. iPhone 12 Pro (390x844) - Mòbil Estàndard
**User App:**
- [ ] Mateix comportament que iPhone SE
- [ ] Més espai vertical per al contingut
- [ ] Scroll funciona correctament

**Admin App:**
- [ ] Mateix comportament que iPhone SE
- [ ] Més espai vertical per al contingut

#### 3. iPad (768x1024) - Tablet
**User App:**
- [ ] Header mostra informació completa d'usuari
- [ ] Text "Sortir" visible al botó
- [ ] Menú lateral visible permanentment
- [ ] Botó de menú flotant ocult
- [ ] Dashboard mostra 2 columnes per a reserves
- [ ] Accions ràpides en 3 columnes

**Admin App:**
- [ ] Header mostra informació completa i subtítol
- [ ] Menú lateral visible permanentment
- [ ] Dashboard mostra 2 columnes per a gràfics
- [ ] Accions ràpides en 3 columnes

#### 4. Desktop (1920x1080)
**User App:**
- [ ] Layout complet amb tots els elements visibles
- [ ] Espaiament òptim
- [ ] Contingut centrat amb max-width

**Admin App:**
- [ ] Layout complet amb tots els elements visibles
- [ ] Espaiament òptim
- [ ] Contingut centrat amb max-width

### Proves d'Orientació

#### Tablet en Horitzontal
- [ ] Layout s'adapta correctament
- [ ] Menú lateral visible
- [ ] Contingut aprofita l'espai disponible

#### Telèfon en Horitzontal
- [ ] Menú encara ocult
- [ ] Botó flotant visible
- [ ] Contingut llegible

## Proves d'Integració amb API

### 1. Autenticació

#### User App - Login
1. Navegar a http://localhost:5173
2. Hauria de redirigir a `/login`
3. **Prova 1: Credencials invàlides**
   - [ ] Introduir email: `invalid@test.com`
   - [ ] Introduir password: `wrong`
   - [ ] Clicar "Iniciar sessió"
   - [ ] Verificar que mostra error: "Credencials no vàlides" o similar
4. **Prova 2: Credencials vàlides (Soci)**
   - [ ] Introduir email: `soci@test.com`
   - [ ] Introduir password: `password123`
   - [ ] Clicar "Iniciar sessió"
   - [ ] Verificar que redirigeix a dashboard
   - [ ] Verificar que mostra nom d'usuari al header
   - [ ] Verificar que mostra "Soci" com a tipus
5. **Prova 3: Persistència de sessió**
   - [ ] Recarregar la pàgina (F5)
   - [ ] Verificar que continua autenticat
   - [ ] Verificar que no redirigeix a login
6. **Prova 4: Logout**
   - [ ] Clicar botó "Sortir"
   - [ ] Verificar que redirigeix a login
   - [ ] Intentar navegar a `/` → hauria de redirigir a login

#### Admin App - Login
1. Navegar a http://localhost:5174
2. Hauria de redirigir a `/login`
3. **Prova 1: Credencials d'usuari normal**
   - [ ] Introduir email: `soci@test.com`
   - [ ] Introduir password: `password123`
   - [ ] Clicar "Iniciar sessió"
   - [ ] Verificar que mostra error (usuari no és admin)
4. **Prova 2: Credencials d'admin**
   - [ ] Introduir email: `admin@test.com`
   - [ ] Introduir password: `admin123`
   - [ ] Clicar "Iniciar sessió"
   - [ ] Verificar que redirigeix a dashboard
   - [ ] Verificar que mostra "Administrador"
5. **Prova 3: Persistència i logout**
   - [ ] Recarregar la pàgina → continua autenticat
   - [ ] Clicar "Sortir" → redirigeix a login

### 2. User App - Dashboard

**Login com a Soci:** `soci@test.com` / `password123`

1. **Estadístiques**
   - [ ] Mostra tipus d'usuari: "Soci"
   - [ ] Mostra comptador d'ús
2. **Reserves Properes**
   - [ ] Mostra llista de reserves confirmades
   - [ ] Cada reserva mostra: pista, data, hora, jugadors
   - [ ] Si no hi ha reserves, mostra missatge apropiat
3. **Sol·licituds Pendents**
   - [ ] Mostra llista de sol·licituds pendents
   - [ ] Cada sol·licitud mostra: data, hora, jugadors, estat
   - [ ] Si no hi ha sol·licituds, mostra missatge apropiat
4. **Accions Ràpides**
   - [ ] Clicar "Nova Reserva" → navega a `/bookings/new`
   - [ ] Clicar "Les Meves Reserves" → navega a `/bookings`
   - [ ] Clicar "Historial" → navega a `/history`

### 3. User App - Crear Reserva/Sol·licitud

1. **Navegar a Nova Reserva**
   - [ ] Clicar "Nova Reserva" des del dashboard
   - [ ] Verificar que mostra calendari
2. **Seleccionar Data (Sol·licitud - 5-2 dies)**
   - [ ] Seleccionar una data entre 5 i 2 dies en el futur
   - [ ] Verificar que mostra indicador de càrrega
   - [ ] Verificar que mostra franges horàries disponibles
   - [ ] Verificar que indica Hora Vall / Hora Punta
3. **Crear Sol·licitud**
   - [ ] Seleccionar una franja horària
   - [ ] Verificar que mostra formulari
   - [ ] Introduir nombre de jugadors: 3
   - [ ] Clicar "Crear Sol·licitud"
   - [ ] Verificar que mostra notificació d'èxit
   - [ ] Verificar que redirigeix a dashboard
   - [ ] Verificar que la nova sol·licitud apareix a "Sol·licituds Pendents"
4. **Seleccionar Data (Reserva Directa - <2 dies)**
   - [ ] Tornar a "Nova Reserva"
   - [ ] Seleccionar una data demà o avui
   - [ ] Verificar que mostra pistes disponibles per cada franja
5. **Crear Reserva Directa**
   - [ ] Seleccionar una franja amb pistes disponibles
   - [ ] Seleccionar una pista
   - [ ] Verificar que mostra formulari amb pista preseleccionada
   - [ ] Introduir nombre de jugadors: 4
   - [ ] Clicar "Crear Reserva"
   - [ ] Verificar que mostra notificació d'èxit
   - [ ] Verificar que redirigeix a dashboard
   - [ ] Verificar que la nova reserva apareix a "Reserves Properes"
6. **Validació**
   - [ ] Intentar crear reserva amb 1 jugador → mostra error
   - [ ] Intentar crear reserva amb 5 jugadors → mostra error
   - [ ] Intentar crear reserva sense seleccionar pista → mostra error

### 4. User App - Gestionar Reserves

1. **Navegar a Reserves**
   - [ ] Clicar "Les Meves Reserves"
   - [ ] Verificar que mostra totes les reserves i sol·licituds
2. **Veure Detalls**
   - [ ] Clicar una reserva
   - [ ] Verificar que mostra tots els detalls
3. **Cancel·lar Reserva**
   - [ ] Clicar botó "Cancel·lar" d'una reserva
   - [ ] Verificar que mostra diàleg de confirmació
   - [ ] Clicar "Cancel·lar" al diàleg → no fa res
   - [ ] Tornar a clicar "Cancel·lar" a la reserva
   - [ ] Clicar "Confirmar" al diàleg
   - [ ] Verificar que mostra notificació d'èxit
   - [ ] Verificar que la reserva desapareix de la llista
4. **Cancel·lar Sol·licitud**
   - [ ] Mateix procés que cancel·lar reserva
   - [ ] Verificar que funciona correctament

### 5. User App - Historial

1. **Navegar a Historial**
   - [ ] Clicar "Historial"
   - [ ] Verificar que mostra reserves completades i cancel·lades
2. **Filtrar**
   - [ ] Filtrar per data
   - [ ] Filtrar per estat (Completada / Cancel·lada)
   - [ ] Verificar que els filtres funcionen
3. **Ordenació**
   - [ ] Verificar que les reserves estan ordenades per data descendent

### 6. Admin App - Dashboard

**Login com a Admin:** `admin@test.com` / `admin123`

1. **Estadístiques Generals**
   - [ ] Mostra nombre de reserves actives
   - [ ] Mostra nombre de sol·licituds pendents
   - [ ] Mostra nombre d'usuaris
   - [ ] Mostra nombre de pistes
2. **Gràfics**
   - [ ] Mostra gràfic d'ús de pistes
   - [ ] Mostra resum de reserves per estat
3. **Accions Ràpides**
   - [ ] Clicar "Gestionar Pistes" → navega a `/courts`
   - [ ] Clicar "Gestionar Usuaris" → navega a `/users`
   - [ ] Clicar "Executar Sorteig" → navega a `/lottery`

### 7. Admin App - Gestió de Pistes

1. **Llistar Pistes**
   - [ ] Navegar a "Pistes"
   - [ ] Verificar que mostra totes les pistes
   - [ ] Cada pista mostra: nom, descripció, estat
2. **Crear Pista**
   - [ ] Clicar "Nova Pista"
   - [ ] Introduir nom: "Pista Test"
   - [ ] Introduir descripció: "Pista de prova"
   - [ ] Marcar "Activa"
   - [ ] Clicar "Crear"
   - [ ] Verificar que mostra notificació d'èxit
   - [ ] Verificar que la nova pista apareix a la llista
3. **Editar Pista**
   - [ ] Clicar "Editar" a una pista
   - [ ] Canviar el nom
   - [ ] Clicar "Guardar"
   - [ ] Verificar que mostra notificació d'èxit
   - [ ] Verificar que els canvis es reflecteixen
4. **Desactivar Pista**
   - [ ] Clicar "Desactivar" a una pista activa
   - [ ] Verificar que canvia a "Inactiva"
5. **Eliminar Pista**
   - [ ] Intentar eliminar una pista amb reserves → mostra error
   - [ ] Eliminar una pista sense reserves → funciona

### 8. Admin App - Gestió d'Horaris

1. **Llistar Horaris**
   - [ ] Navegar a "Horaris"
   - [ ] Verificar que mostra totes les franges horàries
2. **Crear Franja Horària**
   - [ ] Clicar "Nova Franja"
   - [ ] Seleccionar dia de la setmana
   - [ ] Introduir hora inici: 09:00
   - [ ] Introduir hora fi: 10:30
   - [ ] Seleccionar tipus: Hora Vall
   - [ ] Clicar "Crear"
   - [ ] Verificar que mostra notificació d'èxit
3. **Validació**
   - [ ] Intentar crear franja amb hora fi < hora inici → mostra error
4. **Editar i Eliminar**
   - [ ] Editar una franja → funciona
   - [ ] Eliminar una franja → funciona

### 9. Admin App - Gestió d'Usuaris

1. **Llistar Usuaris**
   - [ ] Navegar a "Usuaris"
   - [ ] Verificar que mostra tots els usuaris
   - [ ] Cada usuari mostra: nom, email, tipus, comptador d'ús
2. **Filtrar Usuaris**
   - [ ] Filtrar per "Soci" → mostra només socis
   - [ ] Filtrar per "No Soci" → mostra només no socis
   - [ ] Filtrar per "Tots" → mostra tots
3. **Crear Usuari**
   - [ ] Clicar "Nou Usuari"
   - [ ] Introduir dades
   - [ ] Seleccionar tipus
   - [ ] Clicar "Crear"
   - [ ] Verificar que mostra notificació d'èxit
4. **Editar Usuari**
   - [ ] Clicar "Editar" a un usuari
   - [ ] Canviar tipus d'usuari
   - [ ] Clicar "Guardar"
   - [ ] Verificar que els canvis es reflecteixen

### 10. Admin App - Visualització de Reserves

1. **Llistar Reserves**
   - [ ] Navegar a "Reserves"
   - [ ] Verificar que mostra totes les reserves
2. **Filtrar Reserves**
   - [ ] Filtrar per data
   - [ ] Filtrar per pista
   - [ ] Filtrar per usuari
   - [ ] Filtrar per estat
   - [ ] Verificar que els filtres funcionen
3. **Veure Detalls**
   - [ ] Clicar una reserva
   - [ ] Verificar que mostra tots els detalls incloent usuari
4. **Canviar Vista**
   - [ ] Canviar a vista de calendari
   - [ ] Canviar a vista de llista
   - [ ] Verificar que ambdues vistes funcionen

### 11. Admin App - Sorteig

1. **Navegar a Sorteig**
   - [ ] Navegar a "Sortejos"
   - [ ] Verificar que mostra dates amb sol·licituds pendents
2. **Executar Sorteig**
   - [ ] Seleccionar una data amb sol·licituds
   - [ ] Clicar "Executar Sorteig"
   - [ ] Verificar que mostra indicador de progrés
   - [ ] Verificar que mostra resultats
   - [ ] Verificar que mostra assignacions realitzades
3. **Veure Resultats**
   - [ ] Verificar que es poden veure els resultats de sortejos anteriors

### 12. Admin App - Estadístiques

1. **Navegar a Estadístiques**
   - [ ] Navegar a "Estadístiques"
   - [ ] Verificar que mostra estadístiques detallades
2. **Seleccionar Període**
   - [ ] Seleccionar "Setmana"
   - [ ] Seleccionar "Mes"
   - [ ] Seleccionar "Any"
   - [ ] Verificar que les estadístiques s'actualitzen
3. **Veure Dades**
   - [ ] Ús de pistes per període
   - [ ] Reserves per tipus d'usuari
   - [ ] Franges horàries més demandades
   - [ ] Comptadors d'ús d'usuaris

## Proves de Gestió d'Errors

### 1. Error de Xarxa

1. **Aturar el Backend**
   - [ ] Aturar el servidor backend (Ctrl+C)
2. **Intentar Operació (User App)**
   - [ ] Intentar crear una reserva
   - [ ] Verificar que mostra error: "No s'ha pogut connectar amb el servidor"
   - [ ] Verificar que mostra notificació d'error
3. **Reiniciar Backend**
   - [ ] Reiniciar el servidor backend
4. **Tornar a Intentar**
   - [ ] Tornar a intentar crear la reserva
   - [ ] Verificar que funciona correctament

### 2. Errors de Validació

1. **User App**
   - [ ] Intentar crear reserva amb 0 jugadors → error
   - [ ] Intentar crear reserva amb 10 jugadors → error
   - [ ] Intentar crear reserva sense seleccionar data → error
2. **Admin App**
   - [ ] Intentar crear pista sense nom → error
   - [ ] Intentar crear franja amb hora fi < hora inici → error
   - [ ] Intentar crear usuari amb email existent → error

### 3. Errors de Negoci

1. **User App**
   - [ ] Intentar cancel·lar reserva completada → error apropiat
   - [ ] Intentar reservar pista no disponible → error apropiat
2. **Admin App**
   - [ ] Intentar eliminar pista amb reserves → error apropiat
   - [ ] Intentar executar sorteig sense sol·licituds → error apropiat

## Checklist Final

### Responsive Design
- [ ] User App funciona correctament en mòbil
- [ ] User App funciona correctament en tablet
- [ ] User App funciona correctament en desktop
- [ ] Admin App funciona correctament en mòbil
- [ ] Admin App funciona correctament en tablet
- [ ] Admin App funciona correctament en desktop
- [ ] Menús mòbils funcionen amb animacions suaus
- [ ] Text és llegible en totes les mides
- [ ] Botons són prou grans per tocar

### Integració amb API
- [ ] Autenticació funciona correctament
- [ ] Totes les funcionalitats de User App funcionen
- [ ] Totes les funcionalitats d'Admin App funcionen
- [ ] Errors es mostren amb missatges clars
- [ ] Notificacions d'èxit i error funcionen
- [ ] Indicadors de càrrega es mostren
- [ ] Gestió d'errors de xarxa funciona
- [ ] Sessió es manté després de recarregar

### Experiència d'Usuari
- [ ] Navegació és intuïtiva
- [ ] Formularis són fàcils d'omplir
- [ ] Feedback visual és clar
- [ ] No hi ha elements sobreposats
- [ ] Colors i contrast són adequats
- [ ] Animacions són suaus
- [ ] Càrrega és ràpida

## Problemes Comuns i Solucions

### El backend no inicia
```bash
# Verificar que el port 3000 no està en ús
netstat -ano | findstr :3000

# Matar el procés si cal
taskkill /PID <PID> /F

# Reiniciar
npm run dev
```

### Les aplicacions frontend no inicien
```bash
# Verificar que els ports 5173 i 5174 no estan en ús
netstat -ano | findstr :5173
netstat -ano | findstr :5174

# Netejar i reinstal·lar
rm -rf node_modules
npm install
npm run dev
```

### Error "Cannot find module"
```bash
# Reinstal·lar dependències
npm install
```

### Error de CORS
```bash
# Verificar que el backend té CORS habilitat
# Verificar que les URLs són correctes a .env
```

## Conclusió

Aquesta guia proporciona un conjunt complet de proves manuals per validar tant el disseny responsive com la integració amb l'API de les aplicacions User App i Admin App.

**Recomanacions:**
1. Seguir l'ordre de les proves
2. Documentar qualsevol problema trobat
3. Provar amb diferents usuaris (Soci, No Soci, Admin)
4. Provar en diferents navegadors (Chrome, Firefox, Safari)
5. Provar en dispositius reals quan sigui possible

**Temps estimat de proves:** 2-3 hores per aplicació
