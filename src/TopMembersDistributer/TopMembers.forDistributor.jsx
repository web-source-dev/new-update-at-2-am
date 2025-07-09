import React, { useState, useEffect } from 'react';
import { Paper, Typography, TextField, Box, Stack, Table, Button,TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const TopMembersForDistributor = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [limit, setLimit] = useState(5);
    const distributorId = localStorage.getItem('user_id');
    const navigate = useNavigate();

    useEffect(() => {
        fetchTopMembers();
    }, [distributorId, limit]);

    const fetchTopMembers = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/distributor/${distributorId}/top-members?limit=${limit}`);
            if (response.data.success) {
                setMembers(response.data.data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching top members:', error);
            setLoading(false);
        }
    };

    const rows = members.map((member, index) => ({
        ...member,
        id: member.member._id,
        rank: index,
    }));

    return (
        <Box sx={{ p: 3 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent='space-between'>
                    <Typography variant="h5" gutterBottom>
                        Top Members
                    </Typography>
                    <Button sx={{
                        color: 'primary.contrastText',
                    }}
                     onClick={()=> navigate (`all/co-op-membors/${distributorId}`)}>
                        View All
                    </Button>
                </Stack>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>No.</TableCell>
                                <TableCell>Member Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Total Commitments</TableCell>
                                <TableCell>Total Spent</TableCell>
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
                                    <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            {row.rank + 1}
                                        </Stack>
                                    </TableCell>
                                    <TableCell>{row.member.name}</TableCell>
                                    <TableCell>{row.member.email}</TableCell>
                                    <TableCell>{row.totalCommitments}</TableCell>
                                    <TableCell>${row.totalSpent.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'primary.contrastText',
                                                cursor: 'pointer',
                                                '&:hover': { textDecoration: 'underline' },
                                            }}
                                            onClick={() => navigate(`view/co-op-membors/${distributorId}/member/${row.member._id}`)}
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

export default TopMembersForDistributor;