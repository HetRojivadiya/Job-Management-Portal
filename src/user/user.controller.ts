import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UnauthorizedException,
  SetMetadata,
  Delete,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { RequestWithUser } from 'src/auth/request-with-user.interface';
import { ERROR_MESSAGES } from './constants/errors.constatns';
import { AddUserSkillsDto } from './dto/add-user-skills.dto';
import { ApiResponse } from './api-response/api-response.interface';
import { UserRoleGuard } from 'guards/user-type.guard';
import { AuthConfig } from 'src/job/constants/auth.config';
import {
  ApiBody,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
} from '@nestjs/swagger';
import { SwaggerConstants } from './constants/swagger.constants';
import { UserRoutes } from './constants/route.constants';
import { UserMessages } from './constants/message.constants';
import { Skills } from './api-response/skills.interface';
import { UserProfileResponse } from './api-response/user-profile.interface';

@Controller(UserRoutes.BASE)
@UseGuards(JwtAuthGuard, UserRoleGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: SwaggerConstants.AddSkills.summary })
  @ApiBody({
    type: AddUserSkillsDto,
    isArray: true,
  })
  @SwaggerApiResponse(SwaggerConstants.AddSkills.response.success)
  @SwaggerApiResponse(SwaggerConstants.AddSkills.response.failure)
  @SetMetadata(AuthConfig.REQUIRED_ROLE, AuthConfig.CANDIDATE)
  @Post(UserRoutes.ADD_SKILLS)
  async addUserSkills(
    @Body() addUserSkillsDto: AddUserSkillsDto[],
    @Req() req: RequestWithUser,
  ): Promise<ApiResponse<void>> {
    try {
      await this.userService.addUserSkills(req.user.id, addUserSkillsDto);
      return { statusCode: 200, message: UserMessages.SKILLS_ADDED_SUCCESS };
    } catch {
      throw new UnauthorizedException(ERROR_MESSAGES.SKILL_ADD_ERROR);
    }
  }

  @ApiOperation({ summary: SwaggerConstants.GetSkills.summary })
  @SwaggerApiResponse(SwaggerConstants.GetSkills.response.success)
  @SwaggerApiResponse(SwaggerConstants.GetSkills.response.failure)
  @Get(UserRoutes.GET_SKILLS)
  async getAllUserSkills(
    @Req() req: RequestWithUser,
  ): Promise<ApiResponse<Skills[]>> {
    try {
      const skills = await this.userService.getUserSkills(req.user.id);
      return {
        statusCode: 200,
        message: UserMessages.SKILLS_RETRIEVED_SUCCESS,
        data: skills,
      };
    } catch {
      throw new UnauthorizedException(ERROR_MESSAGES.SKILL_RETRIEVAL_ERROR);
    }
  }

  @ApiOperation({ summary: SwaggerConstants.GetSkills.summary })
  @ApiBody({
    type: [String],
  })
  @SwaggerApiResponse(SwaggerConstants.DeleteSkills.response.success)
  @SwaggerApiResponse(SwaggerConstants.DeleteSkills.response.failure)
  @SetMetadata(AuthConfig.REQUIRED_ROLE, AuthConfig.CANDIDATE)
  @Delete(UserRoutes.DELETE_SKILLS)
  async deleteUserSkills(
    @Body() { userSkillIds }: { userSkillIds: string[] },
  ): Promise<ApiResponse<void>> {
    try {
      await this.userService.deleteUserSkills(userSkillIds);
      return {
        statusCode: 200,
        message: UserMessages.SKILLS_DELETED_SUCCESS,
      };
    } catch {
      throw new NotFoundException(ERROR_MESSAGES.SKILL_DELETE_ERROR);
    }
  }

  @ApiOperation({ summary: SwaggerConstants.GetUserProfile.summary })
  @SwaggerApiResponse(SwaggerConstants.GetUserProfile.response.success)
  @SwaggerApiResponse(SwaggerConstants.GetUserProfile.response.failure)
  @Get(UserRoutes.GET_USER_PROFILE + '/:userId')
  async getUserProfile(
    @Param('userId') userId: string,
  ): Promise<ApiResponse<UserProfileResponse>> {
    try {
      const userProfile = await this.userService.getUserProfile(userId);
      return {
        statusCode: 200,
        message: UserMessages.USER_PROFILE_RETRIEVED_SUCCESS,
        data: userProfile,
      };
    } catch {
      throw new UnauthorizedException(
        ERROR_MESSAGES.USER_PROFILE_RETRIEVAL_ERROR,
      );
    }
  }

  // @ApiOperation({ summary: SwaggerConstants.GetAllUserProfiles.summary })
  // @SwaggerApiResponse(SwaggerConstants.GetAllUserProfiles.response.success)
  // @SwaggerApiResponse(SwaggerConstants.GetAllUserProfiles.response.failure)
  @Get(UserRoutes.GET_ALL_USERS) // Define the new route
  async getAllUserProfiles(): Promise<ApiResponse<UserProfileResponse[]>> {
    try {
      const userProfiles = await this.userService.getAllUserProfiles();
      return {
        statusCode: 200,
        message: UserMessages.ALL_USER_PROFILES_RETRIEVED_SUCCESS,
        data: userProfiles,
      };
    } catch (error) {
      console.error('Error fetching all user profiles:', error);
      throw new UnauthorizedException(
        ERROR_MESSAGES.ALL_USER_PROFILES_RETRIEVAL_ERROR,
      );
    }
  }
}
