import { EventDetailPageClient } from "./_components/EventDetailPageClient";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;

  return <EventDetailPageClient id={id} />;
}
