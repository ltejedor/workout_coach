import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { procedure } from "@/server/api/trpc";
import { env } from "@/env";

export const sendMessage = procedure
  .input(
    z.object({
      message: z.string().min(1, "Message cannot be empty"),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const response = await fetch(
        "https://api.fireworks.ai/inference/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.FIREWORKS_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model:
              "accounts/sentientfoundation/models/dobby-mini-unhinged-llama-3-1-8b#accounts/sentientfoundation/deployments/81e155fc",
            messages: [
              {
                role: "user",
                content: input.message,
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get response from AI",
        });
      }

      const data = await response.json();
      return {
        reply: data.choices[0]?.message?.content ?? "No response from AI",
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to communicate with AI service",
      });
    }
  });
