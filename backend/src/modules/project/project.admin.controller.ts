import {
  Controller,
  Post,
  Param,
  Body,
  Request,
  Get,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('admin/projects')
@UseGuards(AuthGuard)
export class ProjectAdminController {
  constructor(private readonly projectService: ProjectService) {}

  @Get('category')
  async getCategory() {
    return this.projectService.getCategory();
  }

  @Post('category')
  async addCategory(
    @Body() body: any, // Get the entire body
    @Request() req,
  ) {
    const { category, project_code, isAdmin } = body;

    // Check if the user is authenticated
    if (!req.user) {
      throw new ForbiddenException('Unauthorized');
    }

    // Check if the user has admin privileges
    if (!isAdmin) {
      throw new ForbiddenException('Only admin can add categories');
    }

    // Pass category and project_code to the service
    return this.projectService.addCategory(category, project_code, isAdmin);
  }
}
