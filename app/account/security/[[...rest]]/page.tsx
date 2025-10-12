import { UserProfile } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SecurityPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          href="/account"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Account
        </Link>
        
        <h1 className="text-3xl font-bold mb-2">Security Settings</h1>
        <p className="text-gray-600 mb-8">
          Manage your password, two-factor authentication, and connected accounts.
        </p>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <UserProfile 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none bg-transparent",
                headerTitle: "text-2xl font-bold",
                headerSubtitle: "text-gray-600",
                navbarButton: "text-gray-700 hover:bg-gray-100",
                navbarButtonActive: "bg-blue-50 text-blue-600",
                pageScrollBox: "p-0",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
              }
            }}
            routing="path"
            path="/account/security"
          />
        </div>
      </div>
    </div>
  );
}
