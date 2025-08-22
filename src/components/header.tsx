import Link from "next/link";
import { UserNav } from "@/components/user-nav";

export default function Header() {
  return (
    <header>
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <Link href="/" className="text-2xl font-semibold">
            <h1>Notifeed</h1>
          </Link>
          <div className="ml-auto leading-none">
            <UserNav />
          </div>
        </div>
      </div>
    </header>
  );
}
