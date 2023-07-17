import { Type } from '@fastify/type-provider-typebox';
import {
  buildSchema,
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLNonNull,
  GraphQLList
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
      type:  new GraphQLNonNull(GraphQLString)
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
      type:  new GraphQLNonNull(GraphQLString)
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
    // userSubscribedTo: {
    //   type: new GraphQLList(UserType),
    //   async resolve(parent) {
    //     console.log(parent.userSubscribedTo);
    //     await prisma.subscribersOnAuthors.findUnique({
    //       where: {
    //         authorId: parent.id,
    //       },
    //     });
    //   }
    // }
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
      type: new GraphQLNonNull(GraphQLString)
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

const SubscribersOnAuthorsType = new GraphQLObjectType({
  name: 'SubscribersOnAuthorsType',
  fields: () => ({
    subscriberId: {
      type: new GraphQLNonNull(GraphQLString)
    },
    authorId: {
      type: GraphQLBoolean
    }
  })
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQuery',
  fields: {
    memberTypes: {
      type: new GraphQLList(MemberType),
      async resolve() {
        return await prisma.memberType.findMany();
      }
    },
    memberType: {
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
    users: {
      type: new GraphQLList(UserType),
      async resolve() {
        return await prisma.user.findMany();
      }
    },
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      async resolve(parent, args) {
        return await prisma.user.findUnique({
          where: {
            id: args.id,
          },
        });
      }
    },
    profiles: {
      type: new GraphQLList(ProfileType),
      async resolve() {
        return await prisma.profile.findMany();
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
    },
    posts: {
      type: new GraphQLList(PostType),
      async resolve() {
        return await prisma.post.findMany();
      }
    },
    post: {
      type: PostType,
      args: { id: { type: GraphQLString } },
      async resolve(parent, args) {
        return await prisma.post.findUnique({
          where: {
            id: args.id,
          },
        });
      }
    },
  }
});

export const schema = new GraphQLSchema({
  query: RootQuery
});
