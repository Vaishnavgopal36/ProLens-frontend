import { RouterProvider } from "react-router-dom";
import { AppProviders } from "@/app/providers";
import { router } from "@/app/routes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export function App() {
  return (
    <AppProviders>
      <TooltipProvider delayDuration={300}>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
      </TooltipProvider>
    </AppProviders>
  );
}

export default App;
