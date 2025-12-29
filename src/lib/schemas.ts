import { z } from "zod";

export const oltSchema = z.object({
    name: z.string().min(1, "Name is required"),
    host: z.string().min(1, "Host is required"),
    port: z.string()
        .transform((val) => parseInt(val, 10))
        .pipe(z.number().min(1).max(65535))
        .or(z.number()),
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
    type: z.string().default("ZTE"),
});

export type OltFormValues = z.infer<typeof oltSchema>;
