import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Person as PersonIcon, ShoppingCart as ShoppingCartIcon, AttachMoney as MoneyIcon } from '@mui/icons-material';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';

const AllMembersForDistributor = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { distributorId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchMembers();
    }, [distributorId]);

    const fetchMembers = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/distributor/${distributorId}/members`);
            if (response.data.success) {
                setMembers(response.data.data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching members:', error);
            setLoading(false);
        }
    };

    const totalCommitments = members.reduce((sum, member) => sum + member.totalCommitments, 0);
    const totalRevenue = members.reduce((sum, member) => sum + member.totalSpent, 0);
    const totalQuantity = members.reduce((sum, member) => sum + member.quantity, 0);

    const rows = members.map(member => ({
        ...member,
        id: member.member._id
    }));

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Member Commitments Overview
            </Typography>
            
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Card sx={{ flex: 1 }}>
                    <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <PersonIcon color="primary.contrastText" />
                            <Box>
                                <Typography variant="h6">{members.length}</Typography>
                                <Typography color="textSecondary">Total Members</Typography>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
                <Card sx={{ flex: 1 }}>
                    <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <ShoppingCartIcon color="primary.contrastText" />
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
                            <MoneyIcon color="primary.contrastText" />
                            <Box>
                                <Typography variant="h6">${totalRevenue.toFixed(2)}</Typography>
                                <Typography color="textSecondary">Total Revenue</Typography>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            </Stack>

            <Paper elevation={3} sx={{ width: '100%' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Member Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Total Commitments</TableCell>
                                <TableCell>Total Spent</TableCell>
                                <TableCell>Last Commitment</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">Loading...</TableCell>
                                </TableRow>
                            ) : rows.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.member.name}</TableCell>
                                    <TableCell>{row.member.email}</TableCell>
                                    <TableCell>{row.totalCommitments}</TableCell>
                                    <TableCell>${row.totalSpent.toFixed(2)}</TableCell>
                                    <TableCell>{moment(row.lastCommitment).format('MMMM Do YYYY')}</TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'primary.contrastText',
                                                cursor: 'pointer',
                                                '&:hover': { textDecoration: 'underline' }
                                            }}
                                            onClick={() => navigate(`/dashboard/distributor/view/co-op-membors/${distributorId}/member/${row.member._id}`)}
                                            >
                                            View Details
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default AllMembersForDistributor;