import { useState } from "react";
import axios from "axios";

import {
    UserCircle,
    Mail,
    Building2,
    MapPin,
    LockKeyhole,
    Pencil,
    Phone
} from "lucide-react";

import Card from "../components/Card";
import Button from "../components/Button";
import Badge from "../components/Badge";

import "./Profile.css";

const Profile = ({ user, setUser }) => {
    const role = user?.role || "EMPLOYEE";

    const [showEditProfile, setShowEditProfile] = useState(false);

    const [notification, setNotification] = useState({
        show: false,
        type: "",
        message: ""
    });

    const [showChangePassword, setShowChangePassword] = useState(false);

    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        confirm_password: ""
    });

    const [profileData, setProfileData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",

        supplier_name: user?.supplier_name || "",
        supplier_email: user?.supplier_email || "",
        supplier_phone: user?.supplier_phone || "",
        supplier_address: user?.supplier_address || "",
        supplier_city: user?.supplier_city || "",
        supplier_state: user?.supplier_state || ""
    });

    const showNotification = (type, message) => {
        setNotification({
            show: true,
            type,
            message
        });

        setTimeout(() => {
            setNotification({
                show: false,
                type: "",
                message: ""
            });
        }, 3000);
    };

    // ==========================================
    // ORGANIZATION DETAILS
    // ==========================================

    const roleName = role.replace("_", " ");

    const organizationName =
        role === "SUPPLIER"
            ? user?.supplier_name
            : user?.company_name;

    const completeAddress =
        role === "SUPPLIER"
            ? [
                user?.supplier_address,
                user?.supplier_city,
                user?.supplier_state
            ]
                .filter(Boolean)
                .join(", ")
            : [
                user?.company_address,
                user?.company_city,
                user?.company_state
            ]
                .filter(Boolean)
                .join(", ");

    const organizationPhone =
        role === "SUPPLIER"
            ? user?.supplier_phone
            : user?.company_phone;

    const organizationEmail =
        role === "SUPPLIER"
            ? user?.supplier_email
            : user?.company_email;

    // ==========================================
    // DISPLAY HELPERS
    // ==========================================

    const getOrganizationText = () => {
        if (organizationName) {
            return organizationName;
        }

        if (role === "SUPER_ADMIN") {
            return "ProcureHub Platform";
        }

        return "Not available";
    };

    const getAddressText = () => {
        if (completeAddress) {
            return completeAddress;
        }

        if (role === "SUPER_ADMIN") {
            return "Platform Administrator";
        }

        return "Not available";
    };

    // ==========================================
    // HANDLE FORM CHANGES
    // ==========================================

    const handleProfileChange = (e) => {
        const { name, value } = e.target;

        setProfileData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // ==========================================
    // SAVE PROFILE
    // ==========================================

    const handleSaveProfile = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");

            const response = await axios.put(
                "http://localhost:5000/api/auth/profile",
                profileData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            showNotification(
                "success",
                response.data.message
            );

            // ------------------------------------------
            // Update localStorage user
            // ------------------------------------------

            const storedUser = JSON.parse(
                localStorage.getItem("user")
            );

            const updatedUser = {
                ...storedUser,

                name: profileData.name,
                email: profileData.email,
                phone: profileData.phone
            };

            // Add supplier information only for suppliers

            if (role === "SUPPLIER") {
                updatedUser.supplier_name =
                    profileData.supplier_name;

                updatedUser.supplier_email =
                    profileData.supplier_email;

                updatedUser.supplier_phone =
                    profileData.supplier_phone;

                updatedUser.supplier_address =
                    profileData.supplier_address;

                updatedUser.supplier_city =
                    profileData.supplier_city;

                updatedUser.supplier_state =
                    profileData.supplier_state;
            }

            localStorage.setItem(
                "user",
                JSON.stringify(updatedUser)
            );

            setUser(updatedUser);

            // Close modal

            setShowEditProfile(false);

        } catch (error) {
            console.error(
                "Update profile error:",
                error
            );

            if (error.response) {
                showNotification(
                    "error",
                    error.response.data.message ||
                    "Failed to update profile."
                );
            } else {
                showNotification(
                    "error",
                    "Unable to connect to the server."
                );
            }
        }
    };

    // ==========================================
    // OPEN EDIT PROFILE
    // ==========================================

    const handleOpenEditProfile = () => {
        // Reload form values from current user

        setProfileData({
            name: user?.name || "",
            email: user?.email || "",
            phone: user?.phone || "",

            supplier_name: user?.supplier_name || "",
            supplier_email: user?.supplier_email || "",
            supplier_phone: user?.supplier_phone || "",
            supplier_address: user?.supplier_address || "",
            supplier_city: user?.supplier_city || "",
            supplier_state: user?.supplier_state || ""
        });

        setShowEditProfile(true);
    };

    // ==========================================
    // CHANGE PASSWORD
    // ==========================================

    const handleChangePassword = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");

            const response = await axios.put(
                "http://localhost:5000/api/auth/change-password",
                passwordData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            showNotification(
                "success",
                response.data.message
            );

            setPasswordData({
                current_password: "",
                new_password: "",
                confirm_password: ""
            });

            setShowChangePassword(false);

        } catch (error) {
            console.error(
                "Change password error:",
                error
            );

            if (error.response) {
                showNotification(
                    "error",
                    error.response.data.message ||
                    "Failed to change password."
                );
            } else {
                showNotification(
                    "error",
                    "Unable to connect to the server."
                );
            }
        }
    };

    return (
        <div className="profile-page">

            {notification.show && (
                <div
                    className={`profile-notification ${notification.type}`}
                >
                    <span className="profile-notification-icon">
                        {notification.type === "success" ? "✓" : "!"}
                    </span>

                    <span>
                        {notification.message}
                    </span>
                </div>
            )}

            {/* ==========================================
                PAGE HEADING
            ========================================== */}

            <div className="profile-heading">

                <div>
                    <h1>My Profile</h1>

                    <p>
                        View and manage your account information.
                    </p>
                </div>

                <Button
                    variant="secondary"
                    onClick={handleOpenEditProfile}
                >
                    <Pencil size={16} />

                    Edit Profile
                </Button>

            </div>

            {/* ==========================================
                PROFILE OVERVIEW
            ========================================== */}

            <Card className="profile-overview">

                <div className="profile-avatar">
                    <UserCircle size={54} />
                </div>

                <div className="profile-main">

                    <h2>
                        {user?.name || "User Name"}
                    </h2>

                    <p>
                        {user?.email || "Email not available"}
                    </p>

                    <Badge variant="primary">
                        {roleName}
                    </Badge>

                </div>

            </Card>

            {/* ==========================================
                ACCOUNT INFORMATION
            ========================================== */}

            <Card>

                <div className="profile-section-header">

                    <div>
                        <h2>Account Information</h2>

                        <p>
                            Your basic account and organization details.
                        </p>
                    </div>

                </div>

                <div className="profile-info-grid">

                    {/* ORGANIZATION EMAIL */}

                    <div className="profile-info-item">

                        <Mail size={19} />

                        <div>

                            <span>
                                {role === "SUPPLIER"
                                    ? "Supplier Email"
                                    : "Company Email"}
                            </span>

                            <strong>
                                {organizationEmail || "Not available"}
                            </strong>

                        </div>

                    </div>

                    {/* ORGANIZATION */}

                    <div className="profile-info-item">

                        <Building2 size={19} />

                        <div>

                            <span>
                                {role === "SUPPLIER"
                                    ? "Supplier"
                                    : "Company"}
                            </span>

                            <strong>
                                {getOrganizationText()}
                            </strong>

                        </div>

                    </div>

                    {/* PHONE */}

                    <div className="profile-info-item">

                        <Phone size={19} />

                        <div>

                            <span>
                                {role === "SUPPLIER"
                                    ? "Mobile Number"
                                    : "Company Phone"}
                            </span>

                            <strong>
                                {organizationPhone || "Not available"}
                            </strong>

                        </div>

                    </div>

                    {/* ADDRESS */}

                    <div className="profile-info-item">

                        <MapPin size={19} />

                        <div>

                            <span>
                                {role === "SUPPLIER"
                                    ? "Location"
                                    : "Address"}
                            </span>

                            <strong>
                                {getAddressText()}
                            </strong>

                        </div>

                    </div>

                </div>

            </Card>

            {/* ==========================================
                SECURITY
            ========================================== */}

            <Card className="profile-security-card">

                <div className="profile-section-header">

                    <div>

                        <h2>Security</h2>

                        <p>
                            Manage your account password and security.
                        </p>

                    </div>

                </div>

                <div className="profile-security-content">

                    <div className="profile-security-icon">
                        <LockKeyhole size={22} />
                    </div>

                    <div className="profile-security-text">

                        <strong>Password</strong>

                        <span>
                            Keep your password secure and update it regularly.
                        </span>

                    </div>

                    <Button
                        variant="secondary"
                        onClick={() => setShowChangePassword(true)}
                    >
                        Change Password
                    </Button>

                </div>

            </Card>

            {/* ==========================================
                EDIT PROFILE MODAL
            ========================================== */}

            {showEditProfile && (

                <div className="profile-modal-overlay">

                    <div className="profile-modal">

                        {/* MODAL HEADER */}

                        <div className="profile-modal-header">

                            <div>

                                <h2>
                                    Edit Profile
                                </h2>

                                <p>
                                    Update your personal and supplier organization information.
                                </p>

                            </div>

                            <button
                                type="button"
                                className="profile-modal-close"
                                onClick={() => setShowEditProfile(false)}
                            >
                                ×
                            </button>

                        </div>

                        {/* FORM */}

                        <form
                            className="profile-edit-form"
                            onSubmit={handleSaveProfile}
                        >

                            {/* ==========================================
                                LOGIN INFORMATION
                            ========================================== */}

                            <div className="profile-form-section">

                                <div className="profile-form-section-heading">

                                    <h3>
                                        Personal / Login Information
                                    </h3>

                                    <p>
                                        These details belong to your ProcureHub login account.
                                    </p>

                                </div>

                                <div className="profile-form-grid">

                                    {/* FULL NAME */}

                                    <div className="profile-form-field">

                                        <label>
                                            Full Name
                                        </label>

                                        <input
                                            type="text"
                                            name="name"
                                            value={profileData.name}
                                            onChange={handleProfileChange}
                                            placeholder="Enter your name"
                                            required
                                        />

                                    </div>

                                    {/* LOGIN EMAIL */}

                                    <div className="profile-form-field">

                                        <label>
                                            Login Email
                                        </label>

                                        <input
                                            type="email"
                                            name="email"
                                            value={profileData.email}
                                            onChange={handleProfileChange}
                                            placeholder="Enter your login email"
                                            required
                                        />

                                    </div>

                                    {/* LOGIN PHONE */}

                                    <div className="profile-form-field">

                                        <label>
                                            Login Phone
                                        </label>

                                        <input
                                            type="tel"
                                            name="phone"
                                            value={profileData.phone}
                                            onChange={handleProfileChange}
                                            placeholder="Enter your phone number"
                                            required
                                        />

                                    </div>

                                </div>

                            </div>

                            {/* ==========================================
                                SUPPLIER ORGANIZATION
                            ========================================== */}

                            {role === "SUPPLIER" && (

                                <div className="profile-form-section">

                                    <div className="profile-form-section-heading">

                                        <h3>
                                            Supplier Organization
                                        </h3>

                                        <p>
                                            These details represent your supplier organization.
                                        </p>

                                    </div>

                                    <div className="profile-form-grid">

                                        {/* ORGANIZATION NAME */}

                                        <div className="profile-form-field">

                                            <label>
                                                Organization Name
                                            </label>

                                            <input
                                                type="text"
                                                name="supplier_name"
                                                value={profileData.supplier_name}
                                                onChange={handleProfileChange}
                                                placeholder="Enter organization name"
                                                required
                                            />

                                        </div>

                                        {/* ORGANIZATION EMAIL */}

                                        <div className="profile-form-field">

                                            <label>
                                                Organization Email
                                            </label>

                                            <input
                                                type="email"
                                                name="supplier_email"
                                                value={profileData.supplier_email}
                                                onChange={handleProfileChange}
                                                placeholder="Enter organization email"
                                                required
                                            />

                                        </div>

                                        {/* ORGANIZATION PHONE */}

                                        <div className="profile-form-field">

                                            <label>
                                                Organization Phone
                                            </label>

                                            <input
                                                type="tel"
                                                name="supplier_phone"
                                                value={profileData.supplier_phone}
                                                onChange={handleProfileChange}
                                                placeholder="Enter organization phone"
                                                required
                                            />

                                        </div>

                                        {/* CITY */}

                                        <div className="profile-form-field">

                                            <label>
                                                City
                                            </label>

                                            <input
                                                type="text"
                                                name="supplier_city"
                                                value={profileData.supplier_city}
                                                onChange={handleProfileChange}
                                                placeholder="Enter city"
                                                required
                                            />

                                        </div>

                                        {/* STATE */}

                                        <div className="profile-form-field">

                                            <label>
                                                State
                                            </label>

                                            <input
                                                type="text"
                                                name="supplier_state"
                                                value={profileData.supplier_state}
                                                onChange={handleProfileChange}
                                                placeholder="Enter state"
                                                required
                                            />

                                        </div>

                                        {/* ADDRESS */}

                                        <div className="profile-form-field profile-form-full">

                                            <label>
                                                Complete Address
                                            </label>

                                            <textarea
                                                rows="3"
                                                name="supplier_address"
                                                value={profileData.supplier_address}
                                                onChange={handleProfileChange}
                                                placeholder="Enter complete address"
                                                required
                                            />

                                        </div>

                                    </div>

                                </div>

                            )}

                            {/* ==========================================
                                ACTIONS
                            ========================================== */}

                            <div className="profile-form-actions">

                                <Button
                                    variant="secondary"
                                    type="button"
                                    onClick={() => setShowEditProfile(false)}
                                >
                                    Cancel
                                </Button>

                                <Button type="submit">
                                    Save Changes
                                </Button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

            {/* ==========================================
                CHANGE PASSWORD MODAL
            ========================================== */}

            {showChangePassword && (

                <div className="profile-modal-overlay">

                    <div className="profile-modal">

                        {/* MODAL HEADER */}

                        <div className="profile-modal-header">

                            <div>

                                <h2>
                                    Change Password
                                </h2>

                                <p>
                                    Update your account password securely.
                                </p>

                            </div>

                            <button
                                type="button"
                                className="profile-modal-close"
                                onClick={() => setShowChangePassword(false)}
                            >
                                ×
                            </button>

                        </div>

                        {/* FORM */}

                        <form
                            className="profile-edit-form"
                            onSubmit={handleChangePassword}
                        >

                            <div className="profile-form-section">

                                <div className="profile-form-section-heading">

                                    <h3>
                                        Password Information
                                    </h3>

                                    <p>
                                        Enter your current password and choose a new password.
                                    </p>

                                </div>

                                <div className="profile-form-grid">

                                    {/* CURRENT PASSWORD */}

                                    <div className="profile-form-field">

                                        <label>
                                            Current Password
                                        </label>

                                        <input
                                            type="password"
                                            name="current_password"
                                            value={passwordData.current_password}
                                            onChange={(e) =>
                                                setPasswordData((prev) => ({
                                                    ...prev,
                                                    current_password: e.target.value
                                                }))
                                            }
                                            placeholder="Enter current password"
                                            required
                                        />

                                    </div>

                                    {/* NEW PASSWORD */}

                                    <div className="profile-form-field">

                                        <label>
                                            New Password
                                        </label>

                                        <input
                                            type="password"
                                            name="new_password"
                                            value={passwordData.new_password}
                                            onChange={(e) =>
                                                setPasswordData((prev) => ({
                                                    ...prev,
                                                    new_password: e.target.value
                                                }))
                                            }
                                            placeholder="Enter new password"
                                            required
                                        />

                                    </div>

                                    {/* CONFIRM PASSWORD */}

                                    <div className="profile-form-field">

                                        <label>
                                            Confirm New Password
                                        </label>

                                        <input
                                            type="password"
                                            name="confirm_password"
                                            value={passwordData.confirm_password}
                                            onChange={(e) =>
                                                setPasswordData((prev) => ({
                                                    ...prev,
                                                    confirm_password: e.target.value
                                                }))
                                            }
                                            placeholder="Confirm new password"
                                            required
                                        />

                                    </div>

                                </div>

                            </div>

                            {/* ACTIONS */}

                            <div className="profile-form-actions">

                                <Button
                                    variant="secondary"
                                    type="button"
                                    onClick={() => {
                                        setShowChangePassword(false);

                                        setPasswordData({
                                            current_password: "",
                                            new_password: "",
                                            confirm_password: ""
                                        });
                                    }}
                                >
                                    Cancel
                                </Button>

                                <Button type="submit">
                                    Change Password
                                </Button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
};

export default Profile;