import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Request,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, Project } from '../../entities/project.entity';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';
import { User } from '../../entities/user.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createProject(createProjectDto: CreateProjectDto) {
    const category = await this.categoryRepository.findOne({
      where: { name: createProjectDto.category },
    });
    const existing = await this.projectRepository.findOne({
      where: { projectCode: createProjectDto.projectCode },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    if (existing) {
      throw new Error('Project already exists');
    }

    const project = this.projectRepository.create({
      ...createProjectDto,
      category,
    });

    return await this.projectRepository.save(project);
  }

  async getAllProjects(userId: string) {
    return this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.phases', 'phase')
      .leftJoinAndSelect('project.category', 'category')
      .leftJoinAndSelect('project.creator', 'creator')
      .leftJoinAndSelect('project.sharedWithUsers', 'sharedUser')
      .where('creator.uid = :userId', { userId })
      .orWhere('sharedUser.uid = :userId', { userId })
      .getMany();
  }

  async getProjectById(id: string) {
    const project = this.projectRepository.findOne({
      where: { id },
      relations: ['phases'],
    });
    return project;
    //return this.projectRepository.findOne({ where: { id }, relations: ['phases'] });
  }

  async updateProject(id: string, updateProjectDto: UpdateProjectDto) {
    const project = await this.getProjectById(id);
    if (!project) throw new NotFoundException('Project not found');

    Object.assign(project, updateProjectDto);
    return this.projectRepository.save(project);
  }

  async deleteProject(id: string) {
    const project = await this.getProjectById(id);
    if (!project) throw new NotFoundException('Project not found');

    await this.projectRepository.remove(project);
    return { success: true, message: 'Project deleted successfully' };
  }

  async addCategory(
    name: string,
    project_code: string,
    isAdmin: boolean,
  ): Promise<Category> {
    // Check if the user is admin
    if (!isAdmin) {
      throw new ForbiddenException('Only admin can add categories');
    }

    // Check if the category already exists
    const existingCategory = await this.categoryRepository.findOne({
      where: { project_code },
    });

    if (existingCategory) {
      throw new ConflictException('Category already exists');
    }

    // Create and save the new category
    const newCategory = this.categoryRepository.create({
      name,
      project_code, // Include project_code
    });

    return await this.categoryRepository.save(newCategory);
  }

  async getCategory() {
    return this.categoryRepository.find();
  }

  async addUserToProject(projectId: string, email: any, userId: string) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['sharedWithUsers', 'creator'],
    });
    if (project?.creator.uid !== userId) {
      throw new ConflictException('Người dùng không có quyền chia sẻ');
    }

    if (!project) throw new NotFoundException('Project not found');
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.email')
      .where('user.email = :email', { email: email })
      .getOne();
    if (!user || !user.email) throw new NotFoundException('User not found');

    // Check nếu đã tồn tại thì khỏi thêm
    if (project.sharedWithUsers.some((u) => u.uid === user.uid)) {
      return project;
    }

    project.sharedWithUsers.push(user);
    return this.projectRepository.save(project);
  }
}
