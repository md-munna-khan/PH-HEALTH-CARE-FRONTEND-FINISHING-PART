"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createReview } from "@/services/patient/reviews.services";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface ReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  doctorName: string;
}

export default function ReviewDialog({
  isOpen,
  onClose,
  appointmentId,
  doctorName,
}: ReviewDialogProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (comment.trim().length < 10) {
      toast.error("Comment must be at least 10 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createReview({
        appointmentId,
        rating,
        comment: comment.trim(),
      });

      if (result.success) {
        toast.success("Review submitted successfully!");
        onClose();
        router.refresh();
      } else {
        toast.error(result.message || "Failed to submit review");
      }
    } catch (error) {
      toast.error("An error occurred while submitting review");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setHoveredRating(0);
      setComment("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              Share your experience with Dr. {doctorName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Rating */}
            <div className="space-y-2">
              <Label htmlFor="rating">Rating *</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoveredRating || rating)
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-sm font-medium">
                    {rating}/5 -{" "}
                    {rating === 1
                      ? "Poor"
                      : rating === 2
                      ? "Fair"
                      : rating === 3
                      ? "Good"
                      : rating === 4
                      ? "Very Good"
                      : "Excellent"}
                  </span>
                )}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label htmlFor="comment">Comment * (minimum 10 characters)</Label>
              <Textarea
                id="comment"
                placeholder="Share your experience with this doctor..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                disabled={isSubmitting}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {comment.length} characters
              </p>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Reviews cannot be edited or deleted once
                submitted. Please ensure your feedback is accurate.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
