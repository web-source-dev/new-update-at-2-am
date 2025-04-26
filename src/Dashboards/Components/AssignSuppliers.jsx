import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Stack,
  Typography,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Chip,
  TextField,
  Select as MuiSelect,
  MenuItem,
  FormControl,
  FormLabel,
  InputLabel,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Alert,
  Snackbar,
  Badge,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  GetApp as DownloadIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const AssignSuppliers = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  
  const [member, setMember] = useState(null);
  const [commitments, setCommitments] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [assignedSupplier, setAssignedSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });
  const [supplierMemberCounts, setSupplierMemberCounts] = useState({});

  // Get user data from localStorage
  const userData = localStorage.getItem("user_id");
  const user_role = localStorage.getItem("user_role");
  const distributorId = userData;
  const apiUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000/api";

  useEffect(() => {
    if (user_role !== "distributor") {
      alert("Access Denied: Only distributors can access this page");
      navigate(-1);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch member data and commitments
        const memberResponse = await axios.get(
          `${apiUrl}/suppliers/export-member-data/${memberId}/${distributorId}`
        );
        
        setMember(memberResponse.data.data.member);
        setCommitments(memberResponse.data.data.commitments);
        
        if (memberResponse.data.data.supplier) {
          setAssignedSupplier(memberResponse.data.data.supplier);
        }
        
        // Fetch all suppliers
        const suppliersResponse = await axios.get(
          `${apiUrl}/suppliers/by-distributor/${distributorId}`
        );
        setSuppliers(suppliersResponse.data.suppliers);
        
        // Calculate number of members per supplier
        const counts = {};
        suppliersResponse.data.suppliers.forEach(supplier => {
          if (supplier.assignedTo) {
            counts[supplier._id] = supplier.assignedTo.length;
          } else {
            counts[supplier._id] = 0;
          }
        });
        setSupplierMemberCounts(counts);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        setSnackbar({
          open: true,
          message: "Failed to fetch data. Please try again.",
          severity: "error"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [memberId, distributorId, apiUrl, user_role, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSupplierSelect = (e) => {
    setSelectedSupplierId(e.target.value);
  };

  const handleCreateSupplier = async () => {
    try {
      if (!formData.name || !formData.email) {
        setSnackbar({
          open: true,
          message: "Please provide both name and email for the supplier",
          severity: "warning"
        });
        return;
      }
      
      const response = await axios.post(`${apiUrl}/suppliers`, {
        ...formData,
        distributorId,
      });
      
      setSnackbar({
        open: true,
        message: "Supplier has been created successfully",
        severity: "success"
      });
      
      // Add new supplier to list and reset form
      setSuppliers([...suppliers, response.data.supplier]);
      setFormData({ name: "", email: "" });
      setModalOpen(false);
      
    } catch (error) {
      console.error("Error creating supplier:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to create supplier",
        severity: "error"
      });
    }
  };

  const handleAssignSupplier = async () => {
    try {
      if (!selectedSupplierId) {
        setSnackbar({
          open: true,
          message: "Please select a supplier to assign",
          severity: "warning"
        });
        return;
      }
      
      await axios.put(`${apiUrl}/suppliers/assign/${selectedSupplierId}`, {
        memberId,
        distributorId,
        multiMemberAssignment: true // Ensure the same supplier can be assigned to multiple members
      });
      
      // Find the selected supplier from the list
      const supplier = suppliers.find(s => s._id === selectedSupplierId);
      setAssignedSupplier(supplier);
      
      // Update the member count for this supplier
      setSupplierMemberCounts(prev => ({
        ...prev,
        [selectedSupplierId]: (prev[selectedSupplierId] || 0) + 1
      }));
      
      setSnackbar({
        open: true,
        message: "Supplier has been assigned successfully",
        severity: "success"
      });
      
    } catch (error) {
      console.error("Error assigning supplier:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to assign supplier",
        severity: "error"
      });
    }
  };

  const handleRemoveSupplier = async () => {
    try {
      if (!assignedSupplier) {
        return;
      }
      
      await axios.put(`${apiUrl}/suppliers/unassign/${assignedSupplier.id}`, {
        memberId,
        distributorId
      });
      
      // Update the member count for this supplier
      if (supplierMemberCounts[assignedSupplier.id] > 0) {
        setSupplierMemberCounts(prev => ({
          ...prev,
          [assignedSupplier.id]: prev[assignedSupplier.id] - 1
        }));
      }
      
      setAssignedSupplier(null);
      setAlertOpen(false);
      
      setSnackbar({
        open: true,
        message: "Supplier has been unassigned successfully",
        severity: "success"
      });
      
    } catch (error) {
      console.error("Error removing supplier:", error);
      setSnackbar({
        open: true,
        message: "Failed to remove supplier",
        severity: "error"
      });
    }
  };

  const handleExportData = async () => {
    try {
      setExportLoading(true);
      
      // Create Excel workbook
      const wb = XLSX.utils.book_new();
      
      // Member info sheet
      const memberData = [
        ["Member Information"],
        ["Name", member.name],
        ["Business Name", member.businessName || "N/A"],
        ["Email", member.email],
        ["Phone", member.phone || "N/A"],
        ["Address", member.address || "N/A"],
        [""],
        ["Supplier Information"],
        ["Name", assignedSupplier?.name || "Not Assigned"],
        ["Email", assignedSupplier?.email || "N/A"],
      ];
      const memberSheet = XLSX.utils.aoa_to_sheet(memberData);
      XLSX.utils.book_append_sheet(wb, memberSheet, "Member Info");
      
      // Commitments sheet with detailed information
      const commitmentHeaders = [
        "Deal Name",
        "Category",
        "Size",
        "Quantity",
        "Price/Unit",
        "Total Price",
        "Status",
        "Date"
      ];
      
      const commitmentRows = [];
      commitmentRows.push(commitmentHeaders);
      
      commitments.forEach(commitment => {
        commitment.sizeCommitments.forEach(sizeCommit => {
          commitmentRows.push([
            commitment.dealName,
            commitment.category || "N/A",
            sizeCommit.size,
            sizeCommit.quantity,
            `$${sizeCommit.pricePerUnit.toFixed(2)}`,
            `$${sizeCommit.totalPrice.toFixed(2)}`,
            commitment.status,
            new Date(commitment.createdAt).toLocaleDateString()
          ]);
        });
      });
      
      const commitmentSheet = XLSX.utils.aoa_to_sheet(commitmentRows);
      XLSX.utils.book_append_sheet(wb, commitmentSheet, "Commitments");
      
      // Export excel file
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const fileName = `${member.businessName || member.name}_Data.xlsx`;
      
      saveAs(
        new Blob([excelBuffer], { type: "application/octet-stream" }),
        fileName
      );
      
      setSnackbar({
        open: true,
        message: "Member data has been exported successfully",
        severity: "success"
      });
    } catch (error) {
      console.error("Export error:", error);
      setSnackbar({
        open: true,
        message: "There was an error exporting the data",
        severity: "error"
      });
    } finally {
      setExportLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getSupplierMemberCount = (supplierId) => {
    return supplierMemberCounts[supplierId] || 0;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 5 }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={5}>
        <IconButton
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">
          Manage Supplier for {member.businessName || member.name}
        </Typography>
      </Stack>

      <Grid container spacing={5} mb={5}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Member Information" />
            <CardContent>
              <Stack spacing={3}>
                <Box sx={{ display: "flex" }}>
                  <Typography fontWeight="bold" sx={{ width: 150 }}>Name:</Typography>
                  <Typography>{member.name}</Typography>
                </Box>
                <Box sx={{ display: "flex" }}>
                  <Typography fontWeight="bold" sx={{ width: 150 }}>Business:</Typography>
                  <Typography>{member.businessName || "N/A"}</Typography>
                </Box>
                <Box sx={{ display: "flex" }}>
                  <Typography fontWeight="bold" sx={{ width: 150 }}>Email:</Typography>
                  <Typography>{member.email}</Typography>
                </Box>
                <Box sx={{ display: "flex" }}>
                  <Typography fontWeight="bold" sx={{ width: 150 }}>Phone:</Typography>
                  <Typography>{member.phone || "N/A"}</Typography>
                </Box>
                <Box sx={{ display: "flex" }}>
                  <Typography fontWeight="bold" sx={{ width: 150 }}>Address:</Typography>
                  <Typography>{member.address || "N/A"}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Commitment Summary" />
            <CardContent>
              <Box mb={4}>
                <Typography color="textSecondary" gutterBottom>Total Deals</Typography>
                <Typography variant="h4">{commitments.length}</Typography>
              </Box>
              <Box mb={4}>
                <Typography color="textSecondary" gutterBottom>Total Value</Typography>
                <Typography variant="h4">
                  ${commitments.reduce((sum, c) => sum + c.totalPrice, 0).toFixed(2)}
                </Typography>
              </Box>
              <Button
                startIcon={<DownloadIcon />}
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleExportData}
                disabled={exportLoading}
              >
                Export Member Data
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 8 }}>
        <CardHeader 
          title="Supplier Assignment" 
          subheader="Assign this member to a supplier who will handle their committed deals"
        />
        <CardContent>
          {assignedSupplier ? (
            <Box>
              <Paper
                elevation={1}
                sx={{
                  p: 4,
                  mb: 5,
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  alignItems: { xs: "stretch", md: "center" },
                  justifyContent: "space-between"
                }}
              >
                <Stack spacing={2} sx={{ mb: { xs: 4, md: 0 } }}>
                  <Typography>
                    <Typography component="span" fontWeight="bold">Current Supplier:</Typography>{" "}
                    <Tooltip title={`${getSupplierMemberCount(assignedSupplier.id)} members are assigned to this supplier`}>
                      <Badge 
                        badgeContent={getSupplierMemberCount(assignedSupplier.id)} 
                        color="primary"
                        max={999}
                        showZero
                      >
                        <Chip
                          label={assignedSupplier.name}
                          color="success"
                          size="small"
                          icon={<GroupIcon fontSize="small" />}
                        />
                      </Badge>
                    </Tooltip>
                  </Typography>
                  <Typography>
                    <Typography component="span" fontWeight="bold">Email:</Typography>{" "}
                    {assignedSupplier.email}
                  </Typography>
                </Stack>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setAlertOpen(true)}
                >
                  Remove Supplier from Member
                </Button>
              </Paper>

              <Divider sx={{ my: 4 }} />

              <Typography fontWeight="bold" sx={{ mb: 3 }}>
                Change Supplier for this Member
              </Typography>
              <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
                <FormControl fullWidth>
                  <InputLabel id="supplier-select-label">Select a supplier</InputLabel>
                  <MuiSelect
                    labelId="supplier-select-label"
                    label="Select a supplier"
                    value={selectedSupplierId}
                    onChange={handleSupplierSelect}
                  >
                    {suppliers
                      .filter(s => s.id !== assignedSupplier.id)
                      .map((supplier) => (
                        <MenuItem key={supplier._id} value={supplier._id}>
                          {supplier.name} ({supplier.email}) - {getSupplierMemberCount(supplier._id)} members
                        </MenuItem>
                      ))}
                  </MuiSelect>
                </FormControl>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAssignSupplier}
                  disabled={!selectedSupplierId}
                >
                  Change Supplier
                </Button>
              </Stack>
            </Box>
          ) : (
            <Box>
              <Alert severity="info" sx={{ mb: 4 }}>
                This member is not assigned to any supplier. Assigning a supplier helps you organize which supplier will handle this member's orders.
              </Alert>

              <Stack direction={{ xs: "column", md: "row" }} spacing={4} sx={{ mb: 6 }}>
                <FormControl fullWidth>
                  <InputLabel id="supplier-select-label">Select a supplier</InputLabel>
                  <MuiSelect
                    labelId="supplier-select-label"
                    label="Select a supplier"
                    value={selectedSupplierId}
                    onChange={handleSupplierSelect}
                  >
                    {suppliers.map((supplier) => (
                      <MenuItem key={supplier._id} value={supplier._id}>
                        {supplier.name} ({supplier.email}) - {getSupplierMemberCount(supplier._id)} members
                      </MenuItem>
                    ))}
                  </MuiSelect>
                </FormControl>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAssignSupplier}
                  disabled={!selectedSupplierId}
                >
                  Assign Supplier
                </Button>
              </Stack>

              <Divider sx={{ my: 4 }} />

              <Button
                startIcon={<AddIcon />}
                variant="contained"
                color="primary"
                onClick={() => setModalOpen(true)}
              >
                Create New Supplier
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Commitment Details" />
        <CardContent>
          <Paper sx={{ width: '100%', overflow: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Deal Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Sizes</TableCell>
                  <TableCell>Total Price</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {commitments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No commitments found
                    </TableCell>
                  </TableRow>
                ) : (
                  commitments.map((commitment) => (
                    <TableRow key={commitment.id}>
                      <TableCell>{commitment.dealName}</TableCell>
                      <TableCell>{commitment.category || "N/A"}</TableCell>
                      <TableCell>
                        {commitment.sizeCommitments.map((sizeCommit, index) => (
                          <Typography key={index} variant="body2">
                            {sizeCommit.size}: {sizeCommit.quantity} units
                          </Typography>
                        ))}
                      </TableCell>
                      <TableCell>${commitment.totalPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip
                          label={commitment.status}
                          color={
                            commitment.status === "approved"
                              ? "success"
                              : commitment.status === "pending"
                              ? "warning"
                              : "error"
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </CardContent>
      </Card>

      {/* Create Supplier Modal */}
      <Modal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)}
        aria-labelledby="create-supplier-modal"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          borderRadius: 1,
          boxShadow: 24,
          p: 4,
        }}>
          <Typography variant="h6" component="h2" mb={3}>
            Create New Supplier
          </Typography>
          <FormControl fullWidth sx={{ mb: 4 }}>
            <FormLabel>Supplier Name</FormLabel>
            <TextField
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter supplier name"
              fullWidth
              size="small"
              margin="dense"
            />
          </FormControl>
          <FormControl fullWidth sx={{ mb: 4 }}>
            <FormLabel>Supplier Email</FormLabel>
            <TextField
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter supplier email"
              type="email"
              fullWidth
              size="small"
              margin="dense"
            />
          </FormControl>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleCreateSupplier}>
              Create
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Confirmation Dialog for Removing Supplier */}
      <Dialog
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Remove Supplier Assignment
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to remove {assignedSupplier?.name} as a supplier for {member?.name}?
            This will only remove the assignment for this specific member, not for other members assigned to this supplier.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlertOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleRemoveSupplier} autoFocus>
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={5000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AssignSuppliers;
