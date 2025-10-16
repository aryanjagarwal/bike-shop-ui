"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Lock, Save, Calendar, Bell, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  useUserProfile,
  useUpdateUserProfile,
  formatUserName,
  getUserInitials,
  getProfileCompletionPercentage,
  formatDateOfBirth,
  getDefaultAddress,
  formatAddress,
  type UserPreferences,
} from "@/lib/api/user";

export default function AccountPage() {
  const router = useRouter();
  const { user: clerkUser, isSignedIn, isLoaded: clerkLoaded } = useUser();
  const [editing, setEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
    preferences: {
      newsletter: false,
      smsNotifications: false,
      emailNotifications: true,
    } as UserPreferences,
  });

  // API hooks
  const { data: profileData, isLoading: isLoadingProfile, error: profileError } = useUserProfile({
    enabled: isSignedIn,
  });
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateUserProfile();

  const userProfile = profileData?.data;

  // Initialize form data when profile loads
  useEffect(() => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        phone: userProfile.phone || "",
        dateOfBirth: userProfile.profile?.dateOfBirth
          ? new Date(userProfile.profile.dateOfBirth).toISOString().split('T')[0]
          : "",
        preferences: {
          newsletter: userProfile.profile?.preferences?.newsletter ?? false,
          smsNotifications: userProfile.profile?.preferences?.smsNotifications ?? false,
          emailNotifications: userProfile.profile?.preferences?.emailNotifications ?? true,
        },
      });
    }
  }, [userProfile]);

  if (!clerkLoaded || isLoadingProfile) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    router.push("/auth/login");
    return null;
  }

  if (profileError) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">We couldn't load your profile. Please try again.</p>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    setSuccessMessage("");
    setErrorMessage("");

    updateProfile(
      {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        preferences: formData.preferences,
      },
      {
        onSuccess: () => {
          setEditing(false);
          setSuccessMessage("Profile updated successfully!");
          setTimeout(() => setSuccessMessage(""), 5000);
        },
        onError: (error: any) => {
          setErrorMessage(error.message || "Failed to update profile. Please try again.");
          setTimeout(() => setErrorMessage(""), 5000);
        },
      }
    );
  };

  const handleCancel = () => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        phone: userProfile.phone || "",
        dateOfBirth: userProfile.profile?.dateOfBirth
          ? new Date(userProfile.profile.dateOfBirth).toISOString().split('T')[0]
          : "",
        preferences: {
          newsletter: userProfile.profile?.preferences?.newsletter ?? false,
          smsNotifications: userProfile.profile?.preferences?.smsNotifications ?? false,
          emailNotifications: userProfile.profile?.preferences?.emailNotifications ?? true,
        },
      });
    }
    setEditing(false);
    setErrorMessage("");
  };

  const defaultAddress = userProfile ? getDefaultAddress(userProfile.addresses) : null;
  const completionPercentage = userProfile ? getProfileCompletionPercentage(userProfile) : 0;

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{errorMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center mb-6">
              {clerkUser?.imageUrl ? (
                <img 
                  src={clerkUser.imageUrl} 
                  alt={userProfile ? formatUserName(userProfile) : "User"} 
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-blue-600">
                  {userProfile ? getUserInitials(userProfile) : <User className="w-12 h-12" />}
                </div>
              )}
              <h2 className="font-bold text-xl">{userProfile ? formatUserName(userProfile) : "User"}</h2>
              <p className="text-gray-600 text-sm">{userProfile?.email}</p>
              
              {/* Profile Completion */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Profile Completion</span>
                  <span className="font-semibold text-blue-600">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-semibold">
                Profile
              </button>
              <button
                onClick={() => router.push("/orders")}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg"
              >
                Orders
              </button>
              <button
                onClick={() => router.push("/addresses")}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg"
              >
                Addresses
              </button>
              <button
                onClick={() => router.push("/wishlist")}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg"
              >
                Wishlist
              </button>
              {userProfile?.role === "ADMIN" && (
                <button
                  onClick={() => router.push("/admin")}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg"
                >
                  Admin Panel
                </button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Profile Information</h2>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    disabled={isUpdating}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      disabled={!editing}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      disabled={!editing}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={userProfile?.email || ""}
                    disabled
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed here. Manage it in security settings.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    disabled={!editing}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    placeholder="+44 7700 900000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                    disabled={!editing}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>
                {!editing && userProfile?.profile?.dateOfBirth && (
                  <p className="text-xs text-gray-500 mt-1">{formatDateOfBirth(userProfile.profile.dateOfBirth)}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <div className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 min-h-[80px]">
                    {defaultAddress ? (
                      <p className="text-sm">{formatAddress(defaultAddress)}</p>
                    ) : (
                      <p className="text-sm text-gray-400">No address added</p>
                    )}
                  </div>
                </div>
                <Link
                  href="/addresses"
                  className="text-xs text-blue-600 hover:text-blue-700 mt-1 inline-block"
                >
                  Manage addresses →
                </Link>
              </div>

              {/* Preferences */}
              <div className="border-t pt-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <span className="text-sm font-medium text-gray-700">Email Notifications</span>
                    <input
                      type="checkbox"
                      checked={formData.preferences.emailNotifications}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences,
                            emailNotifications: e.target.checked,
                          },
                        })
                      }
                      disabled={!editing}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <span className="text-sm font-medium text-gray-700">SMS Notifications</span>
                    <input
                      type="checkbox"
                      checked={formData.preferences.smsNotifications}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences,
                            smsNotifications: e.target.checked,
                          },
                        })
                      }
                      disabled={!editing}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <span className="text-sm font-medium text-gray-700">Newsletter</span>
                    <input
                      type="checkbox"
                      checked={formData.preferences.newsletter}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences,
                            newsletter: e.target.checked,
                          },
                        })
                      }
                      disabled={!editing}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                  </label>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Security & Authentication
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Manage your password, two-factor authentication, and connected accounts.
                </p>
                <Link 
                  href="/account/security"
                  className="block w-full px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg transition-all border border-blue-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Manage Security Settings</p>
                      <p className="text-sm text-gray-600 mt-1">Update password, enable 2FA, manage connected accounts</p>
                    </div>
                    <Lock className="w-5 h-5 text-blue-600" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
