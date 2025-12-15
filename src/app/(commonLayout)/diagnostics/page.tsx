import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Activity,
  Bone,
  Brain,
  FileText,
  Heart,
  Microscope,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-static";

const DiagnosticsPage = () => {
  const services = [
    {
      icon: Activity,
      title: "Blood Tests",
      description: "Complete blood count, lipid profile, diabetes screening",
      tests: "50+ tests available",
    },
    {
      icon: Heart,
      title: "Cardiac Tests",
      description: "ECG, Echo, stress tests, and cardiac markers",
      tests: "15+ tests available",
    },
    {
      icon: Brain,
      title: "Imaging",
      description: "X-Ray, MRI, CT Scan, Ultrasound",
      tests: "20+ tests available",
    },
    {
      icon: Microscope,
      title: "Pathology",
      description: "Urine, stool, culture tests, and biopsies",
      tests: "40+ tests available",
    },
    {
      icon: Bone,
      title: "Radiology",
      description: "Bone density, mammography, specialized imaging",
      tests: "10+ tests available",
    },
    {
      icon: FileText,
      title: "Health Packages",
      description: "Comprehensive health checkup packages",
      tests: "8+ packages",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <Badge className="mb-4" variant="outline">
          Coming Soon
        </Badge>
        <h1 className="text-4xl font-bold text-primary mb-4">
          Diagnostic Services
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Book diagnostic tests online and get reports delivered digitally.
          Trusted labs, accurate results.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">{service.tests}</Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-primary/5 border-primary/20 mb-12">
        <CardContent className="p-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Why Choose Our Diagnostic Services?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-3">
                <div className="shrink-0 w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Accredited Labs</h3>
                  <p className="text-sm text-muted-foreground">
                    Partner labs certified by national and international bodies
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="shrink-0 w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Home Sample Collection</h3>
                  <p className="text-sm text-muted-foreground">
                    Trained phlebotomists collect samples from your home
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="shrink-0 w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Digital Reports</h3>
                  <p className="text-sm text-muted-foreground">
                    Access your reports online anytime, anywhere
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="shrink-0 w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Affordable Pricing</h3>
                  <p className="text-sm text-muted-foreground">
                    Competitive rates with package discounts
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Card className="inline-block">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              We are partnering with top diagnostic labs to bring you the best
              testing services. Stay tuned!
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

export default DiagnosticsPage;
