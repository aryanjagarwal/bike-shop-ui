import { SignUp } from "@clerk/nextjs";
import { Bike, Sparkles, Award, Users } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen pt-20 pb-12 flex items-center justify-center relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-blue-50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(37,99,235,0.05),transparent_50%)]" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-24 h-24 bg-green-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl" />
      
      <div className="relative z-10 w-full max-w-6xl mx-4 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* Left Side - Branding */}
        <div className="flex-1 text-center lg:text-left space-y-6 px-4">
          <Link href="/" className="inline-flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <Bike className="w-7 h-7 text-white" />
            </div>
            <span className="font-bold text-3xl text-gray-900">BikeShop</span>
          </Link>
          
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Start Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                Cycling Adventure
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto lg:mx-0">
              Join thousands of cycling enthusiasts. Create your account and unlock exclusive benefits.
            </p>
          </div>
          
          {/* Benefits */}
          <div className="space-y-4 max-w-md mx-auto lg:mx-0 pt-4">
            <div className="flex items-start space-x-3 text-left">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Exclusive Deals</h3>
                <p className="text-sm text-gray-600">Get access to member-only discounts and early product launches</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 text-left">
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Rewards Program</h3>
                <p className="text-sm text-gray-600">Earn points with every purchase and redeem for amazing rewards</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 text-left">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Community Access</h3>
                <p className="text-sm text-gray-600">Connect with fellow cyclists and join exclusive events</p>
              </div>
            </div>
          </div>
          
          {/* Social Proof */}
          <div className="flex items-center justify-center lg:justify-start space-x-2 pt-4">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white" />
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white" />
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white" />
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-white" />
            </div>
            <p className="text-sm text-gray-600">
              <span className="font-bold text-gray-900">10,000+</span> happy cyclists
            </p>
          </div>
        </div>
        
        {/* Right Side - Sign Up Form */}
        <div className="flex-1 w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 p-8">
            <SignUp 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none w-full",
                  headerTitle: "text-2xl font-bold text-gray-900",
                  headerSubtitle: "text-gray-600",
                  socialButtonsBlockButton: "bg-white border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all rounded-xl",
                  socialButtonsBlockButtonText: "text-gray-700 font-medium",
                  formButtonPrimary: "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl py-3 font-semibold shadow-lg hover:shadow-xl transition-all",
                  formFieldInput: "rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all",
                  footerActionLink: "text-green-600 hover:text-green-700 font-semibold",
                  identityPreviewText: "text-gray-700",
                  formFieldLabel: "text-gray-700 font-medium",
                  dividerLine: "bg-gray-200",
                  dividerText: "text-gray-500",
                  formFieldInputShowPasswordButton: "text-gray-500 hover:text-gray-700",
                  otpCodeFieldInput: "border-2 border-gray-200 focus:border-green-500 rounded-lg",
                  formResendCodeLink: "text-green-600 hover:text-green-700",
                  footer: "hidden"
                },
                layout: {
                  socialButtonsPlacement: "top",
                  socialButtonsVariant: "blockButton"
                }
              }}
              routing="path"
              path="/auth/register"
              signInUrl="/auth/login"
            />
            
            {/* Custom Footer */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-green-600 hover:text-green-700 font-semibold hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-6 text-center text-sm text-gray-500 space-y-1">
            <p>🔒 Secure authentication powered by Clerk</p>
            <p className="text-xs">By signing up, you agree to our Terms & Privacy Policy</p>
          </div>
        </div>
      </div>
    </div>
  );
}
