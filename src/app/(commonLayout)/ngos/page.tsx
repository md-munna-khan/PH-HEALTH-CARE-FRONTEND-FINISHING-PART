import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Award, Building2, Globe, HandHeart, Heart, Users } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-static";

const NGOsPage = () => {
  const ngoCategories = [
    {
      icon: Heart,
      title: "Health & Wellness",
      description:
        "Organizations providing free medical camps and health education",
      count: "25+ NGOs",
    },
    {
      icon: HandHeart,
      title: "Patient Support",
      description: "Financial aid and support for critical patients",
      count: "15+ NGOs",
    },
    {
      icon: Users,
      title: "Community Health",
      description: "Grassroots healthcare initiatives in underserved areas",
      count: "30+ NGOs",
    },
    {
      icon: Building2,
      title: "Medical Facilities",
      description: "Free clinics and community hospitals",
      count: "20+ Organizations",
    },
    {
      icon: Award,
      title: "Medical Research",
      description: "Organizations funding medical research and innovation",
      count: "10+ Institutions",
    },
    {
      icon: Globe,
      title: "International Aid",
      description: "Global health organizations working in Bangladesh",
      count: "12+ NGOs",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <Badge className="mb-4" variant="outline">
          Coming Soon
        </Badge>
        <h1 className="text-4xl font-bold text-primary mb-4">
          Healthcare NGOs & Organizations
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Connect with healthcare NGOs providing free or subsidized medical
          services. Making healthcare accessible for everyone.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {ngoCategories.map((category, index) => {
          const Icon = category.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">{category.count}</Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-primary/5 border-primary/20 mb-12">
        <CardContent className="p-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">
              How NGO Network Helps
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-3">
                <div className="shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Find Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Search for NGOs based on your medical needs and location
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Get Assistance</h3>
                  <p className="text-sm text-muted-foreground">
                    Access free or subsidized healthcare services
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Community Programs</h3>
                  <p className="text-sm text-muted-foreground">
                    Participate in health camps and awareness programs
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Make a Difference</h3>
                  <p className="text-sm text-muted-foreground">
                    Volunteer or donate to support healthcare initiatives
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-linear-to-br from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Partner With Us</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Are you a healthcare NGO? Register your organization to reach more
            people in need and make a bigger impact.
          </p>
          <Button size="lg" variant="outline">
            Register Your NGO
          </Button>
        </CardContent>
      </Card>

      <div className="mt-12 text-center">
        <Card className="inline-block">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              We are building a comprehensive directory of healthcare NGOs to
              connect those in need with available resources.
            </p>
            <Link href="/">
              <Button size="lg">Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NGOsPage;
