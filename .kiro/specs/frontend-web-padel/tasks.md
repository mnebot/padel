# Pla d'Implementació - Aplicacions Web Frontend

## Estructura del Projecte

Aquest pla implementarà dues aplicacions web frontend:
1. **User App**: Aplicació per als usuaris finals
2. **Admin App**: Aplicació per als administradors

Ambdues aplicacions compartiran molts components i utilitats, però seran projectes independents.

## Tasques d'Implementació

- [x] 1. Configurar l'estructura base dels projectes

- [x] 1.1 Crear projecte User App amb Vite + React + TypeScript
  - Executar `npm create vite@latest user-app -- --template react-ts`
  - Configurar estructura de directoris segons el disseny
  - Instal·lar dependències: react-router-dom, axios, tailwindcss, shadcn/ui, react-hook-form, zod, date-fns, lucide-react
  - _Requirements: 15.1, 15.5_

- [x] 1.2 Crear projecte Admin App amb Vite + React + TypeScript
  - Executar `npm create vite@latest admin-app -- --template react-ts`
  - Configurar estructura de directoris segons el disseny
  - Instal·lar les mateixes dependències que User App
  - _Requirements: 15.1, 15.5_

- [x] 1.3 Configurar Tailwind CSS i shadcn/ui en ambdues aplicacions
  - Inicialitzar Tailwind CSS
  - Configurar shadcn/ui
  - Instal·lar components base: button, card, dialog, form, input, select, table, toast, badge, calendar, tabs
  - _Requirements: 15.1, 15.5_

- [x] 1.4 Configurar Vitest i React Testing Library
  - Instal·lar vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event
  - Crear fitxer de configuració vitest.config.ts
  - Crear fitxer de setup per als tests
  - _Requirements: Testing Strategy_

- [x] 1.5 Instal·lar i configurar fast-check per property-based testing






  - Instal·lar fast-check a user-app i admin-app
  - Crear arbitraries per als models de dades (User, Booking, Court, etc.)
  - _Requirements: Testing Strategy_







- [x] 2. Implementar types i models compartits




- [x] 2.1 Crear types per User App






  - Crear user-app/src/types/user.ts amb UserType enum i User interface
  - Crear user-app/src/types/court.ts amb Court interface
  - Crear user-app/src/types/timeSlot.ts amb TimeSlotType enum i TimeSlot interface
  - Crear user-app/src/types/booking.ts amb BookingStatus enum, BookingRequest i Booking interfaces


  - Crear user-app/src/types/api.ts amb ApiError, ApiResponse i PaginatedResponse interfaces
  - Crear user-app/src/types/index.ts per exportar tots els types
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1_

- [ ] 2.2 Crear types per Admin App




  - Crear admin-app/src/types/user.ts amb UserType enum i User interface
  - Crear admin-app/src/types/court.ts amb Court interface
  - Crear admin-app/src/types/timeSlot.ts amb TimeSlotType enum i TimeSlot interface
  - Crear admin-app/src/types/booking.ts amb BookingStatus enum, BookingRequest i Booking interfaces
  - Crear admin-app/src/types/api.ts amb ApiError, ApiResponse i PaginatedResponse interfaces



  - Crear admin-app/src/types/index.ts per exportar tots els types
  - _Requirements: 8.1, 9.1, 10.1, 11.1, 12.1, 13.1_



- [ ] 3. Implementar capa de serveis i API client


- [x] 3.1 Crear API client base per User App


  - Crear user-app/src/services/api.ts amb ApiClient class
  - Implementar interceptors per autenticació i gestió d'errors
  - Implementar mètodes get, post, put, delete
  - Implementar traducció de missatges d'error
  - _Requirements: 16.3, 16.4_



- [ ] 3.2 Crear serveis per User App
  - Crear user-app/src/services/authService.ts amb login, logout, getCurrentUser
  - Crear user-app/src/services/bookingService.ts amb getBookings, createDirectBooking, cancelBooking, getAvailability


  - Crear user-app/src/services/bookingRequestService.ts amb getRequests, createRequest, cancelRequest
  - Crear user-app/src/services/userService.ts amb getUserProfile, updateProfile
  - _Requirements: 1.2, 4.3, 5.4, 6.1, 7.1_

- [ ] 3.3 Crear API client base per Admin App
  - Crear admin-app/src/services/api.ts amb ApiClient class
  - Implementar interceptors per autenticació i gestió d'errors
  - Implementar mètodes get, post, put, delete
  - _Requirements: 16.3, 16.4_

- [ ] 3.4 Crear serveis per Admin App
  - Crear admin-app/src/services/authService.ts amb login, logout, getCurrentUser
  - Crear admin-app/src/services/courtService.ts amb getCourts, createCourt, updateCourt, deleteCourt
  - Crear admin-app/src/services/timeSlotService.ts amb getTimeSlots, createTimeSlot, updateTimeSlot, deleteTimeSlot
  - Crear admin-app/src/services/userService.ts amb getUsers, createUser, updateUser
  - Crear admin-app/src/services/bookingService.ts amb getAllBookings, getBookingsByFilters
  - Crear admin-app/src/services/lotteryService.ts amb executeLottery, getLotteryResults
  - Crear admin-app/src/services/statsService.ts amb getStats, getCourtUsage, getUserStats
  - _Requirements: 8.2, 10.2, 11.5, 12.3, 13.1, 14.3, 18.1_

- [x] 4. Implementar Context i State Management





- [x] 4.1 Crear AuthContext per User App


  - Crear user-app/src/context/AuthContext.tsx amb AuthProvider
  - Implementar estat d'autenticació (user, isAuthenticated, isLoading, error)
  - Implementar funcions login, logout, refreshUser
  - Implementar persistència de sessió amb localStorage
  - _Requirements: 1.2, 1.4, 1.5_

- [x] 4.2 Crear ToastContext per User App


  - Crear user-app/src/context/ToastContext.tsx amb ToastProvider
  - Implementar gestió de notificacions (success, error, warning, info)
  - Implementar funcions showToast, removeToast
  - _Requirements: 15.3, 15.4_



- [ ] 4.3 Crear AuthContext per Admin App
  - Crear admin-app/src/context/AuthContext.tsx amb AuthProvider
  - Implementar estat d'autenticació (user, isAuthenticated, isLoading, error)


  - Implementar funcions login, logout, refreshUser

  - _Requirements: 8.2, 8.4, 8.5_


- [ ] 4.4 Crear ToastContext per Admin App
  - Crear admin-app/src/context/ToastContext.tsx amb ToastProvider
  - Implementar gestió de notificacions
  - _Requirements: 15.3, 15.4_

- [x] 5. Implementar Custom Hooks



- [x] 5.1 Crear hooks per User App

  - Crear user-app/src/hooks/useAuth.ts per accedir a AuthContext
  - Crear user-app/src/hooks/useBookings.ts amb fetchBookings, cancelBooking
  - Crear user-app/src/hooks/useBookingRequests.ts amb fetchRequests, createRequest, cancelRequest
  - Crear user-app/src/hooks/useAvailability.ts amb fetchAvailability per dates
  - Crear user-app/src/hooks/useToast.ts per accedir a ToastContext
  - _Requirements: 2.3, 3.2, 4.3, 5.4, 6.1, 7.1_


- [x] 5.2 Crear hooks per Admin App

  - Crear admin-app/src/hooks/useAuth.ts per accedir a AuthContext
  - Crear admin-app/src/hooks/useCourts.ts amb fetchCourts, createCourt, updateCourt, deleteCourt
  - Crear admin-app/src/hooks/useTimeSlots.ts amb fetchTimeSlots, createTimeSlot, updateTimeSlot, deleteTimeSlot
  - Crear admin-app/src/hooks/useUsers.ts amb fetchUsers, createUser, updateUser
  - Crear admin-app/src/hooks/useBookings.ts amb fetchAllBookings, filterBookings
  - Crear admin-app/src/hooks/useLottery.ts amb executeLottery, getLotteryResults
  - Crear admin-app/src/hooks/useToast.ts per accedir a ToastContext
  - _Requirements: 10.1, 11.1, 12.1, 13.1, 14.3_


- [x] 6. Implementar utilitats i validacions





- [x] 6.1 Crear utilitats per User App


  - Crear user-app/src/utils/dateUtils.ts amb funcions per formatar dates i validar finestres de reserva
  - Crear user-app/src/utils/validationSchemas.ts amb schemas Zod per formularis
  - Crear user-app/src/utils/constants.ts amb constants de l'aplicació
  - _Requirements: 3.2, 4.2, 5.3, 16.1, 16.2_



- [ ] 6.2 Crear utilitats per Admin App
  - Crear admin-app/src/utils/dateUtils.ts amb funcions per formatar dates
  - Crear admin-app/src/utils/validationSchemas.ts amb schemas Zod per formularis
  - Crear admin-app/src/utils/constants.ts amb constants de l'aplicació
  - _Requirements: 10.2, 11.2, 12.3, 16.1, 16.2_

- [ ]* 6.3 Escriure property test per validació de jugadors
  - **Property 2: Player number validation**
  - Validar que només s'accepten valors entre 2 i 4
  - _Requirements: 4.2, 5.3_

- [ ]* 6.4 Escriure property test per validació de temps
  - **Property 9: Time validation**
  - Validar que l'hora de fi és posterior a l'hora d'inici
  - _Requirements: 11.2_

- [x] 7. Implementar components comuns







- [x] 7.1 Crear components comuns per User App

  - Crear user-app/src/components/common/LoadingSpinner.tsx
  - Crear user-app/src/components/common/ErrorMessage.tsx
  - Crear user-app/src/components/common/ConfirmDialog.tsx
  - _Requirements: 15.2, 15.3_

- [x] 7.2 Crear components comuns per Admin App


  - Crear admin-app/src/components/common/LoadingSpinner.tsx
  - Crear admin-app/src/components/common/ErrorMessage.tsx
  - Crear admin-app/src/components/common/ConfirmDialog.tsx
  - _Requirements: 15.2, 15.3_
- [x] 8. Implementar components de layout






- [ ] 8. Implementar components de layout


- [x] 8.1 Crear layout per User App


  - Crear user-app/src/components/layout/Header.tsx amb navegació i informació d'usuari
  - Crear user-app/src/components/layout/Footer.tsx
  - Crear user-app/src/components/layout/Sidebar.tsx amb menú de navegació
  - Crear user-app/src/components/layout/MainLayout.tsx que combina Header, Sidebar i Footer
  - _Requirements: 15.1, 15.5_

- [x] 8.2 Crear layout per Admin App


  - Crear admin-app/src/components/layout/AdminHeader.tsx amb navegació
  - Crear admin-app/src/components/layout/AdminSidebar.tsx amb menú d'administració
  - Crear admin-app/src/components/layout/AdminLayout.tsx que combina Header i Sidebar
  - _Requirements: 15.1, 15.5_

- [x] 9. Implementar autenticació i routing





- [x] 9.1 Crear components d'autenticació per User App


  - Crear user-app/src/components/auth/LoginForm.tsx amb validació
  - Crear user-app/src/components/auth/ProtectedRoute.tsx per protegir rutes
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 9.2 Crear pàgina de login per User App


  - Crear user-app/src/pages/LoginPage.tsx
  - Integrar LoginForm i gestió d'errors
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 9.3 Configurar routing per User App


  - Crear user-app/src/router.tsx amb React Router
  - Configurar rutes: /, /login, /bookings, /bookings/new, /history
  - Implementar ProtectedRoute per rutes privades
  - _Requirements: 1.1, 1.4_

- [ ]* 9.4 Escriure property test per persistència de sessió
  - **Property 1: Session persistence across navigation**
  - Validar que la sessió es manté durant la navegació
  - _Requirements: 1.4_




- [ ] 9.5 Crear components d'autenticació per Admin App
  - Crear admin-app/src/components/auth/AdminLoginForm.tsx
  - Crear admin-app/src/components/auth/ProtectedRoute.tsx


  - _Requirements: 8.1, 8.2, 8.3_


- [x] 9.6 Crear pàgina de login per Admin App


  - Crear admin-app/src/pages/AdminLoginPage.tsx
  - Integrar AdminLoginForm
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 9.7 Configurar routing per Admin App

  - Crear admin-app/src/router.tsx amb React Router
  - Configurar rutes: /, /login, /courts, /timeslots, /users, /bookings, /lottery, /stats
  - Implementar ProtectedRoute per rutes privades
  - _Requirements: 8.1, 8.4_

- [x] 10. Implementar Dashboard d'Usuari





- [x] 10.1 Crear components de dashboard per User App


  - Crear user-app/src/components/dashboard/DashboardStats.tsx per mostrar tipus d'usuari i comptador d'ús
  - Crear user-app/src/components/dashboard/UpcomingBookings.tsx per reserves properes
  - Crear user-app/src/components/dashboard/PendingRequests.tsx per sol·licituds pendents
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 10.2 Crear pàgina de dashboard per User App


  - Crear user-app/src/pages/DashboardPage.tsx
  - Integrar components de dashboard
  - Implementar accés ràpid a crear nova reserva
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ]* 10.3 Escriure property test per renderització completa de dades
  - **Property 6: Complete data rendering**
  - Validar que tots els camps especificats es mostren
  - _Requirements: 2.2, 6.2_

- [x] 11. Implementar funcionalitat de reserves





- [x] 11.1 Crear components de booking per User App


  - Crear user-app/src/components/booking/BookingCalendar.tsx per seleccionar dates
  - Crear user-app/src/components/booking/TimeSlotSelector.tsx per seleccionar horaris
  - Crear user-app/src/components/booking/BookingForm.tsx per crear reserves/sol·licituds
  - Crear user-app/src/components/booking/BookingCard.tsx per mostrar una reserva
  - Crear user-app/src/components/booking/BookingList.tsx per llistar reserves
  - _Requirements: 3.1, 3.2, 3.3, 4.1, 5.1, 6.1_

- [ ]* 11.2 Escriure property test per distinció visual de franges horàries
  - **Property 4: Time slot visual distinction**
  - Validar que OFF_PEAK i PEAK es distingeixen visualment
  - _Requirements: 3.4_

- [x] 11.3 Crear pàgina de nova reserva per User App


  - Crear user-app/src/pages/NewBookingPage.tsx
  - Integrar BookingCalendar, TimeSlotSelector i BookingForm
  - Implementar lògica per diferenciar finestra de sol·licitud vs reserva directa
  - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.3, 5.1, 5.4_

- [ ]* 11.4 Escriure property test per gestió d'errors d'API
  - **Property 3: API error display**
  - Validar que els errors d'API es mostren correctament
  - _Requirements: 4.4, 5.5, 7.3_

- [ ]* 11.5 Escriure property test per validació de camps obligatoris
  - **Property 5: Required field validation**
  - Validar que els camps obligatoris impedeixen l'enviament
  - _Requirements: 16.1, 16.2_

- [x] 11.6 Crear pàgina de gestió de reserves per User App


  - Crear user-app/src/pages/BookingsPage.tsx
  - Integrar BookingList amb reserves i sol·licituds
  - Implementar funcionalitat de cancel·lació amb confirmació
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2_

- [ ]* 11.7 Escriure property test per feedback d'operacions asíncrones
  - **Property 8: Async operation feedback**
  - Validar que es mostren indicadors de càrrega i notificacions
  - _Requirements: 15.2, 15.3, 15.4_

- [x] 12. Implementar historial i estadístiques d'usuari







- [ ] 12.1 Crear pàgina d'historial per User App
  - Crear user-app/src/pages/HistoryPage.tsx
  - Implementar filtres per data i estat
  - Mostrar reserves completades i cancel·lades
  - Mostrar comptador d'ús i estadístiques personals
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

- [ ]* 12.2 Escriure property test per ordenació d'historial
  - **Property 10: Historical data ordering**
  - Validar que l'historial s'ordena per data descendent
  - _Requirements: 17.5_

- [ ]* 12.3 Escriure property test per funcionalitat de filtres
  - **Property 7: Filter functionality**
  - Validar que els filtres funcionen correctament
  - _Requirements: 17.2_

- [x] 13. Integrar App.tsx i main.tsx per User App





- [x] 13.1 Configurar App.tsx per User App


  - Actualitzar user-app/src/App.tsx per utilitzar router i providers
  - Integrar AuthProvider i ToastProvider
  - Configurar RouterProvider amb les rutes definides
  - _Requirements: 1.4, 15.5_

- [x] 13.2 Configurar main.tsx per User App


  - Actualitzar user-app/src/main.tsx si cal
  - Assegurar que l'aplicació es renderitza correctament
  - _Requirements: 15.5_

- [x] 14. Implementar Dashboard d'Administrador




- [x] 14.1 Crear components de dashboard per Admin App


  - Crear admin-app/src/components/stats/StatsOverview.tsx per estadístiques generals
  - Crear admin-app/src/components/stats/UsageChart.tsx per gràfics d'ús
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 14.2 Crear pàgina de dashboard per Admin App


  - Crear admin-app/src/pages/AdminDashboardPage.tsx
  - Integrar components d'estadístiques
  - Mostrar reserves actives, sol·licituds pendents, usuaris i pistes
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 15. Implementar gestió de pistes





- [x] 15.1 Crear components de pistes per Admin App


  - Crear admin-app/src/components/courts/CourtList.tsx per llistar pistes
  - Crear admin-app/src/components/courts/CourtForm.tsx per crear/editar pistes
  - Crear admin-app/src/components/courts/CourtCard.tsx per mostrar una pista
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 15.2 Crear pàgina de gestió de pistes per Admin App


  - Crear admin-app/src/pages/CourtsPage.tsx
  - Integrar CourtList i CourtForm
  - Implementar funcionalitat de crear, editar, activar/desactivar i eliminar
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 16. Implementar gestió d'horaris





- [x] 16.1 Crear components d'horaris per Admin App


  - Crear admin-app/src/components/timeslots/TimeSlotList.tsx per llistar franges
  - Crear admin-app/src/components/timeslots/TimeSlotForm.tsx per crear/editar franges
  - Crear admin-app/src/components/timeslots/TimeSlotCard.tsx per mostrar una franja
  - _Requirements: 11.1, 11.2, 11.3_



- [x] 16.2 Crear pàgina de gestió d'horaris per Admin App




  - Crear admin-app/src/pages/TimeSlotsPage.tsx
  - Integrar TimeSlotList i TimeSlotForm
  - Implementar validació de temps i advertències de conflictes

  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 17. Implementar gestió d'usuaris








- [x] 17.1 Crear components d'usuaris per Admin App


  - Crear admin-app/src/components/users/UserList.tsx per llistar usuaris
  - Crear admin-app/src/components/users/UserForm.tsx per crear/editar usuaris
  - Crear admin-app/src/components/users/UserCard.tsx per mostrar un usuari
  - Crear admin-app/src/components/users/UserFilters.tsx per filtrar usuaris
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 17.2 Crear pàgina de gestió d'usuaris per Admin App


  - Crear admin-app/src/pages/UsersPage.tsx
  - Integrar UserList, UserForm i UserFilters
  - Implementar funcionalitat de crear, editar i filtrar usuaris
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 18. Implementar visualització de reserves per administrador




- [x] 18.1 Crear components de reserves per Admin App


  - Crear admin-app/src/components/bookings/BookingCalendarView.tsx per vista de calendari
  - Crear admin-app/src/components/bookings/BookingListView.tsx per vista de llista
  - Crear admin-app/src/components/bookings/BookingDetails.tsx per detalls de reserva
  - Crear admin-app/src/components/bookings/BookingFilters.tsx per filtrar reserves
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 18.2 Crear pàgina de reserves per Admin App


  - Crear admin-app/src/pages/BookingsPage.tsx
  - Integrar components de reserves amb filtres
  - Implementar canvi entre vista de calendari i llista
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ] 19. Implementar gestió de sortejos


- [x] 19.1 Crear components de sorteig per Admin App


  - Crear admin-app/src/components/lottery/LotteryDashboard.tsx per mostrar dates amb sol·licituds
  - Crear admin-app/src/components/lottery/LotteryExecutor.tsx per executar sorteig
  - Crear admin-app/src/components/lottery/LotteryResults.tsx per mostrar resultats
  - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [x] 19.2 Crear pàgina de sortejos per Admin App



  - Crear admin-app/src/pages/LotteryPage.tsx
  - Integrar components de sorteig
  - Implementar execució manual i visualització de resultats
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_
- [x] 20. Implementar estadístiques d'administrador




- [ ] 20. Implementar estadístiques d'administrador


- [x] 20.1 Crear components d'estadístiques per Admin App


  - Crear admin-app/src/components/stats/UserStatsTable.tsx per estadístiques d'usuaris
  - Millorar admin-app/src/components/stats/UsageChart.tsx per gràfics detallats
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_

- [x] 20.2 Crear pàgina d'estadístiques per Admin App


  - Crear admin-app/src/pages/StatsPage.tsx
  - Integrar components d'estadístiques
  - Implementar selecció de període de temps
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_
- [-] 21. Integrar App.tsx i main.tsx per Admin App

- [ ] 21. Integrar App.tsx i main.tsx per Admin App


- [x] 21.1 Configurar App.tsx per Admin App


  - Actualitzar admin-app/src/App.tsx per utilitzar router i providers
  - Integrar AuthProvider i ToastProvider
  - Configurar RouterProvider amb les rutes definides
  - _Requirements: 8.4, 15.5_

- [x] 21.2 Configurar main.tsx per Admin App


  - Actualitzar admin-app/src/main.tsx si cal
  - Assegurar que l'aplicació es renderitza correctament
  - _Requirements: 15.5_

- [x] 22. Configurar variables d'entorn i build







- [x] 22.1 Configurar variables d'entorn per User App


  - Crear user-app/.env.example amb VITE_API_BASE_URL
  - Documentar variables necessàries
  - _Requirements: 16.4_

- [x] 22.2 Configurar variables d'entorn per Admin App


  - Crear admin-app/.env.example amb VITE_API_BASE_URL
  - Documentar variables necessàries
  - _Requirements: 16.4_

- [x] 22.3 Configurar Vite per User App


  - Actualitzar user-app/vite.config.ts amb proxy per /api
  - Configurar build optimizations
  - _Requirements: 15.5_

- [x] 22.4 Configurar Vite per Admin App


  - Actualitzar admin-app/vite.config.ts amb proxy per /api
  - Configurar build optimizations
  - _Requirements: 15.5_




- [ ] 23. Testing i validació final



- [ ]* 23.1 Executar tots els tests de User App
  - Executar npm test a user-app
  - Verificar que tots els tests passen
  - _Requirements: Testing Strategy_

- [ ]* 23.2 Executar tots els tests d'Admin App
  - Executar npm test a admin-app
  - Verificar que tots els tests passen
  - _Requirements: Testing Strategy_



- [ ] 23.3 Validar responsive design
  - Provar User App en diferents mides de pantalla


  - Provar Admin App en diferents mides de pantalla



  - _Requirements: 15.1_

- [x] 23.4 Validar integració amb API


  - Provar totes les funcionalitats de User App amb l'API real
  - Provar totes les funcionalitats d'Admin App amb l'API real
  - _Requirements: 16.4_



- [ ] 24. Documentació



- [ ] 24.1 Crear README per User App
  - Documentar instal·lació i configuració
  - Documentar scripts disponibles
  - Documentar estructura del projecte
  - _Requirements: 15.5_

- [ ] 24.2 Crear README per Admin App
  - Documentar instal·lació i configuració
  - Documentar scripts disponibles
  - Documentar estructura del projecte
  - _Requirements: 15.5_
