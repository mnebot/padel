# Document de Requisits - Aplicacions Web Frontend

## Introducció

Aquest document defineix els requisits per a dues aplicacions web frontend que consumiran l'API REST del sistema de gestió de reserves de pàdel:
1. **Aplicació d'Usuari**: Interfície per als usuaris finals per gestionar les seves reserves
2. **Aplicació d'Administrador**: Interfície per als administradors per gestionar el sistema

## Glossari

- **Aplicació d'Usuari**: Interfície web per als usuaris finals (socis i no socis)
- **Aplicació d'Administrador**: Interfície web per als administradors del sistema
- **API REST**: Servei backend que proporciona les funcionalitats del sistema
- **Usuari Final**: Persona que utilitza l'Aplicació d'Usuari per fer reserves
- **Administrador**: Persona que utilitza l'Aplicació d'Administrador per gestionar el sistema
- **Autenticació**: Procés de verificació d'identitat d'un usuari
- **Dashboard**: Pàgina principal que mostra informació resumida
- **Vista de Calendari**: Component visual que mostra disponibilitat per dates
- **Formulari de Reserva**: Interfície per crear sol·licituds o reserves
- **Notificació**: Missatge visual que informa l'usuari d'esdeveniments o errors
- **Estat de Càrrega**: Indicador visual que mostra que una operació està en procés
- **Responsive Design**: Disseny que s'adapta a diferents mides de pantalla
- **Validació Client**: Verificació de dades abans d'enviar-les al servidor

## Requisits

### Requisit 1: Autenticació d'Usuaris

**User Story:** Com a usuari, vull iniciar sessió a l'aplicació, per tal d'accedir a les meves reserves i funcionalitats personalitzades.

#### Criteris d'Acceptació

1. QUAN un usuari accedeix a l'Aplicació d'Usuari ALESHORES el Sistema HAURÀ DE mostrar un formulari d'inici de sessió
2. QUAN un usuari introdueix les seves credencials vàlides ALESHORES el Sistema HAURÀ DE autenticar-lo i redirigir-lo al Dashboard
3. QUAN un usuari introdueix credencials invàlides ALESHORES el Sistema HAURÀ DE mostrar un missatge d'error clar
4. QUAN un usuari està autenticat ALESHORES el Sistema HAURÀ DE mantenir la sessió durant la navegació
5. QUAN un usuari tanca sessió ALESHORES el Sistema HAURÀ DE eliminar les dades de sessió i redirigir-lo a la pàgina d'inici de sessió

### Requisit 2: Dashboard d'Usuari

**User Story:** Com a usuari, vull veure un resum de la meva activitat, per tal de tenir una visió general del meu estat al sistema.

#### Criteris d'Acceptació

1. QUAN un usuari accedeix al Dashboard ALESHORES el Sistema HAURÀ DE mostrar el seu tipus d'usuari (Soci o No Soci)
2. QUAN es mostra el Dashboard ALESHORES el Sistema HAURÀ DE mostrar el Comptador d'Ús actual de l'usuari
3. QUAN es mostra el Dashboard ALESHORES el Sistema HAURÀ DE llistar les reserves confirmades properes
4. QUAN es mostra el Dashboard ALESHORES el Sistema HAURÀ DE llistar les sol·licituds pendents d'assignació
5. QUAN es mostra el Dashboard ALESHORES el Sistema HAURÀ DE proporcionar accés ràpid a crear una nova reserva

### Requisit 3: Visualització de Disponibilitat

**User Story:** Com a usuari, vull veure la disponibilitat de pistes en un calendari, per tal de triar la millor data i hora per a mi.

#### Criteris d'Acceptació

1. QUAN un usuari accedeix a la Vista de Calendari ALESHORES el Sistema HAURÀ DE mostrar un calendari mensual amb les dates disponibles
2. QUAN un usuari selecciona una data dins la finestra de sol·licitud ALESHORES el Sistema HAURÀ DE mostrar les franges horàries amb indicació de Hora Vall o Hora Punta
3. QUAN un usuari selecciona una data dins la finestra de reserva lliure ALESHORES el Sistema HAURÀ DE mostrar les pistes i horaris disponibles en temps real
4. QUAN es mostren franges horàries ALESHORES el Sistema HAURÀ DE indicar visualment quines són Hora Vall i quines són Hora Punta
5. QUAN no hi ha disponibilitat per una data ALESHORES el Sistema HAURÀ DE mostrar-ho clarament a l'usuari

### Requisit 4: Creació de Sol·licituds de Reserva

**User Story:** Com a usuari, vull sol·licitar una reserva amb antelació, per tal de participar en el sorteig d'assignació.

#### Criteris d'Acceptació

1. QUAN un usuari selecciona una data dins la finestra de sol·licitud ALESHORES el Sistema HAURÀ DE mostrar el Formulari de Reserva per a sol·licituds
2. QUAN un usuari omple el formulari ALESHORES el Sistema HAURÀ DE validar que el nombre de jugadors està entre 2 i 4
3. QUAN un usuari envia una sol·licitud vàlida ALESHORES el Sistema HAURÀ DE cridar l'API per crear-la i mostrar una confirmació
4. QUAN l'API retorna un error ALESHORES el Sistema HAURÀ DE mostrar el missatge d'error a l'usuari
5. QUAN es crea una sol·licitud ALESHORES el Sistema HAURÀ DE redirigir l'usuari al Dashboard amb la nova sol·licitud visible

### Requisit 5: Creació de Reserves Directes

**User Story:** Com a usuari, vull fer reserves directes amb menys de 2 dies d'antelació, per tal d'aprofitar espais horaris disponibles.

#### Criteris d'Acceptació

1. QUAN un usuari selecciona una data dins la finestra de reserva lliure ALESHORES el Sistema HAURÀ DE mostrar les pistes disponibles per cada franja horària
2. QUAN un usuari selecciona una pista i horari ALESHORES el Sistema HAURÀ DE mostrar el Formulari de Reserva amb la pista preseleccionada
3. QUAN un usuari omple el formulari ALESHORES el Sistema HAURÀ DE validar que el nombre de jugadors està entre 2 i 4
4. QUAN un usuari envia una reserva vàlida ALESHORES el Sistema HAURÀ DE cridar l'API per crear-la i mostrar una confirmació
5. QUAN la pista ja no està disponible ALESHORES el Sistema HAURÀ DE mostrar un error i actualitzar la disponibilitat

### Requisit 6: Gestió de Reserves Existents

**User Story:** Com a usuari, vull veure i gestionar les meves reserves i sol·licituds, per tal de tenir control sobre la meva activitat.

#### Criteris d'Acceptació

1. QUAN un usuari accedeix a les seves reserves ALESHORES el Sistema HAURÀ DE mostrar una llista amb totes les reserves i sol·licituds
2. QUAN es mostra una reserva ALESHORES el Sistema HAURÀ DE incloure pista, data, hora, nombre de jugadors i estat
3. QUAN es mostra una sol·licitud pendent ALESHORES el Sistema HAURÀ DE indicar que està pendent d'assignació
4. QUAN un usuari selecciona una reserva o sol·licitud ALESHORES el Sistema HAURÀ DE mostrar els detalls complets
5. QUAN un usuari vol cancel·lar ALESHORES el Sistema HAURÀ DE mostrar un diàleg de confirmació abans de procedir

### Requisit 7: Cancel·lació de Reserves

**User Story:** Com a usuari, vull cancel·lar una reserva o sol·licitud, per tal d'alliberar l'espai si no puc assistir.

#### Criteris d'Acceptació

1. QUAN un usuari confirma la cancel·lació ALESHORES el Sistema HAURÀ DE cridar l'API per cancel·lar-la
2. QUAN la cancel·lació és exitosa ALESHORES el Sistema HAURÀ DE mostrar una confirmació i actualitzar la llista
3. QUAN l'API rebutja la cancel·lació ALESHORES el Sistema HAURÀ DE mostrar el motiu de l'error
4. QUAN es cancel·la una reserva ALESHORES el Sistema HAURÀ DE actualitzar el Dashboard automàticament
5. QUAN un usuari intenta cancel·lar una reserva completada ALESHORES el Sistema HAURÀ DE impedir l'acció i mostrar un missatge informatiu

### Requisit 8: Autenticació d'Administradors

**User Story:** Com a administrador, vull iniciar sessió a l'aplicació d'administració, per tal d'accedir a les funcionalitats de gestió del sistema.

#### Criteris d'Acceptació

1. QUAN un administrador accedeix a l'Aplicació d'Administrador ALESHORES el Sistema HAURÀ DE mostrar un formulari d'inici de sessió
2. QUAN un administrador introdueix credencials vàlides ALESHORES el Sistema HAURÀ DE autenticar-lo i redirigir-lo al Dashboard d'administració
3. QUAN un administrador introdueix credencials invàlides ALESHORES el Sistema HAURÀ DE mostrar un missatge d'error
4. QUAN un administrador està autenticat ALESHORES el Sistema HAURÀ DE mantenir la sessió durant la navegació
5. QUAN un administrador tanca sessió ALESHORES el Sistema HAURÀ DE eliminar les dades de sessió

### Requisit 9: Dashboard d'Administrador

**User Story:** Com a administrador, vull veure un resum de l'activitat del sistema, per tal de monitoritzar l'estat general.

#### Criteris d'Acceptació

1. QUAN un administrador accedeix al Dashboard ALESHORES el Sistema HAURÀ DE mostrar el nombre total de reserves actives
2. QUAN es mostra el Dashboard ALESHORES el Sistema HAURÀ DE mostrar el nombre de sol·licituds pendents d'assignació
3. QUAN es mostra el Dashboard ALESHORES el Sistema HAURÀ DE mostrar estadístiques d'ús de pistes
4. QUAN es mostra el Dashboard ALESHORES el Sistema HAURÀ DE proporcionar accés ràpid a les funcions principals de gestió
5. QUAN es mostra el Dashboard ALESHORES el Sistema HAURÀ DE mostrar alertes o notificacions importants

### Requisit 10: Gestió de Pistes

**User Story:** Com a administrador, vull gestionar les pistes del sistema, per tal de mantenir actualitzada la informació de les instal·lacions.

#### Criteris d'Acceptació

1. QUAN un administrador accedeix a la gestió de pistes ALESHORES el Sistema HAURÀ DE mostrar una llista de totes les pistes
2. QUAN un administrador crea una nova pista ALESHORES el Sistema HAURÀ DE mostrar un formulari amb camps per nom, descripció i estat
3. QUAN un administrador edita una pista ALESHORES el Sistema HAURÀ DE carregar les dades actuals i permetre modificar-les
4. QUAN un administrador desactiva una pista ALESHORES el Sistema HAURÀ DE cridar l'API i actualitzar l'estat visual
5. QUAN un administrador intenta eliminar una pista amb reserves actives ALESHORES el Sistema HAURÀ DE mostrar un error explicatiu

### Requisit 11: Gestió d'Horaris

**User Story:** Com a administrador, vull configurar els horaris i la seva classificació, per tal d'adaptar-me als horaris d'obertura del club.

#### Criteris d'Acceptació

1. QUAN un administrador accedeix a la gestió d'horaris ALESHORES el Sistema HAURÀ DE mostrar les franges horàries configurades
2. QUAN un administrador crea una franja horària ALESHORES el Sistema HAURÀ DE validar que l'hora de fi és posterior a l'hora d'inici
3. QUAN un administrador defineix una franja ALESHORES el Sistema HAURÀ DE permetre classificar-la com a Hora Vall o Hora Punta
4. QUAN un administrador modifica horaris ALESHORES el Sistema HAURÀ DE mostrar advertències si hi ha conflictes amb reserves existents
5. QUAN es desen canvis ALESHORES el Sistema HAURÀ DE cridar l'API i mostrar confirmació d'èxit

### Requisit 12: Gestió d'Usuaris

**User Story:** Com a administrador, vull gestionar els usuaris del sistema, per tal de mantenir actualitzada la informació dels membres.

#### Criteris d'Acceptació

1. QUAN un administrador accedeix a la gestió d'usuaris ALESHORES el Sistema HAURÀ DE mostrar una llista de tots els usuaris
2. QUAN es mostra un usuari ALESHORES el Sistema HAURÀ DE incloure nom, email, tipus (Soci o No Soci) i Comptador d'Ús
3. QUAN un administrador crea un nou usuari ALESHORES el Sistema HAURÀ DE validar que l'email és únic
4. QUAN un administrador modifica el tipus d'usuari ALESHORES el Sistema HAURÀ DE cridar l'API per actualitzar-lo
5. QUAN es mostren usuaris ALESHORES el Sistema HAURÀ DE permetre filtrar per tipus (Soci o No Soci)

### Requisit 13: Visualització de Reserves i Sol·licituds

**User Story:** Com a administrador, vull veure totes les reserves i sol·licituds del sistema, per tal de monitoritzar l'activitat.

#### Criteris d'Acceptació

1. QUAN un administrador accedeix a la visualització de reserves ALESHORES el Sistema HAURÀ DE mostrar totes les reserves del sistema
2. QUAN es mostren reserves ALESHORES el Sistema HAURÀ DE permetre filtrar per data, pista, usuari i estat
3. QUAN un administrador selecciona una reserva ALESHORES el Sistema HAURÀ DE mostrar tots els detalls incloent l'usuari que la va crear
4. QUAN es mostren sol·licituds pendents ALESHORES el Sistema HAURÀ DE indicar clarament que estan pendents de sorteig
5. QUAN un administrador consulta reserves ALESHORES el Sistema HAURÀ DE mostrar-les en una vista de calendari o llista

### Requisit 14: Execució Manual del Sorteig

**User Story:** Com a administrador, vull poder executar manualment el sorteig, per tal de tenir control sobre el procés d'assignació.

#### Criteris d'Acceptació

1. QUAN un administrador accedeix a la gestió de sortejos ALESHORES el Sistema HAURÀ DE mostrar les dates amb sol·licituds pendents
2. QUAN un administrador selecciona una data ALESHORES el Sistema HAURÀ DE mostrar el nombre de sol·licituds i pistes disponibles
3. QUAN un administrador executa el sorteig ALESHORES el Sistema HAURÀ DE cridar l'API i mostrar un indicador de progrés
4. QUAN el sorteig finalitza ALESHORES el Sistema HAURÀ DE mostrar els resultats amb les assignacions realitzades
5. QUAN el sorteig falla ALESHORES el Sistema HAURÀ DE mostrar un missatge d'error detallat

### Requisit 15: Experiència d'Usuari i Disseny

**User Story:** Com a usuari o administrador, vull una interfície intuïtiva i responsive, per tal de poder utilitzar l'aplicació des de qualsevol dispositiu.

#### Criteris d'Acceptació

1. QUAN un usuari accedeix des d'un dispositiu mòbil ALESHORES el Sistema HAURÀ DE adaptar la interfície a la mida de pantalla
2. QUAN es realitza una operació ALESHORES el Sistema HAURÀ DE mostrar un Estat de Càrrega mentre es processa
3. QUAN es produeix un error ALESHORES el Sistema HAURÀ DE mostrar una Notificació clara i comprensible
4. QUAN es completa una operació exitosament ALESHORES el Sistema HAURÀ DE mostrar una Notificació de confirmació
5. QUAN un usuari navega per l'aplicació ALESHORES el Sistema HAURÀ DE mantenir una interfície consistent i coherent

### Requisit 16: Validació i Gestió d'Errors

**User Story:** Com a usuari o administrador, vull que l'aplicació validi les meves dades abans d'enviar-les, per tal d'evitar errors innecessaris.

#### Criteris d'Acceptació

1. QUAN un usuari omple un formulari ALESHORES el Sistema HAURÀ DE validar els camps obligatoris abans d'enviar
2. QUAN un camp conté dades invàlides ALESHORES el Sistema HAURÀ DE mostrar un missatge d'error al costat del camp
3. QUAN l'API retorna un error ALESHORES el Sistema HAURÀ DE traduir-lo a un missatge comprensible per l'usuari
4. QUAN es perd la connexió amb l'API ALESHORES el Sistema HAURÀ DE mostrar un missatge d'error de connexió
5. QUAN es recupera la connexió ALESHORES el Sistema HAURÀ DE permetre tornar a intentar l'operació fallida

### Requisit 17: Historial i Estadístiques

**User Story:** Com a usuari, vull veure el meu historial de reserves, per tal de tenir un registre de la meva activitat passada.

#### Criteris d'Acceptació

1. QUAN un usuari accedeix al seu historial ALESHORES el Sistema HAURÀ DE mostrar totes les reserves completades i cancel·lades
2. QUAN es mostra l'historial ALESHORES el Sistema HAURÀ DE permetre filtrar per data i estat
3. QUAN es mostra una reserva històrica ALESHORES el Sistema HAURÀ DE incloure tots els detalls originals
4. QUAN un usuari consulta estadístiques personals ALESHORES el Sistema HAURÀ DE mostrar el seu Comptador d'Ús i tendències d'ús
5. QUAN es mostra l'historial ALESHORES el Sistema HAURÀ DE ordenar les reserves per data de manera descendent

### Requisit 18: Estadístiques d'Administrador

**User Story:** Com a administrador, vull veure estadístiques detallades del sistema, per tal de prendre decisions informades sobre la gestió.

#### Criteris d'Acceptació

1. QUAN un administrador accedeix a estadístiques ALESHORES el Sistema HAURÀ DE mostrar l'ús de pistes per període de temps
2. QUAN es mostren estadístiques ALESHORES el Sistema HAURÀ DE incloure el nombre de reserves per tipus d'usuari (Soci vs No Soci)
3. QUAN un administrador consulta estadístiques ALESHORES el Sistema HAURÀ DE mostrar les franges horàries més demandades
4. QUAN es mostren estadístiques ALESHORES el Sistema HAURÀ DE permetre seleccionar el període de temps (setmana, mes, any)
5. QUAN un administrador consulta usuaris ALESHORES el Sistema HAURÀ DE mostrar els Comptadors d'Ús de tots els usuaris
