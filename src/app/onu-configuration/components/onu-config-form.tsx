"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoaderCircle } from "lucide-react";
import { useEffect } from "react";
import { formSchema } from "@/lib/schema";
import { OnuConfig, OnuDetail } from "@/lib/type";

export default function OnuConfigForm({
  isLoading = false,
  isSubmitting = false,
  onuDetail,
  onSubmit,
}: {
  isLoading?: boolean;
  isSubmitting?: boolean;
  onuDetail?: OnuDetail | null;
  onSubmit?: (onuConfig: OnuConfig) => void | null;
}) {
  const PROFILES = ["default", "iptv-up", "5M", "10M", "15M", "20M", "50M", "100M"];

  const CVLAN_PROFILES = ["netmedia143"];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slotPort: "",
      serialNumber: "",
      onuId: "",
      customerOnuName: "",
      pppoeUsername: "",
      pppoePassword: "",
      vlanId: "",
      profile: "",
      cvlanProfile: "",
    },
  });

  useEffect(() => {
    if (onuDetail) {
      form.reset({
        onuId: String(onuDetail.onu_id),
        slotPort: onuDetail.slot_port,
        serialNumber: onuDetail.serial,
        customerOnuName: "",
        pppoeUsername: "",
        pppoePassword: "",
        vlanId: "",
        profile: "",
        cvlanProfile: "",
      });
    }
  }, [onuDetail]);

  function handleSubmit(formData: z.infer<typeof formSchema>) {
    if (!onSubmit) return;

    onSubmit(formData as OnuConfig);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Configure ONU </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex w-full h-full justify-center">
            <LoaderCircle className="text-blue-500 animate-spin w-12 h-12" />
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className={"w-full flex flex-col gap-4"}
            >
              <FormField
                control={form.control}
                name="slotPort"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slot/Port</FormLabel>
                    <FormControl>
                      <Input disabled placeholder="Slot/Port" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="serialNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serial Number</FormLabel>
                    <FormControl>
                      <Input disabled placeholder="Serial Number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="onuId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ONU ID</FormLabel>
                    <FormControl>
                      <Input disabled placeholder="ONU ID" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerOnuName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer ONU Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Customer ONU Name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pppoeUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PPPOE Username</FormLabel>
                    <FormControl>
                      <Input placeholder="PPPOE Username" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pppoePassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PPPOE Password</FormLabel>
                    <FormControl>
                      <Input placeholder="PPPOE Password" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vlanId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VLAN ID</FormLabel>
                    <FormControl>
                      <Input placeholder="VLAN ID" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="profile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Profile" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROFILES.map((profile) => (
                            <SelectItem key={profile} value={profile}>
                              {profile.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cvlanProfile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VLAN Profile</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select CVLAN Profile" />
                        </SelectTrigger>
                        <SelectContent>
                          {CVLAN_PROFILES.map((cvlan) => (
                            <SelectItem key={cvlan} value={cvlan}>
                              {cvlan}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting} className="mt-2">
                {isSubmitting ? (
                  <LoaderCircle className="text-background animate-spin" />
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
