import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Signup from "./components/Signup";
import Login from "./components/Login";
import Profile from "./pages/Profile";
import AIChat from "./components/AiChat";
import Home from "./pages/Home";
import AddWork from "./pages/AddWork";

import Users from "./pages/admin/Users";
import Services from "./pages/admin/Services";
import Pnf from "./pages/Pnf";
import Connections from "./pages/Connections";
import Likes from "./pages/Likes";
import Admin from "./pages/admin/Admin";
import Settings from "./pages/Settings";
import ForgotPass from "./components/ForgotPass";
import PostList from "./pages/PostList";
import VideoPostList from "./pages/VideoPostList";
import MyVideo from "./pages/MyVideo";
import CreatePost from "./components/CreatePost";
import CreateVideoPost from "./components/CreateVideoPost";
import { useAuthStore } from "./store/authStore";
import Navbar from "./components/NavBar";
import UserProfileShow from "./pages/UserProfileShow";
import DeleteAcc from "./components/DeleteAcc";
import Followers from "./components/Followers";
import Following from "./components/Following";
import PasswordChange from "./components/PasswordReset";
import ApplyDoctor from "./pages/doctor/ApplyDoctor";
import DoctorApprove from "./pages/admin/DoctorApprove";
import AppointmentBooking from "./pages/appointment/AppointmentBooking";
import AppointmentHistory from "./pages/appointment/AppointmentHistory";
import Appointments from "./pages/appointment/Appointments"
import AllAppointments from "./pages/appointment/AllAppointments"
import Footer from "./components/Footer";


const App = () => {
  const { user } = useAuthStore();

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/signup" element={user ? <Home /> : <Signup />} />
        <Route path="/login" element={user ? <Home /> : <Login />} />
        <Route path="/forgotpass" element={user ? <Home /> : <ForgotPass />} />
        <Route path="*" element={<Pnf />} />
        <Route path="/" element={user ? <Home /> : <Login />} />
        <Route
          path="/connections"
          element={user ? <Connections /> : <Login />}
        />
        <Route path="/likes" element={user ? <Likes /> : <Login />} />
        <Route path="/settings" element={user ? <Settings /> : <Login />} />
        <Route path="/profile" element={user ? <Profile /> : <Login />} />
        <Route path="/addwork" element={user ? <AddWork /> : <Login />} />
        <Route path="/posts" element={user ? <PostList /> : <Login />} />
        <Route path="/followers/:userId" element={user ? <Followers /> : <Login />} />
        <Route path="/following/:userId" element={user ? <Following /> : <Login />} />
        <Route path="/" element={<PostList />} />
        <Route
          path="/videoposts"
          element={user ? <VideoPostList /> : <Login />}
        />
        <Route path="/myvideo" element={user ? <MyVideo /> : <Login />} />
        <Route path="/createpost" element={user ? <CreatePost /> : <Login />} />
        <Route path="/deleteacc" element={user ? <DeleteAcc /> : <Login />} />
        <Route path="/ai" element={user ? <AIChat /> : <Login />} />
        <Route path="/applydoc" element={user ? <ApplyDoctor /> : <Login />} />
        <Route
          path="/createvideopost"
          element={user ? <CreateVideoPost /> : <Login />}
        />
        <Route
          path="/changepass"
          element={user ? <PasswordChange /> : <Login />}
        />
        <Route
          path="/profile/:userId"
          element={user ? <UserProfileShow /> : <Login />}
        />
         <Route
          path="/book/:docId"
          element={user ? <AppointmentBooking /> : <Login />}
        />
         <Route
          path="/history"
          element={user ? <AppointmentHistory /> : <Login />}
        />
         <Route
          path="/appointments"
          element={user ? <Appointments /> : <Login />}
        />
         <Route
          path="/allappointments"
          element={user ? <AllAppointments /> : <Login />}
        />

        {user && (user.role === "admin" || user.role === "staff") && (
          <>
            <Route path="/services" element={user ? <Services /> : <Login />} />
            <Route path="/docapprove" element={user ? <DoctorApprove /> : <Login />} />
            <Route path="/admin" element={user ? <Admin /> : <Login />} />
            <Route path="/users" element={user ? <Users /> : <Login />} />
          </>
        )}
      </Routes>
      {user && (
      <Footer></Footer>
      )}
    </Router>
  );
};

export default App;
