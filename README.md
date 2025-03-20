# DriveForm - Google Drive & Form Clone

A full-stack application that clones basic functionalities of Google Drive and Google Forms using modern web technologies.

## Tech Stack

- **Backend**: NestJS with TypeScript
- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Database**: PostgreSQL
- **Storage**: MinIO (S3-compatible object storage)
- **Container**: Docker

## Prerequisites

- Node.js (LTS version)
- Docker and Docker Compose
- npm (comes with Node.js)

## Getting Started

1. **Start the Infrastructure Services**
   ```bash
   cd docker
   docker-compose up -d
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the Applications**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - MinIO Console: http://localhost:9001
   - MinIO API: http://localhost:9000

## Features

- File upload and management (Drive)
- Form creation and response collection
- Real-time notifications
- File sharing capabilities
- User authentication

## Project Structure

```
project-root/
│── backend/                 # NestJS backend
│── frontend/                # Next.js frontend
│── docker/                  # Docker configurations
│── database/                # Database migrations
│── docs/                    # Documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 