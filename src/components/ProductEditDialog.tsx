import { useEffect, useMemo, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

type ProductEditDialogProps = {
  productId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export default function ProductEditDialog({
  productId,
  open,
  onOpenChange,
  onSuccess,
}: ProductEditDialogProps) {
  const enabled = useMemo(() => !!productId && open, [productId, open]);
  const product = useQuery(
    api.products.getById,
    enabled ? ({ id: productId as any }) : (undefined as any)
  );
  const updateProduct = useMutation(api.products.update);
  const getUploadUrl = useAction(api.files.createUploadUrl);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [category, setCategory] = useState<"furniture" | "electronics" | "clothing" | "books">("furniture");
  const [condition, setCondition] = useState<"new" | "used">("used");
  const [imageUrl, setImageUrl] = useState("");
  const [imageStorageId, setImageStorageId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Populate form when product loads
  useEffect(() => {
    if (!product) return;
    if (product === undefined) return; // still loading
    setTitle(product.title || "");
    setDescription(product.description || "");
    setPrice(String(product.price ?? ""));
    setCategory(product.category as any);
    setCondition(product.condition as any);
    setImageUrl(product.imageUrl || "");
    setImageStorageId(null);
    setPreviewUrl(null);
    setCity(product.city || "");
  }, [product]);

  // Add: handle file upload to Convex storage
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const { url } = await getUploadUrl({});
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) throw new Error("Upload failed");
      const json = await res.json();
      const sid = json.storageId as string;
      setImageStorageId(sid);
      setPreviewUrl(URL.createObjectURL(file));
      // Clear manual URL when storage image selected
      setImageUrl("");
      toast.success("Image uploaded");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!productId) return;
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    const priceNum = Number(price);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      toast.error("Please enter a valid price greater than 0");
      return;
    }

    try {
      setLoading(true);
      await updateProduct({
        id: productId as any,
        title: title.trim(),
        description: description.trim() || undefined,
        price: priceNum,
        category,
        condition,
        // Prefer storage image if present
        imageUrl: imageStorageId ? undefined : (imageUrl.trim() || undefined),
        imageStorageId: imageStorageId as any || undefined,
        city: city.trim() || undefined,
      });
      toast.success("Listing updated!");
      onOpenChange(false);
      onSuccess?.();
    } catch (e: any) {
      toast.error(e?.message || "Failed to update listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !loading && onOpenChange(o)}>
      <DialogContent className="glass-strong border-white/30 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white text-shadow">Edit Listing</DialogTitle>
          <DialogDescription className="text-white/80">
            Update your item details and save changes.
          </DialogDescription>
        </DialogHeader>

        {product === undefined ? (
          <div className="p-8 text-center text-white/80">Loading...</div>
        ) : product === null ? (
          <div className="p-8 text-center text-white/80">Product not found.</div>
        ) : (
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <label className="text-sm text-white/80">Title *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Modern Office Chair"
                className="glass border-white/30 text-white placeholder:text-white/70"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-white/80">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details about the item, condition, and any notes"
                className="glass border-white/30 text-white placeholder:text-white/70 min-h-28"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm text-white/80">Price (USD) *</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="glass border-white/30 text-white placeholder:text-white/70"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm text-white/80">Condition *</label>
                <Select value={condition} onValueChange={(v: "new" | "used") => setCondition(v)}>
                  <SelectTrigger className="glass border-white/30 text-white">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-white/30">
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm text-white/80">Category *</label>
                <Select
                  value={category}
                  onValueChange={(v: "furniture" | "electronics" | "clothing" | "books") => setCategory(v)}
                >
                  <SelectTrigger className="glass border-white/30 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-white/30">
                    <SelectItem value="furniture">Furniture</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="books">Books</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm text-white/80">City</label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Seattle"
                  className="glass border-white/30 text-white placeholder:text-white/70"
                />
              </div>
            </div>

            {/* Add: Image upload */}
            <div className="grid gap-2">
              <label className="text-sm text-white/80">Upload Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="text-white/80"
              />
              {(previewUrl || product.imageUrl) && (
                <div className="mt-2">
                  <img
                    src={previewUrl || product.imageUrl}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-md"
                  />
                </div>
              )}
              <p className="text-xs text-white/60">Or paste an image URL below.</p>
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-white/80">Image URL</label>
              <Input
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  if (e.target.value) setImageStorageId(null);
                }}
                placeholder="https://images.unsplash.com/..."
                className="glass border-white/30 text-white placeholder:text-white/70"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            className="glass border-white/30 text-white hover:bg-white/10"
            onClick={() => !loading && onOpenChange(false)}
            disabled={loading || uploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || product === null || product === undefined || uploading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}