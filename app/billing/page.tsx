"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  CreditCard,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/auth-context";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { Globe, Code, Layers, Wrench, Shield, Cloud, Headphones, Rocket, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Premium benefits data
const premiumBenefits = [
  { icon: Globe, title: "Unlimited generations", description: "Generate code without limits" },
  { icon: Code, title: "Unlimited code generation", description: "Create as much code as you need" },
  { icon: Layers, title: "Mermaid architecture diagrams", description: "Visualize your system architecture" },
  { icon: Wrench, title: "Explanations for debugging", description: "Get help fixing your code" },
  { icon: Wrench, title: "Code optimization", description: "Improve your code performance" },
  { icon: Shield, title: "Automated testing", description: "Generate test suites automatically" },
  { icon: Cloud, title: "Full API integrations", description: "Connect with GitHub, Swagger, Firebase" },
  { icon: Headphones, title: "Priority support", description: "Get faster help from our team" },
  { icon: Rocket, title: "Early access to new features", description: "Try new tools before everyone else" },
  { icon: BarChart3, title: "Advanced analytics", description: "Track your coding performance" },
];

export default function Billing() {
  const router = useRouter();
  const { user } = useAuth();
  const { requireAuth } = useRequireAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate days left in trial if applicable
  const daysLeftInTrial = user?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 14;

  const handleSubscribe = async () => {
    if (requireAuth("Billing")) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsSubscribed(true);
        setIsLoading(false);
      }, 1500);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Billing</h1>
            <p className="text-muted-foreground">Manage your subscription and payment methods</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
            Back
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Free Trial</CardTitle>
              <CardDescription>
                14-day free trial with unlimited features (no token usage limit during trial).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Trial period</span>
                  <span>14 days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Days remaining</span>
                  <span>{daysLeftInTrial} days</span>
                </div>
                <Progress
                  value={Math.round(((14 - daysLeftInTrial) / 14) * 100)}
                  className="h-2"
                  max={100}
                />
                <div className="pt-2">
                  <h4 className="font-medium mb-2">Features included:</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      Unlimited generations
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      Unlimited code generation
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      Mermaid architecture diagrams
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      AI-powered debugging
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Premium Plan</CardTitle>
              <CardDescription>
                Unlock all features with our premium subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">$15</div>
                  <div className="text-muted-foreground">per month</div>
                </div>

                <div className="space-y-3">
                  {premiumBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-start">
                      <benefit.icon className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                      <div>
                        <div className="font-medium">{benefit.title}</div>
                        <div className="text-sm text-muted-foreground">{benefit.description}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full ${isSubscribed ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-primary/90'}`}
                  onClick={handleSubscribe}
                  disabled={isSubscribed || isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Processing...
                    </>
                  ) : isSubscribed ? (
                    <>
                      <Check className="mr-2 h-4 w-4" /> Premium active – enjoy benefits!
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" /> Pay $15/month
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {isSubscribed && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Check className="mr-2 h-5 w-5 text-green-500" />
                Welcome to Premium!
              </CardTitle>
              <CardDescription>
                You now have access to all premium features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {premiumBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-start p-3 border rounded-lg">
                    <benefit.icon className="mr-2 h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium">{benefit.title}</div>
                      <div className="text-sm text-muted-foreground">{benefit.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>
              Securely manage your payment information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input id="card-number" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card-name">Name on Card</Label>
                  <Input id="card-name" placeholder="John Doe" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input id="expiry" placeholder="MM/YY" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input id="cvv" placeholder="123" />
                </div>
              </div>
              <Button className="w-full">
                <CreditCard className="mr-2 h-4 w-4" />
                Save Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
