import { GraphQLFloat, GraphQLInputObjectType, GraphQLObjectType, GraphQLString } from 'graphql';
import { PrismaClient } from '@prisma/client';
import { MemberType, PostType, ProfileType, UserType } from './types.js';

const prisma = new PrismaClient();

const inputUserType = new GraphQLInputObjectType({
  name: 'UserInput',
  fields: {
    name: {
      type: GraphQLString
    },
    balance: {
      type: GraphQLFloat
    }
  }
})

const RootMutation = new GraphQLObjectType({
  name: 'RootMutation',
  fields: {
    createUser: {
      type: UserType,
      args: { dto: { type: inputUserType } },
      async resolve(parent, args) {
        return prisma.user.create({
          data: args.dto,
        });
      }
    }
  }
});

export default RootMutation;