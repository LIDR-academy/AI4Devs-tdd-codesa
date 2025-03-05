import { validateCandidateData } from '../application/validator';

describe('Validator', () => {
  // Test para validación de datos correctos
  test('debería validar un candidato con datos correctos', () => {
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

    // Si la validación es correcta, no debe lanzar ninguna excepción
    expect(() => validateCandidateData(candidateData)).not.toThrow();
  });

  // Test para validación de nombre incorrecto
  test('debería rechazar un candidato con nombre inválido', () => {
    const candidateData = {
      firstName: '12345', // Nombre inválido (solo números)
      lastName: 'García',
      email: 'juan.garcia@example.com',
      phone: '654321987',
      address: 'Calle Mayor 123, Madrid',
    };

    expect(() => validateCandidateData(candidateData)).toThrow('Invalid name');
  });

  // Test para validación de email incorrecto
  test('debería rechazar un candidato con email inválido', () => {
    const candidateData = {
      firstName: 'Juan',
      lastName: 'García',
      email: 'email-invalido', // Email inválido
      phone: '654321987',
      address: 'Calle Mayor 123, Madrid',
    };

    expect(() => validateCandidateData(candidateData)).toThrow('Invalid email');
  });

  // Test para validación de teléfono incorrecto
  test('debería rechazar un candidato con teléfono inválido', () => {
    const candidateData = {
      firstName: 'Juan',
      lastName: 'García',
      email: 'juan.garcia@example.com',
      phone: '1234', // Teléfono inválido (demasiado corto)
      address: 'Calle Mayor 123, Madrid',
    };

    expect(() => validateCandidateData(candidateData)).toThrow('Invalid phone');
  });

  // Test para validación de educación incorrecta
  test('debería rechazar un candidato con datos de educación inválidos', () => {
    const candidateData = {
      firstName: 'Juan',
      lastName: 'García',
      email: 'juan.garcia@example.com',
      phone: '654321987',
      educations: [
        {
          institution: 'Universidad Complutense',
          title: 'Ingeniería Informática',
          startDate: 'fecha-invalida', // Formato de fecha inválido
          endDate: '2019-06-30',
        },
      ],
    };

    expect(() => validateCandidateData(candidateData)).toThrow('Invalid date');
  });
}); 