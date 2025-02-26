import { Skeleton } from '@mui/material';

const ProfileSkeleton = () => (
  <Container>
    <Box sx={{ mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Skeleton variant="circular" width={150} height={150} sx={{ mx: 'auto', mb: 2 }} />
            <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 1 }} />
            <Skeleton variant="text" width="60%" sx={{ mx: 'auto' }} />
            <Box sx={{ mt: 2 }}>
              <Skeleton variant="rectangular" width={120} height={36} sx={{ mx: 'auto' }} />
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              {[...Array(6)].map((_, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Skeleton variant="text" sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" height={56} />
                </Grid>
              ))}
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Skeleton variant="rectangular" width={100} height={36} />
              <Skeleton variant="rectangular" width={100} height={36} />
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  </Container>
);

const Profile = () => {
  // ... existing state ...

  if (loading) {
    return <ProfileSkeleton />;
  }

  // ... rest of component
}; 