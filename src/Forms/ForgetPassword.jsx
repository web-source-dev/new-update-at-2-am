import React, { useState, useEffect } from "react";
import { TextField, Button, Container, Typography, Grid, Box, Paper, Skeleton, CircularProgress } from "@mui/material";
import axios from "axios";
import Toast from "../Components/Toast/Toast";
import Links from "../Components/Buttons/Links";

const ForgetPasswordSkeleton = () => (
  <Container maxWidth="sm">
    <Box sx={{ mt: 4 }}>
      <Skeleton variant="text" sx={{ fontSize: '2rem', mb: 2, textAlign: 'center' }} />
      <Skeleton variant="text" sx={{ mb: 3, textAlign: 'center' }} width="80%" />
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={56} />
        </Box>
        <Skeleton variant="rectangular" height={42} />
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Skeleton variant="text" width={150} sx={{ mx: 'auto' }} />
        </Box>
      </Paper>
    </Box>
  </Container>
);

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [successMessage, setSuccessMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/auth/forget-password`,
        { email }
      );
      setToast({
        open: true,
        message: "Email sent successfully.",
        severity: "success",
      });
      setSuccessMessage(true);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Server error, please try again.";
      setToast({ open: true, message: errorMessage, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setToast({ ...toast, open: false });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(false);
    }, 3000); // Show skeleton for 3 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <Container
      maxWidth="sm"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div style={{ width: "100%" }}>
        {showSkeleton ? (
          <ForgetPasswordSkeleton />
        ) : (
          <>
            <Typography variant="h4" component="h1" gutterBottom>
              Forget Password
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : "Send Reset Link"}
                  </Button>
                  <Grid>
                    <Typography mt={2} sx={{display:'flex',justifyContent:'center',alignItems:'center', gap:'10px', fontSize:'18px' }} variant="body2" color="textSecondary" gutterBottom>
                      Remember your password?{" "}
                      <Links link={`/login`} linkText={`Back to login`} />
                    </Typography>
                  </Grid>
                  {successMessage && (
                    <Typography
                      mt={2}
                      variant="body2"
                      align="center"
                      color="textSecondary"
                      gutterBottom
                      sx={{ fontSize: "1.1rem" }}
                    >
                      Reset link sent to <strong>{email}</strong>. Use it within{" "}
                      <strong>one hour</strong> before it expires!.
                    </Typography>
                  )}
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <Links link={`/login`} text={`Back to login`} />
                  </Typography>
                </Grid>
              </Grid>
            </form>
            <Toast
              open={toast.open}
              message={toast.message}
              severity={toast.severity}
              handleClose={handleClose}
            />
          </>
        )}
      </div>
    </Container>
  );
};

export default ForgetPassword;
