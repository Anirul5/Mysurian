import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Button,
  Drawer,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  InputAdornment,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig"; // adjust if needed

const navLinks = [{ label: "Home", path: "/" }];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, "categories"));
      const list = snapshot.docs.map((doc) => doc.id);
      setCategories(list);
    };
    fetchCategories();
  }, []);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
      setSearchOpen(false);
    }
  };

  const handleCategoryClick = (category) => {
    navigate(category);
    setAnchorEl(null);
    setMobileOpen(false);
  };

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        {navLinks.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton component={RouterLink} to={item.path}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate("/categories")}>
            <ListItemText primary="All Categories" />
          </ListItemButton>
        </ListItem>
        {categories.map((cat) => (
          <ListItem key={cat} disablePadding>
            <ListItemButton
              onClick={() => handleCategoryClick(`category/${cat}`)}
            >
              <ListItemText
                primary={cat
                  .replaceAll("_", " ")
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" color="primary" sx={{ boxShadow: 0 }}>
        <Toolbar>
          {/* Logo */}
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                textDecoration: "none",
                color: "inherit",
                fontWeight: "bold",
                mr: 4,
              }}
            >
              Mysurian
            </Typography>
          </Box>

          {/* Desktop Search */}
          <Box
            component="form"
            onSubmit={handleSearchSubmit}
            sx={{
              display: { xs: "none", md: "block" },
              maxWidth: 300,
              flexGrow: 1,
              mr: 2,
            }}
          >
            <TextField
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              placeholder="Search..."
              variant="outlined"
              fullWidth
              sx={{
                backgroundColor: "#fff",
                borderRadius: "50px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "50px",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="secondary" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Desktop Nav Links */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
            {navLinks.map((item) => (
              <Button
                key={item.label}
                color="inherit"
                component={RouterLink}
                to={item.path}
              >
                {item.label}
              </Button>
            ))}

            {/* Categories Dropdown */}
            <Button
              color="inherit"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              endIcon={<ArrowDropDownIcon />}
            >
              Categories
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem onClick={() => handleCategoryClick("/categories")}>
                All Categories
              </MenuItem>
              {categories.map((cat) => (
                <MenuItem
                  key={cat}
                  onClick={() => handleCategoryClick(`/category/${cat}`)}
                >
                  {cat
                    .replaceAll("_", " ")
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Mobile Icons */}
          <IconButton
            color="inherit"
            sx={{ display: { xs: "block", md: "none" }, ml: "auto" }}
            onClick={() => setSearchOpen(true)}
          >
            <SearchIcon />
          </IconButton>
          <IconButton
            color="inherit"
            sx={{ display: { xs: "block", md: "none" } }}
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{ display: { xs: "block", md: "none" } }}
      >
        {drawer}
      </Drawer>

      {/* Mobile Search Drawer */}
      <Drawer
        anchor="top"
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        sx={{ display: { xs: "block", md: "none" } }}
      >
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ p: 2 }}>
          <TextField
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            placeholder="Search..."
            variant="outlined"
            fullWidth
            sx={{
              backgroundColor: "#fff",
              borderRadius: "50px",
              "& .MuiOutlinedInput-root": {
                borderRadius: "50px",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="secondary" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Drawer>
    </>
  );
}
