const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Library Management System",
      // version: "1.0.0",
      description:
        "API end point documentation for the Library Management System",
    },
  },
  apis: ["**/*.js"], // Path to the API routes
};

const specs = swaggerJsdoc(options);

module.exports = specs;
