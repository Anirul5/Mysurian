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
  Avatar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, loginWithGoogle, logoutUser } from "../firebase/auth";
import { Padding } from "@mui/icons-material";

const navLinks = [{ label: "Home", path: "/" }];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [userMenuEl, setUserMenuEl] = useState(null);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, "categories"));
      setCategories(snapshot.docs.map((doc) => doc.id));
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
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
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
                "& .MuiOutlinedInput-root": { borderRadius: "50px" },
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
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 1,
              alignItems: "center",
            }}
          >
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

            {/* User Section */}
            {user ? (
              <>
                <Avatar
                  src={user.photoURL}
                  alt={user.displayName}
                  sx={{ width: 40, height: 40, cursor: "pointer" }}
                  onClick={(e) => setUserMenuEl(e.currentTarget)}
                />
                <Menu
                  anchorEl={userMenuEl}
                  open={Boolean(userMenuEl)}
                  onClose={() => setUserMenuEl(null)}
                >
                  <MenuItem
                    onClick={() => {
                      navigate("/favorites");
                      setUserMenuEl(null);
                    }}
                  >
                    Favorites
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      logoutUser();
                      setUserMenuEl(null);
                    }}
                  >
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                color="secondary"
                variant="contained"
                onClick={loginWithGoogle}
              >
                Login
              </Button>
            )}

            {/* Categories Menu */}
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
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Mobile Icons */}
          {user ? (
            <Box sx={{ padding: "8px" }}>
              <Avatar
                src={user.photoURL}
                alt={user.displayName}
                sx={{
                  width: 35,
                  height: 35,
                  cursor: "pointer",
                  ml: 1,
                  display: { xs: "block", md: "none" },
                }}
                onClick={(e) => setUserMenuEl(e.currentTarget)}
              />
            </Box>
          ) : (
            <Button
              variant="contained"
              color="secondary"
              sx={{ display: { xs: "block", md: "none" }, ml: 1 }}
              onClick={loginWithGoogle}
            >
              Login
            </Button>
          )}

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
              "& .MuiOutlinedInput-root": { borderRadius: "50px" },
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

      {/* Mobile User Menu */}
      <Menu
        anchorEl={userMenuEl}
        open={Boolean(userMenuEl)}
        onClose={() => setUserMenuEl(null)}
      >
        <MenuItem onClick={() => navigate("/favorites")}>Favorites</MenuItem>
        <MenuItem onClick={logoutUser}>Logout</MenuItem>
      </Menu>
    </>
  );
}
