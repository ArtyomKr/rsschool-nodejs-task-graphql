import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';
import { MemberTypeId } from '../types/memberTypeId.js';
import { UUIDType } from '../types/uuid.js';
import { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';

const prisma = new PrismaClient();

const MemberType = new GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(MemberTypeId)
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
      async resolve(parent, args, context, info) {
        const { dataloaders } = context;

        let dl = dataloaders.get(info.fieldNodes);
        if (!dl) {
          dl = new DataLoader(async (ids: string[]) => {
            const profiles = await prisma.profile.findMany({
              where: {
                userId: {
                  in: ids,
                },
              },
            });

            return ids.map((id) => profiles.find((p) => p.userId === id));
          });

          dataloaders.set(info.fieldNodes, dl);
        }

        return dl.load(parent.id);
      }
    },
    posts: {
      type: new GraphQLList(PostType),
      async resolve(parent, args, context, info) {
        const { dataloaders } = context;

        let dl = dataloaders.get(info.fieldNodes);
        if (!dl) {
          dl = new DataLoader(async (ids: string[]) => {
            const posts = await prisma.post.findMany({
              where: {
                authorId: {
                  in: ids,
                },
              },
            });

            return ids.map((id) => posts.find((p) => p.authorId === id));
          });

          dataloaders.set(info.fieldNodes, dl);
        }

        return dl.load(parent.id);
      }
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      async resolve(parent, args, context, info) {
        const { dataloaders } = context;

        let dl = dataloaders.get(info.fieldNodes);
        if (!dl) {
          dl = new DataLoader(async (ids: string[]) => {
            const authors = await prisma.user.findMany({
              where: {
                subscribedToUser: {
                  some: {
                    subscriberId: {
                      in: ids,
                    },
                  },
                },
              }
            });

            return ids.map((id) => authors.find((a) => a.subscriberId === id));
          });

          dataloaders.set(info.fieldNodes, dl);
        }

        return dl.load(parent.id);
      }
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      async resolve(parent, args, context, info) {
        const { dataloaders } = context;

        let dl = dataloaders.get(info.fieldNodes);
        if (!dl) {
          dl = new DataLoader(async (ids: string[]) => {
            const subscribers = await prisma.user.findMany({
              where: {
                userSubscribedTo: {
                  some: {
                    authorId: {
                      in: ids,
                    },
                  },
                },
              }
            });

            return ids.map((id) => subscribers.find((s) => s.authorId === id));
          });

          dataloaders.set(info.fieldNodes, dl);
        }

        return dl.load(parent.id);
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