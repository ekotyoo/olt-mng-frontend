import { Card, CardContent } from "./ui/card";

export default function CounterInfoCard({
  count,
  label,
  icon: Icon,
}: {
  count: Number;
  label: string;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardContent>
        <div className="flex justify-between min-h-[100px]">
          <div className="flex flex-col justify-between">
            <h5 className="font-semibold">{label}</h5>
            <h1 className="text-5xl font-semibold">{count.toString()}</h1>
          </div>
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-10 items-center justify-center rounded-lg">
            <Icon className="size-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
