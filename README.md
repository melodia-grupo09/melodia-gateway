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
- **Data Persistence**: User data management

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

### 🛡️ Security & Reliability

- Request validation and sanitization
- Standardized error handling
- Graceful degradation for external service failures
- Production-ready logging

### 🧪 Testing & Quality Assurance

- **51 unit tests** with comprehensive coverage
- **97%+ code coverage** on critical services
- Integration tests for user flows
- Mocked external dependencies for reliable testing

## API Documentation

For comprehensive API documentation, including all endpoints, request/response schemas, and interactive testing, visit our Swagger documentation:

**🔗 [Interactive API Documentation](https://melodia-gateway-2b9807728e9a.herokuapp.com//api)**

### Key Endpoints Overview

- **Authentication**: User registration, login, and password reset
- **Analytics**: Protected routes for user metrics and retention data
- **Health Checks**: System status and monitoring endpoints

All endpoints include detailed request/response examples, authentication requirements, and error handling documentation in the Swagger interface.

## Test Coverage

- **MetricsService**: 97.56% coverage (12 tests)
- **UsersService**: 100% coverage (8 tests)
- **FirebaseAuthGuard**: Basic validation tests (7 tests)
- **Integration Tests**: End-to-end user flows (24 tests)

## Dependencies

### Core Framework

- **NestJS**: Modern Node.js framework with TypeScript support
- **Firebase Admin SDK**: Authentication and user management
- **Axios**: HTTP client for external API integration

### Development & Testing

- **Jest**: Testing framework with mocking capabilities
- **ESLint**: Code quality and style enforcement
- **TypeScript**: Type safety and enhanced developer experience
