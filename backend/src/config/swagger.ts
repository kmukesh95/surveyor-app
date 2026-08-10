import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Household Survey & Ration Card Management System API',
      version: '1.0.0',
      description:
        'Production-Ready RESTful API for Household Surveys, Beneficiary Registrations, Document Verification, Zonal User Location Assignment, and Admin Approval Workflows.',
      contact: {
        name: 'API Support Team',
        email: 'support@surveyor-app.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development Server (v1)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token in the format: Bearer <token>',
        },
      },
      schemas: {
        StandardResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation completed successfully.' },
            data: { type: 'object' },
            timestamp: { type: 'string', example: '2026-08-09T00:00:00.000Z' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'An error occurred processing your request.' },
            errors: { type: 'array', items: { type: 'string' } },
            timestamp: { type: 'string', example: '2026-08-09T00:00:00.000Z' },
          },
        },
        DirectRegisterInput: {
          type: 'object',
          required: ['firstName', 'lastName', 'mobile', 'gender', 'password'],
          properties: {
            firstName: { type: 'string', example: 'Ramesh' },
            middleName: { type: 'string', example: 'Kumar' },
            lastName: { type: 'string', example: 'Sharma' },
            email: { type: 'string', example: 'ramesh@example.com' },
            mobile: { type: 'string', example: '9876543210' },
            gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'], example: 'MALE' },
            password: { type: 'string', example: 'Password@123' },
            dob: { type: 'string', example: '1990-05-15' },
          },
        },
        SurveyorRegisterInput: {
          type: 'object',
          required: ['firstName', 'lastName', 'fatherName', 'motherName', 'mobile', 'gender', 'password'],
          properties: {
            firstName: { type: 'string', example: 'Sunil' },
            middleName: { type: 'string', example: 'Kumar' },
            lastName: { type: 'string', example: 'Verma' },
            fatherName: { type: 'string', example: 'Ram Verma' },
            motherName: { type: 'string', example: 'Sita Verma' },
            spouseName: { type: 'string', example: 'Anita Verma' },
            email: { type: 'string', example: 'sunil@example.com' },
            mobile: { type: 'string', example: '9812345678' },
            gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'], example: 'MALE' },
            password: { type: 'string', example: 'Password@123' },
            dob: { type: 'string', example: '1988-03-20' },
            houseNumber: { type: 'string', example: 'H.No. 101' },
            buildingName: { type: 'string', example: 'Ganga Enclave' },
            streetLandmark: { type: 'string', example: 'Near Metro Station' },
            stateId: { type: 'integer', example: 1 },
            districtId: { type: 'integer', example: 1 },
            blockId: { type: 'integer', example: 1 },
            pincode: { type: 'string', example: '110001' },
            socialCategoryId: { type: 'string', example: 'uuid-string' },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['identifier', 'password'],
          properties: {
            identifier: { type: 'string', example: '9876543210' },
            password: { type: 'string', example: 'Password@123' },
          },
        },
        Verify2FAInput: {
          type: 'object',
          required: ['tfaCode'],
          properties: {
            tfaCode: { type: 'string', example: '123456' },
          },
        },
        UpdateProfileInput: {
          type: 'object',
          properties: {
            fatherName: { type: 'string', example: 'Suresh Sharma' },
            motherName: { type: 'string', example: 'Sunita Sharma' },
            spouseName: { type: 'string', example: 'Pooja Sharma' },
            dob: { type: 'string', example: '1990-05-15' },
            socialCategoryId: { type: 'string', example: 'uuid-string' },
          },
        },
        UpdateAddressInput: {
          type: 'object',
          properties: {
            houseNumber: { type: 'string', example: 'Flat 302' },
            buildingName: { type: 'string', example: 'Apex Tower' },
            streetLandmark: { type: 'string', example: 'Main Road' },
            stateId: { type: 'integer', example: 1 },
            districtId: { type: 'integer', example: 1 },
            blockId: { type: 'integer', example: 1 },
            pincode: { type: 'string', example: '110001' },
          },
        },
        AddFamilyMemberInput: {
          type: 'object',
          required: ['firstName', 'lastName', 'relationId', 'gender'],
          properties: {
            firstName: { type: 'string', example: 'Pooja' },
            middleName: { type: 'string', example: '' },
            lastName: { type: 'string', example: 'Sharma' },
            relationId: { type: 'string', example: 'uuid-string' },
            gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'], example: 'FEMALE' },
            dob: { type: 'string', example: '1992-08-22' },
            age: { type: 'integer', example: 32 },
            idProofNumber: { type: 'string', example: '123456789012' },
            occupation: { type: 'string', example: 'Teacher' },
          },
        },
        AssignUserLocationInput: {
          type: 'object',
          required: ['userId', 'stateId'],
          properties: {
            userId: { type: 'string', example: 'uuid-user-id' },
            stateId: { type: 'integer', example: 1 },
            districtId: { type: 'integer', example: 1 },
            blockId: { type: 'integer', example: 1 },
          },
        },
        RejectApplicationInput: {
          type: 'object',
          required: ['rejectionReason'],
          properties: {
            rejectionReason: { type: 'string', example: 'Profile photo is not clear. Please re-upload.' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/v1/routes/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
