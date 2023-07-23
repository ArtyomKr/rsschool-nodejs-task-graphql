import { GraphQLList, GraphQLNonNull, GraphQLObjectType } from 'graphql/index.js';
import { MemberTypeId } from '../types/memberTypeId.js';
import { UUIDType } from '../types/uuid.js';
import { MemberType, PostType, ProfileType, UserType } from './types.js';
import { parseResolveInfo, ResolveTree, simplifyParsedResolveInfoFragmentWithType } from 'graphql-parse-resolve-info';
import DataLoader from 'dataloader';

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
      async resolve(parent, args, context, info) {
        const { dataloaders, prisma } = context;
        const parsed = parseResolveInfo(info);
        const { fields } : { fields: Record<string, unknown> } = simplifyParsedResolveInfoFragmentWithType(<ResolveTree>parsed, UserType);

        let res;
        if (fields.userSubscribedTo || fields.subscribedToUser) {
          res = await prisma.user.findMany({
            include: {
              subscribedToUser: Boolean(fields.subscribedToUser),
              userSubscribedTo: Boolean(fields.userSubscribedTo),
            },
          })
          if (fields.subscribedToUser) {
            const getSubscribers = (user) => user.subscribedToUser.map((sub) => res.find((user) => user.id === sub.subscriberId));

            const subscribersLoader = new DataLoader(async () => [null]);
            res.forEach((user) => subscribersLoader.prime(user.id, getSubscribers(user)));
            context.subscribersLoader = subscribersLoader;
          }
          if (fields.userSubscribedTo) {
            const getSubscribes = (user) => user.userSubscribedTo.map((authors) => res.find((user) => user.id === authors.authorId));
            const subscribesLoader = new DataLoader(async () => [null]);
            res.forEach((user) => subscribesLoader.prime(user.id, getSubscribes(user)));
            context.subscribesLoader = subscribesLoader;
          }
        } else {
          res = await prisma.user.findMany();
        }

        return res;
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
