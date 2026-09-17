import { notFound } from "next/navigation";
import { getPropertyByGuestToken } from "@/config/properties";
import { GALLERY_GROUPS } from "@/lib/gallery/rooms";
import { getPhotoUrls, getGroupPhotoUrls } from "@/lib/gallery/photos";
import { GalleryView } from "@/components/guest/gallery/GalleryView";

export default async function GalleryPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ group?: string; room?: string }>;
}) {
  const { token } = await params;
  const { group, room } = await searchParams;
  const property = getPropertyByGuestToken(token);
  if (!property) notFound();

  const groups = GALLERY_GROUPS[property.slug];
  const matchedGroup = groups.find((g) => g.gallerySlug === group) ?? groups[0];

  // Nessuna camera specificata: galleria cumulativa con tutte le foto del
  // gruppo insieme (es. tutte le foto di "MiPA — Appartamenti").
  if (!room) {
    const photos = getGroupPhotoUrls(matchedGroup.gallerySlug);
    return <GalleryView title={matchedGroup.label} photos={photos} />;
  }

  const matchedRoom = matchedGroup.rooms.find((r) => r.id === room) ?? matchedGroup.rooms[0];
  const photos = getPhotoUrls(matchedGroup.gallerySlug, matchedRoom.id);

  return <GalleryView title={matchedRoom.label} photos={photos} />;
}
