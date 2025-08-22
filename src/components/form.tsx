import { FormEvent, useState } from "react";
import { UseMutationResult } from "@tanstack/react-query";
import { FeedDTO } from "@/lib/models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoaderCircle, Save } from "lucide-react";

interface FormProps {
  isOpen: boolean;
  onClose: () => void;
  createMutation: UseMutationResult<FeedDTO, Error, string>;
}
export function Form({ isOpen, onClose, createMutation }: FormProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await createMutation.mutateAsync(url);
    handleClose();
  };

  const handleClose = () => {
    setUrl("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="gap-8">
        <DialogHeader>
          <DialogTitle className="text-left">Add Feed</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-10">
          <Input
            required
            id="url"
            type="url"
            placeholder="Feed URL"
            value={url}
            onChange={(e: { target: { value: string } }) => {
              setUrl(e.target.value);
            }}
          />
          <Button
            type="submit"
            className="cursor-pointer"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Save />
            )}
            Save
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
