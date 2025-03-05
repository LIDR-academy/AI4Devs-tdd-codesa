import { addCandidate } from '../application/services/candidateService';
import { validateCandidateData } from '../application/validator';
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

describe('CandidateService', () => {
  // Limpia los mocks antes de cada test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debería crear un candidato correctamente', async () => {
    // Mock de datos de entrada
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

    // Ejecutar el servicio
    const result = await addCandidate(candidateData);

    // Verificar que se llamó a la validación
    expect(validateCandidateData).toHaveBeenCalledWith(candidateData);

    // Verificar que se llamó al guardado del candidato
    expect(Candidate.prototype.save).toHaveBeenCalled();

    // Verificar que se devolvió el candidato guardado
    expect(result).toEqual(savedCandidate);
  });

  test('debería lanzar error si la validación falla', async () => {
    const candidateData = {
      firstName: '',
      lastName: '',
      email: 'email-invalido',
    };

    // Mock para que la validación falle
    (validateCandidateData as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid data');
    });

    // Verificar que se lanza el error
    await expect(addCandidate(candidateData)).rejects.toThrow('Invalid data');

    // Verificar que no se intentó guardar
    expect(Candidate.prototype.save).not.toHaveBeenCalled();
  });

  test('debería lanzar error si el email ya existe', async () => {
    const candidateData = {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@example.com',
      phone: '612345678',
    };

    (validateCandidateData as jest.Mock).mockImplementation(() => {});
    
    // Mock para simular error de duplicidad de email
    (Candidate.prototype.save as jest.Mock).mockRejectedValue({
      code: 'P2002',
    });

    await expect(addCandidate(candidateData)).rejects.toThrow('The email already exists in the database');
  });
}); 