const path = require('path');

const configsDir = '../lib/init-config/';

const settings = {
    default: {
        file: path.join(configsDir, 'npm.init.js'),
        title: 'npm',
    },
    upradata: {
        file: path.join(configsDir, 'upradata.init.js'),
        title: 'upradata',
    },
    example: {
        file: '../package.example.json',
        title: 'example',
    }
};


module.exports = settings;
