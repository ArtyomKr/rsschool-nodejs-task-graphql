import { Type } from '@fastify/type-provider-typebox';
import {
  buildSchema,
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLNonNull
} from 'graphql';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const gqlResponseSchema = Type.Partial(
  Type.Object({
    data: Type.Any(),
    errors: Type.Any(),
  }),
);

export const createGqlResponseSchema = {
  body: Type.Object(
    {
      query: Type.String(),
      variables: Type.Optional(Type.Record(Type.String(), Type.Any())),
    },
    {
      additionalProperties: false,
    },
  ),
};

const MemberType = new GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    id: {
      type: GraphQLString
    },
    discount: {
      type: GraphQLFloat
    },
    postsLimitPerMonth: {
      type: GraphQLInt
    },
  })
});

const ProfileType = new GraphQLObjectType({
  name: 'ProfileType',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString)
    },
    isMale: {
      type: GraphQLBoolean
    },
    yearOfBirth: {
      type: GraphQLInt
    }
  })
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQuery',
  fields: {
    memberTypes: {
      type: MemberType,
      args: { id: { type: GraphQLString } },
      async resolve(parent, args) {
        return await prisma.memberType.findUnique({
          where: {
            id: args.id,
          },
        });
      }
    },
    profile: {
      type: ProfileType,
      args: { id: { type: GraphQLString } },
      async resolve(parent, args) {
        return await prisma.profile.findUnique({
          where: {
            id: args.id,
          },
        });
      }
    }
  }
});

export const schema = new GraphQLSchema({
  query: RootQuery
});
