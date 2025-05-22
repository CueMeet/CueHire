import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const LogIn = () => {
  const handleGoogleLogin = React.useCallback(() => {
    const url = import.meta.env.VITE_GOOGLE_AUTH_URL as string;
    window.location.href = url;
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4 shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">Welcome to CueHire</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Button 
              variant="outline" 
              onClick={handleGoogleLogin}
              className="w-full max-w-[280px] h-12 px-4 flex items-center justify-center gap-3 hover:bg-accent transition-colors"
            >
              <img 
                src="/svgs/google.svg" 
                alt="Google" 
                width={20} 
                height={20} 
                className="mr-2"
              />
              <span className="text-base font-medium">Continue with Google</span>
            </Button>
            <p className="text-xs text-muted-foreground text-center max-w-[280px]">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogIn;
