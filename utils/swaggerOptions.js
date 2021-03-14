module.exports = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Make Trade API Documentation with Swagger',
      version: '1.0.0',
      description:
        'A portfolio tracking API which allows adding/deleting/updating trades and can do basic return calculations etc.',
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html',
      },
      contact: {
        name: 'Lakshmi Narasimhan K S',
        url: 'https://lakshmi-narasimhan.netlify.app/',
        email: 'lakshmi.narasimhan2611@gmail.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/',
      },
    ],
  },
  apis: ['./routes/index.js'],
};
