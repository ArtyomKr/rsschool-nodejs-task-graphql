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
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MemberType = new GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    id: {
      type:  new GraphQLNonNull(MemberTypeId)
    },
    discount: {
      type: GraphQLFloat
    },
    postsLimitPerMonth: {
      type: GraphQLInt
    },
    profiles: {
      type: new GraphQLList(ProfileType),
      async resolve(parent) {
        return await prisma.profile.findMany({
          where: {
            memberTypeId: parent.id,
          },
        });
      }
    }
  })
});

const UserType = new GraphQLObjectType({
  name: 'UserType',
  fields: () => ({
    id: {
      type:  new GraphQLNonNull(UUIDType)
    },
    name: {
      type: GraphQLString
    },
    balance: {
      type: GraphQLFloat
    },
    profile: {
      type: ProfileType,
      async resolve(parent) {
        return await prisma.profile.findUnique({
          where: {
            userId: parent.id,
          },
        });
      }
    },
    posts: {
      type: new GraphQLList(PostType),
      async resolve(parent) {
        return await prisma.post.findMany({
          where: {
            authorId: parent.id,
          },
        });
      }
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      async resolve(parent) {
        return await prisma.user.findMany({
          where: {
            subscribedToUser: {
              some: {
                subscriberId: parent.id,
              },
            },
          },
        });
      }
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      async resolve(parent) {
        return await prisma.user.findMany({
          where: {
            userSubscribedTo: {
              some: {
                authorId: parent.id,
              },
            },
          },
        });
      }
    }
  })
});

const ProfileType = new GraphQLObjectType({
  name: 'ProfileType',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(UUIDType)
    },
    isMale: {
      type: GraphQLBoolean
    },
    yearOfBirth: {
      type: GraphQLInt
    },
    user: {
      type: UserType,
      async resolve(parent) {
        return await prisma.user.findUnique({
          where: {
            id: parent.userId
          },
        });
      }
    },
    memberType: {
      type: MemberType,
      async resolve(parent) {
        return await prisma.memberType.findUnique({
          where: {
            id: parent.memberTypeId
          },
        });
      }
    }
  })
});

const PostType = new GraphQLObjectType({
  name: 'PostType',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(UUIDType)
    },
    title: {
      type: GraphQLString
    },
    content: {
      type: GraphQLString
    },
    author: {
      type: UserType,
      async resolve(parent) {
        return await prisma.user.findUnique({
          where: {
            id: parent.authorId
          },
        });
      }
    },
  })
});

export { MemberType, UserType, ProfileType, PostType }