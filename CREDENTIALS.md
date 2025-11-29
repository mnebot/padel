# Credencials de Prova

## Usuaris de Prova

Pots utilitzar aquestes credencials per accedir a l'aplicació:

### Administrador
- **Email:** admin@padel.com
- **Contrasenya:** password123
- **Tipus:** Soci (MEMBER)
- **Rol:** Administrador

### Usuari Soci
- **Email:** member@padel.com
- **Contrasenya:** password123
- **Tipus:** Soci (MEMBER)
- **Rol:** Usuari

### Usuari No Soci
- **Email:** user@padel.com
- **Contrasenya:** password123
- **Tipus:** No Soci (NON_MEMBER)
- **Rol:** Usuari

## Com Iniciar les Aplicacions

### Backend (API)
```bash
npm run dev
```
El backend estarà disponible a: http://localhost:3000

### Aplicació d'Usuari
```bash
cd user-app
npm run dev
```

### Aplicació d'Administrador
```bash
cd admin-app
npm run dev
```

## Endpoints d'Autenticació

- **POST /api/auth/register** - Registrar nou usuari
- **POST /api/auth/login** - Iniciar sessió
- **POST /api/auth/logout** - Tancar sessió
- **GET /api/auth/me** - Obtenir usuari actual (requereix autenticació)
