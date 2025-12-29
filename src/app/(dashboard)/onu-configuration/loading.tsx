import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="w-full max-w-5xl flex flex-col mx-auto px-4 py-3 gap-6 items-center">
      <div className="w-full space-y-4">
        <Skeleton className="h-12 w-full max-w-md mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}
