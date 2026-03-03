"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const emailSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Please enter a valid email address"),
});

type EmailFormValues = z.infer<typeof emailSchema>;

interface EmailFormProps {
    onSubmit: (email: string) => Promise<boolean>;
    isLoading?: boolean;
    title?: string;
    description?: string;
    submitLabel?: string;
    className?: string;
}

export function EmailForm({
    onSubmit,
    isLoading = false,
    title = "Welcome back",
    description = "Enter your email to sign in to your account",
    submitLabel = "Continue",
    className,
}: EmailFormProps) {
    const [submitted, setSubmitted] = useState(false);

    const form = useForm<EmailFormValues>({
        resolver: zodResolver(emailSchema),
        defaultValues: {
            email: "",
        },
    });

    const handleSubmit = async (values: EmailFormValues) => {
        const success = await onSubmit(values.email);
        if (success) {
            setSubmitted(true);
        }
    };

    if (submitted) {
        return (
            <Card className={cn("border-0 shadow-none", className)}>
                <CardHeader className="space-y-1 text-center pb-4">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                        <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Check your email</CardTitle>
                    <CardDescription className="text-base">
                        We sent a verification code to{" "}
                        <span className="font-medium text-foreground">
                            {form.getValues("email")}
                        </span>
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className={cn("border-0 shadow-none", className)}>
            <CardHeader className="space-y-1 text-center pb-4">
                <CardTitle className="text-xl">{title}</CardTitle>
                <CardDescription className="text-base">{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="sr-only">Email</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="email"
                                                placeholder="name@example.com"
                                                autoComplete="email"
                                                autoFocus
                                                disabled={isLoading}
                                                className="pl-10 h-11"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            className="w-full h-11"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    {submitLabel}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
