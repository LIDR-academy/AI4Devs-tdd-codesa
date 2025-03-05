import { validateCandidateData } from '../application/validator';
import { addCandidate } from '../application/services/candidateService';
import { Candidate } from '../domain/models/Candidate';
import { Education } from '../domain/models/Education';
import { WorkExperience } from '../domain/models/WorkExperience';
import { Resume } from '../domain/models/Resume';

// Mock de las dependencias
jest.mock('../application/validator');
jest.mock('../domain/models/Candidate');
jest.mock('../domain/models/Education');
jest.mock('../domain/models/WorkExperience');
jest.mock('../domain/models/Resume');

describe('Pruebas iniciales', () => {
  describe('Validación de datos', () => {
    test('debería validar un candidato con datos correctos', () => {
      // Arrange - Preparar los datos de prueba
      const candidateData = {
        firstName: 'Juan',
        lastName: 'García',
        email: 'juan.garcia@example.com',
        phone: '654321987',
        address: 'Calle Mayor 123, Madrid',
        educations: [
          {
            institution: 'Universidad Complutense',
            title: 'Ingeniería Informática',
            startDate: '2015-09-01',
            endDate: '2019-06-30',
          },
        ],
        workExperiences: [
          {
            company: 'Empresa ABC',
            position: 'Desarrollador',
            description: 'Desarrollo de aplicaciones web',
            startDate: '2019-07-01',
            endDate: '2022-12-31',
          },
        ],
        cv: {
          filePath: 'uploads/1234567890-cv.pdf',
          fileType: 'application/pdf',
        },
      };

      // Act & Assert - Ejecutar y verificar
      // Si la validación es correcta, no debe lanzar ninguna excepción
      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });

    test('debería rechazar un candidato con email inválido', () => {
      // Arrange - Preparar los datos de prueba con email inválido
      const candidateData = {
        firstName: 'Juan',
        lastName: 'García',
        email: 'email-invalido', // Email inválido
        phone: '654321987',
        address: 'Calle Mayor 123, Madrid',
      };

      // Act & Assert - Ejecutar y verificar que se lanza la excepción esperada
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid email');
    });
  });

  describe('Servicio de candidatos', () => {
    // Limpia los mocks antes de cada test
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('debería crear un candidato correctamente', async () => {
      // Arrange - Preparar los datos de prueba
      const candidateData = {
        firstName: 'María',
        lastName: 'López',
        email: 'maria.lopez@example.com',
        phone: '678912345',
        address: 'Avenida Principal 456, Barcelona',
        educations: [
          {
            institution: 'Universidad Politécnica',
            title: 'Ingeniería Industrial',
            startDate: '2014-09-01',
            endDate: '2018-06-30',
          },
        ],
        workExperiences: [
          {
            company: 'Empresa XYZ',
            position: 'Ingeniera',
            description: 'Desarrollo de proyectos industriales',
            startDate: '2018-07-01',
            endDate: '2021-12-31',
          },
        ],
        cv: {
          filePath: 'uploads/0987654321-cv.pdf',
          fileType: 'application/pdf',
        },
      };

      // Mock del resultado del guardado
      const savedCandidate = {
        id: 1,
        ...candidateData,
      };

      // Mock de los métodos
      (validateCandidateData as jest.Mock).mockImplementation(() => {});
      (Candidate.prototype.save as jest.Mock).mockResolvedValue(savedCandidate);
      (Education.prototype.save as jest.Mock).mockResolvedValue({});
      (WorkExperience.prototype.save as jest.Mock).mockResolvedValue({});
      (Resume.prototype.save as jest.Mock).mockResolvedValue({});

      // Act - Ejecutar el servicio
      const result = await addCandidate(candidateData);

      // Assert - Verificar el comportamiento esperado
      // 1. Se llamó a la validación
      expect(validateCandidateData).toHaveBeenCalledWith(candidateData);
      
      // 2. Se llamó al guardado del candidato
      expect(Candidate.prototype.save).toHaveBeenCalled();
      
      // 3. El resultado es el candidato guardado
      expect(result).toEqual(savedCandidate);
    });

    test('debería lanzar error si el email ya existe', async () => {
      // Arrange - Preparar los datos de prueba
      const candidateData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@example.com',
        phone: '612345678',
      };

      // Mock de los métodos
      (validateCandidateData as jest.Mock).mockImplementation(() => {});
      
      // Mock para simular error de duplicidad de email
      (Candidate.prototype.save as jest.Mock).mockRejectedValue({
        code: 'P2002',
      });

      // Act & Assert - Ejecutar y verificar que se lanza la excepción esperada
      await expect(addCandidate(candidateData)).rejects.toThrow('The email already exists in the database');
    });
  });
}); 