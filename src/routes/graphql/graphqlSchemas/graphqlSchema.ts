import { GraphQLSchema } from 'graphql/index.js';
import RootQuery from './queries.js';
import RootMutation from './mutations.js';

export const graphqlSchema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation
});