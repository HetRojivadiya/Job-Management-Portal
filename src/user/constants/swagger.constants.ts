export const SwaggerConstants = {
  AddSkills: {
    summary: 'Add skills to the user profile',
    bodyType: 'AddUserSkillsDto',
    response: {
      success: {
        status: 200,
        description: 'Skills added successfully',
        example: {
          statusCode: 200,
          message: 'Skills added successfully',
        },
      },
      failure: {
        status: 401,
        description: 'Unauthorized or failed to add skills',
        example: {
          statusCode: 401,
          message: 'Failed to add skills',
          error: 'Unauthorized',
        },
      },
    },
  },
  DeleteSkills: {
    summary: 'Delete user skills based on skill IDs',
    bodyType: 'Array of user-skill IDs',
    response: {
      success: {
        status: 200,
        description: 'Skills deleted successfully',
        example: {
          statusCode: 200,
          message: 'Skills deleted successfully',
        },
      },
      failure: {
        status: 400,
        description: 'Invalid request or failed to delete skills',
        example: {
          statusCode: 400,
          message: 'Failed to delete skills',
          error: 'Bad Request',
        },
      },
    },
  },
  GetSkills: {
    summary: 'Get all skills of the authenticated user',
    response: {
      success: {
        status: 200,
        description: 'Successfully retrieved skills',
        example: {
          statusCode: 200,
          message: 'Skills retrieved successfully',
          data: [
            {
              skillName: 'JavaScript',
              proficiencyLevel: 4,
            },
            {
              skillName: 'Python',
              proficiencyLevel: 5,
            },
          ],
        },
      },
      failure: {
        status: 401,
        description: 'Unauthorized or failed to retrieve skills',
        example: {
          statusCode: 401,
          message: 'Failed to retrieve skills',
          error: 'Unauthorized',
        },
      },
    },
  },
  GetUserProfile: {
    summary: 'Retrieve full user profile including role and skills',
    response: {
      success: {
        status: 200,
        description: 'Successfully retrieved user profile',
        example: {
          statusCode: 200,
          message: 'User profile retrieved successfully',
          data: {
            userId: '123e4567-e89b-12d3-a456-426614174000',
            username: 'JohnDoe',
            email: 'johndoe@example.com',
            mobile: '1234567890',
            status: 'Active',
            role: {
              roleId: '06cf5958-6fb1-451b-9e9a-1d7cb1e007f5',
              roleName: 'Candidate',
            },
            skills: [
              {
                userSkillId: '8266af64-5af6-49c3-a329-9f8ca497b15a',
                skillName: 'Java',
                proficiencyLevel: 5,
              },
              {
                userSkillId: 'f22ef585-6b66-452d-bad9-565dbd9f8b7d',
                skillName: 'DevOps',
                proficiencyLevel: 5,
              },
            ],
          },
        },
      },
      failure: {
        status: 401,
        description: 'Unauthorized or user not found',
        example: {
          statusCode: 401,
          message: 'User profile retrieval failed',
          error: 'Unauthorized',
        },
      },
    },
  },
};
