# Melodía API Gateway

[![codecov](https://codecov.io/gh/melodia-grupo09/melodia-gateway/branch/main/graph/badge.svg)](https://codecov.io/gh/melodia-grupo09/melodia-gateway)

Production-ready API Gateway built with [**NestJS**](https://nestjs.com/) for the Melodía application ecosystem.

## Overview

This API Gateway serves as the central entry point for the Melodía platform, providing:

- **User Management**: Registration, authentication, and profile management
- **Firebase Authentication**: Secure JWT-based authentication using Firebase Admin SDK
- **Analytics Integration**: Real-time user behavior tracking via external metrics service
- **Request/Response Interceptors**: Standardized API responses and error handling
- **Production Monitoring**: Comprehensive logging and error tracking

## Architecture

The gateway follows a modular microservices architecture pattern:

- **API Gateway Layer**: Routes and validates incoming requests
- **Authentication Layer**: Firebase-based JWT verification
- **Business Logic Layer**: User operations and service orchestration
- **External Services Integration**: Metrics API for user analytics

## Features

### 🔐 Authentication & Authorization

- Firebase Admin SDK integration
- JWT token validation and verification
- Protected route guards
- Secure user session management

### 📊 Analytics & Monitoring

- Real-time user registration tracking
- Login activity monitoring
- User retention analytics
- Non-blocking metrics collection (resilient to external service failures)

## API Documentation

For comprehensive API documentation, including all endpoints, request/response schemas, and interactive testing, visit our Swagger documentation:

**🔗 [Interactive API Documentation](https://melodia-gateway-2b9807728e9a.herokuapp.com//api)**

## Test Coverage

Comprehensive test coverage tracked automatically via Codecov:

![Code Coverage](https://codecov.io/gh/melodia-grupo09/melodia-gateway/graphs/sunburst.svg?token=DTFTGGZX5L)

## Dependencies

### Core Framework

- **NestJS**: Modern Node.js framework with TypeScript support
- **Firebase Admin SDK**: Authentication and user management
- **Axios**: HTTP client for external API integration

### Development & Testing

- **Jest**: Testing framework with mocking capabilities
- **ESLint**: Code quality and style enforcement
- **TypeScript**: Type safety and enhanced developer experience
