import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,Button } from '@mui/material';
import { Card, CardContent, Typography, Box, Grid, Stack } from '@mui/material';
import { Person as PersonIcon, ShoppingCart as ShoppingCartIcon, AttachMoney as MoneyIcon, ArrowBack } from '@mui/icons-material';
import axios from 'axios';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';

const ViewSingleMember = () => {
    const [memberData, setMemberData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { distributorId, memberId } = useParams();
    const navigate = useNavigate()
    useEffect(() => {
        fetchMemberDetails();
    }, [distributorId, memberId]);

    const fetchMemberDetails = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/distributor/${distributorId}/member/${memberId}`);
            if (response.data.success) {
                setMemberData(response.data.data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching member details:', error);
            setLoading(false);
        }
    };

    if (loading || !memberData) {
        return <Box sx={{ p: 3 }}>Loading...</Box>;
    }

    const totalCommitments = memberData.commitments.length;
    const totalSpent = memberData.commitments.reduce((sum, commitment) => sum + commitment.totalPrice, 0);
    const totalQuantity = memberData.commitments.reduce((sum, commitment) => sum + commitment.quantity, 0);

    const rows = memberData.commitments.map(commitment => ({
        ...commitment,
        id: commitment._id
    }));

    return (
        <>
        <Button onClick={()=> navigate(-1)}><ArrowBack /></Button>
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Member Details</Typography>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Member Information</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                            <Typography color="textSecondary">Name</Typography>
                            <Typography>{memberData.member.name}</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Typography color="textSecondary">Email</Typography>
                            <Typography>{memberData.member.email}</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Typography color="textSecondary">Phone</Typography>
                            <Typography>{memberData.member.phone || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Typography color="textSecondary">Address</Typography>
                            <Typography>{memberData.member.address || 'N/A'}</Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Card sx={{ flex: 1 }}>
                    <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <ShoppingCartIcon color="primary" />
                            <Box>
                                <Typography variant="h6">{totalCommitments}</Typography>
                                <Typography color="textSecondary">Total Commitments</Typography>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
                <Card sx={{ flex: 1 }}>
                    <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <PersonIcon color="primary" />
                            <Box>
                                <Typography variant="h6">{totalQuantity}</Typography>
                                <Typography color="textSecondary">Total Quantity</Typography>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
                <Card sx={{ flex: 1 }}>
                    <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <MoneyIcon color="primary" />
                            <Box>
                                <Typography variant="h6">${totalSpent.toFixed(2)}</Typography>
                                <Typography color="textSecondary">Total Spent</Typography>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            </Stack>

            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Commitment History</Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Deal Name</TableCell>
                                    <TableCell>Quantity</TableCell>
                                    <TableCell>Total Price</TableCell>
                                    <TableCell>Date</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell>{row.dealId.name}</TableCell>
                                        <TableCell>{row.quantity}</TableCell>
                                        <TableCell>${row.totalPrice.toFixed(2)}</TableCell>
                                        <TableCell>{moment(row.createdAt).format('MMMM Do YYYY, h:mm a')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
        </>
    );
};

export default ViewSingleMember;