import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import userLogo from "../assets/user.jpg";
import { toast } from "sonner";
import { api, getApiErrorMessage } from "@/lib/api";
import { setUser } from "@/redux/userSlice";
import { Package, Calendar, Tag, ShieldCheck, ShoppingBag, Loader2, ArrowRight, MapPin, Phone, User, KeyRound, Key } from "lucide-react";

const Profile = () => {
  const { user } = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const userId = params.userId;

  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "profile");
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phoneNo || "",
    address: user?.address || "",
    city: user?.city || "",
    zipCode: user?.zipcode || "",
    profilePic: user?.profilePic || "",
    role: user?.role || "",
  });

  const [file, setFile] = useState(null);
  
  // Password state for OTP verify change password
  const [passwordData, setPasswordData] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Sync state tab if redirected with state
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  // Fetch orders when orders tab is active
  const fetchOrders = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!user || !accessToken) return;
    setOrdersLoading(true);
    try {
      const res = await api.get('/api/v1/order/my-orders', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (error) {
      console.error("Fetch orders error:", error);
      toast.error(getApiErrorMessage(error, "Failed to load orders."));
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, user]);

  // Countdown timer for resend OTP cooldown
  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendPasswordOTP = async () => {
    if (!user?.email) {
      toast.error("User email not found. Please log in again.");
      return;
    }

    setOtpSending(true);
    try {
      const res = await api.post('/api/v1/user/forgot-password', { email: user.email });
      if (res.data.success) {
        toast.success(res.data.message || "OTP code sent to your registered email!");
        setOtpSent(true);
        setOtpTimer(180); // 3 minutes resend cooldown
      }
    } catch (error) {
      console.error("Send change password OTP error:", error);
      toast.error(getApiErrorMessage(error, "Failed to send verification OTP."));
    } finally {
      setOtpSending(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    const { otp, newPassword, confirmPassword } = passwordData;

    if (!otp) {
      toast.error("Please enter the verification OTP sent to your email.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error("New Password and Confirm Password are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New Password and Confirm Password do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setPasswordLoading(true);

    try {
      // Step 1: Verify OTP using user's email
      const verifyRes = await api.post(
        `/api/v1/user/verify-otp/${user.email}`,
        { otp }
      );

      if (verifyRes.data.success) {
        // Step 2: If verify succeeds, call change-password API
        const updateRes = await api.post(
          `/api/v1/user/change-password/${user.email}`,
          {
            newPassword,
            confirmPassword,
          }
        );

        if (updateRes.data.success) {
          toast.success("Password updated successfully!");
          setPasswordData({
            otp: "",
            newPassword: "",
            confirmPassword: "",
          });
          setOtpSent(false);
          setOtpTimer(0);
        } else {
          toast.error(updateRes.data.message || "Failed to update password");
        }
      }
    } catch (error) {
      console.error(error);
      const errorMsg = getApiErrorMessage(error, "Invalid or expired OTP code. Please request a new one.");
      toast.error(errorMsg);
    } finally {
      setPasswordLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phoneNo || "",
        address: user.address || "",
        city: user.city || "",
        zipCode: user.zipcode || "",
        profilePic: user.profilePic || "",
        role: user.role || "",
      });
    }
  }, [user]);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    setProfile((prev) => ({
      ...prev,
      profilePic: URL.createObjectURL(selectedFile),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const accessToken = window.localStorage.getItem("accessToken");

      const formData = new FormData();
      formData.append("firstName", profile.firstName);
      formData.append("lastName", profile.lastName);
      formData.append("email", profile.email);
      formData.append("phoneNo", profile.phone);
      formData.append("address", profile.address);
      formData.append("city", profile.city);
      formData.append("zipCode", profile.zipCode);

      if (file) {
        formData.append("file", file);
      }

      const res = await api.put(
        `/api/v1/user/update/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        dispatch(setUser(res.data.user));
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setProfile((prev) => ({
          ...prev,
          firstName: res.data.user.firstName || prev.firstName,
          lastName: res.data.user.lastName || prev.lastName,
          email: res.data.user.email || prev.email,
          phone: res.data.user.phoneNo || prev.phone,
          address: res.data.user.address || prev.address,
          city: res.data.user.city || prev.city,
          zipCode: res.data.user.zipcode || prev.zipCode,
          profilePic: res.data.user.profilePic || prev.profilePic,
          role: res.data.user.role || prev.role,
        }));
        setFile(null);
      }
    } catch (error) {
      console.log(error);
      toast.error(getApiErrorMessage(error, "Failed to update profile"));
    } finally {
      setLoading(false);
    }
  };

  // Helper for Status Badge Styling
  const getStatusBadgeStyles = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Shipped':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Processing':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Pending':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'Cancelled':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-background text-white pt-28 pb-16 px-4 select-none">
      <div className="max-w-2xl mx-auto space-y-6 relative z-10">
        
        {/* Glow Circles */}
        <div className="absolute top-10 left-10 w-[250px] h-[250px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[250px] h-[250px] bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

        {/* User Card Summary Banner */}
        <div className="bg-card border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-24 h-24 rounded-full border-4 border-accent overflow-hidden bg-background flex-shrink-0 shadow-lg shadow-accent/10">
            <img
              src={profile.profilePic || userLogo}
              className="w-full h-full object-cover"
              alt="avatar"
            />
          </div>
          <div className="text-center sm:text-left space-y-1">
            <h1 className="text-2xl font-bold font-heading text-white">{profile.firstName} {profile.lastName}</h1>
            <p className="text-sm text-gray-400">{profile.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-accent/5 text-accent border border-accent/25 text-[10px] font-extrabold uppercase rounded-full tracking-wider">
              {profile.role} account
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8 bg-[#111827] border border-white/5 p-1 rounded-2xl max-w-md mx-auto">
            <TabsTrigger 
              value="profile" 
              className="rounded-xl py-2 text-sm font-semibold transition-all data-[state=active]:bg-accent data-[state=active]:text-background data-[state=active]:shadow-lg cursor-pointer"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="orders" 
              className="rounded-xl py-2 text-sm font-semibold transition-all data-[state=active]:bg-accent data-[state=active]:text-background data-[state=active]:shadow-lg cursor-pointer"
            >
              Orders
            </TabsTrigger>
            <TabsTrigger 
              value="password" 
              className="rounded-xl py-2 text-sm font-semibold transition-all data-[state=active]:bg-accent data-[state=active]:text-background data-[state=active]:shadow-lg cursor-pointer"
            >
              Password
            </TabsTrigger>
          </TabsList>

          {/* PROFILE FORM */}
          <TabsContent value="profile">
            <Card className="rounded-3xl border-white/5 bg-card overflow-hidden shadow-2xl">
              <CardContent className="p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-bold font-heading text-white mb-1 flex items-center gap-2">
                    <User className="size-5 text-accent" /> Profile Information
                  </h2>
                  <p className="text-xs text-gray-400">Keep your personal contact and delivery profiles up to date.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                  {/* Photo Edit */}
                  <div className="flex flex-col items-center gap-3 w-full md:w-auto flex-shrink-0">
                    <div
                      className="w-32 h-32 rounded-full border-4 border-white/15 overflow-hidden bg-background cursor-pointer hover:border-accent transition-all duration-300 shadow-md group relative"
                      onClick={handleImageClick}
                    >
                      <img
                        src={profile.profilePic || userLogo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        alt="profile"
                      />
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <Button
                      onClick={handleImageClick}
                      variant="outline"
                      className="border-white/10 hover:border-accent hover:text-accent text-white rounded-xl h-9 text-xs font-bold cursor-pointer"
                    >
                      Change Photo
                    </Button>
                  </div>

                  {/* Fields Form */}
                  <form onSubmit={handleSubmit} className="flex-1 w-full space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="firstName" className="text-xs font-bold text-gray-400 uppercase tracking-wider">First Name</Label>
                        <Input id="firstName" name="firstName" value={profile.firstName} onChange={handleChange} className="bg-background border-white/10 text-white placeholder-gray-600 rounded-xl h-10 text-sm focus-visible:border-accent" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="lastName" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Last Name</Label>
                        <Input id="lastName" name="lastName" value={profile.lastName} onChange={handleChange} className="bg-background border-white/10 text-white placeholder-gray-600 rounded-xl h-10 text-sm focus-visible:border-accent" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</Label>
                      <Input id="email" name="email" value={profile.email} onChange={handleChange} className="bg-background border-white/10 text-white placeholder-gray-600 rounded-xl h-10 text-sm focus-visible:border-accent" />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</Label>
                      <Input id="phone" name="phone" value={profile.phone} onChange={handleChange} className="bg-background border-white/10 text-white placeholder-gray-600 rounded-xl h-10 text-sm focus-visible:border-accent" placeholder="e.g. 03XX-XXXXXXX" />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="address" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Shipping Address</Label>
                      <Input id="address" name="address" value={profile.address} onChange={handleChange} className="bg-background border-white/10 text-white placeholder-gray-600 rounded-xl h-10 text-sm focus-visible:border-accent" placeholder="Street Address, Building, Apartment" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="city" className="text-xs font-bold text-gray-400 uppercase tracking-wider">City</Label>
                        <Input id="city" name="city" value={profile.city} onChange={handleChange} className="bg-background border-white/10 text-white placeholder-gray-600 rounded-xl h-10 text-sm focus-visible:border-accent" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="zipCode" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Zip Code</Label>
                        <Input id="zipCode" name="zipCode" value={profile.zipCode} onChange={handleChange} className="bg-background border-white/10 text-white placeholder-gray-600 rounded-xl h-10 text-sm focus-visible:border-accent" />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-accent hover:bg-accent-hover text-background font-bold rounded-xl h-11 w-full text-sm mt-3 shadow-lg glow-accent transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                    >
                      {loading ? "Updating Suite..." : "Update Profile Suite"}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MY ORDERS */}
          <TabsContent value="orders">
            <Card className="rounded-3xl border-white/5 bg-card overflow-hidden shadow-2xl">
              <CardContent className="p-8">
                <div className="mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                  <Package className="size-5 text-accent" />
                  <div>
                    <h2 className="text-xl font-bold font-heading text-white">Order History</h2>
                    <p className="text-xs text-gray-400 mt-0.5 font-light">View and track status logs of your system orders.</p>
                  </div>
                </div>

                {ordersLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="animate-spin text-accent" size={36} />
                    <p className="text-xs text-gray-400">Fetching order history logs...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-5">
                    <div className="p-4 bg-accent/10 text-accent rounded-full border border-accent/20">
                      <ShoppingBag size={40} strokeWidth={1.5} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-white font-heading">No Orders Placed Yet</h3>
                      <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed font-light">
                        You have not placed any orders yet. Discover our latest collections and start buying!
                      </p>
                    </div>
                    <Link to="/products">
                      <Button className="bg-accent hover:bg-accent-hover text-background font-bold rounded-xl h-10 text-xs px-6 transition-all duration-300 glow-accent flex items-center gap-2 cursor-pointer">
                        Start Shopping <ArrowRight size={14} />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div 
                        key={order._id} 
                        className="border border-white/5 rounded-2xl overflow-hidden bg-background/40 shadow-md hover:border-white/10 transition-colors"
                      >
                        {/* Order Header Summary */}
                        <div className="bg-[#111827]/80 px-4 py-3.5 border-b border-white/5 flex flex-wrap justify-between items-center gap-4 text-xs font-mono">
                          <div className="flex flex-wrap items-center gap-6">
                            <div>
                              <p className="text-gray-500 text-[10px] uppercase font-bold">Placed Date</p>
                              <p className="font-semibold text-white/95 mt-0.5">
                                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-[10px] uppercase font-bold">Grand Total</p>
                              <p className="font-bold text-accent mt-0.5">Rs {order.totalAmount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-[10px] uppercase font-bold">Order UID</p>
                              <p className="font-semibold text-gray-400 uppercase mt-0.5">#{order._id.substring(18)}</p>
                            </div>
                          </div>
                          
                          {/* Colored Status Badge */}
                          <span className={`px-3 py-1 border text-[10px] font-extrabold rounded-full uppercase tracking-wider ${getStatusBadgeStyles(order.status)}`}>
                            {order.status}
                          </span>
                        </div>

                        {/* Order Product Items */}
                        <div className="p-4 divide-y divide-white/5">
                          {order.items.map((item) => {
                            const product = item.productId;
                            if (!product) return null;

                            const itemImg = product.productImg && product.productImg[0] 
                              ? product.productImg[0].url 
                              : '/placeholder-product.png';

                            return (
                              <div key={item._id} className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/5 bg-background flex items-center justify-center p-1 flex-shrink-0">
                                  <img 
                                    src={itemImg} 
                                    alt={product.productName} 
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-xs text-white/90 truncate">{product.productName}</h4>
                                  <p className="text-[10px] text-gray-500 mt-1 font-mono">Qty: {item.quantity}</p>
                                </div>
                                <div className="text-right flex-shrink-0 font-mono">
                                  <p className="font-bold text-xs text-white">Rs {(item.price * item.quantity).toLocaleString()}</p>
                                  <p className="text-[10px] text-gray-500">Rs {item.price.toLocaleString()} ea</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Delivery Address Footer */}
                        <div className="bg-[#111827]/40 px-4 py-3 text-[10px] text-gray-400 border-t border-white/5 flex items-center gap-2">
                          <MapPin size={12} className="text-accent flex-shrink-0" />
                          <span className="truncate">Deliver to: <b className="text-white font-normal">{order.address}, {order.city} - {order.zipcode}</b> (Contact: {order.phoneNo})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* CHANGE PASSWORD */}
          <TabsContent value="password">
            <Card className="rounded-3xl border-white/5 bg-card overflow-hidden shadow-2xl max-w-lg mx-auto">
              <CardContent className="p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-bold font-heading text-white mb-1 flex items-center gap-2">
                    <KeyRound className="size-5 text-accent" /> Change Password
                  </h2> 
                  <p className="text-xs text-gray-400 leading-relaxed font-light">
                    For verification security, we will transmit a one-time passcode verification to: <b className="text-accent font-semibold">{user?.email}</b>.
                  </p>
                </div>

                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  {/* OTP Trigger & Input Box */}
                  <div className="space-y-1.5">
                    <Label htmlFor="otp" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Verification OTP Code</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="otp"
                        type="text" 
                        name="otp" 
                        value={passwordData.otp} 
                        onChange={handlePasswordChange} 
                        placeholder="6-digit OTP" 
                        className="bg-background border-white/10 text-white placeholder-gray-600 rounded-xl h-10 text-sm flex-1 font-mono focus-visible:border-accent"
                        maxLength="6"
                        required
                        disabled={!otpSent}
                      />
                      <Button
                        type="button"
                        onClick={handleSendPasswordOTP}
                        disabled={otpSending || otpTimer > 0}
                        className="bg-secondary hover:bg-secondary/80 text-white rounded-xl h-10 text-xs font-bold px-4 transition-all duration-300 shadow-md shadow-secondary/10 cursor-pointer"
                      >
                        {otpSending ? "Sending..." : otpTimer > 0 ? `Resend (${otpTimer}s)` : otpSent ? "Resend OTP" : "Send OTP"}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="newPassword" className="text-xs font-bold text-gray-400 uppercase tracking-wider">New Password</Label>
                    <Input 
                      id="newPassword"
                      type="password" 
                      name="newPassword" 
                      value={passwordData.newPassword} 
                      onChange={handlePasswordChange} 
                      placeholder="Minimum 6 characters" 
                      className="bg-background border-white/10 text-white placeholder-gray-600 rounded-xl h-10 text-sm focus-visible:border-accent"
                      required
                      disabled={!otpSent}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Confirm New Password</Label>
                    <Input 
                      id="confirmPassword"
                      type="password" 
                      name="confirmPassword" 
                      value={passwordData.confirmPassword} 
                      onChange={handlePasswordChange} 
                      placeholder="Confirm New Password" 
                      className="bg-background border-white/10 text-white placeholder-gray-600 rounded-xl h-10 text-sm focus-visible:border-accent"
                      required
                      disabled={!otpSent}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={passwordLoading || !otpSent}
                    className="bg-accent hover:bg-accent-hover text-background font-extrabold rounded-xl h-11 w-full text-sm mt-3 shadow-lg glow-accent transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                  >
                    {passwordLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={16} /> Updating...
                      </span>
                    ) : "Save Security Credentials"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default Profile;