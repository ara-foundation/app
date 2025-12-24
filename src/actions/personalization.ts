import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { generateCode } from '@/server-side/ai-code-generator';
import {
  createPersonalization,
  getPersonalizationsByUserAndContext,
  updatePersonalization,
  deletePersonalization,
} from '@/server-side/personalization';
import { getStarByEmail } from '@/server-side/star';

export const server = {
  /**
   * Generate personalization code from prompt
   */
  generatePersonalizationCode: defineAction({
    input: z.object({
      prompt: z.string().min(1),
      context: z.string(),
      componentStructure: z.array(z.string()),
      email: z.string().email(),
    }),
    handler: async ({ prompt, context, componentStructure, email }) => {
      try {
        const result = await generateCode({ prompt, context, componentStructure });
        return {
          success: true,
          code: result.code,
          uris: result.uris,
        };
      } catch (error) {
        console.error('Error generating code:', error);
        return {
          success: false,
          error: 'Failed to generate code',
        };
      }
    },
  }),

  /**
   * Save personalization to database (create or update)
   */
  savePersonalization: defineAction({
    input: z.object({
      context: z.string(),
      code: z.string(),
      prompt: z.string(),
      uris: z.array(z.string()),
      email: z.string().email(),
      personalizationId: z.string().optional(),
    }),
    handler: async ({ context, code, prompt, uris, email, personalizationId }) => {
      try {
        const user = await getStarByEmail(email);
        if (!user || !user._id) {
          return {
            success: false,
            error: 'User not found',
          };
        }

        // If personalizationId is provided, update existing; otherwise create new
        if (personalizationId) {
          const updated = await updatePersonalization(personalizationId, {
            code,
            prompt,
            uris,
          });
          if (updated) {
            return {
              success: true,
              personalizationId,
            };
          } else {
            return {
              success: false,
              error: 'Failed to update personalization',
            };
          }
        } else {
          const newId = await createPersonalization({
            context,
            userId: user._id,
            code,
            prompt,
            uris,
          });

          return {
            success: true,
            personalizationId: newId,
          };
        }
      } catch (error) {
        console.error('Error saving personalization:', error);
        return {
          success: false,
          error: 'Failed to save personalization',
        };
      }
    },
  }),

  /**
   * Get personalizations for user and context
   */
  getPersonalizations: defineAction({
    input: z.object({
      context: z.string(),
      email: z.string().email(),
    }),
    handler: async ({ context, email }) => {
      try {
        const user = await getStarByEmail(email);
        if (!user || !user._id) {
          return {
            success: false,
            error: 'User not found',
            data: [],
          };
        }

        const personalizations = await getPersonalizationsByUserAndContext(
          user._id,
          context
        );

        return {
          success: true,
          data: personalizations,
        };
      } catch (error) {
        console.error('Error getting personalizations:', error);
        return {
          success: false,
          error: 'Failed to get personalizations',
          data: [],
        };
      }
    },
  }),

  /**
   * Delete personalization
   */
  deletePersonalization: defineAction({
    input: z.object({
      personalizationId: z.string(),
    }),
    handler: async ({ personalizationId }) => {
      try {
        const success = await deletePersonalization(personalizationId);
        return {
          success,
        };
      } catch (error) {
        console.error('Error deleting personalization:', error);
        return {
          success: false,
          error: 'Failed to delete personalization',
        };
      }
    },
  }),
};
