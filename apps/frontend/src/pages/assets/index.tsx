import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  SelectChangeEvent,
  Pagination,
  useTheme,
  CircularProgress,
  Slider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Link from 'next/link';
import { assetService } from '@/services/api';

// Asset interfaces
interface Asset {
  id: string;
  name: string;
  description: string;
  type: string;
  location: string;
  value: number;
  yield: number;
  minimumInvestment: number;
  imageUrl: string;
  status: 'active' | 'funding' | 'completed';
  fundingProgress: number;
}

export default function AssetsPage() {
  const theme = useTheme();
  const router = useRouter();
  
  // State variables
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [totalAssets, setTotalAssets] = useState(0);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [assetType, setAssetType] = useState('all');
  const [location, setLocation] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Asset type options
  const assetTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'renewable_energy', label: 'Renewable Energy' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'commercial', label: 'Commercial' },
  ];
  
  // Location options
  const locations = [
    { value: 'all', label: 'All Locations' },
    { value: 'asia', label: 'Asia' },
    { value: 'europe', label: 'Europe' },
    { value: 'north_america', label: 'North America' },
    { value: 'south_america', label: 'South America' },
    { value: 'africa', label: 'Africa' },
    { value: 'oceania', label: 'Oceania' },
  ];
  
  // Sort options
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'value_high', label: 'Highest Value' },
    { value: 'value_low', label: 'Lowest Value' },
    { value: 'yield_high', label: 'Highest Yield' },
    { value: 'yield_low', label: 'Lowest Yield' },
    { value: 'progress_high', label: 'Most Funded' },
    { value: 'progress_low', label: 'Least Funded' },
  ];
  
  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'funding', label: 'Funding' },
    { value: 'completed', label: 'Completed' },
  ];
  
  // Fetch assets with filters and pagination
  const fetchAssets = async () => {
    try {
      setLoading(true);
      
      // Prepare query parameters
      const params: any = {
        page,
        limit,
        sortBy: sortBy.split('_')[0],
        order: sortBy.split('_')[1] === 'high' ? 'desc' : 'asc',
      };
      
      // Add filters if they are not set to "all"
      if (assetType !== 'all') params.type = assetType;
      if (location !== 'all') params.location = location;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;
      if (priceRange[0] > 0) params.minValue = priceRange[0];
      if (priceRange[1] < 10000000) params.maxValue = priceRange[1];
      
      // Make API request
      const response = await assetService.getAssets(params);
      
      // Update state with response data
      setAssets(response.data.assets);
      setTotalAssets(response.data.total);
      
    } catch (err: any) {
      console.error('Error fetching assets:', err);
      setError(err.message || 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle filter changes
  const handleTypeChange = (event: SelectChangeEvent) => {
    setAssetType(event.target.value);
    setPage(1); // Reset to first page on filter change
  };
  
  const handleLocationChange = (event: SelectChangeEvent) => {
    setLocation(event.target.value);
    setPage(1);
  };
  
  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value);
    setPage(1);
  };
  
  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };
  
  const handlePriceRangeChange = (event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as [number, number]);
  };
  
  const handlePriceRangeChangeCommitted = () => {
    setPage(1);
    fetchAssets();
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
    fetchAssets();
  };
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  
  // Effect to fetch assets on component mount and when filters change
  useEffect(() => {
    fetchAssets();
  }, [page, limit, assetType, location, sortBy, statusFilter]);
  
  // For demo purposes, display hardcoded assets if we don't have API running
  useEffect(() => {
    if (!assets.length && !loading) {
      // Hardcoded demo assets
      const demoAssets: Asset[] = [
        {
          id: '1',
          name: 'Luxury Villa in Bali',
          description: 'Prime tourist location with stable rental income and professional management.',
          type: 'real_estate',
          location: 'asia',
          value: 1250000,
          yield: 8.2,
          minimumInvestment: 10000,
          imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914',
          status: 'funding',
          fundingProgress: 68,
        },
        {
          id: '2',
          name: 'Coffee Plantation',
          description: 'Organic coffee plantation with established export channels.',
          type: 'agriculture',
          location: 'south_america',
          value: 850000,
          yield: 7.5,
          minimumInvestment: 5000,
          imageUrl: 'https://images.unsplash.com/photo-1591291263064-564b8556e295',
          status: 'funding',
          fundingProgress: 75,
        },
        {
          id: '3',
          name: 'Solar Farm Project',
          description: 'Renewable energy project with government subsidies and stable electricity sales.',
          type: 'renewable_energy',
          location: 'europe',
          value: 2100000,
          yield: 9.1,
          minimumInvestment: 15000,
          imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276',
          status: 'funding',
          fundingProgress: 42,
        },
        {
          id: '4',
          name: 'Boutique Hotel in Barcelona',
          description: 'Centrally located boutique hotel with steady tourist bookings.',
          type: 'real_estate',
          location: 'europe',
          value: 3200000,
          yield: 6.8,
          minimumInvestment: 20000,
          imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
          status: 'active',
          fundingProgress: 100,
        },
        {
          id: '5',
          name: 'Avocado Farm',
          description: 'High-demand crop with export contracts to North America and Europe.',
          type: 'agriculture',
          location: 'south_america',
          value: 720000,
          yield: 8.9,
          minimumInvestment: 5000,
          imageUrl: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716',
          status: 'funding',
          fundingProgress: 35,
        },
        {
          id: '6',
          name: 'Wind Turbine Array',
          description: 'Clean energy project with long-term power purchase agreements.',
          type: 'renewable_energy',
          location: 'north_america',
          value: 4500000,
          yield: 7.2,
          minimumInvestment: 25000,
          imageUrl: 'https://images.unsplash.com/photo-1467533003447-e295ff1b0435',
          status: 'active',
          fundingProgress: 100,
        },
      ];
      
      setAssets(demoAssets);
      setTotalAssets(demoAssets.length);
      setError(null);
    }
  }, [assets.length, loading]);
  
  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  return (
    <>
      <Head>
        <title>Explore Assets | Perpetua</title>
        <meta name="description" content="Browse our curated selection of high-quality real-world assets offering stable yields and long-term growth." />
      </Head>
      
      <Box sx={{ 
        bgcolor: 'primary.main', 
        color: 'white', 
        py: 6,
        backgroundImage: 'linear-gradient(to right, #4776E6, #8E54E9)',
      }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Explore Investment Assets
          </Typography>
          <Typography variant="h6" sx={{ maxWidth: 700, mb: 4, opacity: 0.9 }}>
            Discover and invest in tokenized real-world assets with stable yields and transparent performance tracking
          </Typography>
          
          {/* Search Form */}
          <Box component="form" onSubmit={handleSearchSubmit} sx={{ mt: 4 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search assets..."
                  variant="outlined"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'white' }} />
                      </InputAdornment>
                    ),
                    sx: { 
                      bgcolor: 'rgba(255, 255, 255, 0.1)', 
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'white',
                      },
                      color: 'white',
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Button 
                  fullWidth 
                  type="submit" 
                  variant="contained" 
                  size="large"
                  sx={{ 
                    bgcolor: 'white', 
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                    },
                    height: '100%',
                  }}
                >
                  Search Assets
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
      
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Filters Section */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 3
          }}>
            <Typography variant="h5" component="h2" sx={{ display: 'flex', alignItems: 'center' }}>
              <FilterListIcon sx={{ mr: 1 }} /> Filter Assets
            </Typography>
            
            <Button 
              variant="outlined" 
              onClick={() => {
                setAssetType('all');
                setLocation('all');
                setSortBy('newest');
                setStatusFilter('all');
                setPriceRange([0, 10000000]);
                setSearchTerm('');
                setPage(1);
              }}
            >
              Reset Filters
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel id="asset-type-label">Asset Type</InputLabel>
                <Select
                  labelId="asset-type-label"
                  id="asset-type"
                  value={assetType}
                  label="Asset Type"
                  onChange={handleTypeChange}
                >
                  {assetTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel id="location-label">Location</InputLabel>
                <Select
                  labelId="location-label"
                  id="location"
                  value={location}
                  label="Location"
                  onChange={handleLocationChange}
                >
                  {locations.map((loc) => (
                    <MenuItem key={loc.value} value={loc.value}>
                      {loc.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  value={statusFilter}
                  label="Status"
                  onChange={handleStatusChange}
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel id="sort-label">Sort By</InputLabel>
                <Select
                  labelId="sort-label"
                  id="sort"
                  value={sortBy}
                  label="Sort By"
                  onChange={handleSortChange}
                >
                  {sortOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Price Range: {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}
              </Typography>
              <Slider
                value={priceRange}
                onChange={handlePriceRangeChange}
                onChangeCommitted={handlePriceRangeChangeCommitted}
                valueLabelDisplay="auto"
                min={0}
                max={10000000}
                step={50000}
                valueLabelFormat={(value) => formatCurrency(value)}
                sx={{ ml: 1, width: 'calc(100% - 16px)' }}
              />
            </Grid>
          </Grid>
        </Box>
        
        {/* Results Section */}
        <Box>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3 
          }}>
            <Typography variant="h5" component="h2">
              {loading ? 'Loading assets...' : `${totalAssets} Assets Found`}
            </Typography>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ 
              py: 8, 
              textAlign: 'center', 
              bgcolor: 'error.light', 
              borderRadius: 2, 
              color: 'error.dark' 
            }}>
              <Typography variant="h6">{error}</Typography>
              <Button variant="contained" onClick={fetchAssets} sx={{ mt: 2 }}>
                Try Again
              </Button>
            </Box>
          ) : assets.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom>No assets found</Typography>
              <Typography variant="body1" color="text.secondary">
                Try adjusting your filters or search terms
              </Typography>
            </Box>
          ) : (
            <>
              <Grid container spacing={4}>
                {assets.map((asset) => (
                  <Grid item xs={12} sm={6} md={4} key={asset.id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 12px 25px rgba(0,0,0,0.12)',
                        },
                        overflow: 'hidden',
                        borderRadius: 3,
                      }}
                    >
                      <CardActionArea component={Link} href={`/assets/${asset.id}`}>
                        <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                          <Box
                            component="img"
                            src={asset.imageUrl}
                            alt={asset.name}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.4s',
                              '&:hover': { transform: 'scale(1.05)' },
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 16,
                              left: 16,
                              display: 'flex',
                              gap: 1,
                            }}
                          >
                            <Chip
                              label={assetTypes.find(t => t.value === asset.type)?.label || asset.type}
                              size="small"
                              sx={{
                                bgcolor: 'secondary.main',
                                color: 'white',
                                fontWeight: 600,
                              }}
                            />
                            <Chip
                              label={statusOptions.find(s => s.value === asset.status)?.label || asset.status}
                              size="small"
                              sx={{
                                bgcolor: 
                                  asset.status === 'active' 
                                    ? 'success.main' 
                                    : asset.status === 'funding' 
                                    ? 'primary.main' 
                                    : 'grey.500',
                                color: 'white',
                                fontWeight: 600,
                              }}
                            />
                          </Box>
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 16,
                              left: 16,
                              display: 'flex',
                              alignItems: 'center',
                              color: 'white',
                              textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
                            }}
                          >
                            <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {locations.find(l => l.value === asset.location)?.label || asset.location}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                          <Typography
                            variant="h5"
                            component="h3"
                            gutterBottom
                            sx={{ fontWeight: 600 }}
                          >
                            {asset.name}
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {asset.description}
                          </Typography>
                          
                          <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">
                                Annual Yield
                              </Typography>
                              <Typography variant="h6" component="p" color="primary.main" sx={{ fontWeight: 700 }}>
                                {asset.yield}%
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">
                                Asset Value
                              </Typography>
                              <Typography variant="h6" component="p" sx={{ fontWeight: 600 }}>
                                {formatCurrency(asset.value)}
                              </Typography>
                            </Grid>
                          </Grid>
                          
                          {asset.status === 'funding' && (
                            <Box sx={{ mt: 3 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {asset.fundingProgress}% Funded
                              </Typography>
                              <Box
                                sx={{
                                  height: 8,
                                  bgcolor: 'grey.200',
                                  borderRadius: 5,
                                  position: 'relative',
                                  overflow: 'hidden',
                                }}
                              >
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    height: '100%',
                                    width: `${asset.fundingProgress}%`,
                                    bgcolor: 'primary.main',
                                    borderRadius: 5,
                                  }}
                                />
                              </Box>
                            </Box>
                          )}
                          
                          <Box sx={{ mt: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                              Minimum Investment:
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {formatCurrency(asset.minimumInvestment)}
                            </Typography>
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              {/* Pagination */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <Pagination
                  count={Math.ceil(totalAssets / limit)}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                />
              </Box>
            </>
          )}
        </Box>
      </Container>
    </>
  );
} 