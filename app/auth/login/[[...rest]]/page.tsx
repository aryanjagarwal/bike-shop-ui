import { SignIn } from "@clerk/nextjs";
import { Bike } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen pt-20 pb-12 flex items-center justify-center relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(37,99,235,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.05),transparent_50%)]" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-green-200/30 rounded-full blur-3xl" />
      
      <div className="relative z-10 w-full max-w-6xl mx-4 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* Left Side - Branding */}
        <div className="flex-1 text-center lg:text-left space-y-6 px-4">
          <Link href="/" className="inline-flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <Bike className="w-7 h-7 text-white" />
            </div>
            <span className="font-bold text-3xl text-gray-900">BikeShop</span>
          </Link>
          
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Welcome Back to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
                Your Cycling Journey
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto lg:mx-0">
              Sign in to access your account, track orders, and discover premium bicycles and parts.
            </p>
          </div>
          
          {/* Features */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0 pt-4">
            <div className="flex items-center space-x-2 text-gray-700">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">🚴</span>
              </div>
              <span className="text-sm font-medium">Premium Bikes</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">🛠️</span>
              </div>
              <span className="text-sm font-medium">Expert Service</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xl">🚚</span>
              </div>
              <span className="text-sm font-medium">Fast Delivery</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-xl">⭐</span>
              </div>
              <span className="text-sm font-medium">Top Quality</span>
            </div>
          </div>
        </div>
        
        {/* Right Side - Sign In Form */}
        <div className="flex-1 w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 p-8">
            <SignIn 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none w-full",
                  headerTitle: "text-2xl font-bold text-gray-900",
                  headerSubtitle: "text-gray-600",
                  socialButtonsBlockButton: "bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all rounded-xl",
                  socialButtonsBlockButtonText: "text-gray-700 font-medium",
                  formButtonPrimary: "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl py-3 font-semibold shadow-lg hover:shadow-xl transition-all",
                  formFieldInput: "rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all",
                  footerActionLink: "text-blue-600 hover:text-blue-700 font-semibold",
                  identityPreviewText: "text-gray-700",
                  formFieldLabel: "text-gray-700 font-medium",
                  dividerLine: "bg-gray-200",
                  dividerText: "text-gray-500",
                  formFieldInputShowPasswordButton: "text-gray-500 hover:text-gray-700",
                  otpCodeFieldInput: "border-2 border-gray-200 focus:border-blue-500 rounded-lg",
                  formResendCodeLink: "text-blue-600 hover:text-blue-700",
                  footer: "hidden"
                },
                layout: {
                  socialButtonsPlacement: "top",
                  socialButtonsVariant: "blockButton"
                }
              }}
              routing="path"
              path="/auth/login"
              signUpUrl="/auth/register"
            />
            
            {/* Custom Footer */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/register"
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                >
                  Sign up now
                </Link>
              </p>
            </div>
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>🔒 Secure authentication powered by Clerk</p>
          </div>
        </div>
      </div>
    </div>
  );
}
