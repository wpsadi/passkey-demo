import { z } from 'zod';

export const emailSchema = z.string().email("Not an email address");