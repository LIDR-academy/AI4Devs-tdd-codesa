import { addCandidate } from '../src/application/services/candidateService';
import mockPrismaClient from './mocks/prisma.mock';
import path from 'path';
import { jest } from '@jest/globals';

// Define interfaces for our mocks
interface CandidateData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  educations?: Array<any>;
  workExperiences?: Array<any>;
  cv?: {
    filePath: string;
    fileType: string;
  };
}

interface PrismaCandidateResult {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface MockCandidateInstance {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  education: any[];
  workExperience: any[];
  resumes: any[];
  save: () => Promise<PrismaCandidateResult>;
}

// Mock the models
jest.mock('../src/domain/models/Candidate', () => {
  return {
    Candidate: jest.fn()
  };
});
jest.mock('../src/domain/models/Education');
jest.mock('../src/domain/models/WorkExperience');
jest.mock('../src/domain/models/Resume');

describe('CandidateService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addCandidate', () => {
    const cvPath = path.resolve(__dirname, './resources/cv_prueba.pdf');
    const validCandidateData: CandidateData = {
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

    it('should successfully add a candidate with all related data', async () => {
      const mockPrismaResult: PrismaCandidateResult = {
        id: 1,
        firstName: validCandidateData.firstName,
        lastName: validCandidateData.lastName,
        email: validCandidateData.email,
        phone: validCandidateData.phone,
        address: validCandidateData.address,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockSave = jest.fn().mockResolvedValue(mockPrismaResult);

      // Setup mock implementations
      const { Candidate } = jest.requireMock('../src/domain/models/Candidate');
      Candidate.mockImplementation(function(this: MockCandidateInstance, data: CandidateData) {
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.email = data.email;
        this.phone = data.phone;
        this.address = data.address;
        this.education = [];
        this.workExperience = [];
        this.resumes = [];
        this.save = mockSave;
      });

      const result = await addCandidate(validCandidateData);
      expect(result).toEqual(mockPrismaResult);
      expect(mockSave).toHaveBeenCalled();
    });

    it('should throw error when validation fails', async () => {
      const invalidData = {
        ...validCandidateData,
        email: 'invalid-email'
      };

      await expect(addCandidate(invalidData)).rejects.toThrow('Invalid email');
    });

    it('should throw error when email already exists', async () => {
      const mockSave = jest.fn().mockRejectedValue({ code: 'P2002' });

      const { Candidate } = jest.requireMock('../src/domain/models/Candidate');
      Candidate.mockImplementation(function(this: MockCandidateInstance, data: CandidateData) {
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.email = data.email;
        this.phone = data.phone;
        this.address = data.address;
        this.education = [];
        this.workExperience = [];
        this.resumes = [];
        this.save = mockSave;
      });

      await expect(addCandidate(validCandidateData))
        .rejects
        .toThrow('The email already exists in the database');
    });

    it('should handle database errors gracefully', async () => {
      const mockSave = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      const { Candidate } = jest.requireMock('../src/domain/models/Candidate');
      Candidate.mockImplementation(function(this: MockCandidateInstance, data: CandidateData) {
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.email = data.email;
        this.phone = data.phone;
        this.address = data.address;
        this.education = [];
        this.workExperience = [];
        this.resumes = [];
        this.save = mockSave;
      });

      await expect(addCandidate(validCandidateData))
        .rejects
        .toThrow('Database connection failed');
    });
  });
});