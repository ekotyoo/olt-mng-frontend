import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function AlertEventCard({ className }: { className?: string }) {
  return (
    <Card className={`w-full ${className ?? ""}`}>
      <CardHeader>
        <CardTitle>Alerts & Events</CardTitle>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  );
}
