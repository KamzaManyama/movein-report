import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, X } from "lucide-react";
import { deletePhotos, getPhoto, savePhoto } from "@/db/inspection.repository";
import { optimiseImage, validateImageFile } from "@/services/image.service";
import { StorageError } from "@/db/indexed-db";
import { newId } from "@/utils/id";
import { btnSmall } from "@/components/layout/button-styles";

export function PhotoThumb({
  id,
  onRemove,
  size = "md",
}: {
  id: string;
  onRemove?: () => void;
  size?: "sm" | "md";
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    let u: string | null = null;
    let alive = true;
    getPhoto(id)
      .then((p) => {
        if (!alive) return;
        if (!p) return setMissing(true);
        u = URL.createObjectURL(p.blob);
        setUrl(u);
      })
      .catch(() => alive && setMissing(true));
    return () => {
      alive = false;
      if (u) URL.revokeObjectURL(u);
    };
  }, [id]);
  const dim = size === "sm" ? "size-16" : "size-28";
  return (
    <div className="space-y-2">
      <div className={`${dim} overflow-hidden rounded-lg border border-border bg-subtle`}>
        {url && <img src={url} alt="Inspection photo" className="size-full object-cover" />}
        {missing && (
          <span className="grid size-full place-items-center px-1 text-center text-xs text-muted-foreground">
            Unavailable
          </span>
        )}
      </div>
      {/* Its own full-width button below the photo: large enough to hit, hard to hit by accident. */}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove photo"
          className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-[var(--radius-btn)] border border-border text-sm font-medium hover:bg-surface active:bg-subtle"
        >
          <X className="size-4" aria-hidden /> Remove
        </button>
      )}
    </div>
  );
}

export function PhotoPicker({
  inspectionId,
  photoIds,
  onAdd,
  onRemove,
  label = "Photos",
}: {
  inspectionId: string;
  photoIds: string[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  label?: string;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    const list = Array.from(files);
    setBusy((n) => n + list.length);
    for (const file of list) {
      try {
        const invalid = validateImageFile(file);
        if (invalid) throw new Error(invalid);
        const { blob, width, height } = await optimiseImage(file);
        const id = newId();
        await savePhoto({
          id,
          inspectionId,
          blob,
          mimeType: blob.type,
          width,
          height,
          createdAt: new Date().toISOString(),
        });
        onAdd(id);
      } catch (e) {
        setError(
          e instanceof StorageError || e instanceof Error
            ? e.message
            : "This photo could not be added.",
        );
      } finally {
        setBusy((n) => n - 1);
      }
    }
  }

  async function remove(id: string) {
    onRemove(id);
    try {
      await deletePhotos([id]);
    } catch {
      /* the reference is gone; orphaned blob is cleaned up when the inspection is deleted */
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-[15px] font-medium">{label}</p>
      {photoIds.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {photoIds.map((id) => (
            <PhotoThumb key={id} id={id} onRemove={() => void remove(id)} />
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => cameraRef.current?.click()} className={btnSmall}>
          <Camera className="size-4" aria-hidden /> Take photo
        </button>
        <button type="button" onClick={() => galleryRef.current?.click()} className={btnSmall}>
          <ImagePlus className="size-4" aria-hidden /> Upload
        </button>
        {busy > 0 && (
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" aria-hidden /> Processing {busy}…
          </span>
        )}
      </div>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
