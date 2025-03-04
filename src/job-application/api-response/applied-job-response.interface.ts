export interface JobSkill {
    id: string;
    skillName: string;
  }
  
  export interface AppliedJob {
    applicationId?: string;
    appliedAt?: string | Date;
    id?: string;
    title?: string;
    description?: string;
    experience_level?: number;
    salary_range?: number;
    location?: string;
    postedBy?: string;
    deadline?: string | Date;
    createdAt?: string | Date;
    updatedAt?: string | Date;
    skills?: JobSkill[];
    status: string;
    rejectionMessage? :string;
  }
  