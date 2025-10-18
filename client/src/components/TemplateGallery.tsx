import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import TemplateCard from "./TemplateCard";

interface Template {
  id: string;
  name: string;
  category: string;
  thumbnailUrl?: string;
}

interface TemplateGalleryProps {
  templates: Template[];
  selectedTemplateId?: string;
  onTemplateSelect?: (id: string) => void;
}

export default function TemplateGallery({
  templates,
  selectedTemplateId,
  onTemplateSelect,
}: TemplateGalleryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(templates.map((t) => t.category)));

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = (template.name || '')
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      !activeCategory || template.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6" data-testid="component-template-gallery">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search templates..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-templates"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge
          variant={activeCategory === null ? "default" : "outline"}
          className="cursor-pointer hover-elevate active-elevate-2"
          onClick={() => setActiveCategory(null)}
          data-testid="filter-all"
        >
          All
        </Badge>
        {categories.map((category) => (
          <Badge
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            className="cursor-pointer hover-elevate active-elevate-2"
            onClick={() => setActiveCategory(category)}
            data-testid={`filter-${category.toLowerCase()}`}
          >
            {category}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            {...template}
            isSelected={selectedTemplateId === template.id}
            onClick={() => onTemplateSelect?.(template.id)}
          />
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No templates found</p>
        </div>
      )}
    </div>
  );
}
