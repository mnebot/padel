# Document de Requisits

## Introducció

Aquest document defineix els requisits per a una aplicació de gestió de reserves de pàdel. El sistema permetrà als usuaris reservar pistes de pàdel, gestionar les seves reserves, i als administradors gestionar les pistes i horaris disponibles.

## Glossari

- **Sistema**: L'aplicació de gestió de reserves de pàdel
- **Usuari**: Persona que utilitza l'aplicació per fer reserves (pot ser Soci o No Soci)
- **Soci**: Usuari amb prioritat en el sistema de reserves
- **No Soci**: Usuari sense prioritat en el sistema de reserves
- **Administrador**: Persona amb permisos per gestionar pistes i configuració del sistema
- **Pista**: Instal·lació física de pàdel disponible per reservar
- **Reserva**: Assignació d'una pista a un usuari per un horari específic
- **Sol·licitud de Reserva**: Petició de reserva feta amb més de 2 dies d'antelació, pendent d'assignació
- **Reserva Confirmada**: Reserva amb pista assignada després del sorteig o reserva directa
- **Franja Horària**: Període de temps durant el qual es pot reservar una pista
- **Hora Vall**: Franja horària amb menor demanda i preu reduït
- **Hora Punta**: Franja horària amb major demanda i preu estàndard
- **Estat de Reserva**: Condició actual d'una reserva (sol·licitada, confirmada, cancel·lada, completada)
- **Comptador d'Ús**: Registre del nombre de vegades que un usuari ha utilitzat les pistes
- **Sorteig Ponderat**: Procés d'assignació de pistes que prioritza Socis i penalitza usuaris amb més ús previ
- **Pes d'Assignació**: Valor calculat per a cada sol·licitud que determina la probabilitat d'obtenir pista en el sorteig
- **Reset Mensual**: Procés automàtic que reinicia tots els Comptadors d'Ús el primer dia de cada mes
- **Finestra de Sol·licitud**: Període de 5 a 2 dies abans de la data desitjada per sol·licitar reserves
- **Finestra de Reserva Lliure**: Període de menys de 2 dies abans de la data on es poden fer reserves directes

## Requisits

### Requisit 1

**User Story:** Com a usuari, vull identificar-me com a soci o no soci, per tal que el sistema apliqui les regles de prioritat corresponents.

#### Criteris d'Acceptació

1. QUAN un usuari es registra al sistema ALESHORES el Sistema HAURÀ DE desar el seu tipus com a Soci o No Soci
2. QUAN un usuari accedeix al sistema ALESHORES el Sistema HAURÀ DE identificar el seu tipus d'usuari
3. QUAN es processa una sol·licitud de reserva ALESHORES el Sistema HAURÀ DE aplicar les regles de prioritat segons el tipus d'usuari
4. QUAN un administrador modifica el tipus d'usuari ALESHORES el Sistema HAURÀ DE actualitzar-lo i aplicar les noves regles a futures reserves

### Requisit 2

**User Story:** Com a usuari, vull veure les franges horàries disponibles amb la seva classificació, per tal de conèixer els preus i disponibilitat.

#### Criteris d'Acceptació

1. QUAN un usuari accedeix al sistema ALESHORES el Sistema HAURÀ DE mostrar les franges horàries classificades com a Hora Vall o Hora Punta
2. QUAN un usuari selecciona una data dins la finestra de sol·licitud ALESHORES el Sistema HAURÀ DE mostrar que les reserves estan pendents d'assignació
3. QUAN un usuari selecciona una data dins la finestra de reserva lliure ALESHORES el Sistema HAURÀ DE mostrar les pistes i horaris disponibles en temps real
4. QUAN es mostra una franja horària ALESHORES el Sistema HAURÀ DE indicar si és Hora Vall o Hora Punta

### Requisit 3

**User Story:** Com a usuari, vull sol·licitar una reserva amb antelació sense triar pista, per tal de participar en el sorteig d'assignació.

#### Criteris d'Acceptació

1. QUAN un usuari sol·licita una reserva amb entre 5 i 2 dies d'antelació ALESHORES el Sistema HAURÀ DE crear una Sol·licitud de Reserva sense pista assignada
2. QUAN un usuari especifica el nombre de jugadors ALESHORES el Sistema HAURÀ DE validar que sigui mínim 2 i màxim 4 persones
3. QUAN un usuari intenta sol·licitar amb més de 5 dies d'antelació ALESHORES el Sistema HAURÀ DE rebutjar la sol·licitud
4. QUAN es crea una sol·licitud ALESHORES el Sistema HAURÀ DE desar l'usuari, data, hora, nombre de jugadors i estat sol·licitat
5. QUAN es crea una sol·licitud ALESHORES el Sistema HAURÀ DE acceptar-la encara que hi hagi més sol·licituds que pistes disponibles

### Requisit 4

**User Story:** Com a sistema, vull comptabilitzar l'ús de les pistes per cada usuari, per tal d'aplicar el sorteig ponderat de manera justa.

#### Criteris d'Acceptació

1. QUAN un usuari completa una reserva ALESHORES el Sistema HAURÀ DE incrementar el seu Comptador d'Ús en una unitat
2. QUAN es consulta el comptador d'un usuari ALESHORES el Sistema HAURÀ DE retornar el nombre total de reserves completades des de l'últim reset
3. QUAN es cancel·la una reserva confirmada ALESHORES el Sistema HAURÀ DE mantenir el Comptador d'Ús sense modificar
4. QUAN arriba el primer dia del mes ALESHORES el Sistema HAURÀ DE reiniciar tots els Comptadors d'Ús a zero automàticament
5. QUAN un administrador consulta estadístiques ALESHORES el Sistema HAURÀ DE mostrar el Comptador d'Ús de tots els usuaris

### Requisit 5

**User Story:** Com a sistema, vull executar un sorteig ponderat 2 dies abans de la data sol·licitada, per tal d'assignar pistes de manera justa prioritzant socis.

#### Criteris d'Acceptació

1. QUAN arriba el moment 2 dies abans d'una data amb sol·licituds pendents ALESHORES el Sistema HAURÀ DE executar el sorteig ponderat automàticament
2. QUAN s'executa el sorteig per una franja horària sense sol·licituds de Socis ALESHORES el Sistema HAURÀ DE assignar totes les pistes disponibles exclusivament a sol·licituds de Socis si n'hi ha
3. QUAN s'executa el sorteig per una franja horària amb sol·licituds de Socis ALESHORES el Sistema HAURÀ DE calcular el Pes d'Assignació com a 2.0 dividit per 1 més el Comptador d'Ús multiplicat per 0.15
4. QUAN s'executa el sorteig per una franja horària amb sol·licituds de No Socis ALESHORES el Sistema HAURÀ DE calcular el Pes d'Assignació com a 1.0 dividit per 1 més el Comptador d'Ús multiplicat per 0.15
5. QUAN s'executa el sorteig ALESHORES el Sistema HAURÀ DE assignar pistes aleatòriament segons els Pesos d'Assignació calculats
6. QUAN s'assigna una pista a una sol·licitud ALESHORES el Sistema HAURÀ DE canviar l'estat a Reserva Confirmada amb pista assignada
7. QUAN una sol·licitud no obté pista en el sorteig ALESHORES el Sistema HAURÀ DE canviar el seu estat a no assignada

### Requisit 6

**User Story:** Com a usuari, vull fer reserves directes amb menys de 2 dies d'antelació, per tal d'aprofitar espais horaris disponibles.

#### Criteris d'Acceptació

1. QUAN un usuari sol·licita una reserva amb menys de 2 dies d'antelació ALESHORES el Sistema HAURÀ DE mostrar les pistes i horaris disponibles en temps real
2. QUAN un usuari selecciona una pista i horari disponible ALESHORES el Sistema HAURÀ DE crear una Reserva Confirmada immediatament
3. QUAN un usuari especifica el nombre de jugadors ALESHORES el Sistema HAURÀ DE validar que sigui mínim 2 i màxim 4 persones
4. QUAN un usuari intenta reservar una franja ja ocupada ALESHORES el Sistema HAURÀ DE rebutjar la reserva
5. QUAN es crea una reserva directa ALESHORES el Sistema HAURÀ DE no aplicar restriccions de prioritat ni sorteig

### Requisit 7

**User Story:** Com a usuari, vull veure les meves reserves i sol·licituds, per tal de gestionar la meva activitat.

#### Criteris d'Acceptació

1. QUAN un usuari accedeix a les seves reserves ALESHORES el Sistema HAURÀ DE mostrar totes les sol·licituds i reserves associades al seu compte
2. QUAN es mostren reserves ALESHORES el Sistema HAURÀ DE incloure la pista (si està assignada), data, hora, nombre de jugadors i estat
3. QUAN es mostra una sol·licitud pendent ALESHORES el Sistema HAURÀ DE indicar que està pendent d'assignació per sorteig
4. QUAN un usuari consulta el seu historial ALESHORES el Sistema HAURÀ DE mostrar el seu Comptador d'Ús actual

### Requisit 8

**User Story:** Com a usuari, vull cancel·lar una reserva o sol·licitud existent, per tal de poder alliberar l'espai si no puc assistir.

#### Criteris d'Acceptació

1. QUAN un usuari cancel·la una sol·licitud pendent ALESHORES el Sistema HAURÀ DE eliminar-la del sorteig
2. QUAN un usuari cancel·la una reserva confirmada ALESHORES el Sistema HAURÀ DE alliberar la pista per a altres usuaris immediatament
3. QUAN un usuari intenta cancel·lar una reserva ja completada ALESHORES el Sistema HAURÀ DE rebutjar l'operació
4. QUAN es cancel·la una reserva confirmada ALESHORES el Sistema HAURÀ DE mantenir el registre històric però no modificar el Comptador d'Ús

### Requisit 9

**User Story:** Com a administrador, vull gestionar les pistes del sistema, per tal de mantenir actualitzada la informació de les instal·lacions.

#### Criteris d'Acceptació

1. QUAN un administrador crea una nova pista ALESHORES el Sistema HAURÀ DE desar-la amb nom, descripció i estat actiu
2. QUAN un administrador modifica una pista ALESHORES el Sistema HAURÀ DE actualitzar la informació mantenint l'identificador
3. QUAN un administrador desactiva una pista ALESHORES el Sistema HAURÀ DE impedir noves reserves però mantenir les existents
4. QUAN un administrador elimina una pista amb reserves actives ALESHORES el Sistema HAURÀ DE rebutjar l'operació

### Requisit 10

**User Story:** Com a administrador, vull configurar els horaris i la seva classificació, per tal d'adaptar-me als horaris d'obertura i preus del club.

#### Criteris d'Acceptació

1. QUAN un administrador defineix una franja horària ALESHORES el Sistema HAURÀ DE desar l'hora d'inici, hora de fi, durada i classificació com a Hora Vall o Hora Punta
2. QUAN un administrador configura horaris per dies de la setmana ALESHORES el Sistema HAURÀ DE aplicar-los automàticament a les dates corresponents
3. QUAN un horari configurat entra en conflicte amb reserves existents ALESHORES el Sistema HAURÀ DE notificar l'administrador abans d'aplicar els canvis
4. QUAN es modifiquen horaris ALESHORES el Sistema HAURÀ DE validar que l'hora de fi és posterior a l'hora d'inici
5. QUAN un administrador canvia la classificació d'una franja ALESHORES el Sistema HAURÀ DE aplicar-la a futures reserves sense afectar les existents

### Requisit 11

**User Story:** Com a usuari, vull rebre confirmació de les meves sol·licituds i reserves, per tal de tenir constància del meu estat.

#### Criteris d'Acceptació

1. QUAN es crea una sol·licitud ALESHORES el Sistema HAURÀ DE generar un resum amb data, hora, nombre de jugadors i estat pendent
2. QUAN s'assigna una pista després del sorteig ALESHORES el Sistema HAURÀ DE generar una confirmació amb la pista assignada
3. QUAN es crea una reserva directa ALESHORES el Sistema HAURÀ DE generar un resum amb tots els detalls de la reserva
4. QUAN es cancel·la una reserva o sol·licitud ALESHORES el Sistema HAURÀ DE generar una confirmació de cancel·lació
5. QUAN es genera una confirmació ALESHORES el Sistema HAURÀ DE incloure el codi únic, pista (si està assignada), data, hora i nombre de jugadors

### Requisit 12

**User Story:** Com a sistema, vull validar la integritat de les dades i regles de negoci, per tal de mantenir la consistència de la informació.

#### Criteris d'Acceptació

1. QUAN es processa una reserva directa ALESHORES el Sistema HAURÀ DE validar que no hi ha conflictes de doble reserva per la mateixa pista i horari
2. QUAN es desen dades ALESHORES el Sistema HAURÀ DE verificar que tots els camps obligatoris contenen valors vàlids
3. QUAN es relacionen entitats ALESHORES el Sistema HAURÀ DE verificar que les referències existeixen al sistema
4. QUAN es detecta una inconsistència ALESHORES el Sistema HAURÀ DE rebutjar l'operació i mantenir l'estat anterior
5. QUAN es valida el nombre de jugadors ALESHORES el Sistema HAURÀ DE verificar que està entre 2 i 4 inclosos
6. QUAN es valida una data de sol·licitud ALESHORES el Sistema HAURÀ DE verificar que està dins la finestra de 5 a 2 dies d'antelació
