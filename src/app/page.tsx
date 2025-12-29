import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Globe, Lock, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
                <Globe className="w-6 h-6" />
                <span>Buroq.net</span>
            </div>
            <div className="flex items-center gap-4">
                <Link href="/portal/login">
                    <Button variant="ghost">Customer Login</Button>
                </Link>
                <Link href="/login">
                    <Button>Admin Login</Button>
                </Link>
            </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-b from-white to-slate-100">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mb-6">
            High-Speed Fiber Internet <br />
            <span className="text-blue-600">Managed with Precision</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-8">
            Experience reliable connectivity with Buroq.net. 
            Manage your subscription, check usage, and pay bills instantly via our Customer Portal.
        </p>
        <div className="flex gap-4">
            <Link href="/portal/login">
                <Button size="lg" className="h-12 px-8 text-lg">
                    Check My Bill <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
            </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg bg-blue-50">
                <CardContent className="pt-6">
                    <Zap className="w-10 h-10 text-blue-600 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Blazing Fast</h3>
                    <p className="text-slate-600">
                        Symmetrical gigabit speeds for streaming, gaming, and working from home.
                    </p>
                </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-green-50">
                <CardContent className="pt-6">
                    <ShieldCheck className="w-10 h-10 text-green-600 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Secure & Reliable</h3>
                    <p className="text-slate-600">
                        99.9% uptime guarantee with 24/7 network monitoring and support.
                    </p>
                </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-purple-50">
                <CardContent className="pt-6">
                    <Lock className="w-10 h-10 text-purple-600 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Self Service</h3>
                    <p className="text-slate-600">
                        Manage your account, view invoices, and make payments from our portal.
                    </p>
                </CardContent>
            </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center">
        <p>&copy; {new Date().getFullYear()} Buroq.net - OLT Management System</p>
      </footer>
    </div>
  );
}
