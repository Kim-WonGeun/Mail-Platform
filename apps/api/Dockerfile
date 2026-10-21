FROM eclipse-temurin:25-jdk AS builder

WORKDIR /app

COPY apps/api/gradlew apps/api/settings.gradle.kts apps/api/build.gradle.kts ./
COPY apps/api/gradle gradle

RUN chmod +x ./gradlew
RUN ./gradlew dependencies --no-daemon

COPY apps/api/src src

RUN ./gradlew bootJar --no-daemon

FROM eclipse-temurin:25-jre

WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]

