import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TemplateFavoritesProps {
  templateId: string;
  onToggleFavorite?: (templateId: string, isFavorite: boolean) => void;
  initialFavorite?: boolean;
}

export default function TemplateFavorites({
  templateId,
  onToggleFavorite,
  initialFavorite = false,
}: TemplateFavoritesProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);

  const handleToggle = () => {
    const newState = !isFavorite;
    setIsFavorite(newState);
    onToggleFavorite?.(templateId, newState);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute top-2 right-2 z-10"
      onClick={(e) => {
        e.stopPropagation();
        handleToggle();
      }}
      data-testid={`button-favorite-${templateId}`}
    >
      <Star
        className={`w-5 h-5 ${
          isFavorite
            ? "fill-chart-4 text-chart-4"
            : "text-muted-foreground"
        }`}
      />
    </Button>
  );
}
