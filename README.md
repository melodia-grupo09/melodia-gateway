Melodía Backend App
=========================================================

Repositorio de la API REST de Melodía, hecha con [**Nest.JS**](https://nestjs.com/).

Tabla de Contenido
------------------

*   [Introducción](#introducción)
    
*   [El Mayor Desafío](#el-mayor-desafío)
    
*   [Pre-requisitos](#pre-requisitos)
    
*   [Biblioteca de Testing](#biblioteca-de-testing)
    
*   [Comandos de Docker](#comandos-de-docker)
    
    *   [Construir y correr la app](#construir-y-correr-la-app)

    *   [Construir la Imagen](#construir-la-imagen)
        
    *   [Correr la Base de Datos](#correr-la-base-de-datos)
        
    *   [Correr el Servicio](#correr-el-servicio)
        

Introducción
------------

La solución implementa una API REST utilizando [**Nest.JS**](https://nestjs.com/), un framework de Node.js que favorece la escalabilidad y la modularidad. La elección de este framework por sobre Express, fue motivada no solo por la filosofía modular que tiene el framework, sino también por todo el set de herramientas que incluye. El objetivo principal fue construir una base sólida y documentada, complementada por una estrategia de testing de integración. Para ello, utilizamos [**Cucumber**](https://cucumber.io/docs/), que permite definir el comportamiento esperado de la API en un lenguaje natural (Gherkin), permitiendo que los que se está queriendo probar pueda ser leido de forma sencilla, e incluso escrito por alguien no-técnico

El Mayor Desafío
----------------

Tengo bastante experiencia con este stack (Nest, Cucumber, Docker, MikroORM) y la forma de trabajarlo, por lo que no hubo nada particularmente desafiante desde el lado tecnológico. Lo más entretenido desde mi punto de vista fue la parte de entender los requerimientos del proyecto y desarrollarlo. Lo más tedioso (aunque no por eso desafiante) fue hacer la configuración inicial de Cucumber y armar el pipeline de CI, por ser algo que, si bien lo hago en el trabajo, no lo hago todos los días.

Pre-requisitos
--------------

Para levantar el entorno de desarrollo y correr el proyecto localmente, necesitamos tener instalado el siguiente software:

*   **Node.js**: v22
    
*   **NPM** v11
    
*   **Docker** y **Docker Compose**.
    

Biblioteca de Testing
-------------------

Las pruebas de integración se desarrollaron utilizando **Cucumber**, una herramienta que implementa el paradigma de Behavior-Driven Development (BDD). Permite escribir casos de prueba en un lenguaje natural y comprensible llamado Gherkin.

*   **Link a la documentación oficial:** [Cucumber.io](https://cucumber.io/docs/)

### Correr los tests
Para correr los test desde el ambiente local tenemos que crear el archivo .env con la url de la db apuntando a localhost
```bash
cp .env.local .env
docker compose up -d postgres
npm install
npm run test:e2e
```

Correr la app para desarrollo
-------------------
Para correr la aplicación sin docker y en modo desarrollo necesitamos modificar el .env con `DATABASE_HOST=localhost`
```bash
cp .env.local .env
sed -i '' 's/^DATABASE_HOST=.*/DATABASE_HOST=localhost/' .env # Si no funciona el comando modificar a mano en el .env
docker compose up -d postgres
npm install
npm run start:dev
```

Comandos de Docker
------------------

A continuación, se detallan los comandos necesarios para construir y ejecutar la aplicación utilizando Docker.
```bash
cp .env.local .env
```

### Construir y correr la app
Con este comando vamos a construir la imagen del servicio, levantar postgres, y por ultimo levantar el servicio.
```bash
docker compose up -d
```

### Construir la Imagen
La imagen que vamos a construir es una imagen productiva, no de desarrollo.
Para construir la imagen, tenemos que ejecutar el siguiente comando desde la raíz del proyecto:

```bash
docker build -t fiuba-melodia-backend .
```

Si queremos unicamente correr el servicio localmente podemos directamente levantarlo con docker compose. Esto va a constuir la imagen si no está construida, y va a levantar la db.
```bash
docker compose up app
```

### Correr la Base de Datos

Para levantar el contenedor de postgres, no debemos tener nada escuchando en el puerto 5432 de nuestro host. Está hecho de esta forma por si queremos correr la app desde un Node local (no docker).
```bash
docker compose up -d postgres
```

### Correr el Servicio

Para iniciar el contenedor de la aplicación (con la ultima version construida de la imagen) podemos usar
```bash
docker compose build
docker compose up -d app
```

Si queremos iniciarlo desde la imagen que construimos en el paso anterior podemos hacerlo con:
```bash
docker run -it --rm -v './.env.local:/app/.env' --network=fiuba-melodia-backend_default fiuba-melodia-backend
```