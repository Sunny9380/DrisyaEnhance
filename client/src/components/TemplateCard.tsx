import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface TemplateCardProps {
  id: string;
  name: string;
  category: string;
  thumbnailUrl?: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function TemplateCard({
  id,
  name,
  category,
  thumbnailUrl,
  isSelected = false,
  onClick,
}: TemplateCardProps) {
  return (
    <Card
      className={`overflow-hidden cursor-pointer transition-all duration-200 hover-elevate active-elevate-2 ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onClick}
      data-testid={`card-template-${id}`}
    >
      <div className="aspect-[4/3] bg-muted relative overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-muted flex items-center justify-center">
            <div className="text-4xl font-mono text-muted-foreground/30">
              {name.charAt(0)}
            </div>
          </div>
        )}
        {isSelected && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
            <Check className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm truncate" data-testid={`text-template-name-${id}`}>
          {name}
        </h3>
        <Badge variant="secondary" className="mt-1 text-xs">
          {category}
        </Badge>
      </div>
    </Card>
  );
}
