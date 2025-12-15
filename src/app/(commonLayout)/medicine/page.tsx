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
  Clock,
  DollarSign,
  Pill,
  Shield,
  ShoppingCart,
  Truck,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-static";

const MedicinePage = () => {
  const features = [
    {
      icon: Pill,
      title: "Wide Selection",
      description: "Access to thousands of medicines and healthcare products",
    },
    {
      icon: DollarSign,
      title: "Best Prices",
      description: "Competitive pricing with regular discounts and offers",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Quick and reliable delivery to your doorstep",
    },
    {
      icon: Shield,
      title: "Genuine Products",
      description: "100% authentic medicines from licensed pharmacies",
    },
    {
      icon: Clock,
      title: "24/7 Service",
      description: "Order anytime, anywhere with our online platform",
    },
    {
      icon: ShoppingCart,
      title: "Easy Ordering",
      description: "Simple and secure online ordering process",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <Badge className="mb-4" variant="outline">
          Coming Soon
        </Badge>
        <h1 className="text-4xl font-bold text-primary mb-4">
          Online Medicine Store
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Order your prescribed medicines online and get them delivered to your
          home. Safe, convenient, and affordable.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index}>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <Card className="bg-linear-to-br from-primary/5 to-white border-primary/20">
        <CardContent className="p-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-bold text-xl">
                  1
                </div>
                <h3 className="font-semibold">Upload Prescription</h3>
                <p className="text-sm text-muted-foreground">
                  Upload your doctor&apos;s prescription or browse medicines
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-bold text-xl">
                  2
                </div>
                <h3 className="font-semibold">Place Order</h3>
                <p className="text-sm text-muted-foreground">
                  Add medicines to cart and complete your order
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-bold text-xl">
                  3
                </div>
                <h3 className="font-semibold">Get Delivered</h3>
                <p className="text-sm text-muted-foreground">
                  Receive your medicines at your doorstep
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-12 text-center">
        <Card className="inline-block">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              We are working hard to bring you the best online medicine ordering
              experience. Stay tuned!
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

export default MedicinePage;
