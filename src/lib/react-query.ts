import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FeedDTO } from "@/lib/models";

export const useFeedsQuery = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryFn: fetchFeeds,
    queryKey: ["feeds"],
  });

  const createMutation = useMutation({
    mutationFn: createFeed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feeds"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFeed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feeds"] });
    },
  });

  return {
    query,
    createMutation,
    deleteMutation,
  };
};
const fetchFeeds = async () => {
  const response = await fetch("/api/feeds", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return (await response.json()) as unknown as FeedDTO[];
};

const createFeed = async (url: string) => {
  const response = await fetch("/api/feeds", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });
  if (!response.ok) {
    throw new Error("Failed to create feed");
  }
  return (await response.json()) as FeedDTO;
};

const deleteFeed = async (id: number) => {
  const response = await fetch("/api/feeds", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });
  if (!response.ok) {
    throw new Error("Failed to delete feed");
  }
  return id;
};

const fetchMe = async () => {
  const response = await fetch("/api/me", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch me");
  }
  return (await response.json()) as unknown as {
    pb_token: string | null;
  };
};

const updateMe = async ({ pb_token }: { pb_token: string | null }) => {
  const response = await fetch("/api/me", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pb_token }),
  });
  if (!response.ok) {
    throw new Error("Failed to update me");
  }
};

export const useMeQuery = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryFn: fetchMe,
    queryKey: ["me"],
  });

  const updateMutation = useMutation({
    mutationFn: updateMe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  return {
    query,
    updateMutation,
  };
};
