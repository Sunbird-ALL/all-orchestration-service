import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'All Orchestration Service API',
            version: '1.0.0',
            description: 'API documentation for the All Orchestration Service - MongoDB Module',
            contact: {
                name: 'API Support',
                email: 'support@example.com'
            }
        },
        servers: [
            {
                url: '/api',
                description: 'API Server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token'
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: [
        './src/mongo_module/modules/**/*.swagger.ts'
    ]
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;

