/**
 * Tests para la funcionalidad de inserción de candidatos
 * Autor: CALD
 */
import { validateCandidateData } from '../application/validator';
import { addCandidate } from '../application/services/candidateService';
import { Candidate } from '../domain/models/Candidate';
import { Education } from '../domain/models/Education';
import { WorkExperience } from '../domain/models/WorkExperience';
import { Resume } from '../domain/models/Resume';
import { PrismaClient } from '@prisma/client';

// Sobrescribir los tipos para Jest
const MockCandidate = Candidate as unknown as jest.Mock;
const MockEducation = Education as unknown as jest.Mock;
const MockWorkExperience = WorkExperience as unknown as jest.Mock;
const MockResume = Resume as unknown as jest.Mock;

// Mocking Prisma
jest.mock('@prisma/client', () => {
  const mockCreate = jest.fn().mockResolvedValue({ id: 1, firstName: 'Test', lastName: 'User', email: 'test@example.com' });
  const mockUpdate = jest.fn();
  
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      candidate: {
        create: mockCreate,
        update: mockUpdate,
        findUnique: jest.fn()
      },
      education: {
        create: jest.fn(),
        update: jest.fn()
      },
      workExperience: {
        create: jest.fn(),
        update: jest.fn()
      },
      resume: {
        create: jest.fn()
      },
      $connect: jest.fn(),
      $disconnect: jest.fn()
    }))
  };
});

// Mock de las clases de dominio - usamos declaraciones simplificadas
jest.mock('../domain/models/Candidate');
jest.mock('../domain/models/Education');
jest.mock('../domain/models/WorkExperience');
jest.mock('../domain/models/Resume');

beforeEach(() => {
  // Reset mocks
  jest.clearAllMocks();
  
  // Setup mocks
  MockCandidate.mockImplementation((data) => {
    return {
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      education: [],
      workExperience: [],
      resumes: [],
      save: jest.fn().mockResolvedValue({ id: 1, ...data })
    };
  });

  MockEducation.mockImplementation((data) => {
    return {
      ...data,
      save: jest.fn().mockResolvedValue({ id: 1, ...data })
    };
  });

  MockWorkExperience.mockImplementation((data) => {
    return {
      ...data,
      save: jest.fn().mockResolvedValue({ id: 1, ...data })
    };
  });

  MockResume.mockImplementation((data) => {
    return {
      ...data,
      save: jest.fn().mockResolvedValue({ id: 1, ...data })
    };
  });
});

describe('Candidate Validation Tests', () => {
  test('should validate correct candidate data', () => {
    const validCandidateData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '666123456',
      address: 'Calle Principal 123',
      educations: [
        {
          institution: 'Universidad de Barcelona',
          title: 'Computer Science',
          startDate: '2010-09-01',
          endDate: '2014-06-30'
        }
      ],
      workExperiences: [
        {
          company: 'Tech Corp',
          position: 'Developer',
          description: 'Full stack development',
          startDate: '2015-01-01',
          endDate: '2020-12-31'
        }
      ],
      cv: {
        filePath: 'uploads/123456-cv.pdf',
        fileType: 'application/pdf'
      }
    };

    // No debería arrojar error
    expect(() => validateCandidateData(validCandidateData)).not.toThrow();
  });

  test('should throw error for invalid name', () => {
    const invalidNameData = {
      firstName: '123', // Nombres deben ser solo letras según regex
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '666123456',
      address: 'Calle Principal 123'
    };

    expect(() => validateCandidateData(invalidNameData)).toThrow('Invalid name');
  });

  test('should throw error for invalid email', () => {
    const invalidEmailData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'not-an-email', // Email inválido
      phone: '666123456',
      address: 'Calle Principal 123'
    };

    expect(() => validateCandidateData(invalidEmailData)).toThrow('Invalid email');
  });

  test('should throw error for invalid phone', () => {
    const invalidPhoneData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '12345', // Teléfono inválido según regex
      address: 'Calle Principal 123'
    };

    expect(() => validateCandidateData(invalidPhoneData)).toThrow('Invalid phone');
  });

  test('should throw error for invalid education date', () => {
    const invalidEducationData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '666123456',
      educations: [
        {
          institution: 'Universidad de Barcelona',
          title: 'Computer Science',
          startDate: 'not-a-date', // Fecha inválida
          endDate: '2014-06-30'
        }
      ]
    };

    expect(() => validateCandidateData(invalidEducationData)).toThrow('Invalid date');
  });

  test('should throw error for invalid work experience', () => {
    const invalidExperienceData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '666123456',
      workExperiences: [
        {
          company: '', // Compañía vacía
          position: 'Developer',
          startDate: '2015-01-01',
          endDate: '2020-12-31'
        }
      ]
    };

    expect(() => validateCandidateData(invalidExperienceData)).toThrow('Invalid company');
  });

  test('should throw error for invalid CV data', () => {
    const invalidCVData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '666123456',
      cv: {
        // Falta fileType, que es requerido según validateCV
        filePath: 'uploads/cv.pdf'
      }
    };

    expect(() => validateCandidateData(invalidCVData)).toThrow('Invalid CV data');
  });
});

describe('Candidate Service Tests', () => {
  test('should add a new candidate successfully', async () => {
    const candidateData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '666123456',
      address: 'Calle Principal 123',
      educations: [
        {
          institution: 'Universidad de Barcelona',
          title: 'Computer Science',
          startDate: '2010-09-01',
          endDate: '2014-06-30'
        }
      ],
      workExperiences: [
        {
          company: 'Tech Corp',
          position: 'Developer',
          description: 'Full stack development',
          startDate: '2015-01-01',
          endDate: '2020-12-31'
        }
      ],
      cv: {
        filePath: 'uploads/123456-cv.pdf',
        fileType: 'application/pdf'
      }
    };

    const result = await addCandidate(candidateData);
    
    // Verificamos que se ha creado el candidato con los datos correctos
    expect(result).toBeDefined();
    expect(MockCandidate).toHaveBeenCalledWith(candidateData);
    // Verificamos que el método save se ha llamado
    expect(MockCandidate.mock.results[0].value.save).toHaveBeenCalled();
  });

  test('should save educations when adding a candidate', async () => {
    const candidateData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '666123456',
      educations: [
        {
          institution: 'Universidad de Barcelona',
          title: 'Computer Science',
          startDate: '2010-09-01',
          endDate: '2014-06-30'
        }
      ]
    };

    await addCandidate(candidateData);
    
    // Verificamos que se ha creado la educación
    expect(MockEducation).toHaveBeenCalledWith(candidateData.educations[0]);
    // Verificamos que el método save de Education se ha llamado
    expect(MockEducation.mock.results[0].value.save).toHaveBeenCalled();
  });

  test('should save work experiences when adding a candidate', async () => {
    const candidateData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '666123456',
      workExperiences: [
        {
          company: 'Tech Corp',
          position: 'Developer',
          description: 'Full stack development',
          startDate: '2015-01-01',
          endDate: '2020-12-31'
        }
      ]
    };

    await addCandidate(candidateData);
    
    // Verificamos que se ha creado la experiencia laboral
    expect(MockWorkExperience).toHaveBeenCalledWith(candidateData.workExperiences[0]);
    // Verificamos que el método save de WorkExperience se ha llamado
    expect(MockWorkExperience.mock.results[0].value.save).toHaveBeenCalled();
  });

  test('should save CV when adding a candidate', async () => {
    const candidateData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '666123456',
      cv: {
        filePath: 'uploads/123456-cv.pdf',
        fileType: 'application/pdf'
      }
    };

    await addCandidate(candidateData);
    
    // Verificamos que se ha creado el CV
    expect(MockResume).toHaveBeenCalledWith(candidateData.cv);
    // Verificamos que el método save de Resume se ha llamado
    expect(MockResume.mock.results[0].value.save).toHaveBeenCalled();
  });

  test('should throw error if email already exists', async () => {
    // Mock para simular un error de violación de restricción única en Prisma
    const emailExistsError = new Error('The email already exists in the database');
    // Añadir la propiedad code
    Object.defineProperty(emailExistsError, 'code', { value: 'P2002' });
    
    // Sobreescribimos el comportamiento de save para este test específico
    MockCandidate.mockImplementationOnce(() => ({
      firstName: 'John',
      lastName: 'Doe',
      email: 'existing@example.com',
      phone: '666123456',
      address: 'Calle Principal 123',
      education: [],
      workExperience: [],
      resumes: [],
      save: jest.fn().mockRejectedValue(emailExistsError)
    }));

    const candidateData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'existing@example.com',
      phone: '666123456'
    };

    await expect(addCandidate(candidateData)).rejects.toThrow('The email already exists in the database');
  });
});