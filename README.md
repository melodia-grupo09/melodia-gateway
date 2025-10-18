# Melodía API Gateway

<a href="https://github.com/melodia-grupo09/melodia-gateway/actions/workflows/ci.yaml" target="_blank">
  <img src="https://img.shields.io/github/actions/workflow/status/melodia-grupo09/melodia-gateway/ci.yaml?branch=main&label=CI%2FCD%20Pipeline" alt="CI/CD Status" />
</a>
<a href="https://app.codecov.io/github/melodia-grupo09/melodia-gateway" target="_blank">
  <img src="https://codecov.io/gh/melodia-grupo09/melodia-gateway/graph/badge.svg?token=DTFTGGZX5L" alt="Coverage Status" />
</a>
<a href="https://nodejs.org" target="_blank">
  <img src="https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen.svg" alt="Node.js Version" />
</a>
<a href="https://nestjs.com" target="_blank">
  <img src="https://img.shields.io/badge/NestJS-10.0-E0234E.svg" alt="NestJS Version" />
</a>
<a href="https://www.typescriptlang.org" target="_blank">
  <img src="https://img.shields.io/badge/TypeScript-5.1-007ACC.svg" alt="TypeScript Version" />
</a>

Rest API Gateway built with [**NestJS**](https://nestjs.com/) for the Melodía application.

## Live Deployment

The application is deployed on Heroku and accessible at: [https://melodia-gateway-2b9807728e9a.herokuapp.com/](https://melodia-gateway-2b9807728e9a.herokuapp.com/)

## Overview

This API Gateway serves as the central entry point for the Melodía platform, providing:

- **Firebase Authentication**: Secure JWT-based authentication using Firebase Admin SDK
- **Request/Response Interceptors**: Standardized API responses and error handling
- **Production Monitoring**: Comprehensive logging and error tracking

## Architecture

The gateway follows a modular microservices architecture pattern:

- **API Gateway Layer**: Routes and validates incoming requests
- **Authentication Layer**: Firebase-based JWT verification

## Connected Services

The gateway integrates with the following external services:

- **Users Service**: [https://backend-user-service-a01239c9445a.herokuapp.com](https://backend-user-service-a01239c9445a.herokuapp.com)
- **Songs Service**: [https://melodia-songs-service-f31b1c1f9a24.herokuapp.com](https://melodia-songs-service-f31b1c1f9a24.herokuapp.com)
- **Artists Service**: [https://melodia-artists-64869ccb2e15.herokuapp.com](https://melodia-artists-64869ccb2e15.herokuapp.com)
- **Playlists Service**: [https://backend-playlist-service-4afcaf66ff1a.herokuapp.com](https://backend-playlist-service-4afcaf66ff1a.herokuapp.com)
- **Metrics Service**: [https://melodia-metrics-e9ca6dea743b.herokuapp.com](https://melodia-metrics-e9ca6dea743b.herokuapp.com)

## API Documentation

For comprehensive API documentation, including all endpoints, request/response schemas, and interactive testing, visit our Swagger documentation:

**[Interactive API Documentation](https://melodia-gateway-2b9807728e9a.herokuapp.com//api)**

## Code Coverage

Comprehensive test coverage tracked automatically via Codecov:

[![Test Coverage](https://codecov.io/gh/melodia-grupo09/melodia-gateway/graph/badge.svg?token=DTFTGGZX5L)](https://codecov.io/gh/melodia-grupo09/melodia-gateway)

**[View Detailed Coverage Report & Interactive Graphs](https://app.codecov.io/gh/melodia-grupo09/melodia-gateway)**

<h3>Graph</h3>
<div align="center">
  
  <a href="https://app.codecov.io/gh/melodia-grupo09/melodia-gateway" target="_blank">
    <img src="https://codecov.io/gh/melodia-grupo09/melodia-gateway/graphs/sunburst.svg?token=DTFTGGZX5L" alt="Coverage Sunburst" width="400" />
  </a>
  
</div>

## Dependencies

### Core Framework

- **NestJS**: Modern Node.js framework with TypeScript support
- **Firebase Admin SDK**: Authentication and user management
- **Axios**: HTTP client for external API integration

### Development & Testing

- **Jest**: Testing framework with mocking capabilities
- **ESLint**: Code quality and style enforcement
- **TypeScript**: Type safety and enhanced developer experience
