import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import {
  AddUserToProjectDto,
  CreateProjectDto,
  UpdateProjectDto,
} from './project.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('projects')
@UseGuards(AuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async createProject(@Body() createProjectDto: CreateProjectDto) {
    return this.projectService.createProject(createProjectDto);
  }

  @Get()
  async getAllProjects(@Request() request) {
    return this.projectService.getAllProjects(request.user.uid);
  }
  @Get("shared")
  async getProjectsShare(@Request() req) {
    return this.projectService.getProjectsShare(req.user)
  }

  @Get('category')
  async getCategory() {
    return this.projectService.getCategory();
  }

  @Get(':id/phases')
  async getProjectById(@Param('id') id: string) {
    const project = await this.projectService.getProjectById(id);
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }


  @Get(':id')
  async getProject(@Param('id') id: string) {
    return this.projectService.getProjectById(id);
  }

  @Patch(':id')
  async updateProject(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectService.updateProject(id, updateProjectDto);
  }

  @Post(':id/add')
  async addProject(
    @Param('id') id: string,
    @Body() addUserToProjectDto: AddUserToProjectDto,
    @Request() req,
  ) {
    return this.projectService.addUserToProject(
      id,
      addUserToProjectDto.email,
      req.user.uid,
    );
  }

  @Delete(':projectId/remove')
  async removeUserFromProject(
      @Param('projectId') projectId: string,
      @Body() user: string,
      @Request() req,
  ) {
    return this.projectService.deleteUserFromProject(
        projectId,
        user,
        req.user.uid,
    );
  }

  @Delete(':id')
  async deleteProject(@Param('id') id: string) {
    return this.projectService.deleteProject(id);
  }
}
