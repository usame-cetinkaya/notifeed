"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useMeQuery } from "@/lib/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, LoaderCircle, Save } from "lucide-react";

export default function Settings() {
  const { theme, setTheme } = useTheme();

  const { query, updateMutation } = useMeQuery();
  const [pushbulletToken, setPushbulletToken] = useState<string>("");
  const [showPushbulletToken, setShowPushbulletToken] = useState(false);

  useEffect(() => {
    if (query.data) {
      setPushbulletToken(query.data.pb_token || "");
    }
  }, [query.data]);

  const handleSavePushbulletToken = async () => {
    await updateMutation.mutateAsync({ pb_token: pushbulletToken || null });
  };

  return (
    <>
      <h1 className="text-xl font-semibold mb-4">Settings</h1>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <label>Theme</label>
          <Select value={theme} onValueChange={(value) => setTheme(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <label>Pushbullet Access Token</label>
          <div className="flex items-center gap-2">
            <Input
              type={showPushbulletToken ? "text" : "password"}
              value={pushbulletToken}
              onChange={(e) => setPushbulletToken(e.target.value)}
              placeholder="Enter your token"
            />
            <Button
              variant="secondary"
              onClick={() => setShowPushbulletToken(!showPushbulletToken)}
            >
              {showPushbulletToken ? <EyeOff /> : <Eye />}
            </Button>
            <Button
              onClick={handleSavePushbulletToken}
              disabled={query.isLoading || updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <Save />
              )}
              Save
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
