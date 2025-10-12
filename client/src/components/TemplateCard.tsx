import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface TemplateCardProps {
  id: string;
  name: string;
  category: string;
  thumbnailUrl?: string;
  gradient?: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function TemplateCard({
  id,
  name,
  category,
  thumbnailUrl,
  gradient,
  isSelected = false,
  onClick,
}: TemplateCardProps) {
  const getGradient = () => {
    if (gradient) return gradient;
    
    const gradients: Record<string, string> = {
      "Blue Gradient": "bg-gradient-to-br from-blue-500 to-blue-700",
      "White Studio": "bg-white",
      "Wooden Table": "bg-gradient-to-br from-amber-700 to-amber-900",
      "Pink Pastel": "bg-gradient-to-br from-pink-300 to-pink-400",
      "Black Premium": "bg-gradient-to-br from-gray-900 to-black",
      "Gray Concrete": "bg-gradient-to-br from-gray-500 to-gray-700",
      "Green Nature": "bg-gradient-to-br from-green-600 to-green-800",
      "Purple Vibrant": "bg-gradient-to-br from-purple-500 to-purple-700",
      "Marble Surface": "bg-gradient-to-br from-gray-200 to-gray-400",
      "Sunset Gradient": "bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600",
      "Clean White": "bg-white border border-border",
      "Dark Wood": "bg-gradient-to-br from-amber-900 to-stone-900",
      "Ocean Blue": "bg-gradient-to-br from-cyan-500 to-blue-600",
      "Sand Texture": "bg-gradient-to-br from-amber-200 to-amber-400",
      "Modern Gray": "bg-gradient-to-br from-slate-400 to-slate-600",
      "Rose Gold": "bg-gradient-to-br from-rose-300 to-amber-400",
      "Forest Green": "bg-gradient-to-br from-emerald-700 to-green-900",
      "Sky Blue": "bg-gradient-to-br from-sky-300 to-sky-500",
      "Premium Dark Fabric": "bg-gradient-to-br from-slate-900 to-slate-800",
    };
    
    return gradients[name] || "bg-gradient-to-br from-primary/20 to-muted";
  };

  return (
    <Card
      className={`overflow-hidden cursor-pointer transition-all duration-200 hover-elevate active-elevate-2 ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onClick}
      data-testid={`card-template-${id}`}
    >
      <div className="aspect-[4/3] relative overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full ${getGradient()} flex items-center justify-center`}>
            <div className="text-4xl font-mono text-white/20">
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
