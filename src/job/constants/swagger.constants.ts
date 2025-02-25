export const SwaggerConstants = {
  CreateJob: {
    summary: 'Create a new job posting',
    bodyType: 'CreateJobDto',
    response: {
      success: {
        status: 201,
        description: 'Job created successfully',
        example: {
          statusCode: 201,
          message: 'Job created successfully',
          data: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Senior Software Engineer',
            description:
              'We are looking for an experienced software engineer...',
            location: 'New York, NY',
            salary: 120000,
            experience: '5+ years',
            createdAt: '2024-02-03T12:00:00Z',
            updatedAt: '2024-02-03T12:00:00Z',
            createdBy: '789e4567-e89b-12d3-a456-426614174111',
            isActive: true,
          },
        },
      },
      failure: {
        status: 401,
        description: 'Unauthorized or failed to create job',
        example: {
          statusCode: 401,
          message: 'Failed to create job',
          error: 'Unauthorized',
        },
      },
    },
  },
  UpdateJob: {
    summary: 'Update an existing job posting',
    bodyType: 'UpdateJobDto',
    params: [
      {
        name: 'id',
        type: 'string',
        description: 'Job ID',
      },
    ],
    response: {
      success: {
        status: 200,
        description: 'Job updated successfully',
        example: {
          statusCode: 200,
          message: 'Job updated successfully',
          data: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Senior Software Engineer (Updated)',
            description: 'Updated job description...',
            location: 'Remote',
            salary: 130000,
            experience: '5+ years',
            updatedAt: '2024-02-03T13:00:00Z',
            createdBy: '789e4567-e89b-12d3-a456-426614174111',
            isActive: true,
          },
        },
      },
      failure: {
        status: 401,
        description: 'Unauthorized or failed to update job',
        example: {
          statusCode: 401,
          message: 'Failed to update job',
          error: 'Unauthorized',
        },
      },
    },
  },
  DeleteJob: {
    summary: 'Delete a job posting',
    params: [
      {
        name: 'id',
        type: 'string',
        description: 'Job ID',
      },
    ],
    response: {
      success: {
        status: 200,
        description: 'Job deleted successfully',
        example: {
          statusCode: 200,
          message: 'Job deleted successfully',
        },
      },
      failure: {
        status: 401,
        description: 'Unauthorized or failed to delete job',
        example: {
          statusCode: 401,
          message: 'Failed to delete job',
          error: 'Unauthorized',
        },
      },
    },
  },
  GetAllJobs: {
    summary: 'Retrieve all job postings',
    response: {
      success: {
        status: 200,
        description: 'Successfully retrieved all jobs',
        example: {
          statusCode: 200,
          message: 'Jobs retrieved successfully',
          data: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              title: 'Senior Software Engineer',
              description:
                'We are looking for an experienced software engineer...',
              location: 'New York, NY',
              salary: 120000,
              experience: '5+ years',
              createdAt: '2024-02-03T12:00:00Z',
              updatedAt: '2024-02-03T12:00:00Z',
              isActive: true,
              skills: [
                {
                  id: '456e4567-e89b-12d3-a456-426614174000',
                  name: 'Node.js',
                  proficiencyLevel: 4,
                },
                {
                  id: '789e4567-e89b-12d3-a456-426614174000',
                  name: 'React',
                  proficiencyLevel: 4,
                },
              ],
            },
          ],
        },
      },
      failure: {
        status: 401,
        description: 'Failed to retrieve jobs',
        example: {
          statusCode: 401,
          message: 'Failed to retrieve jobs',
          error: 'Unauthorized',
        },
      },
    },
  },
  GetJobById: {
    summary: 'Retrieve a specific job posting by ID',
    params: [
      {
        name: 'id',
        type: 'string',
        description: 'Job ID',
      },
    ],
    response: {
      success: {
        status: 200,
        description: 'Successfully retrieved job',
        example: {
          statusCode: 200,
          message: 'Job retrieved successfully',
          data: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Senior Software Engineer',
            description:
              'We are looking for an experienced software engineer...',
            location: 'New York, NY',
            salary: 120000,
            experience: '5+ years',
            createdAt: '2024-02-03T12:00:00Z',
            updatedAt: '2024-02-03T12:00:00Z',
            isActive: true,
            skills: [
              {
                id: '456e4567-e89b-12d3-a456-426614174000',
                name: 'Node.js',
                proficiencyLevel: 4,
              },
              {
                id: '789e4567-e89b-12d3-a456-426614174000',
                name: 'React',
                proficiencyLevel: 4,
              },
            ],
          },
        },
      },
      failure: {
        status: 404,
        description: 'Job not found',
        example: {
          statusCode: 404,
          message: 'Job not found',
          error: 'Not Found',
        },
      },
    },
  },
};
