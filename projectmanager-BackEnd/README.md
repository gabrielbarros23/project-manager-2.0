# Project Management API

REST API for project and task management, built with NestJS, Prisma and PostgreSQL.

The application allows users to create projects, manage project members and create tasks with assigned users, including authentication and role-based authorization.

The application aims to be simple but with well-defined authorization rules.
## Technologies

- Node.js
- TypeScript
- NestJS
- Prisma ORM
- PostgreSQL
- JWT
- bcrypt
- class-validator

## Features

### Authentication
- User registration
- User login
- Password hashing with bcrypt
- JWT-based authentication
- Protected routes

### Projects
- Create projects
- Update projects
- Delete projects
- Add and remove project members
- Project roles: OWNER, ADMIN and MEMBER
- Get user projects with filter (title,description,members)

### Tasks
- Create tasks
- Update tasks
- Delete tasks
- Filter tasks with filter (title,priority,status,dueData,members,projects)
- Assign and Unassign multiple users to tasks

### Authorization
- Role-based access control
- Project ownership validation
- Admin permissions
- Project membership validation

## SCHEMAS

```mermaid
    USER {
        Int id
        String email
        String name
        String password
        DateTime createdAt
        DateTime updatedAt
    }
    
    PROJECT_MEMBERS {
        Int userId
        Int projectId
        ProjectRole role
    }

    PROJECT {
        Int id
        String title
        String description
        DateTime createdAt
        DateTime updatedAt
    }

     TASK_MEMBERS {
        Int userId
        Int taskId
    }

    TASK {
        Int id
        String title
        String description
        TaskStatus status
        TaskPriority priority
        DateTime dueDate
        Int projectId
        DateTime createdAt
        DateTime updatedAt
    }

   

```

## Running with Docker

### Prerequisites

* Docker
* Docker Compose

### Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://gabriel:YOUR_PASSWORD@postgres:5432/nestdb?schema=public"
JWT_SECRET="your-secret"

POSTGRES_USER="gabriel"
POSTGRES_PASSWORD="YOUR_PASSWORD"
POSTGRES_DB="nestdb"
```

### Start the application

Build the image and start the API and PostgreSQL containers:

```bash
docker compose up --build
```

The API will be available at:

```text
http://localhost:3333
```

To stop the containers:

```bash
docker compose down
```

### Database setup

Run the Prisma migrations:

```bash
npx prisma generate
```

### Start the application:
```start
npx prisma migrate dev
npm run start:dev
```

### insomnia setup
Import the Insomnia file here. 
[![Run in Insomnia](https://github.com/user-attachments/assets/56736d74-ca2b-460c-b08e-091d0e9bf159)](https://github.com/gabrielbarros23/Project-Manager/blob/main/insomnia/ProjectManager)
