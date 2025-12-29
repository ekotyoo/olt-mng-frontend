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
  tcontProfiles,
  vlanProfiles,
  activeVlans
}: {
  isLoading?: boolean;
  isSubmitting?: boolean;
  onuDetail?: OnuDetail | null;
  tcontProfiles?: string[];
  vlanProfiles?: string[];
  activeVlans?: { id: string, name: string }[];
  onSubmit?: (onuConfig: OnuConfig) => void | null;
}) {
  const PROFILES = ["default", "iptv-up", "5M", "10M", "15M", "20M", "50M", "100M"]; // Fallback if empty
  const CVLAN_PROFILES = ["netmedia143"]; // Fallback

  const availableTcont = tcontProfiles?.length ? tcontProfiles : PROFILES;
  const availableVlanProc = vlanProfiles?.length ? vlanProfiles : CVLAN_PROFILES;

  // Combine custom input + active vlans for Combobox later?
  // For now we keep vlanId as text but maybe show a hint or simple select if we want to enforce


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
      deviceType: "ZTE-F609"
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
        deviceType: "ZTE-F609",
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
              className={"grid grid-cols-1 md:grid-cols-2 gap-4"}
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
                name="deviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Device Type</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Device Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {["ZTE-F609", "ZTE-F660", "ZTE-F670", "ZTE-F601", "ZTE-F460"].map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Input placeholder="ONU ID" {...field} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select VLAN" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeVlans?.length ? (
                              activeVlans.map((vlan) => (
                                <SelectItem key={vlan.id} value={vlan.id}>
                                  {vlan.id} - {vlan.name}
                                </SelectItem>
                              ))
                          ) : (
                              <SelectItem value="none" disabled>No VLANs found</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
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
                          {availableTcont.map((profile) => (
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
                          {availableVlanProc.map((cvlan) => (
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
              <Button type="submit" disabled={isSubmitting} className="mt-2 col-span-1 md:col-span-2">
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
