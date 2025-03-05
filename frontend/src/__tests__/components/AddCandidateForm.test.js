import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddCandidateForm from '../../components/AddCandidateForm';

// Mock del componente FileUploader
jest.mock('../../components/FileUploader', () => {
  return function MockFileUploader({ onUpload }) {
    return (
      <div data-testid="file-uploader">
        <button 
          onClick={() => onUpload({ 
            filePath: 'uploads/mock-cv.pdf', 
            fileType: 'application/pdf' 
          })}
        >
          Simular Carga
        </button>
      </div>
    );
  };
});

// Mock de fetch para las peticiones API
global.fetch = jest.fn();

describe('Componente AddCandidateForm', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('debería renderizar correctamente el formulario', () => {
    render(<AddCandidateForm />);
    
    // Verificar que los campos principales están presentes
    expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Apellido/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Teléfono/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Dirección/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/CV/i)).toBeInTheDocument();
    
    // Verificar que los botones para añadir secciones están presentes
    expect(screen.getByText(/Añadir Educación/i)).toBeInTheDocument();
    expect(screen.getByText(/Añadir Experiencia Laboral/i)).toBeInTheDocument();
    
    // Verificar que el botón de envío está presente
    expect(screen.getByText(/Enviar/i)).toBeInTheDocument();
  });

  test('debería permitir añadir campos de educación', async () => {
    render(<AddCandidateForm />);
    
    // Verificar que inicialmente no hay campos de educación
    expect(screen.queryByPlaceholderText(/Institución/i)).not.toBeInTheDocument();
    
    // Hacer clic en el botón para añadir educación
    fireEvent.click(screen.getByText(/Añadir Educación/i));
    
    // Verificar que se añadieron los campos de educación
    expect(screen.getByPlaceholderText(/Institución/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Título/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Fecha de Inicio/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Fecha de Fin/i)).toBeInTheDocument();
  });

  test('debería permitir añadir campos de experiencia laboral', async () => {
    render(<AddCandidateForm />);
    
    // Verificar que inicialmente no hay campos de experiencia
    expect(screen.queryByPlaceholderText(/Empresa/i)).not.toBeInTheDocument();
    
    // Hacer clic en el botón para añadir experiencia
    fireEvent.click(screen.getByText(/Añadir Experiencia Laboral/i));
    
    // Verificar que se añadieron los campos de experiencia
    expect(screen.getByPlaceholderText(/Empresa/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Puesto/i)).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/Fecha de Inicio/i).length).toBeGreaterThan(0);
    expect(screen.getAllByPlaceholderText(/Fecha de Fin/i).length).toBeGreaterThan(0);
  });

  test('debería manejar la carga de un CV', async () => {
    render(<AddCandidateForm />);
    
    // Simular la carga de un archivo
    fireEvent.click(screen.getByText(/Simular Carga/i));
    
    // Verificar que el CV se cargó correctamente
    expect(screen.getByText(/Archivo subido con éxito/i)).toBeInTheDocument();
  });

  test('debería enviar el formulario correctamente', async () => {
    // Mock de la respuesta de fetch
    fetch.mockResolvedValueOnce({
      status: 201,
      json: () => Promise.resolve({ 
        message: 'Candidato añadido con éxito',
        data: { id: 1 } 
      })
    });
    
    render(<AddCandidateForm />);
    
    // Rellenar el formulario
    await userEvent.type(screen.getByLabelText(/Nombre/i), 'Carlos');
    await userEvent.type(screen.getByLabelText(/Apellido/i), 'Gómez');
    await userEvent.type(screen.getByLabelText(/Correo Electrónico/i), 'carlos.gomez@example.com');
    await userEvent.type(screen.getByLabelText(/Teléfono/i), '678123456');
    await userEvent.type(screen.getByLabelText(/Dirección/i), 'Calle Principal 123');
    
    // Simular la carga de un CV
    fireEvent.click(screen.getByText(/Simular Carga/i));
    
    // Enviar el formulario
    fireEvent.click(screen.getByText(/Enviar/i));
    
    // Verificar que se llamó a fetch con los parámetros correctos
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3010/candidates',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: expect.any(String)
        })
      );
    });
    
    // Verificar que se muestra el mensaje de éxito
    await waitFor(() => {
      expect(screen.getByText(/Candidato añadido con éxito/i)).toBeInTheDocument();
    });
  });

  test('debería mostrar un error si el envío falla', async () => {
    // Mock de la respuesta de fetch con error
    fetch.mockResolvedValueOnce({
      status: 400,
      json: () => Promise.resolve({ 
        message: 'Datos inválidos: Email inválido' 
      })
    });
    
    render(<AddCandidateForm />);
    
    // Rellenar el formulario con datos inválidos
    await userEvent.type(screen.getByLabelText(/Nombre/i), 'Carlos');
    await userEvent.type(screen.getByLabelText(/Apellido/i), 'Gómez');
    await userEvent.type(screen.getByLabelText(/Correo Electrónico/i), 'email-invalido');
    
    // Enviar el formulario
    fireEvent.click(screen.getByText(/Enviar/i));
    
    // Verificar que se muestra el mensaje de error
    await waitFor(() => {
      expect(screen.getByText(/Error al añadir candidato/i)).toBeInTheDocument();
    });
  });
}); 