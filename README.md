# ResearchRepo
CSCE 490 Research Milestone

Note about commit history: My Git email was initially not synced correctly with my GitHub account, so some of my earlier commits are not associated with my GitHub profile, even though my name appears as the author. I have since fixed the issue and made a few test commits to confirm that my Git configuration is now correctly synced with GitHub for all future commits.

## Overview

The application allows users to:

- Register and log in
- Create events
- View events on a calendar
- Edit events
- Delete events
- Store events in a MySQL database
- Keep events separated between different users

## Technology Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- FullCalendar

### Backend
- Java
- Spring Boot
- Spring Security
- JWT authentication
- Spring Data JPA
- Maven

### Database
- MySQL

## How to Run

### 1. Start the Backend
./mvnw spring-boot:run

### 2. Start the Frontend
npm run dev

### 3. The Frontend Will Run At
http://localhost:3000
