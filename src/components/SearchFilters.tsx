import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Filter, X } from "lucide-react";
import { useState } from "react";

interface SearchFiltersProps {
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: string) => void;
  selectedCategory: string;
  selectedSort: string;
}

export default function SearchFilters({
  onCategoryChange,
  onSortChange,
  selectedCategory,
  selectedSort,
}: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "furniture", label: "Furniture" },
    { value: "electronics", label: "Electronics" },
    { value: "clothing", label: "Clothing" },
    { value: "books", label: "Books" },
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
  ];

  const clearFilters = () => {
    onCategoryChange("");
    onSortChange("newest");
  };

  const hasActiveFilters = selectedCategory !== "" || selectedSort !== "newest";

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-4 mb-6"
    >
      <div className="flex items-center justify-between mb-4 lg:mb-0">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-white" />
          <span className="font-medium text-white">Filters</span>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden text-white hover:bg-white/10"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${isOpen ? "block" : "hidden lg:grid"}`}>
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Category
          </label>
          <Select
            value={selectedCategory === "" ? "all" : selectedCategory}
            onValueChange={(val) => onCategoryChange(val === "all" ? "" : val)}
          >
            <SelectTrigger className="glass border-white/30 text-white">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="glass-strong border-white/30">
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Sort by
          </label>
          <Select value={selectedSort} onValueChange={onSortChange}>
            <SelectTrigger className="glass border-white/30 text-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="glass-strong border-white/30">
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </motion.div>
  );
}