export class CreateJobDto {
  title: string;
  description: string;
  experience_level: number;
  salary_range: number;
  location: string;
  postedBy: string;
  deadline: Date;
  skills: string[];
}

export class UpdateJobDto {
  title?: string;
  description?: string;
  experience_level?: number;
  salary_range?: number;
  location?: string;
  postedBy?: string;
  deadline?: Date;
  skills?: string[];
}

export class recommandedJob {
  userId: string;
}
