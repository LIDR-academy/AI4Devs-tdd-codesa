import { validateCandidateData } from '../src/application/validator';
import path from 'path';

describe('Validator', () => {
  describe('validateCandidateData', () => {
    const cvPath = path.resolve(__dirname, './resources/cv_prueba.pdf');
    const validCandidate = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '612345678',
      address: 'Calle Principal 123',
      educations: [
        {
          institution: 'Universidad Example',
          title: 'Computer Science',
          startDate: '2018-01-01',
          endDate: '2022-12-31'
        }
      ],
      workExperiences: [
        {
          company: 'Tech Corp',
          position: 'Software Developer',
          description: 'Development of web applications',
          startDate: '2022-01-01',
          endDate: '2023-12-31'
        }
      ],
      cv: {
        filePath: cvPath,
        fileType: 'application/pdf'
      }
    };

    it('should validate a correct candidate without throwing errors', () => {
      expect(() => validateCandidateData(validCandidate)).not.toThrow();
    });

    describe('Name validation', () => {
      it('should throw error for invalid firstName', () => {
        const invalidCandidate = { ...validCandidate, firstName: '123' };
        expect(() => validateCandidateData(invalidCandidate)).toThrow('Invalid name');
      });

      it('should throw error for invalid lastName', () => {
        const invalidCandidate = { ...validCandidate, lastName: '' };
        expect(() => validateCandidateData(invalidCandidate)).toThrow('Invalid name');
      });

      it('should throw error for too long name', () => {
        const invalidCandidate = { 
          ...validCandidate, 
          firstName: 'a'.repeat(101)
        };
        expect(() => validateCandidateData(invalidCandidate)).toThrow('Invalid name');
      });
    });

    describe('Email validation', () => {
      it('should throw error for invalid email format', () => {
        const invalidCandidate = { ...validCandidate, email: 'invalid-email' };
        expect(() => validateCandidateData(invalidCandidate)).toThrow('Invalid email');
      });

      it('should throw error for empty email', () => {
        const invalidCandidate = { ...validCandidate, email: '' };
        expect(() => validateCandidateData(invalidCandidate)).toThrow('Invalid email');
      });
    });

    describe('Phone validation', () => {
      it('should throw error for invalid phone format', () => {
        const invalidCandidate = { ...validCandidate, phone: '12345678' };
        expect(() => validateCandidateData(invalidCandidate)).toThrow('Invalid phone');
      });

      it('should accept valid phone numbers starting with 6, 7, or 9', () => {
        const validPhones = ['612345678', '712345678', '912345678'];
        validPhones.forEach(phone => {
          expect(() => validateCandidateData({ ...validCandidate, phone })).not.toThrow();
        });
      });
    });

    describe('Education validation', () => {
      it('should throw error for invalid education institution', () => {
        const invalidCandidate = {
          ...validCandidate,
          educations: [{
            ...validCandidate.educations[0],
            institution: ''
          }]
        };
        expect(() => validateCandidateData(invalidCandidate)).toThrow('Invalid institution');
      });

      it('should throw error for invalid education dates', () => {
        const invalidCandidate = {
          ...validCandidate,
          educations: [{
            ...validCandidate.educations[0],
            startDate: '2018/01/01'
          }]
        };
        expect(() => validateCandidateData(invalidCandidate)).toThrow('Invalid date');
      });
    });

    describe('Work Experience validation', () => {
      it('should throw error for invalid company name', () => {
        const invalidCandidate = {
          ...validCandidate,
          workExperiences: [{
            ...validCandidate.workExperiences[0],
            company: ''
          }]
        };
        expect(() => validateCandidateData(invalidCandidate)).toThrow('Invalid company');
      });

      it('should throw error for too long description', () => {
        const invalidCandidate = {
          ...validCandidate,
          workExperiences: [{
            ...validCandidate.workExperiences[0],
            description: 'a'.repeat(201)
          }]
        };
        expect(() => validateCandidateData(invalidCandidate)).toThrow('Invalid description');
      });
    });

    describe('CV validation', () => {
      it('should throw error for invalid CV data', () => {
        const invalidCandidate = {
          ...validCandidate,
          cv: { filePath: null }
        };
        expect(() => validateCandidateData(invalidCandidate)).toThrow('Invalid CV data');
      });

      it('should validate CV with correct file path', () => {
        expect(() => validateCandidateData(validCandidate)).not.toThrow();
      });
    });

    describe('Existing candidate validation', () => {
      it('should skip validation for existing candidate with id', () => {
        const existingCandidate = {
          id: 1,
          firstName: '123', // Invalid name but should pass because it's an existing candidate
        };
        expect(() => validateCandidateData(existingCandidate)).not.toThrow();
      });
    });
  });
}); 