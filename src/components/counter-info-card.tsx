import { Card, CardContent } from "./ui/card";

export default function CounterInfoCard({
  count,
  label,
  icon: Icon,
  iconColor,
}: {
  count: Number;
  label: string;
  icon: React.ElementType;
  iconColor?: string;
}) {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col justify-between">
          <div className="flex justify-between min-h-[80px]">
            <h5 className="font-semibold">{label}</h5>
            <div
              className={`${
                iconColor || "bg-primary"
              } text-primary-foreground flex aspect-square size-10 items-center justify-center rounded-lg`}
            >
              <Icon className="size-6" />
            </div>
          </div>
          <h1 className="text-5xl font-semibold">{count.toString()}</h1>
        </div>
      </CardContent>
    </Card>
  );
}
