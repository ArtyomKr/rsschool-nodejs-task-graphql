import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql/index.js';
import { MemberTypeId } from '../types/memberTypeId.js';
import { UUIDType } from '../types/uuid.js';
import { MemberType, PostType, ProfileType, UserType } from './types.js';

const RootQuery = new GraphQLObjectType({
  name: 'RootQuery',
  fields: {
    memberTypes: {
      type: new GraphQLList(MemberType),
      async resolve(parent, args, context) {
        const { prisma } = context;
        return await prisma.memberType.findMany();
      }
    },
    memberType: {
      type: MemberType,
      args: { id: { type: MemberTypeId } },
      async resolve(parent, args, context) {
        const { prisma } = context;
        return await prisma.memberType.findUnique({
          where: {
            id: args.id,
          },
        });
      }
    },
    users: {
      type: new GraphQLList(UserType),
      async resolve(parent, args, context) {
        const { prisma } = context;
        return await prisma.user.findMany();
      }
    },
    user: {
      type: UserType,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      async resolve(parent, args, context) {
        const { prisma } = context;
        return await prisma.user.findUnique({
          where: {
            id: args.id,
          },
        });
      }
    },
    profiles: {
      type: new GraphQLList(ProfileType),
      async resolve(parent, args, context) {
        const { prisma } = context;
        return await prisma.profile.findMany();
      }
    },
    profile: {
      type: ProfileType,
      args: { id: { type: UUIDType } },
      async resolve(parent, args, context) {
        const { prisma } = context;
        return await prisma.profile.findUnique({
          where: {
            id: args.id,
          },
        });
      }
    },
    posts: {
      type: new GraphQLList(PostType),
      async resolve(parent, args, context) {
        const { prisma } = context;
        return await prisma.post.findMany();
      }
    },
    post: {
      type: PostType,
      args: { id: { type: UUIDType } },
      async resolve(parent, args, context) {
        const { prisma } = context;
        return await prisma.post.findUnique({
          where: {
            id: args.id,
          },
        });
      }
    },
  }
});

export default RootQuery;
