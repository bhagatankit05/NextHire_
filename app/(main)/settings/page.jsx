"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  Bell,
  Shield,
  Briefcase,
  MapPin,
  Camera,
  Save,
  X,
} from "lucide-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [profileImage, setProfileImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    jobTitle: "",
    department: "",
    company: "",
    location: "",
    bio: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    newApplications: true,
    interviewReminders: true,
    systemUpdates: false,
    weeklyReports: true,
  });

  // Load saved data from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem("profileData");
    const savedNotifications = localStorage.getItem("notificationSettings");
    const savedImage = localStorage.getItem("profileImage");
    if (savedProfile) setProfileData(JSON.parse(savedProfile));
    if (savedNotifications)
      setNotificationSettings(JSON.parse(savedNotifications));
    if (savedImage) setProfileImage(savedImage);
  }, []);

  // Save Profile
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem("profileData", JSON.stringify(profileData));
      localStorage.setItem(
        "notificationSettings",
        JSON.stringify(notificationSettings)
      );
      if (profileImage) localStorage.setItem("profileImage", profileImage);

      await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      setTimeout(() => {
        setIsSaving(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }, 800);
    } catch (err) {
      console.error("Save failed:", err);
      setIsSaving(false);
    }
  };

  // Handlers
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleProfileChange = (field, value) =>
    setProfileData((p) => ({ ...p, [field]: value }));

  const handlePasswordChange = (field, value) =>
    setPasswordData((p) => ({ ...p, [field]: value }));

  const handleNotificationToggle = (field) =>
    setNotificationSettings((p) => ({ ...p, [field]: !p[field] }));

  // ======================
  //   RENDER SECTIONS
  // ======================

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Photo */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Profile Photo
        </h3>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-blue-600" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700">
              <Camera className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <p className="text-sm text-gray-500">JPG or PNG up to 2MB</p>
            {profileImage && (
              <button
                onClick={() => {
                  setProfileImage(null);
                  localStorage.removeItem("profileImage");
                }}
                className="text-red-600 text-sm mt-2 font-medium hover:text-red-700"
              >
                Remove Photo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            ["First Name", "firstName", User],
            ["Last Name", "lastName", User],
            ["Email", "email", Mail],
            ["Phone", "phone", Phone],
            ["Job Title", "jobTitle", Briefcase],
            ["Company", "company", Briefcase],
            ["Location", "location", MapPin],
          ].map(([label, key, Icon]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
              </label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={profileData[key]}
                  onChange={(e) => handleProfileChange(key, e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            value={profileData.bio}
            onChange={(e) => handleProfileChange("bio", e.target.value)}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Tell us about yourself..."
          />
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4 max-w-[1000px]">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Change Password
      </h3>
      {["currentPassword", "newPassword", "confirmPassword"].map((key) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
            {key.replace(/([A-Z])/g, " $1")}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              value={passwordData[key]}
              onChange={(e) => handlePasswordChange(key, e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      ))}
      <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700">
        Update Password
      </button>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Notification Preferences
      </h3>
      {Object.keys(notificationSettings).map((key) => (
        <div
          key={key}
          className="flex items-center justify-between py-2 border-b last:border-b-0"
        >
          <span className="capitalize text-gray-700">
            {key.replace(/([A-Z])/g, " $1")}
          </span>
          <button
            onClick={() => handleNotificationToggle(key)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notificationSettings[key] ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notificationSettings[key] ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  );

  // ======================
  //   MAIN RENDER
  // ======================
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 shadow-sm px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-600">
          Manage your account and preferences
        </p>
      </header>

      <main className="max-w-7xl mx-auto p-6 flex flex-col md:flex-row gap-6">
        {/* Sidebar with FIXED HEIGHT */}
        <aside className="w-full md:w-64 bg-white rounded-lg border shadow-sm p-2 h-[150px] flex flex-col justify-start">
          {["profile", "security", "notifications"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === tab
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab === "profile" && <User className="w-5 h-5" />}
              {tab === "security" && <Shield className="w-5 h-5" />}
              {tab === "notifications" && <Bell className="w-5 h-5" />}
              <span className="capitalize font-medium">{tab}</span>
            </button>
          ))}
        </aside>

        {/* Main Content */}
        <section className="flex-1">
          {activeTab === "profile" && renderProfileTab()}
          {activeTab === "security" && renderSecurityTab()}
          {activeTab === "notifications" && renderNotificationsTab()}

          {activeTab === "profile" && (
            <div className="mt-6 flex justify-end gap-4">
              <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <div className="bg-white rounded-full w-5 h-5 flex items-center justify-center text-green-600 text-sm">
            ✓
          </div>
          <span className="font-medium">Profile updated successfully!</span>
          <button onClick={() => setShowSuccess(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(Settings);
