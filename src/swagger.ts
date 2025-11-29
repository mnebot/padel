import swaggerJsdoc from 'swagger-jsdoc';
import { UserType, TimeSlotType, BookingStatus } from '@prisma/client';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Gestió de Reserves de Pàdel API',
      version: '1.0.0',
      description: `
Sistema de gestió de reserves de pàdel amb sorteig ponderat.

## Característiques Principals

- **Gestió d'Usuaris**: Registre i gestió de socis i no socis
- **Gestió de Pistes**: Administració de pistes de pàdel
- **Gestió d'Horaris**: Configuració de franges horàries (Hora Vall / Hora Punta)
- **Sol·licituds de Reserva**: Sistema de sol·licituds amb sorteig ponderat (5-2 dies d'antelació)
- **Reserves Directes**: Reserves immediates per a última hora (menys de 2 dies)
- **Sorteig Ponderat**: Prioritza socis i penalitza ús excessiu
- **Comptador d'Ús**: Seguiment mensual de l'ús de pistes per usuari

## Finestres Temporals

- **Finestra de Sol·licitud**: 5 a 2 dies abans de la data desitjada
- **Finestra de Reserva Lliure**: Menys de 2 dies abans de la data

## Tipus d'Usuari

- **MEMBER**: Soci amb prioritat en el sorteig (pes base 2.0)
- **NON_MEMBER**: No soci sense prioritat (pes base 1.0)

## Fórmula de Càlcul de Pes

\`\`\`
Per Socis:     pes = 2.0 / (1 + usageCount * 0.15)
Per No Socis:  pes = 1.0 / (1 + usageCount * 0.15)
\`\`\`
      `,
      contact: {
        name: 'API Support',
        email: 'support@padel.example.com',
      },
      license: {
        name: 'ISC',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Users',
        description: 'Gestió d\'usuaris (socis i no socis)',
      },
      {
        name: 'Courts',
        description: 'Gestió de pistes de pàdel',
      },
      {
        name: 'TimeSlots',
        description: 'Gestió de franges horàries',
      },
      {
        name: 'BookingRequests',
        description: 'Sol·licituds de reserva (5-2 dies d\'antelació)',
      },
      {
        name: 'Bookings',
        description: 'Reserves directes (menys de 2 dies)',
      },
      {
        name: 'Lottery',
        description: 'Execució i consulta del sorteig ponderat',
      },
      {
        name: 'Health',
        description: 'Endpoints de salut del sistema',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          required: ['id', 'name', 'email', 'type', 'createdAt', 'updatedAt'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Identificador únic de l\'usuari',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 255,
              description: 'Nom de l\'usuari',
              example: 'Joan Garcia',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Correu electrònic de l\'usuari',
              example: 'joan.garcia@example.com',
            },
            type: {
              type: 'string',
              enum: Object.values(UserType),
              description: 'Tipus d\'usuari (MEMBER = Soci, NON_MEMBER = No Soci)',
              example: UserType.MEMBER,
            },
            usageCount: {
              type: 'integer',
              minimum: 0,
              description: 'Nombre de reserves completades des de l\'últim reset mensual',
              example: 3,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de creació',
              example: '2024-01-15T10:30:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data d\'última actualització',
              example: '2024-01-20T14:45:00Z',
            },
          },
        },
        Court: {
          type: 'object',
          required: ['id', 'name', 'description', 'isActive', 'createdAt', 'updatedAt'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Identificador únic de la pista',
              example: '660e8400-e29b-41d4-a716-446655440001',
            },
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 255,
              description: 'Nom de la pista',
              example: 'Pista 1',
            },
            description: {
              type: 'string',
              maxLength: 1000,
              description: 'Descripció de la pista',
              example: 'Pista exterior amb il·luminació',
            },
            isActive: {
              type: 'boolean',
              description: 'Indica si la pista està activa i disponible per reserves',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de creació',
              example: '2024-01-10T09:00:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data d\'última actualització',
              example: '2024-01-15T11:30:00Z',
            },
          },
        },
        TimeSlot: {
          type: 'object',
          required: ['id', 'dayOfWeek', 'startTime', 'endTime', 'duration', 'type', 'createdAt', 'updatedAt'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Identificador únic de la franja horària',
              example: '770e8400-e29b-41d4-a716-446655440002',
            },
            dayOfWeek: {
              type: 'integer',
              minimum: 0,
              maximum: 6,
              description: 'Dia de la setmana (0 = Diumenge, 1 = Dilluns, ..., 6 = Dissabte)',
              example: 1,
            },
            startTime: {
              type: 'string',
              pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]$',
              description: 'Hora d\'inici en format HH:mm',
              example: '09:00',
            },
            endTime: {
              type: 'string',
              pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]$',
              description: 'Hora de fi en format HH:mm',
              example: '10:00',
            },
            duration: {
              type: 'integer',
              minimum: 1,
              description: 'Durada en minuts',
              example: 60,
            },
            type: {
              type: 'string',
              enum: Object.values(TimeSlotType),
              description: 'Tipus de franja (OFF_PEAK = Hora Vall, PEAK = Hora Punta)',
              example: TimeSlotType.PEAK,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de creació',
              example: '2024-01-05T08:00:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data d\'última actualització',
              example: '2024-01-10T10:00:00Z',
            },
          },
        },
        BookingRequest: {
          type: 'object',
          required: ['id', 'userId', 'date', 'timeSlot', 'numberOfPlayers', 'status', 'createdAt', 'updatedAt'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Identificador únic de la sol·licitud',
              example: '880e8400-e29b-41d4-a716-446655440003',
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'Identificador de l\'usuari que fa la sol·licitud',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Data de la reserva sol·licitada',
              example: '2024-01-25',
            },
            timeSlot: {
              type: 'string',
              pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]$',
              description: 'Hora de la reserva en format HH:mm',
              example: '10:00',
            },
            numberOfPlayers: {
              type: 'integer',
              minimum: 2,
              maximum: 4,
              description: 'Nombre de jugadors (entre 2 i 4)',
              example: 4,
            },
            status: {
              type: 'string',
              enum: Object.values(BookingStatus),
              description: 'Estat de la sol·licitud',
              example: BookingStatus.REQUESTED,
            },
            weight: {
              type: 'number',
              format: 'float',
              description: 'Pes calculat pel sorteig (opcional)',
              example: 1.54,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de creació',
              example: '2024-01-20T15:30:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data d\'última actualització',
              example: '2024-01-20T15:30:00Z',
            },
          },
        },
        Booking: {
          type: 'object',
          required: ['id', 'userId', 'courtId', 'date', 'timeSlot', 'numberOfPlayers', 'status', 'createdAt', 'updatedAt'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Identificador únic de la reserva',
              example: '990e8400-e29b-41d4-a716-446655440004',
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'Identificador de l\'usuari que fa la reserva',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            courtId: {
              type: 'string',
              format: 'uuid',
              description: 'Identificador de la pista assignada',
              example: '660e8400-e29b-41d4-a716-446655440001',
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Data de la reserva',
              example: '2024-01-23',
            },
            timeSlot: {
              type: 'string',
              pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]$',
              description: 'Hora de la reserva en format HH:mm',
              example: '11:00',
            },
            numberOfPlayers: {
              type: 'integer',
              minimum: 2,
              maximum: 4,
              description: 'Nombre de jugadors (entre 2 i 4)',
              example: 4,
            },
            status: {
              type: 'string',
              enum: Object.values(BookingStatus),
              description: 'Estat de la reserva',
              example: BookingStatus.CONFIRMED,
            },
            requestId: {
              type: 'string',
              format: 'uuid',
              description: 'Identificador de la sol·licitud original (si ve del sorteig)',
              example: '880e8400-e29b-41d4-a716-446655440003',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de creació',
              example: '2024-01-21T16:00:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data d\'última actualització',
              example: '2024-01-21T16:00:00Z',
            },
            completedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de completació (quan la reserva s\'ha utilitzat)',
              example: '2024-01-23T12:00:00Z',
              nullable: true,
            },
            cancelledAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de cancel·lació',
              example: null,
              nullable: true,
            },
          },
        },
        Error: {
          type: 'object',
          required: ['error', 'message'],
          properties: {
            error: {
              type: 'string',
              description: 'Nom de l\'error',
              example: 'ValidationError',
            },
            message: {
              type: 'string',
              description: 'Descripció de l\'error',
              example: 'Invalid input data',
            },
            details: {
              type: 'array',
              description: 'Detalls addicionals de l\'error (opcional)',
              items: {
                type: 'object',
              },
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          required: ['success'],
          properties: {
            success: {
              type: 'boolean',
              description: 'Indica si l\'operació ha estat exitosa',
              example: true,
            },
            data: {
              type: 'object',
              description: 'Dades de resposta',
            },
            message: {
              type: 'string',
              description: 'Missatge addicional (opcional)',
            },
          },
        },
      },
      responses: {
        BadRequest: {
          description: 'Petició invàlida - Error de validació',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              examples: {
                validationError: {
                  summary: 'Error de validació',
                  value: {
                    error: 'ValidationError',
                    message: 'Invalid input data',
                    details: [
                      {
                        field: 'email',
                        message: 'Email must be valid',
                      },
                    ],
                  },
                },
                invalidWindow: {
                  summary: 'Finestra temporal invàlida',
                  value: {
                    error: 'InvalidRequestWindowError',
                    message: 'Booking requests must be made between 5 and 2 days in advance',
                  },
                },
                invalidPlayers: {
                  summary: 'Nombre de jugadors invàlid',
                  value: {
                    error: 'InvalidNumberOfPlayersError',
                    message: 'Number of players must be between 2 and 4',
                  },
                },
              },
            },
          },
        },
        NotFound: {
          description: 'Recurs no trobat',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              examples: {
                userNotFound: {
                  summary: 'Usuari no trobat',
                  value: {
                    error: 'UserNotFoundError',
                    message: 'User not found',
                  },
                },
                courtNotFound: {
                  summary: 'Pista no trobada',
                  value: {
                    error: 'CourtNotFoundError',
                    message: 'Court not found',
                  },
                },
                bookingNotFound: {
                  summary: 'Reserva no trobada',
                  value: {
                    error: 'BookingNotFoundError',
                    message: 'Booking not found',
                  },
                },
              },
            },
          },
        },
        Conflict: {
          description: 'Conflicte - Recurs ja existeix o no disponible',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              examples: {
                courtNotAvailable: {
                  summary: 'Pista no disponible',
                  value: {
                    error: 'CourtNotAvailableError',
                    message: 'Court is not available for the selected time slot',
                  },
                },
                courtInactive: {
                  summary: 'Pista inactiva',
                  value: {
                    error: 'CourtInactiveError',
                    message: 'Court is inactive and cannot accept bookings',
                  },
                },
                hasActiveBookings: {
                  summary: 'Pista amb reserves actives',
                  value: {
                    error: 'CourtHasActiveBookingsError',
                    message: 'Cannot delete court with active bookings',
                  },
                },
              },
            },
          },
        },
        InternalServerError: {
          description: 'Error intern del servidor',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                error: 'InternalServerError',
                message: 'An unexpected error occurred',
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/controllers/*.ts', './src/index.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
