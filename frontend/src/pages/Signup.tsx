import React from "react";
import { IoIosLogIn } from "react-icons/io";
import { Box, Typography, Button } from "@mui/material";
import CustomizedInput from "../components/shared/CustomizedInput";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    // Basic validation
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      toast.loading("Signing Up...", { id: "signup" });
      await auth?.signup(email, password, name);
      toast.success("Signed up successfully!", { id: "signup" });
      // Navigate to login or dashboard after successful signup
      navigate("/login");
    } catch (error: any) {
      console.log(error);
      const errorMessage = error?.response?.data?.message || error?.message || "Signup failed";
      toast.error(errorMessage, { id: "signup" });
    }
  };

  return (
    <Box width={"100%"} height={"100%"} display="flex" flex={1}>
      <Box padding={8} mt={8} display="flex">
        <img src="/robo.png" alt="Robot" style={{ width: "400px" }} />
      </Box>
      <Box
        display={"flex"}
        flex={{ xs: 1, md: 0.5 }}
        justifyContent={"center"}
        alignItems={"center"}
        padding={2}
        ml={"auto"}
        mt={16}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            margin: "auto",
            padding: "30px",
            boxShadow: "10px 10px 20px #000",
            borderRadius: "10px",
            border: "none",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h4"
              textAlign="center"
              padding={2}
              fontWeight={600}
            >
              Sign Up
            </Typography>
            <CustomizedInput type="text" name="name" label="Full Name" />
            <CustomizedInput type="email" name="email" label="Email" />
            <CustomizedInput type="password" name="password" label="Password" />
            <Button
              type="submit"
              sx={{
                px: 2,
                py: 1,
                mt: 2,
                width: "400px",
                borderRadius: 2,
                bgcolor: "#00ffff",
                color: "black",
                fontWeight: "bold",
                ":hover": {
                  bgcolor: "white",
                  color: "black",
                },
              }}
              endIcon={<IoIosLogIn />}
            >
              Sign Up
            </Button>
            <Typography
              variant="body2"
              textAlign="center"
              mt={2}
              sx={{ cursor: "pointer" }}
              onClick={() => navigate("/login")}
            >
              Already have an account? <span style={{ color: "#00ffff", textDecoration: "underline" }}>Login here</span>
            </Typography>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default Signup;