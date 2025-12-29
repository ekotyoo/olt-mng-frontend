"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createOlt, updateOlt, testConnection, OltInput } from "@/app/actions/olt-management";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Olt } from "@prisma/client";
import { Eye, EyeOff, Loader2, Network } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { oltSchema, OltFormValues } from "@/lib/schemas";

export default function OltForm({ initialData }: { initialData?: Olt }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; latency?: number; error?: string } | null>(null);

  const form = useForm<OltFormValues>({
    resolver: zodResolver(oltSchema),
    defaultValues: {
      name: initialData?.name || "",
      host: initialData?.host || "",
      port: initialData?.port || 23,
      username: initialData?.username || "",
      password: initialData?.password || "",
      type: "ZTE", // Fixed for now
    },
  });

  async function handleTestConnection() {
    setTesting(true);
    setTestResult(null);
    const values = form.getValues();

    try {
        // basic validation for test
      if (!values.host || !values.username || !values.password) {
        toast.error("Please fill in Host, Username and Password");
        setTesting(false);
        return;
      }
      
      const data: OltInput = {
        ...values,
        port: Number(values.port),
      };

      const res = await testConnection(data);
      if (res.success) {
        setTestResult({ success: true, latency: res.latency });
        toast.success(`Connection successful! (${res.latency}ms)`);
      } else {
        setTestResult({ success: false, error: res.error });
        toast.error("Connection failed");
      }
    } catch (e) {
      toast.error("An unexpected error occurred");
    } finally {
      setTesting(false);
    }
  }

  async function onSubmit(values: OltFormValues) {
    setLoading(true);

    const data: OltInput = {
      ...values,
      port: Number(values.port),
    };

    const res = initialData
      ? await updateOlt(initialData.id, data)
      : await createOlt(data);

    if (res.success) {
      toast.success(initialData ? "OLT updated" : "OLT created");
      router.push("/settings/olts");
      router.refresh();
    } else {
      toast.error(res.error);
    }
    setLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md">
        
        {testResult && (
            <Alert variant={testResult.success ? "default" : "destructive"} className={testResult.success ? "border-green-500 text-green-700 bg-green-50 dark:bg-green-950/20" : ""}>
                <Network className="h-4 w-4" />
                <AlertTitle>{testResult.success ? "Connected Successfully" : "Connection Failed"}</AlertTitle>
                <AlertDescription>
                    {testResult.success
                        ? `Latency: ${testResult.latency}ms`
                        : testResult.error}
                </AlertDescription>
            </Alert>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Main OLT" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="host"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Host / IP</FormLabel>
                <FormControl>
                  <Input placeholder="192.168.1.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="port"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Port</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="23" 
                    {...field} 
                    onChange={e => field.onChange(e.target.valueAsNumber)} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="admin" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 pt-2">
            <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleTestConnection}
                disabled={testing || loading}
            >
                {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Network className="mr-2 h-4 w-4" />}
                Test Connection
            </Button>
            <Button type="submit" disabled={loading || testing} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save OLT"}
            </Button>
        </div>
      </form>
    </Form>
  );
}
