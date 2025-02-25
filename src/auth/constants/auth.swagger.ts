export const SwaggerConstants = {
  Signup: {
    summary: 'Sign up a new user',
    bodyType: 'SignupDto',
    response: {
      status: 201,
      description:
        'Signup successful, please check your email for verification.',
      example: {
        statusCode: 201,
        message: 'Signup successful, please check your email for verification.',
        data: {
          data: {
            status: 'Unauthorized',
            twoFactorEnabled: false,
            id: '795d97c7-8da4-4c0e-bb2c-8e54a5689a10',
            username: 'het123',
            password: 'hashed-password',
            email: 'het3@gmail.com',
            mobile: '1234567890',
            roleId: '06cf5958-6fb1-451b-9e9a-1d7cb1e007f5',
            updatedAt: '2025-01-30T08:36:14.904Z',
            createdAt: '2025-01-30T08:36:14.904Z',
            twoFactorSecret: null,
          },
          token: 'jwt-token',
        },
      },
    },
  },
  Verify: {
    summary: 'Verify the user with a token',
    param: {
      name: 'token',
      required: true,
      description: 'The token to verify the user',
      type: String,
    },
    response: {
      success: {
        status: 200,
        description: 'User verification successful',
        example: {
          message: 'OTP verified successfully',
        },
      },
      failure: {
        status: 400,
        description: 'Invalid token or verification failed',
        example: {
          message: 'User verification failed: <error-message>',
        },
      },
    },
  },
  Login: {
    summary: 'Login a user',
    bodyType: 'LoginDto',
    response: {
      success: {
        status: 200,
        description: 'Login successful, returns access token',
        example: {
          statusCode: 200,
          message: 'Login successful',
          data: {
            token: 'jwt-token',
          },
        },
      },
      failure: {
        status: 401,
        description: 'Invalid credentials or token generation failed',
        example: {
          message: 'Invalid credentials',
          error: 'Unauthorized',
          statusCode: 401,
        },
      },
    },
  },
  VerifyOtp: {
    summary: 'Verify OTP for user authentication',
    bodyDescription: 'Body to verify OTP with a token',
    response: {
      success: {
        status: 200,
        description: 'OTP verified successfully.',
        example: {
          statusCode: 200,
          message: 'Otp Verified Successfully',
          data: 'jwt-token',
        },
      },
      failure: {
        status: 401,
        description: 'Invalid two-factor authentication token.',
        example: {
          statusCode: 401,
          message: 'Invalid two-factor authentication token',
          error: 'Unauthorized',
        },
      },
    },
  },
  EnableTwoFactor: {
    summary: 'Enable two-factor authentication for a user',
    response: {
      success: {
        status: 200,
        description: 'Two-factor authentication setup successful',
        example: {
          message: 'Two-factor authentication setup successful',
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANS...==',
        },
      },
      failure: {
        status: 401,
        description: 'Unauthorized or Invalid token',
        example: {
          message: 'Unauthorized',
          error: 'Unauthorized',
          statusCode: 401,
        },
      },
    },
  },
  ForgotPassword: {
    summary: "Send password reset link to the user's email",
    bodyDescription:
      'The email of the user who requested the password reset link',
    response: {
      success: {
        status: 200,
        description: 'Password reset link sent successfully',
        example: {
          statusCode: 200,
          message: 'Password reset link sent successfully',
        },
      },
      failure: {
        status: 400,
        description: 'Invalid email or user not found',
        example: {
          statusCode: 400,
          message: 'Invalid email or user not found',
          error: 'Bad Request',
        },
      },
    },
  },
  ResetPassword: {
    summary: 'Reset user password',
    bodyDescription: 'The new password to update for the user',
    response: {
      success: {
        status: 200,
        description: 'Password updated successfully',
        example: {
          statusCode: 200,
          message: 'Password updated successfully',
        },
      },
      failure: {
        status: 401,
        description: 'Unauthorized - Invalid token or user not authorized',
        example: {
          statusCode: 401,
          message: 'User unauthorized',
        },
      },
    },
  },
  DisableTwoFactor: {
    summary: 'Disable two-factor authentication for a user',
    response: {
      success: {
        status: 200,
        description: 'Two-factor authentication disabled successfully',
        example: {
          statusCode: 200,
          message: 'Two-factor authentication disabled successfully',
          data: {
            id: '795d97c7-8da4-4c0e-bb2c-8e54a5689a10',
            username: 'het123',
            email: 'het3@gmail.com',
            mobile: '1234567890',
            twoFactorEnabled: false,
            updatedAt: '2025-02-22T08:36:14.904Z',
          },
        },
      },
      failure: {
        status: 400,
        description: 'Disabling two-factor authentication failed',
        example: {
          statusCode: 400,
          message: 'Failed to disable two-factor authentication',
          error: 'Bad Request',
        },
      },
      unauthorized: {
        status: 401,
        description: 'Unauthorized - Invalid token or user not authorized',
        example: {
          statusCode: 401,
          message: 'User unauthorized',
          error: 'Unauthorized',
        },
      },
    },
  },
  
};
