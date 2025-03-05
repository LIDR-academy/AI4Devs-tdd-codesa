import { uploadCV, sendCandidateData } from '../../services/candidateService';

// Mock de axios
jest.mock('axios');
import axios from 'axios';

describe('Servicio de Candidatos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadCV', () => {
    test('debería cargar correctamente un archivo CV', async () => {
      // Datos de ejemplo
      const mockFile = new File(['contenido de prueba'], 'test-cv.pdf', { type: 'application/pdf' });
      const mockResponse = {
        data: {
          filePath: 'uploads/123456789-test-cv.pdf',
          fileType: 'application/pdf'
        }
      };

      // Configurar el mock de axios para simular una respuesta exitosa
      axios.post.mockResolvedValue(mockResponse);

      // Ejecutar la función
      const result = await uploadCV(mockFile);

      // Verificar que axios.post fue llamado con los parámetros correctos
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3010/upload',
        expect.any(FormData),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'multipart/form-data'
          })
        })
      );

      // Verificar el resultado
      expect(result).toEqual(mockResponse.data);
    });

    test('debería manejar errores durante la carga del CV', async () => {
      // Datos de ejemplo
      const mockFile = new File(['contenido de prueba'], 'test-cv.pdf', { type: 'application/pdf' });
      
      // Configurar el mock de axios para simular un error
      axios.post.mockRejectedValue({
        response: {
          data: 'Error al subir el archivo'
        }
      });

      // Verificar que se lanza un error
      await expect(uploadCV(mockFile)).rejects.toThrow('Error al subir el archivo');
    });
  });

  describe('sendCandidateData', () => {
    test('debería enviar correctamente los datos del candidato', async () => {
      // Datos de ejemplo
      const candidateData = {
        firstName: 'Ana',
        lastName: 'Martínez',
        email: 'ana.martinez@example.com',
        phone: '612345678',
        educations: [],
        workExperiences: [],
        cv: {
          filePath: 'uploads/123456789-test-cv.pdf',
          fileType: 'application/pdf'
        }
      };

      const mockResponse = {
        data: {
          id: 1,
          ...candidateData
        }
      };

      // Configurar el mock de axios para simular una respuesta exitosa
      axios.post.mockResolvedValue(mockResponse);

      // Ejecutar la función
      const result = await sendCandidateData(candidateData);

      // Verificar que axios.post fue llamado con los parámetros correctos
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3010/candidates',
        candidateData
      );

      // Verificar el resultado
      expect(result).toEqual(mockResponse.data);
    });

    test('debería manejar errores al enviar datos del candidato', async () => {
      // Datos de ejemplo (con email inválido)
      const candidateData = {
        firstName: 'Ana',
        lastName: 'Martínez',
        email: 'email-invalido',
        phone: '612345678'
      };

      // Configurar el mock de axios para simular un error
      axios.post.mockRejectedValue({
        response: {
          data: 'Error al enviar datos: Email inválido'
        }
      });

      // Verificar que se lanza un error
      await expect(sendCandidateData(candidateData)).rejects.toThrow('Error al enviar datos del candidato');
    });
  });
}); 