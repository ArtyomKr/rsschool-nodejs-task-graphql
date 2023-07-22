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
import DataLoader from 'dataloader';

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
      async resolve(parent, args, context) {
        const { prisma } = context;
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
        const { dataloaders, prisma } = context;

        let dl = dataloaders.get(info.fieldNodes);
        if (!dl) {
          dl = new DataLoader(async (ids: any) => {
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
        const { dataloaders, prisma } = context;

        let dl = dataloaders.get(info.fieldNodes);
        if (!dl) {
          dl = new DataLoader(async (ids: any) => {
            const posts = await prisma.post.findMany({
              where: {
                authorId: {
                  in: ids,
                },
              },
            });

            return ids.map((id) => posts.filter((p) => p.authorId === id));
          });

          dataloaders.set(info.fieldNodes, dl);
        }

        return dl.load(parent.id);
      }
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      async resolve(parent, args, context, info) {
        const { dataloaders, prisma } = context;

        let dl = dataloaders.get(info.fieldNodes);
        if (!dl) {
          dl = new DataLoader(async (ids: any) => {
            const authors = await prisma.user.findMany({
              where: {
                subscribedToUser: {
                  some: {
                    subscriberId: {
                      in: ids,
                    },
                  },
                },
              },
              include: {
                subscribedToUser: true,
              },
            });

            return ids.map((id) => authors.filter((a) => a.subscribedToUser.find(({ subscriberId }) => subscriberId === id)));
          });

          dataloaders.set(info.fieldNodes, dl);
        }

        return dl.load(parent.id);
      }
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      async resolve(parent, args, context, info) {
        const { dataloaders, prisma } = context;

        let dl = dataloaders.get(info.fieldNodes);
        if (!dl) {
          dl = new DataLoader(async (ids: any) => {
            const subscribers = await prisma.user.findMany({
              where: {
                userSubscribedTo: {
                  some: {
                    authorId: {
                      in: ids,
                    },
                  },
                },
              },
              include: {
                userSubscribedTo: true,
              },
            });

            return ids.map((id) => subscribers.filter((a) => a.userSubscribedTo.find(({ authorId }) => authorId === id)));
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
      async resolve(parent, args, context, info) {
        const { dataloaders, prisma } = context;

        let dl = dataloaders.get(info.fieldNodes);
        if (!dl) {
          dl = new DataLoader(async (ids: any) => {
            const users = await prisma.user.findMany({
              where: {
                id: {
                  in: ids,
                },
              },
            });

            return ids.map((id) => users.find((u) => u.id === id));
          });

          dataloaders.set(info.fieldNodes, dl);
        }

        return dl.load(parent.userId);
      }
    },
    memberType: {
      type: MemberType,
      async resolve(parent, args, context, info) {
        const { dataloaders, prisma } = context;

        let dl = dataloaders.get(info.fieldNodes);
        if (!dl) {
          dl = new DataLoader(async (ids: any) => {
            const users = await prisma.memberType.findMany({
              where: {
                id: {
                  in: ids,
                },
              },
            });

            return ids.map((id) => users.find((u) => u.id === id));
          });

          dataloaders.set(info.fieldNodes, dl);
        }

        return dl.load(parent.memberTypeId);
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
      async resolve(parent, args, context, info) {
        const { dataloaders, prisma } = context;

        let dl = dataloaders.get(info.fieldNodes);
        if (!dl) {
          dl = new DataLoader(async (ids: any) => {
            const users = await prisma.user.findMany({
              where: {
                id: {
                  in: ids,
                },
              },
            });

            return ids.map((id) => users.find((u) => u.id === id));
          });

          dataloaders.set(info.fieldNodes, dl);
        }

        return dl.load(parent.authorId);
      }
    },
  })
});

export { MemberType, UserType, ProfileType, PostType }