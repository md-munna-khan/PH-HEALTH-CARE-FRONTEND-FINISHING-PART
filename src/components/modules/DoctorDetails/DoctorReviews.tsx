"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getReviews } from "@/services/patient/reviews.services";
import { format } from "date-fns";
import { Star, User } from "lucide-react";
import { useEffect, useState } from "react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  patient?: {
    name: string;
    profilePhoto?: string;
  };
}

interface DoctorReviewsProps {
  doctorId: string;
}

export default function DoctorReviews({ doctorId }: DoctorReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        const response = await getReviews(`?doctorId=${doctorId}&limit=10`);

        if (response.success && response.data) {
          setReviews(response.data);

          // Calculate stats
          if (response.data.length > 0) {
            const total = response.data.reduce(
              (sum: number, review: Review) => sum + review.rating,
              0
            );
            setStats({
              averageRating: total / response.data.length,
              totalReviews: response.data.length,
            });
          }
        }
      } catch (error) {
        console.error("Error loading reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [doctorId]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Patient Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading reviews...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Patient Reviews</CardTitle>
          {stats.totalReviews > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {renderStars(Math.round(stats.averageRating))}
              </div>
              <span className="font-semibold">
                {stats.averageRating.toFixed(1)}
              </span>
              <Badge variant="secondary">{stats.totalReviews} reviews</Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No reviews yet. Be the first to review this doctor!
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border-b last:border-0 pb-4 last:pb-0"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    {review.patient?.profilePhoto ? (
                      <AvatarImage
                        src={review.patient.profilePhoto}
                        alt={review.patient.name}
                      />
                    ) : (
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {review.patient?.name || "Anonymous"}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(review.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
