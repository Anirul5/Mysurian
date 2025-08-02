import React from "react";
import { Box, TextField, MenuItem, InputAdornment, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

function SearchBar({ placeholder = "Search hotels, gyms, food..." }) {
  return (
    <TextField
      fullWidth
      variant="outlined"
      color="blackColor"
      
      placeholder={placeholder}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="secondary" />
          </InputAdornment>
        ),
        sx: { borderRadius: "50px", backgroundColor: "#fff" },
      }}
    />
  );
}

export default SearchBar;
