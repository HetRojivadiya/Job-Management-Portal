export interface JobApplicant {
  applicationId: string;
  userId: string;
  username: string;
  email: string;
  appliedAt: Date;
  skills: {
    skillName: string;
    proficiencyLevel: number;
  }[];
  resumeUrl?: string;
}
