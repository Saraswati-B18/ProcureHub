import { useEffect, useState } from "react";
import axios from "axios";

import {
  UserCircle,
  Mail,
  Building2,
  MapPin,
  Phone,
  LockKeyhole,
  Pencil
} from "lucide-react";

import Card from "../components/Card";
import Button from "../components/Button";
import Badge from "../components/Badge";

import "./Profile.css";

const CompanyAdminCompany = () => {

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [showEditProfile, setShowEditProfile] = useState(false);

  const [showChangePassword, setShowChangePassword] = useState(false);

const [passwordData, setPasswordData] = useState({
  current_password: "",
  new_password: "",
  confirm_password: ""
});

const [passwordMessage, setPasswordMessage] = useState("");
const [savingPassword, setSavingPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",

    company_name: "",
    company_email: "",
    company_phone: "",
    company_address: "",
    company_city: "",
    company_state: ""
  });

  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: ""
  });

  // ==========================================
  // FETCH COMPANY
  // ==========================================

  const fetchMyCompany = async () => {

    try {

      setLoading(true);
      setErrorMessage("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/companies/my-company",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setCompany(response.data.company);

    } catch (error) {

      console.error(
        "Failed to fetch company:",
        error
      );

      setErrorMessage(
        error.response?.data?.message ||
        "Failed to load company information."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    fetchMyCompany();
  }, []);


  // ==========================================
  // NOTIFICATION
  // ==========================================

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
  // OPEN EDIT PROFILE
  // ==========================================

  const handleOpenEditProfile = () => {

    const storedUser =
      JSON.parse(localStorage.getItem("user")) || {};

    setProfileData({

      name:
        company?.admin_name ||
        storedUser.name ||
        "",

      email:
        company?.admin_email ||
        storedUser.email ||
        "",

      phone:
        company?.admin_phone ||
        storedUser.phone ||
        "",

      company_name:
        company?.company_name || "",

      company_email:
        company?.email || "",

      company_phone:
        company?.phone || "",

      company_address:
        company?.address || "",

      company_city:
        company?.city || "",

      company_state:
        company?.state || ""
    });

    setShowEditProfile(true);
  };


  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleProfileChange = (e) => {

  const {
    name,
    value
  } = e.target;

  if (
    name === "phone" ||
    name === "company_phone"
  ) {
    const numbersOnly = value
      .replace(/\D/g, "")
      .slice(0, 10);

    setProfileData((prev) => ({
      ...prev,
      [name]: numbersOnly
    }));

    return;
  }

  setProfileData((prev) => ({
    ...prev,
    [name]: value
  }));
};


  // ==========================================
  // SAVE PROFILE + COMPANY
  // ==========================================

  const handleSaveProfile = async (e) => {

    e.preventDefault();

    try {

      const token =
        localStorage.getItem("token");

      // --------------------------------------
      // Update Company Admin personal details
      // --------------------------------------

      await axios.put(
        "http://localhost:5000/api/auth/profile",
        {
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );


      // --------------------------------------
      // Update Company details
      // --------------------------------------

      await axios.put(
        "http://localhost:5000/api/companies/my-company",
        {
          company_name:
            profileData.company_name,

          email:
            profileData.company_email,

          phone:
            profileData.company_phone,

          address:
            profileData.company_address,

          city:
            profileData.company_city,

          state:
            profileData.company_state
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );


      // --------------------------------------
      // Update localStorage user
      // --------------------------------------

      const storedUser =
        JSON.parse(
          localStorage.getItem("user")
        ) || {};

      const updatedUser = {
        ...storedUser,

        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,

        company_name:
          profileData.company_name,

        company_email:
          profileData.company_email,

        company_phone:
          profileData.company_phone,

        company_address:
          profileData.company_address,

        company_city:
          profileData.company_city,

        company_state:
          profileData.company_state
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );


      showNotification(
        "success",
        "Profile and company information updated successfully."
      );

      setShowEditProfile(false);

      await fetchMyCompany();

    } catch (error) {

      console.error(
        "Update profile failed:",
        error
      );

      showNotification(
        "error",
        error.response?.data?.message ||
        "Failed to update information."
      );
    }
  };

  const handleSaveCompany = async (e) => {

  e.preventDefault();

  try {
    setSavingCompany(true);
    setCompanyMessage("");

    const token = localStorage.getItem("token");

    await axios.put(
      "http://localhost:5000/api/companies/my-company",
      companyForm,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setCompanyMessage(
      "Company information updated successfully."
    );

    await fetchMyCompany();
    setShowEditCompany(false);

  } catch (error) {

    console.error(
      "Update company failed:",
      error
    );

    setCompanyMessage(
      error.response?.data?.message ||
      "Failed to update company information."
    );

  } finally {

    setSavingCompany(false);

  }
};


// 👇 ADD THE PASSWORD HANDLER HERE

const handleChangePassword = async (e) => {

  e.preventDefault();

  if (
    !passwordData.current_password ||
    !passwordData.new_password ||
    !passwordData.confirm_password
  ) {
    setPasswordMessage(
      "All password fields are required."
    );
    return;
  }

  if (
    passwordData.new_password !==
    passwordData.confirm_password
  ) {
    setPasswordMessage(
      "New password and confirm password do not match."
    );
    return;
  }

  if (passwordData.new_password.length < 6) {
    setPasswordMessage(
      "New password must contain at least 6 characters."
    );
    return;
  }

  try {

    setSavingPassword(true);
    setPasswordMessage("");

    const token =
      localStorage.getItem("token");

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
  response.data.message ||
    "Password changed successfully."
);
    setPasswordData({
      current_password: "",
      new_password: "",
      confirm_password: ""
    });

    setTimeout(() => {
      setShowChangePassword(false);
      setPasswordMessage("");
    }, 1500);

  } catch (error) {

    console.error(
      "Change password failed:",
      error
    );

    setPasswordMessage(
      error.response?.data?.message ||
      "Failed to change password."
    );

  } finally {

    setSavingPassword(false);

  }
};


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (
      <div className="profile-page">

        <div className="profile-loading">
          Loading profile information...
        </div>

      </div>
    );
  }


  // ==========================================
  // ERROR
  // ==========================================

  if (errorMessage) {

    return (
      <div className="profile-page">

        <div className="profile-error">
          {errorMessage}
        </div>

      </div>
    );
  }


  if (!company) {

    return (
      <div className="profile-page">

        <div className="profile-empty">
          Company information not available.
        </div>

      </div>
    );
  }


  // ==========================================
  // PAGE
  // ==========================================

  return (

    <div className="profile-page">

      {/* NOTIFICATION */}

      {notification.show && (

        <div
          className={`profile-notification ${notification.type}`}
        >

          <span className="profile-notification-icon">
            {notification.type === "success"
              ? "✓"
              : "!"}
          </span>

          <span>
            {notification.message}
          </span>

        </div>

      )}


      {/* PAGE HEADING */}

      <div className="profile-heading">

        <div>

          <h1>
            My Profile
          </h1>

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


      {/* PROFILE OVERVIEW */}

      <Card className="profile-overview">

        <div className="profile-avatar">

          <UserCircle size={54} />

        </div>


        <div className="profile-main">

          <h2>
            {company.admin_name ||
              "Company Admin"}
          </h2>

          <p>
            {company.admin_email ||
              "Email not available"}
          </p>

          <Badge variant="primary">
            COMPANY ADMIN
          </Badge>

        </div>

      </Card>


      {/* ACCOUNT INFORMATION */}

      <Card>

        <div className="profile-section-header">

          <div>

            <h2>
              Account Information
            </h2>

            <p>
              Your basic account and company details.
            </p>

          </div>

        </div>


        <div className="profile-info-grid">


          {/* COMPANY EMAIL */}

          <div className="profile-info-item">

            <Mail size={19} />

            <div>

              <span>
                Company Email
              </span>

              <strong>
                {company.email ||
                  "Not available"}
              </strong>

            </div>

          </div>


          {/* COMPANY */}

          <div className="profile-info-item">

            <Building2 size={19} />

            <div>

              <span>
                Company
              </span>

              <strong>
                {company.company_name ||
                  "Not available"}
              </strong>

            </div>

          </div>


          {/* COMPANY PHONE */}

          <div className="profile-info-item">

            <Phone size={19} />

            <div>

              <span>
                Company Phone
              </span>

              <strong>
                {company.phone ||
                  "Not available"}
              </strong>

            </div>

          </div>


          {/* ADDRESS */}

          <div className="profile-info-item">

            <MapPin size={19} />

            <div>

              <span>
                Address
              </span>

              <strong>
                {company.address ||
                  "Not available"}
              </strong>

            </div>

          </div>


          {/* CITY */}

          <div className="profile-info-item">

            <MapPin size={19} />

            <div>

              <span>
                City
              </span>

              <strong>
                {company.city ||
                  "Not available"}
              </strong>

            </div>

          </div>


          {/* STATE */}

          <div className="profile-info-item">

            <MapPin size={19} />

            <div>

              <span>
                State
              </span>

              <strong>
                {company.state ||
                  "Not available"}
              </strong>

            </div>

          </div>

        </div>

      </Card>


      {/* SECURITY */}

      <Card className="profile-security-card">

        <div className="profile-section-header">

          <div>

            <h2>
              Security
            </h2>

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

            <strong>
              Password
            </strong>

            <span>
              Keep your password secure and update it regularly.
            </span>

          </div>


          <Button
  variant="secondary"
  onClick={() => {
    setPasswordMessage("");
    setPasswordData({
      current_password: "",
      new_password: "",
      confirm_password: ""
    });
    setShowChangePassword(true);
  }}
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


            {/* HEADER */}

            <div className="profile-modal-header">

              <div>

                <h2>
                  Edit Profile
                </h2>

                <p>
                  Update your personal and company information.
                </p>

              </div>


              <button
                type="button"
                className="profile-modal-close"
                onClick={() =>
                  setShowEditProfile(false)
                }
              >
                ×
              </button>

            </div>


            {/* FORM */}

            <form
              className="profile-edit-form"
              onSubmit={handleSaveProfile}
            >


              {/* PERSONAL */}

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


                  <div className="profile-form-field">

                    <label>
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      required
                    />

                  </div>


                  <div className="profile-form-field">

                    <label>
                      Login Email
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      required
                    />

                  </div>


                  <div className="profile-form-field">

                    <label>
                      Login Phone
                    </label>

                    <input
  type="tel"
  name="phone"
  value={profileData.phone}
  onChange={handleProfileChange}
  placeholder="Enter 10-digit mobile number"
  maxLength="10"
  required
/>
                  </div>

                </div>

              </div>


              {/* COMPANY */}

              <div className="profile-form-section">

                <div className="profile-form-section-heading">

                  <h3>
                    Company Information
                  </h3>

                  <p>
                    These details belong to your company.
                  </p>

                </div>


                <div className="profile-form-grid">


                  <div className="profile-form-field">

                    <label>
                      Company Name
                    </label>

                    <input
                      type="text"
                      name="company_name"
                      value={profileData.company_name}
                      onChange={handleProfileChange}
                      required
                    />

                  </div>


                  <div className="profile-form-field">

                    <label>
                      Company Email
                    </label>

                    <input
                      type="email"
                      name="company_email"
                      value={profileData.company_email}
                      onChange={handleProfileChange}
                      required
                    />

                  </div>


                  <div className="profile-form-field">

                    <label>
                      Company Phone
                    </label>

                   <input
  type="tel"
  name="company_phone"
  value={profileData.company_phone}
  onChange={handleProfileChange}
  placeholder="Enter 10-digit mobile number"
  maxLength="10"
  required
/>

                  </div>


                  <div className="profile-form-field">

                    <label>
                      City
                    </label>

                    <input
                      type="text"
                      name="company_city"
                      value={profileData.company_city}
                      onChange={handleProfileChange}
                      required
                    />

                  </div>


                  <div className="profile-form-field">

                    <label>
                      State
                    </label>

                    <input
                      type="text"
                      name="company_state"
                      value={profileData.company_state}
                      onChange={handleProfileChange}
                      required
                    />

                  </div>


                  <div className="profile-form-field profile-form-full">

                    <label>
                      Complete Address
                    </label>

                    <textarea
                      rows="3"
                      name="company_address"
                      value={profileData.company_address}
                      onChange={handleProfileChange}
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
                  onClick={() =>
                    setShowEditProfile(false)
                  }
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

            <div className="profile-modal-header">

              <div>

                <h2>
                  Change Password
                </h2>

                <p>
                  Update your account password.
                </p>

              </div>

              <button
                type="button"
                className="profile-modal-close"
                onClick={() => {
                  setShowChangePassword(false);
                  setPasswordMessage("");
                }}
                disabled={savingPassword}
              >
                ×
              </button>

            </div>


            <form
              className="profile-edit-form"
              onSubmit={handleChangePassword}
            >

              <div className="profile-form-section">

                <div className="profile-form-grid">

                  <div className="profile-form-field profile-form-full">

                    <label>
                      Current Password
                    </label>

                    <input
                      type="password"
                      name="current_password"
                      value={passwordData.current_password}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          current_password: e.target.value
                        })
                      }
                      required
                    />

                  </div>


                  <div className="profile-form-field">

                    <label>
                      New Password
                    </label>

                    <input
                      type="password"
                      name="new_password"
                      value={passwordData.new_password}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          new_password: e.target.value
                        })
                      }
                      required
                    />

                  </div>


                  <div className="profile-form-field">

                    <label>
                      Confirm New Password
                    </label>

                    <input
                      type="password"
                      name="confirm_password"
                      value={passwordData.confirm_password}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirm_password: e.target.value
                        })
                      }
                      required
                    />

                  </div>

                </div>


                {passwordMessage && (

                  <div className="profile-password-message">
                    {passwordMessage}
                  </div>

                )}

              </div>


              <div className="profile-form-actions">

                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordMessage("");
                  }}
                  disabled={savingPassword}
                >
                  Cancel
                </Button>


                <Button
                  type="submit"
                  disabled={savingPassword}
                >
                  {savingPassword
                    ? "Changing..."
                    : "Change Password"}
                </Button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default CompanyAdminCompany;