import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardContent } from "../../components/ui/Card";
import { ArrowLeft } from "lucide-react";
import { useToast } from "../../components/ui/Toast";
import api from "../../lib/api";

export function ClinicRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    clinicName: "",
    email: "",
    phoneNumber: "",
    address: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/auth/clinic/register', formData);
      if (res.data.success) {
        toast({
          title: "Registration Successful",
          description: "Your clinic has been registered. Please log in.",
          type: "success"
        });
        navigate('/clinic/login');
      }
    } catch (error: any) {
      let errorMessage = "Registration failed";
      if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors[0].msg;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast({ title: "Error", description: errorMessage, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Link 
        to="/" 
        className="inline-flex items-center text-sm font-medium text-text-secondary hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border rounded-sm"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to options
      </Link>

      <div className="space-y-2">
        <h2 className="text-3xl font-semibold tracking-tight text-white">
          Register Clinic
        </h2>
        <p className="text-text-secondary">
          Join CareFlow and transform your practice
        </p>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="First name" 
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Dr. Jane"
                required 
              />
              <Input 
                label="Last name" 
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                required 
              />
            </div>
            <Input 
              label="Clinic Name" 
              name="clinicName"
              value={formData.clinicName}
              onChange={handleChange}
              placeholder="CareFlow Medical Center"
              required 
            />
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Work Email" 
                name="email"
                type="email" 
                value={formData.email}
                onChange={handleChange}
                placeholder="jane@clinic.com"
                required 
              />
              <Input 
                label="Phone Number" 
                name="phoneNumber"
                type="tel" 
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                required 
              />
            </div>
            <Input 
              label="Address" 
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Medical Way, Health City"
              required 
            />
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Password" 
                name="password"
                type="password" 
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required 
              />
              <Input 
                label="Confirm Password" 
                name="confirmPassword"
                type="password" 
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required 
              />
            </div>
            <div className="pt-2">
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Create Account
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <p className="text-center text-sm text-text-secondary">
        Already registered?{" "}
        <Link to="/clinic/login" className="font-medium text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border rounded-sm">
          Sign in here
        </Link>
      </p>
    </div>
  );
}
