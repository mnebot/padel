# Gestió de Reserves de Pàdel

Sistema de gestió de reserves de pàdel amb sorteig ponderat que prioritza socis i penalitza l'ús excessiu.

## Característiques

- Sol·licituds de reserves amb sorteig ponderat (5-2 dies d'antelació)
- Reserves directes per última hora (menys de 2 dies)
- Prioritat per a socis sobre no socis
- Comptador d'ús amb reset mensual automàtic
- Classificació d'horaris: Hora Vall i Hora Punta
- Validació de reserves per a 2-4 jugadors

## Requisits

- Node.js >= 18
- PostgreSQL >= 14
- npm o yarn

## Instal·lació

```bash
# Instal·lar dependències
npm install

# Configurar variables d'entorn
cp .env.example .env
# Editar .env amb les teves credencials

# Generar client de Prisma
npm run prisma:generate

# Executar migracions
npm run prisma:migrate
```

## Scripts

```bash
# Desenvolupament
npm run dev

# Build
npm run build

# Tests
npm test
npm run test:watch
```

## Estructura del Projecte

```
src/
├── controllers/    # Controladors de l'API REST
├── services/       # Lògica de negoci
├── repositories/   # Capa d'accés a dades
├── models/         # Models i tipus
└── utils/          # Utilitats i helpers
```

## Tecnologies

- TypeScript
- Express
- Prisma
- PostgreSQL
- Jest
- fast-check (Property-Based Testing)
- node-cron
