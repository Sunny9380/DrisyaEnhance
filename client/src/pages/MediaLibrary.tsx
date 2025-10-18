import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Heart, Search, Trash2, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MediaItem {
  id: string;
  fileName: string;
  processedUrl: string;
  thumbnailUrl?: string;
  fileSize?: number;
  dimensions?: string;
  templateUsed?: string;
  tags?: string[];
  isFavorite: boolean;
  createdAt: string;
}

export default function MediaLibrary() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "name">("date");

  const { data, isLoading } = useQuery<{ media: MediaItem[] }>({
    queryKey: ["/api/media-library"],
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      return apiRequest("/api/media-library/favorite/" + id, {
        method: "POST",
        body: JSON.stringify({ isFavorite }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media-library"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("/api/media-library/" + id, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media-library"] });
      toast({
        title: "Deleted",
        description: "Image removed from library",
      });
    },
  });

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredMedia = data?.media?.filter((item) => {
    const matchesSearch = (item.fileName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.templateUsed || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorite = !filterFavorites || item.isFavorite;
    return matchesSearch && matchesFavorite;
  }).sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return a.fileName.localeCompare(b.fileName);
  }) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Media Library</h1>
          <p className="text-muted-foreground">
            View and manage all your processed images
          </p>
        </div>

        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by filename or template..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={filterFavorites ? "default" : "outline"}
              size="default"
              onClick={() => setFilterFavorites(!filterFavorites)}
              data-testid="button-filter-favorites"
            >
              <Heart className={`h-4 w-4 mr-2 ${filterFavorites ? "fill-current" : ""}`} />
              Favorites
            </Button>

            <Select value={sortBy} onValueChange={(value: "date" | "name") => setSortBy(value)}>
              <SelectTrigger className="w-32" data-testid="select-sort">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Recent</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredMedia.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <p className="text-lg text-muted-foreground mb-2">No images found</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery || filterFavorites
                  ? "Try adjusting your filters"
                  : "Process some images to see them here"}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMedia.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden group hover-elevate"
                data-testid={`card-media-${item.id}`}
              >
                <div className="relative aspect-square bg-muted">
                  <img
                    src={item.processedUrl}
                    alt={item.fileName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    data-testid={`img-media-${item.id}`}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                      onClick={() => handleDownload(item.processedUrl, item.fileName)}
                      data-testid={`button-download-${item.id}`}
                    >
                      <Download className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                      onClick={() =>
                        toggleFavoriteMutation.mutate({
                          id: item.id,
                          isFavorite: !item.isFavorite,
                        })
                      }
                      data-testid={`button-favorite-${item.id}`}
                    >
                      <Heart
                        className={`h-5 w-5 ${item.isFavorite ? "fill-current text-red-500" : ""}`}
                      />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                      onClick={() => deleteMutation.mutate(item.id)}
                      data-testid={`button-delete-${item.id}`}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-3">
                  <p className="font-medium text-sm truncate mb-1" title={item.fileName}>
                    {item.fileName}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    {item.templateUsed && (
                      <Badge variant="secondary" className="text-xs">
                        {item.templateUsed}
                      </Badge>
                    )}
                    {item.dimensions && (
                      <span className="text-xs text-muted-foreground">
                        {item.dimensions}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Total: {filteredMedia.length} image{filteredMedia.length !== 1 ? "s" : ""}
            {filterFavorites && " (favorites)"}
          </p>
        </div>
      </div>
    </div>
  );
}
