import { GraphQLFloat, GraphQLInputObjectType, GraphQLObjectType, GraphQLString, GraphQLBoolean, GraphQLInt } from 'graphql';
import { PrismaClient } from '@prisma/client';
import { MemberType, PostType, ProfileType, UserType } from './types.js';
import { UUIDType } from '../types/uuid.js';
import { MemberTypeId } from '../types/memberTypeId.js';

const prisma = new PrismaClient();

const inputUserType = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    name: {
      type: GraphQLString
    },
    balance: {
      type: GraphQLFloat
    }
  }
});

const inputProfileType = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: {
    userId: {
      type: UUIDType
    },
    memberTypeId: {
      type: MemberTypeId
    },
    isMale: {
      type: GraphQLBoolean
    },
    yearOfBirth: {
      type: GraphQLInt
    }
  }
});

const inputPostType = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: {
    authorId: {
      type: UUIDType
    },
    content: {
      type: GraphQLString
    },
    title: {
      type: GraphQLString
    }
  }
});

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
    },
    createProfile: {
      type: ProfileType,
      args: { dto: { type: inputProfileType } },
      async resolve(parent, args) {
        return prisma.profile.create({
          data: args.dto,
        });
      }
    },
    createPost: {
      type: PostType,
      args: { dto: { type: inputPostType } },
      async resolve(parent, args) {
        return prisma.post.create({
          data: args.dto,
        });
      }
    },
    deleteUser: {
      type: GraphQLBoolean,
      args: { id: { type: UUIDType } },
      async resolve(parent, args) {
        await prisma.user.delete({
          where: {
            id: args.id,
          },
        });
      }
    },
    deleteProfile: {
      type: GraphQLBoolean,
      args: { id: { type: UUIDType } },
      async resolve(parent, args) {
        await prisma.profile.delete({
          where: {
            id: args.id,
          },
        });
      }
    },
    deletePost: {
      type: GraphQLBoolean,
      args: { id: { type: UUIDType } },
      async resolve(parent, args) {
        await prisma.post.delete({
          where: {
            id: args.id,
          },
        });
      }
    },
  }
});

export default RootMutation;