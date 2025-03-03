const mockPrismaClient = {
  candidate: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
  education: {
    create: jest.fn(),
  },
  workExperience: {
    create: jest.fn(),
  },
  resume: {
    create: jest.fn(),
  },
} as const;

export default mockPrismaClient; 