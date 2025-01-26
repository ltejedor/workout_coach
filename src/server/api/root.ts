import {
  createCallerFactory,
  createTRPCRouter,
  procedure,
} from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * Procedures from api/procedures should be added here.
 */
import { sendMessage } from "./procedures/sendMessage";

export const appRouter = createTRPCRouter({
  sendMessage,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
