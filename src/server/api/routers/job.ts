import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { extractJobDataFromScreenshot } from "~/lib/ocr";

export const jobRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        company: z.string().min(1),
        title: z.string().min(1),
        status: z.string().min(1),
        date: z.date(),
        notes: z.string().optional(),
        imageUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { notes, imageUrl, ...requiredFields } = input;

      return ctx.db.job.create({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: {
          ...requiredFields,
          userId: ctx.session.user.id,
          ...(notes !== undefined && { notes }),
          ...(imageUrl !== undefined && { imageUrl }),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any, // Type assertion to bypass Prisma type generation issue
      });
    }),

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.job.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.job.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        company: z.string().min(1).optional(),
        title: z.string().min(1).optional(),
        status: z.string().min(1).optional(),
        date: z.date().optional(),
        notes: z.string().optional(),
        imageUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      return ctx.db.job.update({
        where: {
          id,
          userId: ctx.session.user.id,
        },
        data: updateData,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.job.delete({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });
    }),

  // OCR extraction endpoint
  extractFromScreenshot: protectedProcedure
    .input(z.object({ imageUrl: z.string().url() }))
    .mutation(async ({ input }) => {
      try {
        const extractedData = await extractJobDataFromScreenshot(
          input.imageUrl,
        );
        return extractedData;
      } catch (error) {
        throw new Error(
          `Failed to extract job data: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }),
});
