export interface UserProfileResponse {
  userId: string;
  username: string;
  email: string;
  mobile: string;
  status: string;
  role: string;
  createdAt?: string | Date;
  skills: UserSkillResponse[];
  resume?: ResumeResponse;
}

export interface UserSkillResponse {
  userSkillId: string;
  skillName: string;
  proficiencyLevel: number;
}

export interface ResumeResponse {
  id: string;
  name: string;
  system_path: string;
  createdAt: Date;
  updatedAt: Date;
}


export interface UserResponse {
  userId: string;
  userProfile: UserProfileResponse;
}
