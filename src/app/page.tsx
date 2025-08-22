"use client";

import { useState } from "react";
import { FeedDTO } from "@/lib/models";
import { useFeedsQuery } from "@/lib/react-query";
import { Button } from "@/components/ui/button";
import ListItem from "@/components/list-item";
import { Plus } from "lucide-react";
import { Form } from "@/components/form";

export default function Home() {
  const { query, createMutation, deleteMutation } = useFeedsQuery();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [deletingIds, setDeletingIds] = useState<number[]>([]);

  return (
    <>
      <div className="flex mb-4">
        <Button
          onClick={() => {
            setIsSheetOpen(true);
          }}
          className="cursor-pointer ml-auto"
        >
          <Plus /> Add Feed
        </Button>
      </div>
      {query.isLoading && <div>Loading...</div>}
      {query.isError && <div>Error: {query.error.message}</div>}
      {query.isSuccess && (
        <div className="flex flex-col gap-4">
          {query.data.map((feed: FeedDTO) => (
            <ListItem
              key={feed.id}
              feed={feed}
              onDeleteClick={async () => {
                setDeletingIds((prev) => [...prev, feed.id]);
                await deleteMutation.mutateAsync(feed.id);
                setDeletingIds((prev) => prev.filter((id) => id !== feed.id));
              }}
              isDeleting={deletingIds.includes(feed.id)}
            />
          ))}
        </div>
      )}
      <Form
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        createMutation={createMutation}
      />
    </>
  );
}
