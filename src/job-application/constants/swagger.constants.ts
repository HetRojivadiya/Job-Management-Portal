export const SwaggerConstants = {
  ApplyJob: {
    summary: 'Apply for a Job',
    bodyType: 'ApplyJobDto',
    response: {
      success: {
        status: 201,
        description: 'Job application submitted successfully',
        example: {
          statusCode: 201,
          message: 'Job application submitted successfully',
        },
      },
      failure: {
        status: 400,
        description: 'User does not meet job skill requirements',
        example: {
          statusCode: 400,
          message: 'User does not meet job skill requirements',
          error: 'Bad Request',
        },
      },
      conflict: {
        status: 409,
        description: 'User has already applied for this job',
        example: {
          statusCode: 409,
          message: 'User has already applied for this job',
          error: 'Conflict',
        },
      },
      notFound: {
        status: 404,
        description: 'Job not found or no skills associated with the job',
        example: {
          statusCode: 404,
          message: 'Job not found or no skills associated with the job',
          error: 'Not Found',
        },
      },
    },
  },
  GetAppliedJobs: {
    summary: 'Get all applied jobs for the authenticated user',
    response: {
      success: {
        status: 200,
        description: 'Successfully retrieved applied jobs',
        example: {
          statusCode: 200,
          message: 'Applied jobs retrieved successfully',
          data: [
            {
              applicationId: '123e4567-e89b-12d3-a456-426614174000',
              appliedAt: '2025-02-02T10:00:00Z',
              jobId: 'f22ef585-6b66-452d-bad9-565dbd9f8b7d',
              jobTitle: 'Software Engineer',
              jobDescription: 'Job description here...',
              jobSkills: [
                { skillName: 'JavaScript', proficiencyLevel: 5 },
                { skillName: 'Node.js', proficiencyLevel: 4 },
              ],
            },
          ],
        },
      },
      failure: {
        status: 404,
        description: 'No job applications found for the user',
        example: {
          statusCode: 404,
          message: 'No applied jobs found for the given user',
          error: 'Not Found',
        },
      },
    },
  },
  DeleteAppliedJob: {
    summary: 'Delete a Job Application',
    bodyType: 'applicationId (string)',
    response: {
      success: {
        status: 200,
        description: 'Job application deleted successfully',
        example: {
          statusCode: 200,
          message: 'Job application deleted successfully',
        },
      },
      notFound: {
        status: 404,
        description: 'Job application not found',
        example: {
          statusCode: 404,
          message: 'Job application not found',
          error: 'Not Found',
        },
      },
      failure: {
        status: 400,
        description: 'Invalid application ID or user not authorized',
        example: {
          statusCode: 400,
          message: 'Invalid application ID or user not authorized',
          error: 'Bad Request',
        },
      },
    },
  },
  GetApplicationsByJobId: {
    summary: 'Get all job applications for a specific job',
    response: {
      success: {
        status: 200,
        description: 'Successfully retrieved job applications',
      },
      failure: {
        status: 404,
        description: 'No applications found for the provided job ID',
      },
    },
  },
};
