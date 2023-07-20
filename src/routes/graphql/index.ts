import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import {  graphql,validate, parse } from 'graphql';
import { graphqlSchema } from './graphqlSchemas/graphqlSchema.js';
import depthLimit from 'graphql-depth-limit';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req, res) {
      const query = req.body.query;
      const variables = req.body.variables;

      const errors = validate(graphqlSchema, parse(query), [depthLimit(5)]);

      if (errors.length > 0) {
        res.code(500);
        return {
          statusCode: res.statusCode,
          errors: errors
        };
      }

      return await graphql({
        schema: graphqlSchema,
        source: query,
        variableValues: variables,
        contextValue: { dataloaders: new WeakMap() }
      });
    },
  });
};

export default plugin;
