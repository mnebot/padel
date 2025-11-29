# Scripts de Dades Sintètiques

Aquest directori conté scripts per generar dades de prova per al sistema de gestió de reserves de pàdel.

## Scripts Disponibles

### 1. `seed-synthetic-data.ts`
Script complet que genera totes les dades sintètiques necessàries per provar l'aplicació.

**Què genera:**
- 26 usuaris (1 admin, 15 socis, 10 no socis)
- 4 pistes de pàdel
- Franges horàries per tots els dies de la setmana
- 20 reserves passades (completades)
- 15 reserves futures (confirmades)
- 10 sol·licituds pendents
- Comptadors d'ús per cada usuari

**Com executar:**
```bash
npm run seed
```

### 2. `create-test-users.ts`
Script simple que només crea 3 usuaris bàsics per fer proves ràpides.

**Què genera:**
- 1 usuari admin
- 1 usuari soci
- 1 usuari no soci

**Com executar:**
```bash
npm run seed:users
```

## Credencials Generades

### Script Complet (seed-synthetic-data.ts)

**Admin:**
- Email: `admin@padel.com`
- Password: `password123`

**Socis (15):**
- Email: `soci1@padel.com` fins a `soci15@padel.com`
- Password: `password123`

**No Socis (10):**
- Email: `user1@padel.com` fins a `user10@padel.com`
- Password: `password123`

### Script Bàsic (create-test-users.ts)

- Admin: `admin@padel.com` / `password123`
- Soci: `member@padel.com` / `password123`
- No Soci: `user@padel.com` / `password123`

## Notes Importants

1. **Base de dades:** Assegura't que la base de dades està configurada i les migracions estan aplicades abans d'executar els scripts:
   ```bash
   npm run prisma:migrate
   ```

2. **Dades existents:** Els scripts utilitzen `upsert` per usuaris i pistes, així que no duplicaran dades si ja existeixen.

3. **Reserves:** Les reserves es generen amb dates relatives (passades i futures) basades en la data actual d'execució.

4. **Participants:** Cada reserva i sol·licitud inclou participants aleatoris segons el nombre de jugadors especificat.

## Personalització

Pots modificar els scripts per ajustar:
- Nombre d'usuaris generats
- Nombre de reserves i sol·licituds
- Rangs de dates
- Noms i cognoms catalans utilitzats
- Configuració de pistes i franges horàries
