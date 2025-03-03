import { Candidate } from '../domain/models/Candidate';
import { addCandidate } from '../application/services/candidateService';
import { validateCandidateData } from '../application/validator';

// Mock de PrismaClient
jest.mock('@prisma/client', () => {
    const mockPrismaClient = {
        candidate: {
            create: jest.fn(),
            update: jest.fn(),
            findUnique: jest.fn()
        },
        education: {
            create: jest.fn()
        },
        workExperience: {
            create: jest.fn()
        },
        resume: {
            create: jest.fn()
        }
    };

    return {
        PrismaClient: jest.fn(() => mockPrismaClient)
    };
});

// Obtener la instancia mockeada de PrismaClient
const mockPrismaClient = new (require('@prisma/client').PrismaClient)();
const mockCreate = jest.spyOn(mockPrismaClient.candidate, 'create');
const mockUpdate = jest.spyOn(mockPrismaClient.candidate, 'update');

describe('Pruebas de inserción de candidatos', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Clase Candidate', () => {
        it('debería crear una instancia de Candidate correctamente', () => {
            const candidatoData = {
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'juan@test.com',
                phone: '123456789',
                address: 'Calle Test 123',
                education: [],
                workExperience: [],
                resumes: []
            };

            const candidato = new Candidate(candidatoData);

            expect(candidato.firstName).toBe('Juan');
            expect(candidato.lastName).toBe('Pérez');
            expect(candidato.email).toBe('juan@test.com');
            expect(candidato.phone).toBe('123456789');
            expect(candidato.address).toBe('Calle Test 123');
            expect(candidato.education).toEqual([]);
            expect(candidato.workExperience).toEqual([]);
            expect(candidato.resumes).toEqual([]);
        });

        it('debería guardar un nuevo candidato correctamente', async () => {
            const candidatoData = {
                firstName: 'María',
                lastName: 'García',
                email: 'maria@test.com',
                education: [],
                workExperience: [],
                resumes: []
            };

            const mockResponse = {
                id: 1,
                ...candidatoData
            };

            mockCreate.mockResolvedValueOnce(mockResponse);

            const candidato = new Candidate(candidatoData);
            const resultado = await candidato.save();

            expect(resultado).toEqual(mockResponse);
            expect(mockCreate).toHaveBeenCalledTimes(1);
            expect(mockCreate).toHaveBeenCalledWith({
                data: {
                    firstName: 'María',
                    lastName: 'García',
                    email: 'maria@test.com'
                }
            });
        });

        it('debería manejar errores de conexión a la base de datos', async () => {
            const candidatoData = {
                firstName: 'Pedro',
                lastName: 'López',
                email: 'pedro@test.com'
            };

            mockCreate.mockRejectedValueOnce(new Error('Error de conexión'));

            const candidato = new Candidate(candidatoData);
            await expect(candidato.save()).rejects.toThrow('Error de conexión');
        });
    });

    describe('Servicio addCandidate', () => {
        it('debería agregar un candidato completo con educación y experiencia laboral', async () => {
            const candidatoCompleto = {
                firstName: 'Ana',
                lastName: 'Martínez',
                email: 'ana@test.com',
                phone: '987654321',
                address: 'Avenida Test 456',
                educations: [{
                    institution: 'Universidad Test',
                    title: 'Ingeniería',
                    startDate: '2018-01-01',
                    endDate: '2022-12-31'
                }],
                workExperiences: [{
                    company: 'Empresa Test',
                    position: 'Desarrollador',
                    description: 'Desarrollo de software',
                    startDate: '2023-01-01',
                    endDate: '2024-01-01'
                }]
            };

            const mockResponse = {
                id: 1,
                ...candidatoCompleto,
                educations: [{
                    id: 1,
                    candidateId: 1,
                    ...candidatoCompleto.educations[0]
                }],
                workExperiences: [{
                    id: 1,
                    candidateId: 1,
                    ...candidatoCompleto.workExperiences[0]
                }]
            };

            mockCreate.mockResolvedValueOnce(mockResponse);

            const resultado = await addCandidate(candidatoCompleto);

            expect(resultado).toBeDefined();
            expect(resultado).toHaveProperty('id', 1);
            expect(resultado.firstName).toBe('Ana');
            expect(resultado.lastName).toBe('Martínez');
            expect(resultado.email).toBe('ana@test.com');
            expect(mockCreate).toHaveBeenCalledTimes(1);
        });

        it('debería validar los datos del candidato antes de guardar', async () => {
            const candidatoInvalido = {
                firstName: '',  // Nombre vacío
                lastName: 'Test',
                email: 'invalid-email'  // Email inválido
            };

            await expect(addCandidate(candidatoInvalido)).rejects.toThrow();
        });

        it('debería manejar el caso de email duplicado', async () => {
            const candidatoData = {
                firstName: 'Luis',
                lastName: 'Rodríguez',
                email: 'luis@test.com'
            };

            mockCreate.mockRejectedValueOnce({ code: 'P2002' });

            await expect(addCandidate(candidatoData)).rejects.toThrow('The email already exists in the database');
        });
    });
}); 