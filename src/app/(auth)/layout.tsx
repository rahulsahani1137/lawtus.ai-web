import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            {children}
            <Toaster position="top-center" richColors closeButton />
        </ThemeProvider>
    );
}
