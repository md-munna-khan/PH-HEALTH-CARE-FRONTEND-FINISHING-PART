import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Shield, Users, Zap } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-static";

const HealthPlansPage = () => {
  const plans = [
    {
      name: "Basic Plan",
      price: "৳499",
      period: "/month",
      description: "Perfect for individuals seeking basic healthcare coverage",
      features: [
        "2 Doctor Consultations per month",
        "Basic Health Checkup",
        "Prescription Management",
        "Health Records Access",
        "Email Support",
      ],
      popular: false,
    },
    {
      name: "Family Plan",
      price: "৳1,499",
      period: "/month",
      description: "Comprehensive coverage for your entire family",
      features: [
        "Unlimited Doctor Consultations",
        "Annual Health Checkup for 4 members",
        "Priority Appointment Booking",
        "Specialist Consultations",
        "24/7 Phone Support",
        "Medicine Discounts up to 20%",
        "Diagnostic Test Discounts",
      ],
      popular: true,
    },
    {
      name: "Premium Plan",
      price: "৳2,999",
      period: "/month",
      description: "Ultimate healthcare with VIP benefits",
      features: [
        "Unlimited Consultations (All specialties)",
        "Comprehensive Annual Checkup",
        "Home Visit Services",
        "Emergency Consultation 24/7",
        "Dedicated Health Manager",
        "Medicine Discounts up to 30%",
        "Free Diagnostic Tests (Monthly quota)",
        "Mental Health Support",
      ],
      popular: false,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Health Plans & Packages
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose a health plan that fits your needs. All plans include access to
          our network of qualified healthcare professionals.
        </p>
      </div>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          {
            icon: Shield,
            title: "Comprehensive Coverage",
            desc: "Wide range of medical services",
          },
          { icon: Users, title: "Family Plans", desc: "Cover your loved ones" },
          {
            icon: Zap,
            title: "Quick Access",
            desc: "Fast appointment booking",
          },
          {
            icon: CheckCircle,
            title: "Quality Care",
            desc: "Verified healthcare professionals",
          },
        ].map((benefit, idx) => {
          const Icon = benefit.icon;
          return (
            <Card key={idx} className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {plans.map((plan, index) => (
          <Card
            key={index}
            className={`relative ${
              plan.popular ? "border-primary shadow-lg" : ""
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              </div>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-primary">
                  {plan.price}
                </span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/login" className="block">
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                >
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Need a Custom Plan?</h2>
          <p className="text-muted-foreground mb-6">
            Contact us to create a healthcare plan tailored to your specific
            needs
          </p>
          <Button size="lg" variant="outline">
            Contact Sales
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthPlansPage;
