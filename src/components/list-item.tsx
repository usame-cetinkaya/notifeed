import { FeedDTO } from "@/lib/models";
import { Button } from "@/components/ui/button";
import { LoaderCircle, Trash } from "lucide-react";

interface ListItemProps {
  feed: FeedDTO;
  onDeleteClick: () => void;
  isDeleting: boolean;
}
export default function ListItem({
  feed,
  onDeleteClick,
  isDeleting,
}: ListItemProps) {
  return (
    <a
      href={feed.url}
      target="_blank"
      rel="noopener noreferrer"
      className="cursor-pointer flex items-center p-2 gap-2 border rounded-lg hover:bg-accent transition-colors"
    >
      <div className="flex flex-col gap-2">
        <span className="text-lg font-semibold leading-none">{feed.name}</span>
        <span className="text-sm text-muted-foreground leading-none break-all">
          {feed.url}
        </span>
      </div>
      <Button
        disabled={isDeleting}
        onClick={(e) => {
          e.preventDefault();
          if (confirm("Are you sure you want to delete this feed?")) {
            onDeleteClick();
          }
        }}
        variant="secondary"
        className="ml-auto cursor-pointer"
      >
        {isDeleting ? <LoaderCircle className="animate-spin" /> : <Trash />}
      </Button>
    </a>
  );
}
