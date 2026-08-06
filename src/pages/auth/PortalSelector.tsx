import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { Divider } from "../../components/ui/Divider";
import { ArrowRight } from "lucide-react";
import { useGoogleLogin } from '@react-oauth/google';
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/ui/Toast";

export function PortalSelector() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleGoogleSuccess = async (tokenResponse: any) => {
    try {
      const credential = tokenResponse.access_token || tokenResponse.credential || 'mock_token';
      const res = await api.post('/auth/google', { credential });
      
      if (res.data.success) {
        login(res.data.user, res.data.token);
        toast({
          title: "Success",
          description: "Successfully logged in to Patient Portal",
          type: "success"
        });
        navigate('/patient/dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Authentication Failed",
        description: error.response?.data?.message || "Could not log in with Google",
        type: "error"
      });
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => {
      toast({
        title: "Error",
        description: "Google authentication failed",
        type: "error"
      });
    }
  });

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center lg:text-left">
        <h2 className="text-3xl font-semibold tracking-tight text-white">
          Welcome to CareFlow
        </h2>
        <p className="text-text-secondary">
          Select your portal to get started
        </p>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6 space-y-6">
          {/* Section 1 - Patient Portal */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-white">Patient Portal</h3>
              <p className="text-sm text-text-secondary">
                Access your healthcare journey securely.
              </p>
            </div>
            <Button 
              className="w-full justify-center" 
              onClick={() => loginWithGoogle()}
            >
              <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>
            <p className="text-center text-sm text-text-secondary">
              Already have an account?{" "}
              <Link to="/patient/login" className="font-medium text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border rounded-sm">
                Login
              </Link>
            </p>
          </div>

          <Divider />

          {/* Section 2 - Clinic / Hospital */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-white">Clinic / Hospital</h3>
              <p className="text-sm text-text-secondary">
                Register your clinic and manage patients with CareFlow.
              </p>
            </div>
            <Button 
              variant="secondary" 
              className="w-full justify-center group"
              onClick={() => navigate('/clinic/register')}
            >
              Register Clinic
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <p className="text-center text-sm text-text-secondary">
              Already registered?{" "}
              <Link to="/clinic/login" className="font-medium text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border rounded-sm">
                Clinic Login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
