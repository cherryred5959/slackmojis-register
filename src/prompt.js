'use strict';

const { Snippet } = require('enquirer');
const slack = require('./slack');

module.exports = async () => {
    const prompt = new Snippet({
        name: 'slack',
        message: 'Please provide the following information:',
        required: true,
        fields: [
            {
                name: 'workspace',
                message: 'Your workspace name',
            },
            {
                type: 'input',
                name: 'email',
                message: 'Your email',
            },
            {
                name: 'password',
                message: 'Your password',
            },
            {
                name: 'prefix',
                message: 'Emoji prefix',
            },
            {
                name: 'path',
                message: 'Emoji download path',
            },
        ],
        template: `{\n  "workspace": "${slack("\${workspace}")}",\n  "email": "\${email}",\n  "password": "\${password}",\n  "prefix": "\${prefix}"\n  "directory: "\${path}"\n}`,
    });

    return await prompt.run();
};