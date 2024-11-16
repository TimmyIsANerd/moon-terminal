'use strict';

/**
 * meme service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::meme.meme');
