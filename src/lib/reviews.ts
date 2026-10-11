import { payloadGet } from "@/lib/payload";

export type Review = {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type ApiReviews = { docs: Review[] };

export type ReviewSummary = { reviews: Review[]; average: number; count: number };

// Public read access on the admin only returns approved reviews.
export async function getReviews(productDocId: string): Promise<ReviewSummary> {
  // revalidate 0: không cache, để review vừa được duyệt hiện ngay.
  const data = await payloadGet<ApiReviews>(
    `/reviews?limit=100&depth=0&sort=-createdAt&where[product][equals]=${encodeURIComponent(productDocId)}&where[status][equals]=approved`,
    0,
  );
  const reviews = data?.docs ?? [];
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return {
    reviews,
    count: reviews.length,
    average: reviews.length > 0 ? Math.round((total / reviews.length) * 10) / 10 : 0,
  };
}
