import { Skeleton } from '@mui/material';

const SettingsSkeleton = () => (
  <Container>
    <Box sx={{ mb: 4 }}>
      <Skeleton variant="text" sx={{ fontSize: '2rem', mb: 3 }} />
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* General Settings */}
          <Grid item xs={12}>
            <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 2 }} />
            <Grid container spacing={2}>
              {[...Array(4)].map((_, index) => (
                <Grid item xs={12} key={index}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" sx={{ fontSize: '1.1rem' }} />
                      <Skeleton variant="text" width="60%" />
                    </Box>
                    <Skeleton variant="rectangular" width={60} height={34} />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Notification Settings */}
          <Grid item xs={12}>
            <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 2 }} />
            {[...Array(3)].map((_, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" sx={{ fontSize: '1.1rem' }} />
                    <Skeleton variant="text" width="70%" />
                  </Box>
                  <Skeleton variant="rectangular" width={60} height={34} />
                </Box>
              </Box>
            ))}
          </Grid>
        </Grid>
      </Paper>
    </Box>
  </Container>
);

const Settings = () => {
  // ... existing state ...

  if (loading) {
    return <SettingsSkeleton />;
  }

  // ... rest of component
}; 