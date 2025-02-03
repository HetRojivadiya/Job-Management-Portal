export const SwaggerConstants = {
  GetResume: {
    summary: 'Retrieve user resume',
    response: {
      success: {
        status: 200,
        description: 'Successfully retrieved resume',
        example: {
          statusCode: 200,
          message: 'Resume retrieved successfully',
          data: {
            resumeId: '123e4567-e89b-12d3-a456-426614174000',
            fileName: 'john-doe-resume.pdf',
            fileUrl: 'https://storage.example.com/resumes/john-doe-resume.pdf',
            uploadDate: '2024-02-03T12:00:00Z',
            fileSize: 1048576, // size in bytes
            mimeType: 'application/pdf',
          },
        },
      },
      failure: {
        status: 401,
        description: 'Unauthorized or resume not found',
        example: {
          statusCode: 401,
          message: 'Failed to retrieve resume',
          error: 'Unauthorized',
        },
      },
    },
  },
  UploadResume: {
    summary: 'Upload a new resume',
    bodyType: 'multipart/form-data',
    response: {
      success: {
        status: 201,
        description: 'Resume uploaded successfully',
        example: {
          statusCode: 201,
          message: 'Resume uploaded successfully',
          data: {
            resumeId: '123e4567-e89b-12d3-a456-426614174000',
            fileName: 'john-doe-resume.pdf',
            fileUrl: 'https://storage.example.com/resumes/john-doe-resume.pdf',
            uploadDate: '2024-02-03T12:00:00Z',
            fileSize: 1048576,
            mimeType: 'application/pdf',
          },
        },
      },
      failure: {
        status: 400,
        description: 'Invalid file format or upload failed',
        example: {
          statusCode: 400,
          message: 'Resume upload failed',
          error: 'Invalid file format. Supported formats: PDF, DOC, DOCX',
        },
      },
    },
  },
  DeleteResume: {
    summary: 'Delete user resume',
    response: {
      success: {
        status: 200,
        description: 'Resume deleted successfully',
        example: {
          statusCode: 200,
          message: 'Resume deleted successfully',
        },
      },
      failure: {
        status: 404,
        description: 'Resume not found or delete failed',
        example: {
          statusCode: 404,
          message: 'Failed to delete resume',
          error: 'Resume not found',
        },
      },
    },
  },
  UpdateResume: {
    summary: 'Update existing resume',
    bodyType: 'multipart/form-data',
    response: {
      success: {
        status: 200,
        description: 'Resume updated successfully',
        example: {
          statusCode: 200,
          message: 'Resume updated successfully',
          data: {
            resumeId: '123e4567-e89b-12d3-a456-426614174000',
            fileName: 'john-doe-resume-updated.pdf',
            fileUrl:
              'https://storage.example.com/resumes/john-doe-resume-updated.pdf',
            uploadDate: '2024-02-03T13:00:00Z',
            fileSize: 1048576,
            mimeType: 'application/pdf',
          },
        },
      },
      failure: {
        status: 400,
        description: 'Invalid file format or update failed',
        example: {
          statusCode: 400,
          message: 'Resume update failed',
          error: 'Invalid file format or no existing resume found',
        },
      },
    },
  },
};
