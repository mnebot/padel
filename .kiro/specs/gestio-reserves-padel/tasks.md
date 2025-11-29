# Pla d'Implementació

- [x] 1. Configurar l'entorn del projecte




  - Crear estructura de directoris (src/models, src/services, src/repositories, src/controllers, src/utils)
  - Configurar TypeScript amb configuració estricta
  - Configurar Jest per a testing
  - Instal·lar dependències: express, prisma, fast-check, node-cron
  - _Requisits: Tots_

- [x] 2. Definir models de dades i esquema de base de dades






  - Crear esquema Prisma amb totes les entitats (User, Court, TimeSlot, BookingRequest, Booking, UsageCounter)
  - Definir relacions entre entitats
  - Definir enums (UserType, TimeSlotType, BookingStatus)
  - Configurar índexs per a optimització
  - _Requisits: 1.1, 9.1, 10.1, 3.1, 6.2, 4.1_

- [x] 2.1 Escriure test de propietat per a persistència de tipus d'usuari










  - **Propietat 1: Persistència del tipus d'usuari**
  - **Valida: Requisits 1.1, 1.2**

- [x] 2.2 Escriure test de propietat per a round-trip de pistes




  - **Propietat 26: Round-trip de pistes**
  - **Valida: Requisits 9.1**

- [x] 2.3 Escriure test de propietat per a round-trip de franges horàries






  - **Propietat 29: Round-trip de franges horàries**
  - **Valida: Requisits 10.1**

- [x] 3. Implementar capa de repositoris








  - Crear UserRepository amb mètodes CRUD
  - Crear CourtRepository amb mètodes CRUD i consulta de pistes actives
  - Crear TimeSlotRepository amb consultes per data i dia de la setmana
  - Crear BookingRequestRepository amb consultes per usuari i data
  - Crear BookingRepository amb consultes per usuari, data i validació de conflictes
  - Crear UsageCounterRepository amb increment, consulta i reset
  - _Requisits: 1.1, 9.1, 10.1, 3.1, 6.2, 4.1_

- [x] 3.1 Escriure test de propietat per a integritat referencial
























  - **Propietat 33: Integritat referencial**
  - **Valida: Requisits 12.3**


- [x] 4. Implementar servei de gestió d'usuaris




  - Implementar registerUser amb validació de tipus
  - Implementar getUserById
  - Implementar updateUserType
  - Implementar getUserUsageCount
  - _Requisits: 1.1, 1.2, 1.4_

- [x] 4.1 Escriure test de propietat per a actualització de tipus d'usuari




  - **Propietat 2: Actualització del tipus d'usuari**
  - **Valida: Requisits 1.4**

- [x] 5. Implementar servei de gestió de pistes
  - Implementar createCourt amb validació
  - Implementar updateCourt mantenint ID
  - Implementar deactivateCourt
  - Implementar deleteCourt amb validació de reserves actives
  - Implementar getActiveCourts
  - Implementar hasActiveBookings
  - _Requisits: 9.1, 9.2, 9.3, 9.4_

- [x] 5.1 Escriure test de propietat per a invariant d'identificador de pista
  - **Propietat 27: Invariant d'identificador de pista**
  - **Valida: Requisits 9.2**

- [x] 5.2 Escriure test de propietat per a pistes inactives






  - **Propietat 28: Pistes inactives no accepten reserves**
  - **Valida: Requisits 9.3**



- [x] 6. Implementar servei de gestió d'horaris


  - Implementar createTimeSlot amb validació d'hora fi > hora inici
  - Implementar updateTimeSlot
  - Implementar getTimeSlotsForDate
  - Implementar getTimeSlotsForDayOfWeek
  - _Requisits: 10.1, 10.2, 10.4_

- [x] 6.1 Escriure test de propietat per a classificació de franges horàries
  - **Propietat 3: Classificació de franges horàries**
  - **Valida: Requisits 2.1**

- [x] 6.2 Escriure test de propietat per a validació d'horaris
  - **Propietat 31: Validació d'horaris**
  - **Valida: Requisits 10.4**

- [x] 6.3 Escriure test de propietat per a horaris per dia de la setmana
  - **Propietat 30: Horaris per dia de la setmana**
  - **Valida: Requisits 10.2**

- [x] 7. Implementar utilitats de validació de dates




  - Implementar validateRequestWindow (5-2 dies)
  - Implementar validateDirectBookingWindow (< 2 dies)
  - Implementar isWithinRequestWindow
  - Implementar isWithinDirectBookingWindow
  - _Requisits: 3.1, 3.3, 6.1_

- [x] 7.1 Escriure test de propietat per a comportament segons finestra temporal





  - **Propietat 4: Comportament segons finestra temporal**
  - **Valida: Requisits 2.2, 2.3, 6.1**


- [x] 8. Implementar servei de gestió de sol·licituds


  - Implementar createRequest amb validació de finestra temporal
  - Implementar validació de nombre de jugadors (2-4)
  - Implementar cancelRequest
  - Implementar getRequestsByUser
  - Implementar getPendingRequestsForDate
  - _Requisits: 3.1, 3.2, 3.4, 3.5, 8.1_

- [x] 8.1 Escriure test de propietat per a validació del nombre de jugadors





  - **Propietat 6: Validació del nombre de jugadors**
  - **Valida: Requisits 3.2, 6.3**




- [x] 8.2 Escriure test de propietat per a sol·licituds sense pista assignada
  - **Propietat 5: Sol·licituds sense pista assignada**
  - **Valida: Requisits 3.1**

- [x] 8.3 Escriure test de propietat per a round-trip de sol·licituds
  - **Propietat 7: Round-trip de sol·licituds**
  - **Valida: Requisits 3.4**

- [x] 8.4 Escriure test de propietat per a acceptació il·limitada de sol·licituds
  - **Propietat 8: Acceptació il·limitada de sol·licituds**
  - **Valida: Requisits 3.5**


- [x] 8.5 Escriure test de propietat per a cancel·lació elimina del sorteig






  - **Propietat 24: Cancel·lació elimina del sorteig**
  - **Valida: Requisits 8.1**

- [x] 9. Implementar servei de comptador d'ús



  - Implementar incrementUsage
  - Implementar getUserUsage
  - Implementar resetAllCounters
  - Implementar getLastResetDate
  - _Requisits: 4.1, 4.2, 4.3, 4.4_



- [x] 9.1 Escriure test de propietat per a increment del comptador











  - **Propietat 9: Increment del comptador d'ús**
  - **Valida: Requisits 4.1**

- [x] 9.2 Escriure test de propietat per a comptador reflecteix reserves completades








  - **Propietat 10: Comptador reflecteix reserves completades**
  - **Valida: Requisits 4.2**


- [x] 9.3 Escriure test de propietat per a cancel·lació no modifica comptador




  - **Propietat 11: Cancel·lació no modifica comptador**
  - **Valida: Requisits 4.3, 8.4**

- [x] 9.4 Escriure test de propietat per a reset mensual





  - **Propietat 12: Reset mensual de comptadors**
  - **Valida: Requisits 4.4**


- [x] 10. Implementar motor de sorteig
  - Implementar calculateWeight amb fórmules per socis i no socis
  - Implementar algoritme de selecció aleatòria ponderada
  - Implementar assignCourts que assigna pistes segons pesos
  - Implementar executeLottery que coordina tot el procés
  - _Requisits: 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [x] 10.1 Escriure test de propietat per a càlcul de pes per socis

  - **Propietat 13: Càlcul de pes per socis**
  - **Valida: Requisits 5.3**

- [x] 10.2 Escriure test de propietat per a càlcul de pes per no socis

  - **Propietat 14: Càlcul de pes per no socis**
  - **Valida: Requisits 5.4**

- [x] 10.3 Escriure test de propietat per a distribució ponderada






  - **Propietat 15: Distribució ponderada del sorteig**
  - **Valida: Requisits 5.5**

- [x] 10.4 Escriure test de propietat per a assignació crea reserva confirmada






  - **Propietat 16: Assignació crea reserva confirmada**
  - **Valida: Requisits 5.6**

- [x] 10.5 Escriure test de propietat per a sol·licituds no assignades


  - **Propietat 17: Sol·licituds no assignades**
  - **Valida: Requisits 5.7**

- [x] 11. Implementar servei de gestió de reserves (BookingService)
  - Crear BookingService.ts
  - Implementar createDirectBooking amb validació de finestra temporal (< 2 dies)
  - Implementar validació de conflictes (hasConflict)
  - Implementar getAvailableCourts
  - Implementar cancelBooking amb alliberament de pista
  - Implementar completeBooking amb increment de comptador
  - Implementar getBookingsByUser
  - _Requisits: 6.1, 6.2, 6.4, 6.5, 7.1, 7.2, 8.2_


- [x] 11.1 Escriure test de propietat per a reserves directes confirmades immediatament













  - **Propietat 18: Reserves directes confirmades immediatament**
  - **Valida: Requisits 6.2**


- [ ] 11.2 Escriure test de propietat per a no dobles reserves






  - **Propietat 19: No dobles reserves**
  - **Valida: Requisits 6.4, 12.1**

- [x]* 11.3 Escriure test de propietat per a reserves directes sense sorteig
  - **Propietat 20: Reserves directes sense sorteig**
  - **Valida: Requisits 6.5**

- [x]* 11.4 Escriure test de propietat per a consulta de reserves per usuari
  - **Propietat 21: Consulta de reserves per usuari**
  - **Valida: Requisits 7.1**

- [x]* 11.5 Escriure test de propietat per a round-trip de reserves
  - **Propietat 22: Round-trip de reserves**
  - **Valida: Requisits 7.2**

- [x] 11.6 Escriure test de propietat per a cancel·lació allibera pista






  - **Propietat 25: Cancel·lació allibera pista**
  - **Valida: Requisits 8.2**

- [x] 12. Implementar validacions d'estat


  - Implementar validació per a cancel·lació de reserves completades (dins BookingService)
  - Validació per a eliminació de pistes amb reserves actives ja implementada en CourtService
  - Estat de sol·licituds pendents ja implementat en BookingRequestService
  - _Requisits: 7.3, 8.3, 9.4_

- [x] 12.1 Escriure test de propietat per a estat de sol·licituds pendents






  - **Propietat 23: Estat de sol·licituds pendents**
  - **Valida: Requisits 7.3**

- [x] 13. Implementar gestió d'errors personalitzats




  - Crear directori src/errors/
  - Crear classe base AppError que estén Error
  - Crear classes d'error específiques:
    - InvalidRequestWindowError (finestra de sol·licitud 5-2 dies)
    - InvalidDirectBookingWindowError (finestra de reserva directa < 2 dies)
    - InvalidNumberOfPlayersError (2-4 jugadors)
    - CourtNotAvailableError (pista ocupada)
    - CourtInactiveError (pista inactiva)
    - CannotCancelCompletedBookingError (no es pot cancel·lar reserva completada)
    - CourtHasActiveBookingsError (pista amb reserves actives)
    - InvalidTimeSlotError (hora fi <= hora inici)
    - UserNotFoundError, CourtNotFoundError, BookingNotFoundError
  - Actualitzar tots els serveis per utilitzar errors personalitzats en lloc de Error genèric
  - _Requisits: 3.3, 8.3, 9.4, 12.4_


- [x] 13.1 Escriure test de propietat per a transaccionalitat d'operacions







  - **Propietat 34: Transaccionalitat d'operacions**
  - **Valida: Requisits 12.4**

- [x] 14. Implementar servei de planificador de tasques (SchedulerService)



  - Crear SchedulerService.ts a src/services/
  - Configurar node-cron per a tasques programades
  - Implementar scheduleLotteryExecution per executar sorteig automàticament 2 dies abans de cada data
  - Implementar scheduleMonthlyReset per executar reset el dia 1 de cada mes a les 00:00
  - Implementar scheduleBookingCompletion per marcar reserves com a completades després de la seva data/hora
  - Implementar startScheduler per iniciar totes les tasques programades
  - _Requisits: 4.4, 5.1_

- [x] 15. Configurar Express i middleware bàsic





  - Instal·lar dependències addicionals si cal (cors, helmet, express-validator)
  - Configurar Express app a src/index.ts
  - Configurar middleware: body-parser (express.json()), cors, helmet per seguretat
  - Configurar middleware de gestió d'errors global que capturi errors personalitzats
  - Configurar port i iniciar servidor
  - _Requisits: Tots_


- [x] 16. Implementar controladors d'usuaris (UserController)





  - Crear src/controllers/UserController.ts
  - Implementar POST /api/users (registre d'usuari)
  - Implementar GET /api/users/:id (consulta d'usuari)
  - Implementar PATCH /api/users/:id/type (actualització de tipus - admin)
  - Implementar GET /api/users/:id/usage (consulta de comptador d'ús)
  - Validar entrada amb express-validator o similar



  - _Requisits: 1.1, 1.2, 1.4, 4.2_

- [x] 17. Implementar controladors de pistes (CourtController)





  - Crear src/controllers/CourtController.ts
  - Implementar POST /api/courts (crear pista - admin)
  - Implementar GET /api/courts (llistar pistes actives)
  - Implementar GET /api/courts/:id (consultar pista)
  - Implementar PATCH /api/courts/:id (actualitzar pista - admin)
  - Implementar DELETE /api/courts/:id (eliminar pista - admin)
  - Implementar PATCH /api/courts/:id/deactivate (desactivar pista - admin)
  - _Requisits: 9.1, 9.2, 9.3, 9.4_



- [x] 18. Implementar controladors d'horaris (TimeSlotController)



  - Crear src/controllers/TimeSlotController.ts
  - Implementar POST /api/timeslots (crear franja horària - admin)
  - Implementar GET /api/timeslots (llistar franges horàries)
  - Implementar GET /api/timeslots/date/:date (franges per data)
  - Implementar GET /api/timeslots/day/:dayOfWeek (franges per dia de la setmana)
  - Implementar PATCH /api/timeslots/:id (actualitzar franja - admin)
  - Implementar DELETE /api/timeslots/:id (eliminar franja - admin)
  - _Requisits: 10.1, 10.2, 10.4, 10.5_
- [x] 19. Implementar controladors de sol·licituds (BookingRequestController)













- [ ] 19. Implementar controladors de sol·licituds (BookingRequestController)

  - Crear src/controllers/BookingRequestController.ts
  - Implementar POST /api/requests (crear sol·licitud)
  - Implementar GET /api/requests/user/:userId (sol·licituds per usuari)
  - Implementar GET /api/requests/pending (sol·licituds pendents per data/hora - admin)
  - Implementar DELETE /api/requests/:id (cancel·lar sol·licitud)
  - _Requisits: 3.1, 3.2, 3.4, 3.5, 8.1_




- [x] 20. Implementar controladors de reserves (BookingController)





  - Crear src/controllers/BookingController.ts
  - Implementar POST /api/bookings (crear reserva directa)
  - Implementar GET /api/bookings/user/:userId (reserves per usuari)
  - Implementar GET /api/bookings/available (pistes disponibles per data/hora)
  - Implementar DELETE /api/bookings/:id (cancel·lar reserva)




  - Implementar PATCH /api/bookings/:id/complete (completar reserva - admin/sistema)
  - _Requisits: 6.1, 6.2, 6.4, 6.5, 7.1, 7.2, 8.2_



- [x] 21. Implementar controlador de sorteig (LotteryController)




  - Crear src/controllers/LotteryController.ts
  - Implementar POST /api/lottery/execute (executar sorteig per data/hora - admin)
  - Implementar GET /api/lottery/results/:date/:timeSlot (consultar resultats del sorteig)
  - _Requisits: 5.1, 5.2, 5.6, 5.7_





- [x] 22. Implementar middleware d'autenticació i autorització






  - Crear src/middleware/auth.ts
  - Implementar middleware d'autenticació bàsic (verificar usuari autenticat)




  - Implementar middleware d'autorització per rols (requireAdmin, requireUser)





  - Aplicar middleware a rutes que ho requereixin


  - _Requisits: Tots (seguretat)_


- [x] 23. Configurar rutes principals







  - Crear src/routes/index.ts per centralitzar totes les rutes
  - Registrar tots els controladors amb els seus prefixos
  - Aplicar middleware d'autenticació/autorització segons correspongui
  - Integrar rutes a src/index.ts
  - _Requisits: Tots_

- [x] 23.1 Escriure test de propietat per a immutabilitat de reserves existents











  - **Propietat 32: Immutabilitat de reserves existents**
  - **Valida: Requisits 10.5**
-

- [x] 24. Checkpoint - Assegurar que tots els tests passen








  - Executar npm test per verificar que tots els tests passen
  - Assegurar que tots els tests passen, preguntar a l'usuari si sorgeixen qüestions.


-

- [x] 25. Crear documentació de l'API amb Swagger









  - Instal·lar swagger-jsdoc i swagger-ui-express
  - Crear src/swagger.ts amb configuració d'OpenAPI
  - Documentar tots els endpoints amb anotacions JSDoc/OpenAPI als controladors
  - Configurar Swagger UI a /api-docs
  - Documentar esquemes de dades (User, Court, TimeSlot, BookingRequest, Booking)
  - Documentar codis d'error i respostes per cada endpoint
  - Crear exemples de peticions i respostes
  - _Requisits: Tots_

- [ ] 26. Checkpoint final - Assegurar que tots els tests passen

  - Executar npm test per verificar que tots els tests unitaris i de propietats passen
  - Verificar que no hi ha errors de TypeScript (npm run build)
  - Assegurar que tots els tests passen, preguntar a l'usuari si sorgeixen qüestions.
