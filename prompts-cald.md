# Prompts Utilizados - CALD

## Prompt para crear tests unitarios para la inserción de candidatos

Necesito crear una suite de tests unitarios en Jest para probar la funcionalidad de inserción de candidatos en una aplicación de gestión de talento. 

El proyecto tiene las siguientes características:
- Backend en Express y TypeScript
- Base de datos PostgreSQL con Prisma como ORM
- Modelo de dominio con clases para Candidate, Education, WorkExperience y Resume
- Validación de datos en application/validator.ts
- Servicio para añadir candidatos en application/services/candidateService.ts

Necesito tests que cubran:
1. La validación de los datos del candidato (formatos correctos de nombre, email, teléfono, etc.)
2. El proceso de guardar un candidato en la base de datos con sus relaciones (educación, experiencia laboral, CV)
3. Casos de error como emails duplicados

Quiero usar mocks para evitar interactuar con la base de datos real durante las pruebas.

Los tests deben organizarse en descripciones lógicas usando describe() y deben incluir comentarios explicativos