import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { PortfolioItem } from "@/lib/data";
import { cn } from "@/lib/utils";

export function PortfolioGrid({
  items,
  categories,
  showFilter = true,
}: {
  items: PortfolioItem[];
  categories: { id: string; name: string }[];
  showFilter?: boolean;
}) {
  const [cat, setCat] = useState<string | null>(null);
  const [open, setOpen] = useState<PortfolioItem | null>(null);
  const filtered = cat ? items.filter((i) => i.category_id === cat) : items;

  return (
    <div>
      {showFilter && categories.length > 0 && (
        <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <button
            onClick={() => setCat(null)}
            className={cn(
              "shrink-0 rounded-full border border-border px-4 py-1.5 text-xs tracking-luxe text-muted-foreground",
              !cat && "border-transparent bg-primary text-primary-foreground",
            )}
          >
            Todos
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={cn(
                "shrink-0 rounded-full border border-border px-4 py-1.5 text-xs tracking-luxe text-muted-foreground",
                cat === c.id && "border-transparent bg-primary text-primary-foreground",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        {filtered.map((item) => (
          <button
            key={item.id}
            onClick={() => setOpen(item)}
            className="group relative aspect-square overflow-hidden rounded-2xl bg-muted"
          >
            <img
              src={item.image_url}
              alt={item.title || "Trabalho do studio"}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Nenhuma foto nesta categoria ainda.
        </p>
      )}

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-lg overflow-hidden p-0">
          {open && (
            <div>
              <img src={open.image_url} alt={open.title} className="w-full object-cover" />
              <div className="p-5">
                <h3 className="font-display text-xl">{open.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{open.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
