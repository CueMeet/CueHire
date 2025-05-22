import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import PrivateRoutes from "./routes/PrivateRoutes";
import PublicRoutes from "./routes/PublicRoutes";

// Private Pages
import Index from "./pages/private/Index";
import Jobs from "./pages/private/Jobs";
import Profile from "./pages/private/Profile";
import Candidates from "./pages/private/Candidates";
import ConfigureAI from "./pages/private/ConfigureAI";
import ScheduleInterview from "./pages/private/ScheduleInterview";
import OrganizationOnboardingPage from "./pages/private/OrganizationOnboarding";
import Team from "./pages/private/Team";

// Public Pages
import LoginPage from "./pages/public/Login";
import NotFound from "./pages/public/NotFound";
import AuthCallback from "./components/Auth/AuthCallback";

import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './graphql';

const router = createBrowserRouter([
  {
    element: <PublicRoutes />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/google/callback", element: <AuthCallback /> },
    ],
  },
  {
    element: <PrivateRoutes />,
    children: [
      { path: "/", element: <Index /> },
      { path: "/dashboard", element: <Index /> },
      { path: "/jobs", element: <Jobs /> },
      { path: "/profile", element: <Profile /> },
      { path: "/candidates/:id", element: <Candidates /> },
      { path: "/schedule-interview", element: <ScheduleInterview /> },
      { path: "/organization-onboarding", element: <OrganizationOnboardingPage /> },
      { path: "/team", element: <Team /> },
    ],
  },
  { path: "*", element: <NotFound /> },
], {
  future: {
    v7_startTransition: true,
  },
});

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <TooltipProvider>
      <ApolloProvider client={apolloClient}>
        <Sonner />
        <RouterProvider router={router} />
      </ApolloProvider>
    </TooltipProvider>
  </ThemeProvider>
);

export default App;
