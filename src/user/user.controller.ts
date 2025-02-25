import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  SetMetadata,
  Delete,
  Get,
  Param,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { RequestWithUser } from 'src/common/request-with-user.interface';
import { AddUserSkillsDto } from './dto/add-user-skills.dto';
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
import { Skills } from './response/skills.interface';
import { UserProfileResponse } from './response/user-profile.interface';
import { ApiResponse } from 'src/common/api.response';
import { AuthRoutes } from 'src/auth/constants/auth.routes';
@Controller(UserRoutes.BASE)
@UseGuards(JwtAuthGuard, UserRoleGuard)
export class UserController {

  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: SwaggerConstants.AddSkills.summary })
  @ApiBody({type: AddUserSkillsDto,isArray: true,})
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
      return { statusCode: HttpStatus.OK, message: UserMessages.SKILLS_ADDED_SUCCESS };
    } catch (error){
      throw error
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
        statusCode: HttpStatus.OK,
        message: UserMessages.SKILLS_RETRIEVED_SUCCESS,
        data: skills,
      };
    } catch (error){
      throw error;
    }
  }

  @ApiOperation({ summary: SwaggerConstants.GetSkills.summary })
  @ApiBody({type: [String],})
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
        statusCode: HttpStatus.OK,
        message: UserMessages.SKILLS_DELETED_SUCCESS,
      };
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: SwaggerConstants.GetUserProfile.summary })
  @SwaggerApiResponse(SwaggerConstants.GetUserProfile.response.success)
  @SwaggerApiResponse(SwaggerConstants.GetUserProfile.response.failure)
  @Get(UserRoutes.GET_USER_PROFILE)
  async getUserProfile(
    @Param(UserRoutes.USER_ID) userId: string,
  ): Promise<ApiResponse<UserProfileResponse>> {
    try {
      const userProfile = await this.userService.getUserProfile(userId);
      return {
        statusCode: HttpStatus.OK,
        message: UserMessages.USER_PROFILE_RETRIEVED_SUCCESS,
        data: userProfile,
      };
    } catch (error){
      throw error;
    }
  }

  @ApiOperation({ summary: SwaggerConstants.GetUserProfile.summary })
  @SwaggerApiResponse(SwaggerConstants.GetUserProfile.response.success)
  @SwaggerApiResponse(SwaggerConstants.GetUserProfile.response.failure)
  @Get(UserRoutes.GET_ALL_USERS) 
  async getAllUserProfiles(): Promise<ApiResponse<UserProfileResponse[]>> {
    try {
      const userProfiles = await this.userService.getAllUserProfiles();
      return {
        statusCode: HttpStatus.OK,
        message: UserMessages.ALL_USER_PROFILES_RETRIEVED_SUCCESS,
        data: userProfiles,
      };
    } catch (error) {
      throw error;
    }
  }
}
