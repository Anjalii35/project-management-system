# Use Maven + Java 21 image to build the project
FROM maven:3.9.6-eclipse-temurin-21 AS build

# Set working folder
WORKDIR /app

# Copy project files
COPY pom.xml .
COPY src ./src

# Build jar file
RUN mvn clean package -DskipTests


# Use lightweight Java image to run the app
FROM eclipse-temurin:21-jre

# Set working folder
WORKDIR /app

# Copy jar from build stage
COPY --from=build /app/target/*.jar task-app.jar

# App runs on port 8080
EXPOSE 8080

# Start Spring Boot application
ENTRYPOINT ["java", "-jar", "task-app.jar"]